import { render } from '@testing-library/react'
import { AnalyticsProvider } from '@/lib/useAnalytics'
import { SettingsProvider } from '@/lib/useSettings'

// Common test utilities and helpers

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <SettingsProvider>
      <AnalyticsProvider>
        {ui}
      </AnalyticsProvider>
    </SettingsProvider>
  )
}

export const createMockAnalysisResult = (overrides = {}) => ({
  documentId: 'test-doc-123',
  timestamp: new Date('2025-01-15T10:00:00Z'),
  structureAnalysis: {
    score: 85,
    issues: [],
    suggestions: ['Improve heading structure'],
    headingHierarchy: {
      isValid: true,
      structure: [
        { level: 1, text: 'Introduction', line: 1, children: [] }
      ],
      issues: []
    }
  },
  linkValidation: {
    score: 92,
    totalLinks: 5,
    validLinks: 4,
    brokenLinks: [],
    externalLinks: [],
    internalLinks: []
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
  overallScore: 83,
  ...overrides
})

export const createMockSettings = (overrides = {}) => ({
  styleGuide: {
    enabledChecks: ['passive-voice', 'click-here', 'heading-caps', 'sentence-length'],
    customRules: [],
    ignoredPatterns: []
  },
  readabilityTargets: {
    targetFleschKincaid: 12,
    maxSentenceLength: 20,
    preferredReadingLevel: 'High School'
  },
  terminologyGlossary: [],
  linkCheckSettings: {
    checkExternalLinks: true,
    timeout: 5000,
    retryCount: 3,
    ignoredDomains: []
  },
  qualityTargets: {
    overallScoreTarget: 80,
    structureScoreTarget: 85,
    readabilityScoreTarget: 75,
    linkValidationTarget: 95,
    styleComplianceTarget: 80,
    terminologyConsistencyTarget: 90
  },
  expectedSections: {
    enabled: true,
    sections: [
      { name: 'Introduction', required: true, description: 'Overview', patterns: ['introduction'], order: 1 }
    ],
    allowCustomSections: true
  },
  ...overrides
})

export const sampleDocuments = {
  wellStructured: `# Getting Started Guide

## Introduction

Welcome to our comprehensive documentation system.

## Installation

Follow these steps to install:

1. Install Node.js
2. Run npm install
3. Configure your settings

## Usage

Basic usage instructions here.

### Advanced Features

More complex functionality.

## Support

Contact us for help.`,

  poorlyStructured: `### Getting Started

No H1 heading.

##### Installation

Skipped levels.

### Getting Started

Duplicate heading.

Click here for more info.

This is a really really really really really really really really long sentence.`,

  empty: '',

  withLinks: `# Documentation

Visit [our website](https://example.com) for more info.

Check the [internal section](#usage) below.

Email us at [support](mailto:help@example.com).

## Usage

Content here.`,

  withIssues: `# Document

Click here to read more.

The document was written by the team.

THIS HEADING IS ALL CAPS

api and API and Api usage varies.`
}

export const waitForAnalysis = async (screen: any, timeout = 5000) => {
  const { waitFor } = await import('@testing-library/react')
  await waitFor(() => {
    expect(screen.getByText('Analysis Results')).toBeDefined()
  }, { timeout })
}
