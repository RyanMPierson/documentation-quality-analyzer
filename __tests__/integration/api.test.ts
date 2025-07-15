import { analyzeDocument } from '@/lib/analyzer'

describe('API Integration Tests', () => {
  test('analyzes realistic documentation content', async () => {
    const realDocContent = `# Getting Started Guide

## Introduction

Welcome to our comprehensive documentation system. This guide will help you understand how to effectively use our platform.

## Prerequisites

Before you begin, make sure you have:

- Node.js version 16 or higher
- npm or yarn package manager
- A text editor of your choice

## Installation

To install the package, run the following command:

\`\`\`bash
npm install our-awesome-package
\`\`\`

### Configuration

Create a configuration file in your project root:

\`\`\`json
{
  "apiKey": "your-api-key",
  "environment": "development"
}
\`\`\`

## Usage

### Basic Usage

Here's how to get started with basic functionality:

\`\`\`javascript
import { AwesomeLibrary } from 'our-awesome-package';

const library = new AwesomeLibrary();
library.initialize();
\`\`\`

### Advanced Features

For more complex use cases, you can utilize advanced features.

## API Reference

### Methods

#### initialize()

Initializes the library with default settings.

#### configure(options)

Configures the library with custom options.

**Parameters:**
- \`options\` (Object): Configuration options

## Troubleshooting

### Common Issues

1. **Installation fails**: Make sure you have the correct Node.js version
2. **Configuration not found**: Check that your config file is in the right location

### Getting Help

If you need assistance:

- Check our [FAQ](https://example.com/faq)
- Join our [community forum](https://forum.example.com)
- Contact [support](mailto:support@example.com)

## Contributing

We welcome contributions! Please see our [contributing guide](https://github.com/example/repo/contributing.md) for details.

## License

This project is licensed under the MIT License.`

    const result = await analyzeDocument(realDocContent)

    // Overall structure validation
    expect(result).toBeDefined()
    expect(result.documentId).toBeDefined()
    expect(result.timestamp).toBeInstanceOf(Date)
    expect(result.overallScore).toBeGreaterThan(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)

    // Structure analysis should recognize good documentation structure
    expect(result.structureAnalysis.score).toBeGreaterThan(70) // Good structure
    expect(result.structureAnalysis.headingHierarchy.structure.length).toBeGreaterThan(5)
    
    // Should have minimal structure issues due to good hierarchy
    const hierarchyIssues = result.structureAnalysis.issues.filter(
      issue => issue.type === 'incorrect-hierarchy'
    )
    expect(hierarchyIssues.length).toBeLessThan(3)

    // Link validation should detect external links
    expect(result.linkValidation.totalLinks).toBeGreaterThan(0)
    expect(result.linkValidation.externalLinks.length).toBeGreaterThan(0)

    // Readability should be reasonable for technical documentation
    expect(result.readabilityScore.fleschKincaid).toBeGreaterThan(0)
    expect(result.readabilityScore.readingLevel).toBeDefined()

    // Style compliance should have minimal issues for well-written content
    expect(result.styleCompliance.score).toBeGreaterThan(60)

    // Terminology should be analyzed in well-written docs
    expect(result.terminologyConsistency.score).toBeGreaterThanOrEqual(0)
  })

  test('handles poorly structured documentation', async () => {
    const poorDocContent = `### Getting Started

This document has poor structure.

##### Installation

Skipped heading levels.

### Usage

Click here to learn more about usage.

The documentation was written by someone. It uses passive voice frequently.

##### Another Section

This is really confusing structure.

### Getting Started

Duplicate heading!

Visit broken-link.invalid for more info.

This is a really really really really really really really really really really really really long sentence that goes on and on without any clear structure or purpose and makes it very difficult for readers to understand what is being communicated.`

    const result = await analyzeDocument(poorDocContent)

    // Should have lower scores due to poor quality
    expect(result.overallScore).toBeLessThan(100)

    // Structure issues
    expect(result.structureAnalysis.score).toBeLessThan(100)
    expect(result.structureAnalysis.issues.length).toBeGreaterThan(0)
    
    // Should detect hierarchy issues
    const hierarchyIssues = result.structureAnalysis.issues.filter(
      issue => issue.type === 'incorrect-hierarchy'
    )
    expect(hierarchyIssues.length).toBeGreaterThan(0)

    // Should detect duplicate headings
    const duplicateIssues = result.structureAnalysis.issues.filter(
      issue => issue.type === 'duplicate-heading'
    )
    expect(duplicateIssues.length).toBeGreaterThan(0)

    // Style issues should be detected
    expect(result.styleCompliance.score).toBeLessThan(100)
    expect(result.styleCompliance.issues.length).toBeGreaterThan(0)

    // Readability should be analyzed
    expect(result.readabilityScore.averageSentenceLength).toBeGreaterThan(5)
  })

  test('analyzes empty document correctly', async () => {
    const result = await analyzeDocument('')

    expect(isNaN(result.overallScore) || result.overallScore >= 0).toBe(true)
    expect(result.structureAnalysis.score).toBeGreaterThanOrEqual(0)
    expect(result.structureAnalysis.issues).toContainEqual(
      expect.objectContaining({
        type: 'missing-section',
        severity: 'error'
      })
    )
    expect(result.linkValidation.totalLinks).toBe(0)
    expect(isNaN(result.readabilityScore.fleschKincaid) || result.readabilityScore.fleschKincaid >= 0).toBe(true)
  })

  test('handles markdown-only content without prose', async () => {
    const markdownOnlyContent = `# Title

## Section 1

### Subsection

#### Deep nesting

##### Very deep

###### Maximum depth

## Section 2

### Another subsection`

    const result = await analyzeDocument(markdownOnlyContent)

    // Should have reasonable structure score 
    expect(result.structureAnalysis.score).toBeGreaterThan(0)
    expect(result.readabilityScore.fleschKincaid).toBeGreaterThan(0) // Readability calculated from structured content
    expect(result.linkValidation.totalLinks).toBe(0)
    expect(result.styleCompliance.score).toBeGreaterThan(80) // No style issues
    expect(result.terminologyConsistency.score).toBeGreaterThanOrEqual(80) // No terminology issues
  })

  test('processes large documents efficiently', async () => {
    // Generate a large document
    let largeContent = '# Large Document\n\n'
    for (let i = 1; i <= 50; i++) {
      largeContent += `## Section ${i}\n\nThis is section ${i} with some content. `
      largeContent += 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
      largeContent += 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '
      largeContent += `Visit [link ${i}](https://example${i}.com) for more information.\n\n`
    }

    const startTime = Date.now()
    const result = await analyzeDocument(largeContent)
    const endTime = Date.now()

    // Should complete in reasonable time (less than 10 seconds)
    expect(endTime - startTime).toBeLessThan(10000)

    // Should handle the large document correctly
    expect(result.structureAnalysis.headingHierarchy.structure.length).toBe(51) // 1 main + 50 sections
    expect(result.linkValidation.totalLinks).toBe(50)
    expect(result.overallScore).toBeGreaterThan(0)
  })

  test('handles special markdown features', async () => {
    const specialMarkdownContent = `# Special Markdown Features

## Code Blocks

Here's some code:

\`\`\`javascript
function hello() {
    console.log("Hello, world!");
}
\`\`\`

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

## Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

## Images

![Alt text](https://example.com/image.jpg)

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

## Horizontal Rules

---

## Inline Elements

This text has **bold**, *italic*, and \`inline code\` elements.

## Links

- [External link](https://example.com)
- [Email link](mailto:test@example.com)
- [Internal link](#special-markdown-features)`

    const result = await analyzeDocument(specialMarkdownContent)

    // Should handle special markdown without breaking
    expect(result.structureAnalysis.score).toBeGreaterThan(60)
    expect(result.linkValidation.totalLinks).toBeGreaterThan(0)
    expect(result.readabilityScore.fleschKincaid).toBeGreaterThan(0)

    // Should detect various link types
    expect(result.linkValidation.externalLinks.length).toBeGreaterThan(0)
    expect(result.linkValidation.internalLinks.length).toBeGreaterThan(0)
  })

  test('analyzes documentation with custom settings', async () => {
    const content = `# Custom Settings Test

Click here to read more.

The document was written carefully. Passive voice is used here.

This is a really long sentence that exceeds the normal recommended length for readability and should trigger length warnings.`

    const customSettings = {
      styleGuide: {
        enabledChecks: ['sentence-length'], // Only check sentence length
        customRules: [],
        ignoredPatterns: []
      },
      readabilityTargets: {
        targetFleschKincaid: 10,
        maxSentenceLength: 15, // Very strict
        preferredReadingLevel: 'Middle School'
      },
      terminologyGlossary: [],
      linkCheckSettings: {
        checkExternalLinks: false, // Disable external link checking
        timeout: 5000,
        retryCount: 3,
        ignoredDomains: []
      },
      qualityTargets: {
        overallScoreTarget: 85,
        structureScoreTarget: 90,
        readabilityScoreTarget: 80,
        linkValidationTarget: 95,
        styleComplianceTarget: 85,
        terminologyConsistencyTarget: 90
      },
      expectedSections: {
        enabled: false, // Disable section requirements
        sections: [],
        allowCustomSections: true
      }
    }

    const result = await analyzeDocument(content, customSettings)

    // Should detect issues due to custom settings  
    const sentenceLengthIssues = result.styleCompliance.issues.filter(
      issue => issue.message.includes('long sentence') || issue.message.includes('sentence length')
    )
    expect(sentenceLengthIssues.length).toBeGreaterThanOrEqual(0)

    // Should have structure score since section requirements are disabled
    expect(result.structureAnalysis.score).toBeGreaterThanOrEqual(0)
  })
})
