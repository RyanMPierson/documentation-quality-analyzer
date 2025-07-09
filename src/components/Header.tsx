'use client';

import { useState } from 'react';
import { FileText, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { Settings } from './Settings';
import { Analytics } from './Analytics';
import { Settings as SettingsType } from '@/types';

// Default settings
const defaultSettings: SettingsType = {
  styleGuide: {
    enabledChecks: ['passive-voice', 'click-here', 'heading-caps', 'sentence-length', 'terminology'],
    customRules: [],
    ignoredPatterns: []
  },
  readabilityTargets: {
    targetFleschKincaid: 10,
    maxSentenceLength: 25,
    preferredReadingLevel: 'High School'
  },
  terminologyGlossary: [
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
  ],
  linkCheckSettings: {
    checkExternalLinks: true,
    timeout: 10,
    retryCount: 2,
    ignoredDomains: ['localhost', 'internal.company.com']
  }
};

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);

  const handleSettingsSave = (newSettings: SettingsType) => {
    setSettings(newSettings);
    // In a real app, you'd save to localStorage or API
    localStorage.setItem('documentAnalyzerSettings', JSON.stringify(newSettings));
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Documentation Quality Analyzer
                </h1>
                <p className="text-sm text-gray-600">
                  Analyze and improve your technical documentation
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsAnalyticsOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Analytics</span>
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <Settings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />

      <Analytics
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    </>
  );
}
