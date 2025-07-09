import { 
  AnalysisResult, 
  StructureAnalysis, 
  StructureIssue, 
  HeadingHierarchy, 
  HeadingNode,
  ReadabilityScore,
  LinkValidation,
  StyleCompliance,
  TerminologyConsistency,
  BrokenLink,
  StyleIssue,
  TerminologyIssue,
  Settings
} from '@/types';

export async function analyzeDocument(content: string, settings?: Settings): Promise<AnalysisResult> {
  const documentId = generateId();
  const timestamp = new Date();
  
  // Run all analysis functions with settings
  const [structureAnalysis, readabilityScore, linkValidation, styleCompliance, terminologyConsistency] = await Promise.all([
    analyzeStructure(content, settings),
    analyzeReadability(content, settings),
    analyzeLinks(content, settings),
    analyzeStyleCompliance(content, settings),
    analyzeTerminologyConsistency(content, settings)
  ]);

  // Calculate overall score with quality targets
  const overallScore = calculateOverallScore({
    structureAnalysis,
    readabilityScore,
    linkValidation,
    styleCompliance,
    terminologyConsistency
  }, settings);

  return {
    documentId,
    timestamp,
    structureAnalysis,
    linkValidation,
    styleCompliance,
    readabilityScore,
    terminologyConsistency,
    overallScore
  };
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function analyzeStructure(content: string, settings?: Settings): StructureAnalysis {
  const lines = content.split('\n');
  const issues: StructureIssue[] = [];
  const headings: HeadingNode[] = [];
  
  let currentLevel = 0;
  let hasH1 = false;
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Check for Markdown headings
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      
      if (level === 1) {
        hasH1 = true;
      }
      
      // Check for proper heading hierarchy
      if (level > currentLevel + 1) {
        issues.push({
          type: 'incorrect-hierarchy',
          message: `Heading level ${level} follows level ${currentLevel}, skipping levels`,
          line: index + 1,
          severity: 'warning'
        });
      }
      
      // Check for empty headings
      if (!text.trim()) {
        issues.push({
          type: 'empty-section',
          message: 'Empty heading found',
          line: index + 1,
          severity: 'error'
        });
      }
      
      // Check for duplicate headings
      if (headings.some(h => h.text.toLowerCase() === text.toLowerCase())) {
        issues.push({
          type: 'duplicate-heading',
          message: `Duplicate heading: "${text}"`,
          line: index + 1,
          severity: 'warning'
        });
      }
      
      headings.push({
        text,
        level,
        line: index + 1,
        children: []
      });
      
      currentLevel = level;
    }
  });
  
  // Check for missing H1
  if (!hasH1) {
    issues.push({
      type: 'missing-section',
      message: 'Document should have an H1 heading',
      severity: 'error'
    });
  }
  
  // Check for expected sections from settings
  const expectedSections = settings?.expectedSections;
  if (expectedSections?.enabled && expectedSections.sections.length > 0) {
    const foundSections = headings.map(h => h.text.toLowerCase());
    
    expectedSections.sections.forEach(section => {
      const sectionFound = foundSections.some(found => 
        section.patterns.length > 0 
          ? section.patterns.some(pattern => found.includes(pattern.toLowerCase()))
          : found.includes(section.name.toLowerCase())
      );
      
      if (!sectionFound) {
        issues.push({
          type: 'missing-section',
          message: `${section.required ? 'Required' : 'Recommended'} section missing: "${section.name}"${section.description ? ` - ${section.description}` : ''}`,
          severity: section.required ? 'error' : 'info'
        });
      }
    });
  } else {
    // Fallback to default common sections
    const commonSections = ['introduction', 'overview', 'getting started', 'installation', 'usage', 'examples'];
    const foundSections = headings.map(h => h.text.toLowerCase());
    
    commonSections.forEach(section => {
      if (!foundSections.some(found => found.includes(section))) {
        issues.push({
          type: 'missing-section',
          message: `Consider adding a "${section}" section`,
          severity: 'info'
        });
      }
    });
  }
  
  const headingHierarchy: HeadingHierarchy = {
    isValid: issues.filter(i => i.type === 'incorrect-hierarchy').length === 0,
    structure: headings,
    issues: issues.filter(i => i.type === 'incorrect-hierarchy').map(i => i.message)
  };
  
  // Calculate structure score
  const maxDeductions = 100;
  let deductions = 0;
  
  deductions += issues.filter(i => i.severity === 'error').length * 15;
  deductions += issues.filter(i => i.severity === 'warning').length * 10;
  deductions += issues.filter(i => i.severity === 'info').length * 5;
  
  const score = Math.max(0, 100 - Math.min(deductions, maxDeductions));
  
  const suggestions = generateStructureSuggestions(issues, headings);
  
  return {
    score,
    issues,
    suggestions,
    headingHierarchy
  };
}

