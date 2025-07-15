import { analyzeDocument } from '@/lib/analyzer'
import { Settings } from '@/types'

const mockSettings: Settings = {
  styleGuide: {
    enabledChecks: ['terminology', 'tone', 'formatting'],
    customRules: [],
    ignoredPatterns: []
  },
  readabilityTargets: {
    targetFleschKincaid: 60,
    maxSentenceLength: 25,
    preferredReadingLevel: 'intermediate'
  },
  terminologyGlossary: [],
  linkCheckSettings: {
    checkExternalLinks: false,
    timeout: 5000,
    retryCount: 2,
    ignoredDomains: []
  },
  qualityTargets: {
    overallScoreTarget: 80,
    structureScoreTarget: 85,
    readabilityScoreTarget: 70,
    linkValidationTarget: 95,
    styleComplianceTarget: 90,
    terminologyConsistencyTarget: 85
  },
  expectedSections: {
    enabled: true,
    allowCustomSections: true,
    sections: [
      { name: 'Introduction', required: true, description: 'Overview', patterns: ['intro', 'introduction'] },
      { name: 'Conclusion', required: false, description: 'Summary', patterns: ['conclusion', 'summary'] }
    ]
  }
}

describe('Analyzer Unit Tests', () => {
  test('analyzes document structure correctly', async () => {
    const content = `# Main Title\n\n## Section 1\n\nContent here.\n\n## Section 2\n\nMore content.`
    
    const result = await analyzeDocument(content, mockSettings)
    
    expect(result.structureAnalysis).toBeDefined()
    expect(result.structureAnalysis.score).toBeGreaterThan(0)
    expect(result.structureAnalysis.headingHierarchy).toBeDefined()
    expect(result.structureAnalysis.issues).toBeDefined()
  })

  test('calculates readability metrics', async () => {
    const content = `# Test Document\n\nThis is a simple test sentence. This is another sentence for testing.`
    
    const result = await analyzeDocument(content, mockSettings)
    
    expect(result.readabilityScore).toBeDefined()
    expect(result.readabilityScore.fleschKincaid).toBeGreaterThan(0)
    expect(result.readabilityScore.averageSentenceLength).toBeGreaterThan(0)
  })

  test('validates links in document', async () => {
    const content = `# Test\n\n[Internal link](#section)\n[External link](https://example.com)`
    
    const result = await analyzeDocument(content, mockSettings)
    
    expect(result.linkValidation).toBeDefined()
    expect(result.linkValidation.totalLinks).toBe(2)
    expect(result.linkValidation.validLinks).toBeGreaterThanOrEqual(0)
  })

  test('calculates overall score', async () => {
    const content = `# Test Document\n\n## Introduction\n\nThis is a well-structured document with multiple sections.\n\n## Conclusion\n\nThis document demonstrates good structure.`
    
    const result = await analyzeDocument(content, mockSettings)
    
    expect(result.overallScore).toBeGreaterThan(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
    expect(typeof result.overallScore).toBe('number')
    expect(isNaN(result.overallScore)).toBe(false)
  })

  test('includes timestamp and document ID', async () => {
    const content = `# Test`
    
    const result = await analyzeDocument(content, mockSettings)
    
    expect(result.documentId).toBeDefined()
    expect(result.timestamp).toBeDefined()
    expect(result.timestamp instanceof Date).toBe(true)
  })
})
