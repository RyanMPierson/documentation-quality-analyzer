'use client';

import { useState } from 'react';
import { X, Save, RefreshCw, Plus, Trash2, GripVertical } from 'lucide-react';
import { Settings as SettingsType, StyleGuideConfig, ReadabilityTargets, LinkCheckSettings, QualityTargets, ExpectedSections } from '@/types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
}

export function Settings({ isOpen, onClose, settings, onSave }: SettingsProps) {
  const [currentSettings, setCurrentSettings] = useState<SettingsType>(settings);
  const [activeTab, setActiveTab] = useState<'style' | 'readability' | 'links' | 'glossary' | 'sections' | 'targets'>('style');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  const handleReset = () => {
    setCurrentSettings(settings);
  };

  const updateStyleGuide = (updates: Partial<StyleGuideConfig>) => {
    setCurrentSettings(prev => ({
      ...prev,
      styleGuide: { ...prev.styleGuide, ...updates }
    }));
  };

  const updateReadabilityTargets = (updates: Partial<ReadabilityTargets>) => {
    setCurrentSettings(prev => ({
      ...prev,
      readabilityTargets: { ...prev.readabilityTargets, ...updates }
    }));
  };

  const updateLinkSettings = (updates: Partial<LinkCheckSettings>) => {
    setCurrentSettings(prev => ({
      ...prev,
      linkCheckSettings: { ...prev.linkCheckSettings, ...updates }
    }));
  };

  const updateQualityTargets = (updates: Partial<QualityTargets>) => {
    setCurrentSettings(prev => ({
      ...prev,
      qualityTargets: { 
        ...{
          overallScoreTarget: 80,
          structureScoreTarget: 85,
          readabilityScoreTarget: 75,
          linkValidationTarget: 95,
          styleComplianceTarget: 80,
          terminologyConsistencyTarget: 90
        },
        ...prev.qualityTargets,
        ...updates 
      }
    }));
  };

  const updateExpectedSections = (updates: Partial<ExpectedSections>) => {
    setCurrentSettings(prev => ({
      ...prev,
      expectedSections: { 
        ...{
          enabled: true,
          sections: [],
          allowCustomSections: true
        },
        ...prev.expectedSections,
        ...updates 
      }
    }));
  };

  const toggleEnabledCheck = (checkName: string) => {
    const updatedChecks = currentSettings.styleGuide.enabledChecks.includes(checkName)
      ? currentSettings.styleGuide.enabledChecks.filter(c => c !== checkName)
      : [...currentSettings.styleGuide.enabledChecks, checkName];
    
    updateStyleGuide({ enabledChecks: updatedChecks });
  };

  const addCustomRule = () => {
    const newRule = {
      name: 'New Rule',
      pattern: '',
      message: 'Custom rule violation',
      severity: 'warning' as const
    };
    
    updateStyleGuide({
      customRules: [...currentSettings.styleGuide.customRules, newRule]
    });
  };

  const removeCustomRule = (index: number) => {
    updateStyleGuide({
      customRules: currentSettings.styleGuide.customRules.filter((_, i) => i !== index)
    });
  };

  const updateCustomRule = (index: number, updates: Partial<{ name: string; pattern: string; message: string; severity: 'error' | 'warning' | 'info' }>) => {
    const updatedRules = currentSettings.styleGuide.customRules.map((rule, i) =>
      i === index ? { ...rule, ...updates } : rule
    );
    updateStyleGuide({ customRules: updatedRules });
  };

  const addExpectedSection = () => {
    const newSection = {
      name: 'New Section',
      required: false,
      description: '',
      patterns: [],
      order: currentSettings.expectedSections.sections.length
    };
    
    updateExpectedSections({
      sections: [...currentSettings.expectedSections.sections, newSection]
    });
  };

  const removeExpectedSection = (index: number) => {
    updateExpectedSections({
      sections: currentSettings.expectedSections.sections.filter((_, i) => i !== index)
    });
  };

  const updateExpectedSection = (index: number, updates: Partial<{ name: string; required: boolean; description: string; patterns: string[]; order: number }>) => {
    const updatedSections = currentSettings.expectedSections.sections.map((section, i) =>
      i === index ? { ...section, ...updates } : section
    );
    updateExpectedSections({ sections: updatedSections });
  };

  const availableChecks = [
    { id: 'passive-voice', name: 'Passive Voice Detection', description: 'Identifies passive voice usage' },
    { id: 'click-here', name: 'Click Here Links', description: 'Detects non-descriptive link text' },
    { id: 'heading-caps', name: 'Heading Capitalization', description: 'Checks heading case consistency' },
    { id: 'sentence-length', name: 'Long Sentences', description: 'Identifies overly long sentences' },
    { id: 'terminology', name: 'Terminology Consistency', description: 'Checks for consistent term usage' },
    { id: 'contractions', name: 'Contractions', description: 'Detects informal contractions' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('style')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'style' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                Style Guide
              </button>
              <button
                onClick={() => setActiveTab('readability')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'readability' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                Readability
              </button>
              <button
                onClick={() => setActiveTab('links')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'links' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                Link Checking
              </button>
              <button
                onClick={() => setActiveTab('sections')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'sections' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                Expected Sections
              </button>
              <button
                onClick={() => setActiveTab('targets')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'targets' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                Quality Targets
              </button>
              <button
                onClick={() => setActiveTab('glossary')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'glossary' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                Glossary
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {activeTab === 'style' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Style Guide Configuration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Enabled Checks</h4>
                      <div className="space-y-2">
                        {availableChecks.map(check => (
                          <div key={check.id} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={check.id}
                              checked={currentSettings.styleGuide.enabledChecks.includes(check.id)}
                              onChange={() => toggleEnabledCheck(check.id)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                            <label htmlFor={check.id} className="flex-1">
                              <div className="font-medium text-gray-900">{check.name}</div>
                              <div className="text-sm text-gray-600">{check.description}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-700">Custom Rules</h4>
                        <button
                          onClick={addCustomRule}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          Add Rule
                        </button>
                      </div>
                      <div className="space-y-3">
                        {currentSettings.styleGuide.customRules.map((rule, index) => (
                          <div key={index} className="p-3 border border-gray-200 rounded-lg">
                            <div className="grid grid-cols-2 gap-3 mb-2">                            <input
                              type="text"
                              value={rule.name}
                              onChange={(e) => updateCustomRule(index, { name: e.target.value })}
                              placeholder="Rule name"
                              className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-500"
                            />
                            <select
                              value={rule.severity}
                              onChange={(e) => updateCustomRule(index, { severity: e.target.value as 'error' | 'warning' | 'info' })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            >
                                <option value="error">Error</option>
                                <option value="warning">Warning</option>
                                <option value="info">Info</option>
                              </select>
                            </div>
                            <input
                              type="text"
                              value={rule.pattern}
                              onChange={(e) => updateCustomRule(index, { pattern: e.target.value })}
                              placeholder="Regex pattern"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2 text-gray-900 placeholder-gray-500"
                            />
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={rule.message}
                                onChange={(e) => updateCustomRule(index, { message: e.target.value })}
                                placeholder="Error message"
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm mr-2 text-gray-900 placeholder-gray-500"
                              />
                              <button
                                onClick={() => removeCustomRule(index)}
                                className="text-red-600 hover:text-red-700 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'readability' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Readability Targets</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Flesch-Kincaid Grade Level
                      </label>
                      <input
                        type="number"
                        value={currentSettings.readabilityTargets.targetFleschKincaid}
                        onChange={(e) => updateReadabilityTargets({ targetFleschKincaid: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        min="1"
                        max="20"
                        step="0.1"
                      />
                      <p className="text-sm text-gray-700 mt-1">
                        Recommended: 8-12 for technical documentation
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Sentence Length
                      </label>
                      <input
                        type="number"
                        value={currentSettings.readabilityTargets.maxSentenceLength}
                        onChange={(e) => updateReadabilityTargets({ maxSentenceLength: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        min="10"
                        max="50"
                      />
                      <p className="text-sm text-gray-700 mt-1">
                        Recommended: 20-25 words per sentence
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Reading Level
                      </label>
                      <select
                        value={currentSettings.readabilityTargets.preferredReadingLevel}
                        onChange={(e) => updateReadabilityTargets({ preferredReadingLevel: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      >
                        <option value="Elementary">Elementary</option>
                        <option value="Middle School">Middle School</option>
                        <option value="High School">High School</option>
                        <option value="College">College</option>
                        <option value="Graduate">Graduate</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Link Checking Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="checkExternalLinks"
                        checked={currentSettings.linkCheckSettings.checkExternalLinks}
                        onChange={(e) => updateLinkSettings({ checkExternalLinks: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <label htmlFor="checkExternalLinks" className="text-sm font-medium text-gray-700">
                        Check External Links
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Request Timeout (seconds)
                      </label>
                      <input
                        type="number"
                        value={currentSettings.linkCheckSettings.timeout}
                        onChange={(e) => updateLinkSettings({ timeout: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        min="1"
                        max="60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retry Count
                      </label>
                      <input
                        type="number"
                        value={currentSettings.linkCheckSettings.retryCount}
                        onChange={(e) => updateLinkSettings({ retryCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        min="0"
                        max="5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ignored Domains (one per line)
                      </label>
                      <textarea
                        value={currentSettings.linkCheckSettings.ignoredDomains.join('\n')}
                        onChange={(e) => updateLinkSettings({ 
                          ignoredDomains: e.target.value.split('\n').filter(d => d.trim()) 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500"
                        rows={4}
                        placeholder="example.com&#10;internal.domain.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Sections Configuration</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="enableExpectedSections"
                        checked={currentSettings.expectedSections.enabled}
                        onChange={(e) => updateExpectedSections({ enabled: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <label htmlFor="enableExpectedSections" className="text-sm font-medium text-gray-700">
                        Enable Expected Sections Analysis
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowCustomSections"
                        checked={currentSettings.expectedSections.allowCustomSections}
                        onChange={(e) => updateExpectedSections({ allowCustomSections: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <label htmlFor="allowCustomSections" className="text-sm font-medium text-gray-700">
                        Allow Custom Sections (don't flag unknown sections as issues)
                      </label>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-700">Expected Sections</h4>
                        <button
                          onClick={addExpectedSection}
                          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Section</span>
                        </button>
                      </div>
                      <div className="space-y-3">
                        {currentSettings.expectedSections.sections.map((section, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                                <input
                                  type="text"
                                  value={section.name}
                                  onChange={(e) => updateExpectedSection(index, { name: e.target.value })}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-500"
                                  placeholder="e.g., Introduction"
                                />
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`required-${index}`}
                                    checked={section.required}
                                    onChange={(e) => updateExpectedSection(index, { required: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                  />
                                  <label htmlFor={`required-${index}`} className="text-sm text-gray-700">
                                    Required
                                  </label>
                                </div>
                                <button
                                  onClick={() => removeExpectedSection(index)}
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea
                                value={section.description}
                                onChange={(e) => updateExpectedSection(index, { description: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-500"
                                rows={2}
                                placeholder="Brief description of what this section should contain"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Matching Patterns (one per line)
                              </label>
                              <textarea
                                value={section.patterns.join('\n')}
                                onChange={(e) => updateExpectedSection(index, { 
                                  patterns: e.target.value.split('\n').filter(p => p.trim()) 
                                })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-500"
                                rows={3}
                                placeholder="introduction&#10;overview&#10;getting started"
                              />
                              <p className="text-xs text-gray-600 mt-1">
                                These patterns will be matched against heading text (case-insensitive)
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'targets' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Targets</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Set target scores for different quality metrics. These will be used in the dashboard progress indicators.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overall Score Target (%)
                      </label>
                      <input
                        type="number"
                        value={currentSettings.qualityTargets?.overallScoreTarget || 80}
                        onChange={(e) => updateQualityTargets({ overallScoreTarget: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Structure Score Target (%)
                      </label>
                      <input
                        type="number"
                        value={currentSettings.qualityTargets?.structureScoreTarget || 85}
                        onChange={(e) => updateQualityTargets({ structureScoreTarget: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Readability Score Target (%)
                      </label>
                      <input
                        type="number"
                        value={currentSettings.qualityTargets?.readabilityScoreTarget || 75}
                        onChange={(e) => updateQualityTargets({ readabilityScoreTarget: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link Validation Target (%)
                      </label>
                      <input
                        type="number"
                        value={currentSettings.qualityTargets?.linkValidationTarget || 95}
                        onChange={(e) => updateQualityTargets({ linkValidationTarget: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Style Compliance Target (%)
                      </label>
                      <input
                        type="number"
                        value={currentSettings.qualityTargets?.styleComplianceTarget || 80}
                        onChange={(e) => updateQualityTargets({ styleComplianceTarget: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Terminology Consistency Target (%)
                      </label>
                      <input
                        type="number"
                        value={currentSettings.qualityTargets?.terminologyConsistencyTarget || 90}
                        onChange={(e) => updateQualityTargets({ terminologyConsistencyTarget: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'glossary' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Terminology Glossary</h3>
                  
                  <div className="space-y-4">
                    {currentSettings.terminologyGlossary.map((term, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                            <input
                              type="text"
                              value={term.term}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Usage</label>
                            <input
                              type="text"
                              value={term.preferredUsage}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Definition</label>
                          <textarea
                            value={term.definition}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            rows={2}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alternatives</label>
                          <input
                            type="text"
                            value={term.alternatives.join(', ')}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            readOnly
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