function analyzeReadability(content: string, settings?: Settings): ReadabilityScore {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.trim().length > 0);
  
  const totalSentences = sentences.length;
  const totalWords = words.length;
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  // Flesch-Kincaid Grade Level
  const averageWordsPerSentence = totalWords / totalSentences;
  const averageSyllablesPerWord = totalSyllables / totalWords;
  const fleschKincaid = 0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59;
  
  // Count complex words (3+ syllables)
  const complexWords = words.filter(word => countSyllables(word) >= 3).length;
  
  // Determine reading level
  let readingLevel = 'Graduate';
  if (fleschKincaid <= 5) readingLevel = 'Elementary';
  else if (fleschKincaid <= 8) readingLevel = 'Middle School';
  else if (fleschKincaid <= 12) readingLevel = 'High School';
  else if (fleschKincaid <= 16) readingLevel = 'College';
  
  const suggestions = generateReadabilitySuggestions(fleschKincaid, averageWordsPerSentence, complexWords, settings);
  
  return {
    fleschKincaid: Math.round(fleschKincaid * 10) / 10,
    averageSentenceLength: Math.round(averageWordsPerSentence * 10) / 10,
    averageWordsPerSentence,
    complexWords,
    readingLevel,
    suggestions
  };
}

function analyzeLinks(content: string, settings?: Settings): LinkValidation {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkPattern.exec(content)) !== null) {
    const [, text, url] = match;
    const line = content.substring(0, match.index).split('\n').length;
    
    links.push({
      text,
      url,
      line,
      isInternal: !url.startsWith('http')
    });
  }
  
  const totalLinks = links.length;
  const internalLinks = links.filter(l => l.isInternal).map(l => ({
    text: l.text,
    target: l.url,
    line: l.line,
    isValid: true // In a real implementation, this would check if the target exists
  }));
  
  const externalLinks = links.filter(l => !l.isInternal).map(l => ({
    text: l.text,
    url: l.url,
    line: l.line,
    status: 'valid' as const // In a real implementation, this would check the URL
  }));
  
  const validLinks = internalLinks.filter(l => l.isValid).length + externalLinks.filter(l => l.status === 'valid').length;
  const brokenLinks: BrokenLink[] = []; // Would be populated by actual link checking
  
  const score = totalLinks > 0 ? Math.round((validLinks / totalLinks) * 100) : 100;
  
  return {
    score,
    totalLinks,
    validLinks,
    brokenLinks,
    internalLinks,
    externalLinks
  };
}

function analyzeStyleCompliance(content: string, settings?: Settings): StyleCompliance {
  const issues: StyleIssue[] = [];
  const lines = content.split('\n');
  
  const enabledChecks = settings?.styleGuide?.enabledChecks || ['passive-voice', 'click-here', 'heading-caps', 'sentence-length'];
  const customRules = settings?.styleGuide?.customRules || [];
  
  lines.forEach((line, index) => {
    // Check for "click here" links
    if (enabledChecks.includes('click-here') && line.toLowerCase().includes('click here')) {
      issues.push({
        type: 'formatting' as const,
        message: 'Avoid using "click here" in links',
        line: index + 1,
        column: line.indexOf('click here'),
        severity: 'warning' as const,
        suggestion: 'Use descriptive link text that explains what the link does'
      });
    }
    
    // Check for passive voice (simplified)
    if (enabledChecks.includes('passive-voice') && line.match(/\b(is|are|was|were|being|been)\s+\w+ed\b/)) {
      issues.push({
        type: 'tone' as const,
        message: 'Consider using active voice instead of passive voice',
        line: index + 1,
        column: 0,
        severity: 'info' as const,
        suggestion: 'Rewrite in active voice for clarity'
      });
    }
    
    // Check sentence length if enabled
    if (enabledChecks.includes('sentence-length')) {
      const sentences = line.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const maxLength = settings?.readabilityTargets?.maxSentenceLength || 20;
      
      sentences.forEach(sentence => {
        const wordCount = sentence.split(/\s+/).filter(w => w.trim().length > 0).length;
        if (wordCount > maxLength) {
          issues.push({
            type: 'grammar' as const,
            message: `Sentence is too long (${wordCount} words, max: ${maxLength})`,
            line: index + 1,
            column: 0,
            severity: 'info' as const,
            suggestion: `Break this sentence into smaller parts`
          });
        }
      });
    }
    
    // Apply custom rules
    customRules.forEach(rule => {
      try {
        const regex = new RegExp(rule.pattern, 'gi');
        if (regex.test(line)) {
          issues.push({
            type: 'formatting' as const,
            message: rule.message,
            line: index + 1,
            column: 0,
            severity: rule.severity,
            suggestion: `Custom rule: ${rule.name}`
          });
        }
      } catch (e) {
        // Invalid regex pattern, skip this rule
      }
    });
  });
  
  const totalChecks = lines.length;
  const issueCount = issues.length;
  const adherencePercentage = Math.round(((totalChecks - issueCount) / totalChecks) * 100);
  const score = Math.max(0, 100 - issueCount * 5);
  
  return {
    score,
    issues,
    adherencePercentage
  };
}

