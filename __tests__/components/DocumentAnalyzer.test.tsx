import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentAnalyzer } from '@/components/DocumentAnalyzer'
import { AnalyticsProvider } from '@/lib/useAnalytics'
import { SettingsProvider } from '@/lib/useSettings'

// Mock the analyzer
jest.mock('@/lib/analyzer', () => ({
  analyzeDocument: jest.fn(() => Promise.resolve({
    documentId: 'test-123',
    timestamp: new Date(),
    structureAnalysis: {
      score: 85,
      issues: [],
      suggestions: [],
      headingHierarchy: { isValid: true, structure: [], issues: [] }
    },
    linkValidation: {
      score: 92,
      totalLinks: 3,
      validLinks: 3,
      brokenLinks: [],
      internalLinks: [],
      externalLinks: []
    },
    styleCompliance: {
      score: 78,
      issues: [],
      adherencePercentage: 78
    },
    readabilityScore: {
      fleschKincaid: 8.5,
      averageSentenceLength: 18,
      averageWordsPerSentence: 18,
      complexWords: 5,
      readingLevel: 'High School',
      suggestions: []
    },
    terminologyConsistency: {
      score: 88,
      inconsistencies: [],
      glossary: []
    },
    overallScore: 83
  }))
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <SettingsProvider>
      <AnalyticsProvider>
        {component}
      </AnalyticsProvider>
    </SettingsProvider>
  )
}

describe('DocumentAnalyzer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders initial state correctly', () => {
    renderWithProviders(<DocumentAnalyzer />)
    
    expect(screen.getByText('Upload Document')).toBeDefined()
    expect(screen.getByText('Analyze Document')).toBeDefined()
    expect(screen.getByPlaceholderText('Paste your document content here or upload a file...')).toBeDefined()
    expect(screen.getByLabelText('Settings')).toBeDefined()
  })

  test('enables analyze button when content is added', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentAnalyzer />)
    
    const analyzeButton = screen.getByText('Analyze Document')
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    
    // Initially disabled
    expect((analyzeButton as HTMLButtonElement).disabled).toBe(true)
    
    // Add content
    await user.type(textArea, '# Test Document')
    
    // Should be enabled
    expect((analyzeButton as HTMLButtonElement).disabled).toBe(false)
  })

  test('shows loading state during analysis', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentAnalyzer />)
    
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    await user.type(textArea, '# Test Document')
    
    const analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)
    
    expect(screen.getByText('Analyzing...')).toBeDefined()
  })

  test('displays analysis results after completion', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentAnalyzer />)
    
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    await user.type(textArea, '# Test Document\n\nSome content here.')
    
    const analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeDefined()
    })
    
    // Check that scores are displayed
    expect(screen.getByText('83')).toBeDefined() // Overall score
    expect(screen.getByText('85')).toBeDefined() // Structure score
    expect(screen.getByText('92')).toBeDefined() // Link validation score
  })

  test('opens and closes settings modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentAnalyzer />)
    
    const settingsButton = screen.getByLabelText('Settings')
    await user.click(settingsButton)
    
    await waitFor(() => {
      expect(screen.getByText('Analysis Settings')).toBeDefined()
    })
    
    const closeButton = screen.getByText('Save Settings')
    await user.click(closeButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Analysis Settings')).toBeNull()
    })
  })

  test('handles file upload', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentAnalyzer />)
    
    const file = new File(['# Test Document\n\nContent'], 'test.txt', { type: 'text/plain' })
    const fileInput = screen.getByLabelText(/upload document/i)
    
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
      expect((textArea as HTMLTextAreaElement).value).toBe('Mock file content')
    })
  })

  test('rejects invalid file types', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentAnalyzer />)
    
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const fileInput = screen.getByLabelText(/upload document/i)
    
    await user.upload(fileInput, file)
    
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    expect((textArea as HTMLTextAreaElement).value).toBe('')
  })

  test('clears content when new file is uploaded', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentAnalyzer />)
    
    const textArea = screen.getByPlaceholderText('Paste your documentation content here...')
    
    // Add manual content first
    await user.type(textArea, 'Manual content')
    expect((textArea as HTMLTextAreaElement).value).toBe('Manual content')
    
    // Upload file should replace content
    const file = new File(['# File Content'], 'test.txt', { type: 'text/plain' })
    const fileInput = screen.getByLabelText(/upload document/i)
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect((textArea as HTMLTextAreaElement).value).toBe('Mock file content')
    })
  })

  test('maintains analysis results when settings are changed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentAnalyzer />)
    
    // Perform analysis first
    const textArea = screen.getByPlaceholderText('Paste your documentation content here...')
    await user.type(textArea, '# Test Document')
    
    const analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeDefined()
    })
    
    // Open and close settings
    const settingsButton = screen.getByLabelText('Settings')
    await user.click(settingsButton)
    
    await waitFor(() => {
      expect(screen.getByText('Analysis Settings')).toBeDefined()
    })
    
    const saveButton = screen.getByText('Save Settings')
    await user.click(saveButton)
    
    // Results should still be visible
    expect(screen.getByText('Analysis Results')).toBeDefined()
    expect(screen.getByText('83')).toBeDefined()
  })

  test('shows proper structure when no analysis is performed', () => {
    renderWithProviders(<DocumentAnalyzer />)
    
    // Should show upload section
    expect(screen.getByText('Upload Document')).toBeDefined()
    expect(screen.getByText('Choose File')).toBeDefined()
    
    // Should not show analysis results
    expect(screen.queryByText('Analysis Results')).toBeNull()
  })

  test('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DocumentAnalyzer />)
    
    const textArea = screen.getByPlaceholderText('Paste your documentation content here...')
    
    // Focus should work
    await user.click(textArea)
    expect(textArea).toHaveFocus()
    
    // Typing should work
    await user.type(textArea, '# Test')
    expect((textArea as HTMLTextAreaElement).value).toBe('# Test')
    
    // Tab navigation should work
    await user.tab()
    const analyzeButton = screen.getByText('Analyze Document')
    expect(analyzeButton).toHaveFocus()
  })
})
