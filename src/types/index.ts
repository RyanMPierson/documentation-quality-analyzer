// Core types for the Documentation Quality Analyzer

export interface Document {
  id: string;
  title: string;
  content: string;
  filename: string;
  lastModified: Date;
  wordCount: number;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  level: number; // 1-6 for h1-h6
  content: string;
  lineNumber: number;
  anchor?: string;
}

export interface AnalysisResult {
  documentId: string;
  timestamp: Date;
  structureAnalysis: StructureAnalysis;
  linkValidation: LinkValidation;
  styleCompliance: StyleCompliance;
  readabilityScore: ReadabilityScore;
  terminologyConsistency: TerminologyConsistency;
  overallScore: number;
}

export interface StructureAnalysis {
  score: number;
  issues: StructureIssue[];
  suggestions: string[];
  headingHierarchy: HeadingHierarchy;
}

export interface StructureIssue {
  type: 'missing-section' | 'incorrect-hierarchy' | 'duplicate-heading' | 'empty-section';
  message: string;
  line?: number;
  severity: 'error' | 'warning' | 'info';
}

export interface HeadingHierarchy {
  isValid: boolean;
  structure: HeadingNode[];
  issues: string[];
}

export interface HeadingNode {
  text: string;
  level: number;
  line: number;
  children: HeadingNode[];
}

export interface LinkValidation {
  score: number;
  totalLinks: number;
  validLinks: number;
  brokenLinks: BrokenLink[];
  internalLinks: InternalLink[];
  externalLinks: ExternalLink[];
}

export interface BrokenLink {
  text: string;
  url: string;
  line: number;
  error: string;
}

export interface InternalLink {
  text: string;
  target: string;
  line: number;
  isValid: boolean;
}

export interface ExternalLink {
  text: string;
  url: string;
  line: number;
  status: 'valid' | 'broken' | 'unreachable';
}

export interface StyleCompliance {
  score: number;
  issues: StyleIssue[];
  adherencePercentage: number;
}

export interface StyleIssue {
  type: 'terminology' | 'formatting' | 'tone' | 'grammar';
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface ReadabilityScore {
  fleschKincaid: number;
  averageSentenceLength: number;
  averageWordsPerSentence: number;
  complexWords: number;
  readingLevel: string;
  suggestions: string[];
}

export interface TerminologyConsistency {
  score: number;
  inconsistencies: TerminologyIssue[];
  glossary: GlossaryTerm[];
}

export interface TerminologyIssue {
  term: string;
  alternatives: string[];
  occurrences: TermOccurrence[];
  suggestion: string;
}

export interface TermOccurrence {
  text: string;
  line: number;
  column: number;
  context: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  preferredUsage: string;
  alternatives: string[];
}

export interface QualityMetrics {
  totalDocuments: number;
  averageScore: number;
  scoreDistribution: ScoreDistribution;
  commonIssues: IssueFrequency[];
  improvementTrends: TrendData[];
}

export interface ScoreDistribution {
  excellent: number; // 90-100
  good: number; // 70-89
  fair: number; // 50-69
  poor: number; // 0-49
}

export interface IssueFrequency {
  type: string;
  count: number;
  percentage: number;
}

export interface TrendData {
  date: Date;
  averageScore: number;
  documentCount: number;
}

export interface Settings {
  styleGuide: StyleGuideConfig;
  readabilityTargets: ReadabilityTargets;
  terminologyGlossary: GlossaryTerm[];
  linkCheckSettings: LinkCheckSettings;
  qualityTargets: QualityTargets;
  expectedSections: ExpectedSections;
}

export interface QualityTargets {
  overallScoreTarget: number;
  structureScoreTarget: number;
  readabilityScoreTarget: number;
  linkValidationTarget: number;
  styleComplianceTarget: number;
  terminologyConsistencyTarget: number;
}

export interface ExpectedSections {
  enabled: boolean;
  sections: ExpectedSection[];
  allowCustomSections: boolean;
}

export interface ExpectedSection {
  name: string;
  required: boolean;
  description: string;
  patterns: string[];
  order?: number;
}

export interface StyleGuideConfig {
  enabledChecks: string[];
  customRules: CustomRule[];
  ignoredPatterns: string[];
}

export interface CustomRule {
  name: string;
  pattern: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ReadabilityTargets {
  targetFleschKincaid: number;
  maxSentenceLength: number;
  preferredReadingLevel: string;
}

export interface LinkCheckSettings {
  checkExternalLinks: boolean;
  timeout: number;
  retryCount: number;
  ignoredDomains: string[];
}
