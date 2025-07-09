'use client';

import { useState } from 'react';
import { X, TrendingUp, TrendingDown, BarChart3, PieChart, Download, Filter } from 'lucide-react';
import { QualityMetrics } from '@/types';

interface AnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for demonstration
const mockMetrics: QualityMetrics = {
  totalDocuments: 24,
  averageScore: 84.5,
  scoreDistribution: {
    excellent: 8,
    good: 12,
    fair: 3,
    poor: 1
  },
  commonIssues: [
    { type: 'Long Sentences', count: 45, percentage: 28.5 },
    { type: 'Passive Voice', count: 32, percentage: 20.3 },
    { type: 'Heading Hierarchy', count: 28, percentage: 17.7 },
    { type: 'Link Issues', count: 19, percentage: 12.0 },
    { type: 'Terminology', count: 15, percentage: 9.5 },
    { type: 'Missing Sections', count: 12, percentage: 7.6 },
    { type: 'Other', count: 7, percentage: 4.4 }
  ],
  improvementTrends: [
    { date: new Date('2024-01-01'), averageScore: 72.3, documentCount: 15 },
    { date: new Date('2024-01-15'), averageScore: 75.1, documentCount: 18 },
    { date: new Date('2024-02-01'), averageScore: 77.8, documentCount: 20 },
    { date: new Date('2024-02-15'), averageScore: 79.2, documentCount: 21 },
    { date: new Date('2024-03-01'), averageScore: 81.5, documentCount: 23 },
    { date: new Date('2024-03-15'), averageScore: 84.5, documentCount: 24 }
  ]
};

const recentAnalyses = [
  { id: '1', title: 'API Documentation', score: 92, date: new Date('2024-03-14'), issues: 3 },
  { id: '2', title: 'User Guide', score: 88, date: new Date('2024-03-13'), issues: 7 },
  { id: '3', title: 'Installation Guide', score: 76, date: new Date('2024-03-12'), issues: 12 },
  { id: '4', title: 'FAQ Section', score: 94, date: new Date('2024-03-11'), issues: 2 },
  { id: '5', title: 'Troubleshooting', score: 82, date: new Date('2024-03-10'), issues: 8 }
];

export function Analytics({ isOpen, onClose }: AnalyticsProps) {
  const [metrics] = useState<QualityMetrics>(mockMetrics);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4" />;
  };

  const exportData = () => {
    const data = {
      metrics,
      recentAnalyses,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentation-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-900">Total Documents</h3>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">{metrics.totalDocuments}</div>
              <div className="flex items-center space-x-1 text-sm text-blue-700">
                {getTrendIcon(metrics.totalDocuments, 20)}
                <span>+4 this month</span>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-900">Average Score</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900">{metrics.averageScore}%</div>
              <div className="flex items-center space-x-1 text-sm text-green-700">
                {getTrendIcon(metrics.averageScore, 79.2)}
                <span>+5.3% improvement</span>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-yellow-900">Active Issues</h3>
                <Filter className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {metrics.commonIssues.reduce((sum, issue) => sum + issue.count, 0)}
              </div>
              <div className="flex items-center space-x-1 text-sm text-yellow-700">
                {getTrendIcon(158, 180)}
                <span>-22 resolved</span>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-900">Quality Goal</h3>
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-900">85%</div>
              <div className="flex items-center space-x-1 text-sm text-purple-700">
                <span>Target achieved</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Score Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Excellent (90-100%)</span>
                  <span className="text-sm text-gray-600">{metrics.scoreDistribution.excellent} docs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.scoreDistribution.excellent / metrics.totalDocuments) * 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Good (70-89%)</span>
                  <span className="text-sm text-gray-600">{metrics.scoreDistribution.good} docs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.scoreDistribution.good / metrics.totalDocuments) * 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Fair (50-69%)</span>
                  <span className="text-sm text-gray-600">{metrics.scoreDistribution.fair} docs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.scoreDistribution.fair / metrics.totalDocuments) * 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Poor (0-49%)</span>
                  <span className="text-sm text-gray-600">{metrics.scoreDistribution.poor} docs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.scoreDistribution.poor / metrics.totalDocuments) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Issues</h3>
              <div className="space-y-3">
                {metrics.commonIssues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index < 3 ? 'bg-red-500' : index < 5 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700">{issue.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{issue.count}</div>
                      <div className="text-xs text-gray-500">{issue.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Trends */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Trend</h3>
              <div className="space-y-4">
                {metrics.improvementTrends.slice(-6).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {trend.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900">{trend.averageScore}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${trend.averageScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Analyses */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analyses</h3>
              <div className="space-y-3">
                {recentAnalyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{analysis.title}</div>
                      <div className="text-xs text-gray-700">
                        {analysis.date.toLocaleDateString()} • {analysis.issues} issues
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBgColor(analysis.score)} ${getScoreColor(analysis.score)}`}>
                      {analysis.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">47</div>
                <div className="text-sm text-gray-600">Total Analyses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">92%</div>
                <div className="text-sm text-gray-600">Improvement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">158</div>
                <div className="text-sm text-gray-600">Issues Resolved</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
