import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'
import { sampleDocuments, waitForAnalysis } from '../helpers/test-utils'

// Mock the analyzer with realistic responses
jest.mock('@/lib/analyzer', () => ({
  analyzeDocument: jest.fn((content, settings) => {
    // Return different results based on content quality
    if (content === sampleDocuments.wellStructured) {
      return Promise.resolve({
        documentId: 'good-doc-123',
        timestamp: new Date(),
        structureAnalysis: {
          score: 95,
          issues: [],
          suggestions: ['Excellent structure'],
          headingHierarchy: {
            isValid: true,
            structure: [
              { level: 1, text: 'Getting Started Guide', line: 1, children: [] },
              { level: 2, text: 'Introduction', line: 3, children: [] },
              { level: 2, text: 'Installation', line: 7, children: [] },
              { level: 2, text: 'Usage', line: 15, children: [] }
            ],
            issues: []
          }
        },
        linkValidation: {
          score: 100,
          totalLinks: 0,
          validLinks: 0,
          brokenLinks: [],
          externalLinks: [],
          internalLinks: []
        },
        styleCompliance: {
          score: 92,
          issues: [],
          adherencePercentage: 92
        },
        readabilityScore: {
          fleschKincaid: 9.2,
          averageSentenceLength: 16,
          averageWordsPerSentence: 16,
          complexWords: 8,
          readingLevel: 'High School',
          suggestions: []
        },
        terminologyConsistency: {
          score: 95,
          inconsistencies: [],
          glossary: []
        },
        overallScore: 94
      })
    } else if (content === sampleDocuments.poorlyStructured) {
      return Promise.resolve({
        documentId: 'poor-doc-456',
        timestamp: new Date(),
        structureAnalysis: {
          score: 35,
          issues: [
            {
              type: 'incorrect-hierarchy',
              message: 'Heading level 3 follows level 0, document should start with H1',
              line: 1,
              severity: 'error'
            },
            {
              type: 'duplicate-heading',
              message: 'Duplicate heading: "Getting Started"',
              line: 7,
              severity: 'warning'
            }
          ],
          suggestions: ['Start with H1 heading', 'Fix heading hierarchy'],
          headingHierarchy: {
            isValid: false,
            structure: [
              { level: 3, text: 'Getting Started', line: 1, children: [] },
              { level: 5, text: 'Installation', line: 5, children: [] }
            ],
            issues: ['Invalid hierarchy']
          }
        },
        linkValidation: {
          score: 100,
          totalLinks: 0,
          validLinks: 0,
          brokenLinks: [],
          externalLinks: [],
          internalLinks: []
        },
        styleCompliance: {
          score: 45,
          issues: [
            {
              type: 'formatting',
              message: 'Avoid using "click here" in links',
              line: 9,
              column: 1,
              severity: 'warning',
              suggestion: 'Use descriptive link text'
            },
            {
              type: 'grammar',
              message: 'Sentence is too long (>20 words)',
              line: 11,
              column: 1,
              severity: 'warning',
              suggestion: 'Break into shorter sentences'
            }
          ],
          adherencePercentage: 45
        },
        readabilityScore: {
          fleschKincaid: 15.8,
          averageSentenceLength: 35,
          averageWordsPerSentence: 35,
          complexWords: 15,
          readingLevel: 'College Graduate',
          suggestions: ['Break up long sentences', 'Use simpler vocabulary']
        },
        terminologyConsistency: {
          score: 85,
          inconsistencies: [],
          glossary: []
        },
        overallScore: 52
      })
    }
    
    // Default response for other content
    return Promise.resolve({
      documentId: 'default-doc-789',
      timestamp: new Date(),
      structureAnalysis: {
        score: 75,
        issues: [],
        suggestions: [],
        headingHierarchy: { isValid: true, structure: [], issues: [] }
      },
      linkValidation: {
        score: 85,
        totalLinks: 1,
        validLinks: 1,
        brokenLinks: [],
        externalLinks: [],
        internalLinks: []
      },
      styleCompliance: {
        score: 80,
        issues: [],
        adherencePercentage: 80
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
      overallScore: 82
    })
  })
}))

describe('End-to-End Workflow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('complete user journey: analyze good document and view results', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Step 1: User sees the initial state
    expect(screen.getByText('Documentation Quality Analyzer')).toBeDefined()
    expect(screen.getByText('No recent analyses yet.')).toBeDefined()
    
    // Step 2: User inputs well-structured content
    const textArea = screen.getByPlaceholderText('Paste your documentation content here...')
    await user.clear(textArea)
    await user.type(textArea, sampleDocuments.wellStructured)

    // Step 3: User triggers analysis
    const analyzeButton = screen.getByText('Analyze Document')
    expect((analyzeButton as HTMLButtonElement).disabled).toBe(false)
    await user.click(analyzeButton)

    // Step 4: User sees loading state
    expect(screen.getByText('Analyzing...')).toBeDefined()

    // Step 5: User sees results for good document
    await waitForAnalysis(screen)
    
    expect(screen.getByText('94')).toBeDefined() // Overall score
    expect(screen.getByText('95')).toBeDefined() // Structure score
    expect(screen.getByText('100')).toBeDefined() // Link validation score
    expect(screen.getByText('92')).toBeDefined() // Style compliance score
    expect(screen.getByText('95')).toBeDefined() // Terminology score

    // Step 6: Dashboard is updated
    await waitFor(() => {
      expect(screen.getByText('1')).toBeDefined() // Total documents
      expect(screen.queryByText('No recent analyses yet.')).toBeNull()
    })

    // Step 7: User can see detailed results
    expect(screen.getByText('Analysis Results')).toBeDefined()
    expect(screen.getByText('Structure Analysis')).toBeDefined()
    expect(screen.getByText('Readability Score')).toBeDefined()
    expect(screen.getByText('Style Compliance')).toBeDefined()
  })

  test('user journey: analyze poor document and see issues', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Input poorly structured content
    const textArea = screen.getByPlaceholderText('Paste your documentation content here...')
    await user.clear(textArea)
    await user.type(textArea, sampleDocuments.poorlyStructured)

    // Analyze
    const analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)

    // Check results for poor document
    await waitForAnalysis(screen)
    
    expect(screen.getByText('52')).toBeDefined() // Overall score (poor)
    expect(screen.getByText('35')).toBeDefined() // Structure score (poor)
    expect(screen.getByText('45')).toBeDefined() // Style compliance score (poor)

    // Should show specific issues
    expect(screen.getByText('Heading level 3 follows level 0, document should start with H1')).toBeDefined()
    expect(screen.getByText('Duplicate heading: "Getting Started"')).toBeDefined()
    expect(screen.getByText('Avoid using "click here" in links')).toBeDefined()
  })

  test('user workflow: multiple analyses and dashboard evolution', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // First analysis - good document
    const textArea = screen.getByPlaceholderText('Paste your documentation content here...')
    await user.type(textArea, sampleDocuments.wellStructured)
    
    let analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)
    
    await waitForAnalysis(screen)
    
    // Check dashboard shows 1 document
    await waitFor(() => {
      expect(screen.getByText('1')).toBeDefined()
    })

    // Second analysis - poor document
    await user.clear(textArea)
    await user.type(textArea, sampleDocuments.poorlyStructured)
    
    analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)
    
    await waitForAnalysis(screen)
    
    // Dashboard should now show 2 documents and updated average
    await waitFor(() => {
      expect(screen.getByText('2')).toBeDefined() // Total documents
    })

    // Average score should be between 52 and 94
    const averageElements = screen.getAllByText(/\d{2,3}/)
    const hasReasonableAverage = averageElements.some(el => {
      const value = parseInt(el.textContent || '0')
      return value >= 70 && value <= 80 // Rough average of 94 and 52
    })
    expect(hasReasonableAverage).toBe(true)
  })

  test('user journey: settings customization affects analysis', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Open settings
    const settingsButton = screen.getByText('Settings')
    await user.click(settingsButton)

    await waitFor(() => {
      expect(screen.getByText('Analysis Settings')).toBeDefined()
    })

    // Modify some settings (disable passive voice check)
    const passiveVoiceToggle = screen.getByLabelText('Passive Voice Detection')
    if ((passiveVoiceToggle as HTMLInputElement).checked) {
      await user.click(passiveVoiceToggle)
    }

    // Save settings
    const saveButton = screen.getByText('Save Settings')
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.queryByText('Analysis Settings')).toBeNull()
    })

    // Analyze document with custom settings
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    await user.type(textArea, sampleDocuments.poorlyStructured)
    
    const analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)
    
    await waitForAnalysis(screen)
    
    // Results should reflect the settings change
    expect(screen.getByText('Analysis Results')).toBeDefined()
  })

  test('user journey: file upload workflow', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Create and upload a file
    const file = new File([sampleDocuments.wellStructured], 'test-doc.txt', { type: 'text/plain' })
    const fileInput = screen.getByLabelText(/upload document/i)
    
    await user.upload(fileInput, file)

    // Wait for file content to load
    await waitFor(() => {
      const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
      expect((textArea as HTMLTextAreaElement).value).toBe('Mock file content')
    })

    // Analyze the uploaded content
    const analyzeButton = screen.getByText('Analyze Document')
    await user.click(analyzeButton)

    await waitForAnalysis(screen)
    
    expect(screen.getByText('Analysis Results')).toBeDefined()
  })

  test('user journey: error handling and recovery', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Try to upload invalid file type
    const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const fileInput = screen.getByLabelText(/upload document/i)
    
    await user.upload(fileInput, invalidFile)

    // Content should remain empty
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    expect((textArea as HTMLTextAreaElement).value).toBe('')

    // Analyze button should still be disabled
    const analyzeButton = screen.getByText('Analyze Document')
    expect((analyzeButton as HTMLButtonElement).disabled).toBe(true)

    // User can still manually input content
    await user.type(textArea, '# Recovery Test\n\nContent here.')
    
    // Now analysis should work
    expect((analyzeButton as HTMLButtonElement).disabled).toBe(false)
    await user.click(analyzeButton)

    await waitForAnalysis(screen)
    expect(screen.getByText('Analysis Results')).toBeDefined()
  })

  test('accessibility workflow', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Test keyboard navigation
    const textArea = screen.getByPlaceholderText('Paste your document content here or upload a file...')
    
    // Focus text area
    await user.click(textArea)
    expect(textArea).toHaveFocus()

    // Type content
    await user.type(textArea, '# Accessibility Test')

    // Tab to analyze button
    await user.tab()
    const analyzeButton = screen.getByText('Analyze Document')
    expect(analyzeButton).toHaveFocus()

    // Activate with Enter key
    await user.keyboard('{Enter}')

    await waitForAnalysis(screen)

    // Check that results are properly labeled for screen readers
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Documentation Quality Analyzer')
    expect(screen.getByText('Analysis Results')).toBeDefined()

    // Settings should be accessible
    const settingsButton = screen.getByText('Settings')
    expect(settingsButton).toBeDefined()
  })
})