function analyzeTerminologyConsistency(content: string, settings?: Settings): TerminologyConsistency {
  const inconsistencies: TerminologyIssue[] = [];
  
  // Use glossary from settings or default one
  const glossary = settings?.terminologyGlossary || [
    {
      term: 'API',
      definition: 'Application Programming Interface',
      preferredUsage: 'API',
      alternatives: ['api', 'Api']
    },
    {
      term: 'JavaScript',
      definition: 'Programming language',
      preferredUsage: 'JavaScript',
      alternatives: ['javascript', 'Javascript', 'JS']
    }
  ];
  
  // Check for terminology consistency using glossary
  glossary.forEach(glossaryEntry => {
    const allVariations = [glossaryEntry.term, ...glossaryEntry.alternatives];
    const foundVariations = new Set<string>();
    
    allVariations.forEach(variation => {
      const regex = new RegExp(`\\b${variation}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        matches.forEach(match => foundVariations.add(match));
      }
    });
    
    if (foundVariations.size > 1) {
      inconsistencies.push({
        term: glossaryEntry.term,
        alternatives: Array.from(foundVariations),
        occurrences: Array.from(foundVariations).map(variation => ({
          text: variation,
          line: 1, // Would need to calculate actual line
          column: 0,
          context: ''
        })),
        suggestion: `Use consistent terminology: "${glossaryEntry.preferredUsage}"`
      });
    }
  });
  
  // Simple consistency check for other terms
  const words = content.split(/\s+/);
  const termCounts = new Map();
  
  words.forEach((word, index) => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 2) {
      const key = cleanWord.toLowerCase();
      if (!termCounts.has(key)) {
        termCounts.set(key, []);
      }
      termCounts.get(key).push({ original: cleanWord, index });
    }
  });
  
  // Check for inconsistent capitalization
  termCounts.forEach((occurrences, key) => {
    const variations = [...new Set(occurrences.map((o: { original: string; index: number }) => o.original))] as string[];
    if (variations.length > 1) {
      inconsistencies.push({
        term: key,
        alternatives: variations,
        occurrences: occurrences.map((o: { original: string; index: number }) => ({
          text: o.original,
          line: 1, // Would need to calculate actual line
          column: o.index,
          context: ''
        })),
        suggestion: `Use consistent capitalization for "${key}"`
      });
    }
  });
  
  const score = Math.max(0, 100 - inconsistencies.length * 10);
  
  return {
    score,
    inconsistencies,
    glossary
  };
}

function countSyllables(word: string): number {
  if (!word) return 0;
  
  word = word.toLowerCase();
  let syllables = 0;
  const vowels = 'aeiouy';
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      syllables++;
    }
    previousWasVowel = isVowel;
  }
  
  // Handle silent 'e'
  if (word.endsWith('e') && syllables > 1) {
    syllables--;
  }
  
  return Math.max(1, syllables);
}

function generateStructureSuggestions(issues: StructureIssue[], headings: HeadingNode[]): string[] {
  const suggestions = [];
  
  if (issues.some(i => i.type === 'missing-section')) {
    suggestions.push('Add missing sections to improve document completeness');
  }
  
  if (issues.some(i => i.type === 'incorrect-hierarchy')) {
    suggestions.push('Fix heading hierarchy to follow proper structure (H1 → H2 → H3, etc.)');
  }
  
  if (headings.length === 0) {
    suggestions.push('Add headings to structure your document better');
  }
  
  if (headings.length < 3) {
    suggestions.push('Consider adding more headings to break up large sections');
  }
  
  return suggestions;
}

function generateReadabilitySuggestions(fleschKincaid: number, averageWordsPerSentence: number, complexWords: number, settings?: Settings): string[] {
  const suggestions = [];
  
  const targetFK = settings?.readabilityTargets?.targetFleschKincaid || 12;
  const maxSentenceLength = settings?.readabilityTargets?.maxSentenceLength || 20;
  
  if (fleschKincaid > targetFK) {
    suggestions.push(`Consider simplifying language for better readability (target: ${targetFK})`);
  }
  
  if (averageWordsPerSentence > maxSentenceLength) {
    suggestions.push(`Break up long sentences to improve clarity (max: ${maxSentenceLength} words)`);
  }
  
  if (complexWords > 10) {
    suggestions.push('Replace complex words with simpler alternatives where possible');
  }
  
  return suggestions;
}

function calculateOverallScore({
  structureAnalysis,
  readabilityScore,
  linkValidation,
  styleCompliance,
  terminologyConsistency
}: {
  structureAnalysis: StructureAnalysis;
  readabilityScore: ReadabilityScore;
  linkValidation: LinkValidation;
  styleCompliance: StyleCompliance;
  terminologyConsistency: TerminologyConsistency;
}, settings?: Settings): number {
  // Use default weights or weights from settings
  const weights = {
    structure: 0.3,
    readability: 0.2,
    links: 0.2,
    style: 0.15,
    terminology: 0.15
  };
  
  const readabilityScoreNormalized = Math.max(0, Math.min(100, 100 - (readabilityScore.fleschKincaid - 8) * 5));
  
  const weightedScore = 
    structureAnalysis.score * weights.structure +
    readabilityScoreNormalized * weights.readability +
    linkValidation.score * weights.links +
    styleCompliance.score * weights.style +
    terminologyConsistency.score * weights.terminology;
  
  return Math.round(weightedScore);
}
