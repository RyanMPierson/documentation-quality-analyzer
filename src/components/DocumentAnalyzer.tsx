'use client';

import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, TrendingUp, Settings as SettingsIcon } from 'lucide-react';
import { AnalysisResult, Settings } from '@/types';
import { analyzeDocument } from '@/lib/analyzer';
import { Settings as SettingsModal } from './Settings';

export function DocumentAnalyzer() {
  const [document, setDocument] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Default settings
  const [settings, setSettings] = useState<Settings>({
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
    if (!document.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeDocument(document, settings);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
            {analysis.structureAnalysis.issues.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span>Issues Found</span>
                </h3>
                <div className="space-y-2">
                  {analysis.structureAnalysis.issues.map((issue, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        issue.severity === 'error' ? 'bg-red-500' : 
                        issue.severity === 'warning' ? 'bg-yellow-500' : 
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {issue.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
}
