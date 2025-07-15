import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Clear any previous mock calls
    jest.clearAllMocks()
  })

  test('renders main application components', () => {
    render(<Home />)
    
    // Check if main components are rendered
    expect(screen.getByText('Documentation Quality Analyzer')).toBeInTheDocument()
    expect(screen.getByText('Analyze Document')).toBeInTheDocument()
    expect(screen.getByText('Quality Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Upload Document')).toBeInTheDocument()
  })

  test('complete document analysis workflow', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Step 1: Upload a document via text area
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    await user.type(textArea, '# Introduction\n\nThis is a test document.\n\n### Setup\n\nSome setup instructions.')

    // Step 2: Trigger analysis
    const analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)

    // Step 3: Wait for analysis to complete and check results
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeInTheDocument()
    })

    // Check overall score display
    expect(screen.getByText('83')).toBeInTheDocument() // Overall score

    // Check individual metric scores
    expect(screen.getByText('85')).toBeInTheDocument() // Structure score
    expect(screen.getByText('92')).toBeInTheDocument() // Link validation score
    expect(screen.getByText('78')).toBeInTheDocument() // Style compliance score
    expect(screen.getByText('72')).toBeInTheDocument() // Readability score
    expect(screen.getByText('88')).toBeInTheDocument() // Terminology consistency score

    // Check that issues are displayed
    expect(screen.getByText('Heading level 3 follows level 1, skipping levels')).toBeInTheDocument()
    expect(screen.getByText('Consider using active voice instead of passive voice')).toBeInTheDocument()
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
      expect(textArea).toHaveValue('Mock file content') // From our FileReader mock
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
      expect(screen.getByText('Analysis Settings')).toBeInTheDocument()
    })

    // Check settings categories
    expect(screen.getByText('Style Guide')).toBeInTheDocument()
    expect(screen.getByText('Readability Targets')).toBeInTheDocument()
    expect(screen.getByText('Link Validation')).toBeInTheDocument()

    // Test toggling a style check
    const passiveVoiceToggle = screen.getByLabelText('Passive Voice Detection')
    expect(passiveVoiceToggle).toBeChecked()
    
    await user.click(passiveVoiceToggle)
    expect(passiveVoiceToggle).not.toBeChecked()

    // Close settings modal
    const closeButton = screen.getByText('Save Settings')
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Analysis Settings')).not.toBeInTheDocument()
    })
  })

  test('dashboard updates after analysis', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Initially, dashboard should show no data
    expect(screen.getByText('No documents analyzed yet')).toBeInTheDocument()

    // Perform analysis
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    await user.type(textArea, '# Test Document\n\nSome content here.')

    const analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeInTheDocument()
    })

    // Check that dashboard is updated
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument() // Total documents
      expect(screen.queryByText('No documents analyzed yet')).not.toBeInTheDocument()
    })

    // Check metrics are displayed in dashboard
    expect(screen.getByText('Total Documents')).toBeInTheDocument()
    expect(screen.getByText('Average Score')).toBeInTheDocument()
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
    expect(mainElement).toHaveClass('container', 'mx-auto', 'px-4', 'py-8')

    // Check grid layout
    const gridContainer = mainElement.firstChild
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-8')
  })

  test('accessibility features', () => {
    render(<Home />)

    // Check for proper headings
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Documentation Quality Analyzer')

    // Check for proper form labels
    expect(screen.getByLabelText(/upload document/i)).toBeInTheDocument()

    // Check for proper button roles
    expect(screen.getByRole('button', { name: /analyze document/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()

    // Check for proper text area label
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Paste your document content here or upload a file...')
  })

  test('analysis state management', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    const analyzeButton = screen.getByText('Analyze Document')

    // Initially, analyze button should be disabled when no content
    expect(analyzeButton).toBeDisabled()

    // Add content
    await user.type(textArea, '# Test Document')

    // Button should now be enabled
    expect(analyzeButton).toBeEnabled()

    // Start analysis
    await user.click(analyzeButton)

    // Button should show loading state
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText('Analyze Document')).toBeInTheDocument()
      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument()
    })
  })
})
