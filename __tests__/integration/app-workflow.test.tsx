import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'

// Mock the analyzer to avoid complex async operations in integration tests
jest.mock('@/lib/analyzer', () => ({
  analyzeDocument: jest.fn(() => Promise.resolve({
    documentId: 'test-doc-123',
    timestamp: new Date('2025-01-15T10:00:00Z'),
    structureAnalysis: {
      score: 85,
      issues: [
        {
          type: 'incorrect-hierarchy',
          message: 'Heading level 3 follows level 1, skipping levels',
          line: 5,
          severity: 'warning'
        }
      ],
      suggestions: ['Consider adding a level 2 heading before level 3'],
      headingHierarchy: {
        isValid: false,
        structure: [
          { level: 1, text: 'Introduction', line: 1, children: [] },
          { level: 3, text: 'Setup', line: 5, children: [] }
        ],
        issues: ['Skipped heading level from 1 to 3']
      }
    },
    linkValidation: {
      score: 92,
      totalLinks: 5,
      validLinks: 4,
      brokenLinks: [
        {
          url: 'https://broken-link.com',
          line: 10,
          reason: 'Connection timeout',
          statusCode: null
        }
      ],
      externalLinks: 3,
      internalLinks: 2
    },
    styleCompliance: {
      score: 78,
      issues: [
        {
          type: 'passive-voice',
          message: 'Consider using active voice instead of passive voice',
          line: 8,
          severity: 'warning',
          suggestion: 'Rewrite to use active voice'
        }
      ],
      passedChecks: ['click-here', 'heading-caps'],
      failedChecks: ['passive-voice']
    },
    readabilityScore: {
      score: 72,
      fleschKincaidGrade: 8.5,
      avgSentenceLength: 18,
      avgSyllablesPerWord: 1.4,
      readingLevel: 'High School',
      suggestions: ['Consider breaking up long sentences', 'Use simpler vocabulary where possible']
    },
    terminologyConsistency: {
      score: 88,
      issues: [
        {
          term: 'API',
          inconsistencies: ['api', 'Api'],
          occurrences: 12,
          suggestion: 'Use consistent capitalization: API'
        }
      ],
      consistentTerms: ['documentation', 'integration', 'component']
    },
    overallScore: 83
  }))
}))

describe('Documentation Quality Analyzer - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders main application components', () => {
    render(<Home />)
    
    // Check if main components are rendered
    expect(screen.getByText('Documentation Quality Analyzer')).toBeDefined()
    expect(screen.getByText('Analyze Document')).toBeDefined()
    expect(screen.getByText('Quality Dashboard')).toBeDefined()
    expect(screen.getByText('Upload Document')).toBeDefined()
  })

  test('complete document analysis workflow', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Step 1: Add document content via text area
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    await user.type(textArea, '# Introduction\n\nThis is a test document.\n\n### Setup\n\nSome setup instructions.')

    // Step 2: Trigger analysis
    const analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)

    // Step 3: Wait for analysis to complete and check results
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeDefined()
    }, { timeout: 5000 })

    // Check overall score display
    expect(screen.getByText('83')).toBeDefined()

    // Check individual metric scores are displayed
    expect(screen.getByText('85')).toBeDefined() // Structure score
    expect(screen.getByText('92')).toBeDefined() // Link validation score
    expect(screen.getByText('78')).toBeDefined() // Style compliance score
    expect(screen.getByText('72')).toBeDefined() // Readability score
    expect(screen.getByText('88')).toBeDefined() // Terminology consistency score
  })

  test('file upload functionality', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Create a mock file
    const file = new File(['# Test Document\n\nContent here'], 'test.txt', { type: 'text/plain' })
    
    // Find file input and upload file
    const fileInput = screen.getByLabelText(/upload document/i)
    await user.upload(fileInput, file)

    // Wait for file content to be processed
    await waitFor(() => {
      const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
      expect((textArea as HTMLTextAreaElement).value).toBe('Mock file content')
    })
  })

  test('settings modal functionality', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Open settings modal
    const settingsButton = screen.getByLabelText('Settings')
    await user.click(settingsButton)

    // Check if settings modal is open
    await waitFor(() => {
      expect(screen.getByText('Analysis Settings')).toBeDefined()
    })

    // Check settings categories
    expect(screen.getByText('Style Guide')).toBeDefined()
    expect(screen.getByText('Readability Targets')).toBeDefined()
    expect(screen.getByText('Link Validation')).toBeDefined()

    // Test toggling a style check
    const passiveVoiceToggle = screen.getByLabelText('Passive Voice Detection')
    expect((passiveVoiceToggle as HTMLInputElement).checked).toBe(true)
    
    await user.click(passiveVoiceToggle)
    expect((passiveVoiceToggle as HTMLInputElement).checked).toBe(false)

    // Close settings modal
    const closeButton = screen.getByText('Save Settings')
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Analysis Settings')).toBeNull()
    })
  })

  test('dashboard updates after analysis', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Initially, dashboard should show no data
    expect(screen.getByText('No documents analyzed yet')).toBeDefined()

    // Perform analysis
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    await user.type(textArea, '# Test Document\n\nSome content here.')

    const analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeDefined()
    })

    // Check that dashboard is updated
    await waitFor(() => {
      expect(screen.getByText('1')).toBeDefined() // Total documents
      expect(screen.queryByText('No documents analyzed yet')).toBeNull()
    })

    // Check metrics are displayed in dashboard
    expect(screen.getByText('Total Documents')).toBeDefined()
    expect(screen.getByText('Average Score')).toBeDefined()
  })

  test('error handling for invalid file types', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Create a mock file with invalid type
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    
    const fileInput = screen.getByLabelText(/upload document/i)
    await user.upload(fileInput, file)

    // File should not be processed (content should remain empty)
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    expect((textArea as HTMLTextAreaElement).value).toBe('')
  })

  test('responsive layout behavior', () => {
    render(<Home />)

    // Check that the layout uses responsive grid classes
    const mainElement = screen.getByRole('main')
    expect(mainElement.className).toContain('container')
    expect(mainElement.className).toContain('mx-auto')

    // Check grid layout
    const gridContainer = mainElement.firstChild as HTMLElement
    expect(gridContainer.className).toContain('grid')
    expect(gridContainer.className).toContain('lg:grid-cols-3')
  })

  test('accessibility features', () => {
    render(<Home />)

    // Check for proper headings
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('Documentation Quality Analyzer')

    // Check for proper form labels
    expect(screen.getByLabelText(/upload document/i)).toBeDefined()

    // Check for proper button roles
    expect(screen.getByRole('button', { name: /analyze document/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /settings/i })).toBeDefined()

    // Check for proper text area
    const textbox = screen.getByRole('textbox')
    expect(textbox.getAttribute('placeholder')).toBe('Paste your document content here or upload a file...')
  })

  test('analysis state management', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    const analyzeButton = screen.getByText('Analyze Document')

    // Initially, analyze button should be disabled when no content
    expect((analyzeButton as HTMLButtonElement).disabled).toBe(true)

    // Add content
    await user.type(textArea, '# Test Document')

    // Button should now be enabled
    expect((analyzeButton as HTMLButtonElement).disabled).toBe(false)

    // Start analysis
    await user.click(analyzeButton)

    // Button should show loading state
    expect(screen.getByText('Analyzing...')).toBeDefined()

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText('Analyze Document')).toBeDefined()
      expect(screen.queryByText('Analyzing...')).toBeNull()
    })
  })
})
