'use client';

import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, TrendingUp, Settings as SettingsIcon } from 'lucide-react';
import { AnalysisResult } from '@/types';
import { analyzeDocument } from '@/lib/analyzer';
import { Settings as SettingsModal } from './Settings';
import { useAnalytics } from '@/lib/useAnalytics';

export function DocumentAnalyzer() {
  const [document, setDocument] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docId, setDocId] = useState('');
  
  // Default settings
  const [settings, setSettings] = useState({
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
        { name: 'Introduction', required: true, description: 'Overview of the topic', patterns: ['introduction', 'overview'], order: 1 },
        { name: 'Installation', required: false, description: 'Setup instructions', patterns: ['installation', 'setup', 'getting started'], order: 2 },
        { name: 'Usage', required: true, description: 'How to use the product', patterns: ['usage', 'how to use', 'examples'], order: 3 },
        { name: 'API Reference', required: false, description: 'API documentation', patterns: ['api', 'reference', 'methods'], order: 4 }
      ],
      allowCustomSections: true
    }
  });

  const { metrics, setMetrics } = useAnalytics();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setDocument(content);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeDocument(document, settings);
    setAnalysis(result);
    // Update analytics metrics here
    let updatedMetrics = metrics ? { ...metrics } : {
      totalDocuments: 0,
      averageScore: 0,
      scoreDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
      commonIssues: [],
      improvementTrends: [],
      recentAnalyses: [],
      lastStructureScore: 0,
      lastReadabilityScore: 0,
      lastLinksOk: 0,
      lastStyleCompliance: 0,
      lastTerminologyConsistency: 0
    };
    updatedMetrics.totalDocuments += 1;
    updatedMetrics.averageScore = Math.round(
      ((updatedMetrics.averageScore * (updatedMetrics.totalDocuments - 1)) + result.overallScore) / updatedMetrics.totalDocuments
    );
    // Add to recent analyses (max 10)
    // Only filter style compliance issues by enabled checks; always include structure and link issues
    const enabledChecks = settings.styleGuide.enabledChecks || [];
    const filteredStyleIssues = result.styleCompliance.issues.filter(issue => {
      // Map issue type/message to check id
      if (issue.message.includes('active voice')) return enabledChecks.includes('passive-voice');
      if (issue.message.includes('click here')) return enabledChecks.includes('click-here');
      if (issue.message.includes('Sentence is too long')) return enabledChecks.includes('sentence-length');
      // Custom rules: always include
      if (issue.type === 'formatting') return true;
      // Exclude unmapped style issues
      return false;
    });
    const allIssues = [
      ...result.structureAnalysis.issues.map(i => i.message), // always include
      ...filteredStyleIssues.map(i => i.message), // filtered
      ...result.linkValidation.brokenLinks.map(i => i.error) // always include
    ];
    const newRecent = {
      id: docId || result.documentId,
      title: docTitle || 'Untitled Document', // Use user-provided title if available
      score: result.overallScore,
      date: new Date(),
      issues: allIssues.length,
      issueList: allIssues // NEW: store issue messages/types
    };
    updatedMetrics.recentAnalyses = [newRecent, ...(updatedMetrics.recentAnalyses || [])].slice(0, 5);
    // Store per-metric values for dashboard
    updatedMetrics.lastStructureScore = result.structureAnalysis.score;
    updatedMetrics.lastReadabilityScore = Math.max(0, Math.min(100, 100 - (result.readabilityScore.fleschKincaid - 8) * 5));
    updatedMetrics.lastLinksOk = result.linkValidation.totalLinks > 0 ? Math.round((result.linkValidation.validLinks / result.linkValidation.totalLinks) * 100) : 0;
    updatedMetrics.lastStyleCompliance = result.styleCompliance.adherencePercentage ?? result.styleCompliance.score;
    updatedMetrics.lastTerminologyConsistency = result.terminologyConsistency.score;
    // Update improvementTrends for trend graph
    const trendPoint = {
      date: new Date(),
      averageScore: result.overallScore,
      documentCount: updatedMetrics.totalDocuments
    };
    updatedMetrics.improvementTrends = [
      ...(updatedMetrics.improvementTrends || []),
      trendPoint
    ].slice(-60); // keep last 60 points (enough for 2 months daily)

    // --- FIX: Update scoreDistribution ---
    // Recalculate score distribution from all recent analyses
    const dist = { excellent: 0, good: 0, fair: 0, poor: 0 };
    let totalIssues = 0;
    (updatedMetrics.recentAnalyses || []).forEach(a => {
      if (a.score >= 90) dist.excellent++;
      else if (a.score >= 70) dist.good++;
      else if (a.score >= 50) dist.fair++;
      else dist.poor++;
      totalIssues += a.issues || 0;
    });
    updatedMetrics.scoreDistribution = dist;
    // --- END FIX ---
    // --- FIX: Update commonIssues total for dashboard quick stats ---
    updatedMetrics.commonIssues = [
      { type: 'All', count: totalIssues, percentage: 100 }
    ];
    // --- END FIX ---

    // Find previous analysis for this document ID
    const previousAnalysis = (updatedMetrics.recentAnalyses || []).find(a => a.id === (docId || result.documentId));
    let issuesResolved = 0;
    if (previousAnalysis && previousAnalysis.issueList && previousAnalysis.issueList.length > 0) {
      // Count issues that were present before but not in the new analysis
      const prevIssues = new Set(previousAnalysis.issueList);
      const currentIssues = new Set(allIssues);
      prevIssues.forEach(issue => {
        if (!currentIssues.has(issue)) issuesResolved++;
      });
    }
    updatedMetrics.issuesResolved = (updatedMetrics.issuesResolved || 0) + issuesResolved;

    setMetrics(updatedMetrics);
    setIsAnalyzing(false);
  };

  // Compose all issues for display (structure, filtered style, and link issues)
  type DisplayIssue = {
    type: string;
    message: string;
    line?: number;
    severity: 'error' | 'warning' | 'info';
    source: string;
  };
  const displayIssues: DisplayIssue[] = [
    ...analysis?.structureAnalysis.issues.map(i => ({
      type: i.type,
      message: i.message,
      line: i.line,
      severity: i.severity,
      source: 'Structure'
    })) || [],
    ...((analysis && analysis.styleCompliance && settings) ? analysis.styleCompliance.issues.filter(issue => {
      const enabledChecks = settings.styleGuide.enabledChecks || [];
      if (issue.message.includes('active voice')) return enabledChecks.includes('passive-voice');
      if (issue.message.includes('click here')) return enabledChecks.includes('click-here');
      if (issue.message.includes('Sentence is too long')) return enabledChecks.includes('sentence-length');
      if (issue.type === 'formatting') return true;
      return false;
    }).map(i => ({
      type: i.type,
      message: i.message,
      line: i.line,
      severity: i.severity,
      source: 'Style'
    })) : []),
    ...analysis?.linkValidation.brokenLinks.map(i => ({
      type: 'broken-link',
      message: i.error,
      line: i.line,
      severity: 'error' as const,
      source: 'Links'
    })) || []
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Document Input */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Document Input</span>
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4 text-gray-700" />
                  <span className="text-sm text-gray-700">Choose File</span>
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-700">
                  Support: .txt, .md files
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or paste your document content
              </label>
              <textarea
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Paste your documentation content here..."
                className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                placeholder="Enter document title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 mb-2"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document ID (for analytics tracking)
              </label>
              <input
                type="text"
                value={docId}
                onChange={e => setDocId(e.target.value)}
                placeholder="Enter unique document ID (e.g. filename, slug, or hash)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 mb-2"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleAnalyze}
                disabled={!document.trim() || isAnalyzing}
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Analyze Document</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Analysis Results</span>
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}%
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.readabilityScore.fleschKincaid)}`}>
                  {analysis.readabilityScore.fleschKincaid}
                </div>
                <div className="text-sm text-gray-600">Readability</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.structureAnalysis.score)}`}>
                  {analysis.structureAnalysis.score}%
                </div>
                <div className="text-sm text-gray-600">Structure</div>
              </div>
            </div>

            {/* Issues */}
            {displayIssues.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span>Issues Found</span>
                </h3>
                <div className="space-y-2">
                  {displayIssues.map((issue, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        issue.severity === 'error' ? 'bg-red-500' : 
                        issue.severity === 'warning' ? 'bg-yellow-500' : 
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {issue.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} <span className="text-xs text-gray-500">[{issue.source}]</span>
                        </div>
                        <div className="text-sm text-gray-600">{issue.message}</div>
                        {issue.line && (
                          <div className="text-xs text-gray-500 mt-1">Line {issue.line}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysis.structureAnalysis.suggestions.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-md font-semibold text-gray-900">Suggestions</h3>
                <div className="space-y-2">
                  {analysis.structureAnalysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700">{suggestion}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
