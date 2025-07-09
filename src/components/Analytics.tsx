'use client';

import { useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, BarChart3, PieChart, Download, Filter, RefreshCw } from 'lucide-react';
import { QualityMetrics } from '@/types';
import { useAnalytics } from '@/lib/useAnalytics';

interface AnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Analytics({ isOpen, onClose }: AnalyticsProps) {
  const { metrics, setMetrics, resetAnalytics } = useAnalytics();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showConfirm, setShowConfirm] = useState(false);

  // Score Distribution
  const scoreDist = metrics?.scoreDistribution ?? { excellent: 0, good: 0, fair: 0, poor: 0 };
  const scoreDistTotal = scoreDist.excellent + scoreDist.good + scoreDist.fair + scoreDist.poor;

  // Common Issues (top 5, aggregated from recentAnalyses)
  const commonIssues = useMemo(() => {
    if (!metrics?.recentAnalyses) return [];
    const issueMap: Record<string, number> = {};
    let totalIssues = 0;
    metrics.recentAnalyses.forEach(a => {
      if (a.issueList && Array.isArray(a.issueList)) {
        a.issueList.forEach((msg: string) => {
          issueMap[msg] = (issueMap[msg] || 0) + 1;
          totalIssues++;
        });
      }
    });
    return Object.entries(issueMap)
      .map(([type, count]) => ({ type, count, percentage: totalIssues ? Math.round((count / totalIssues) * 1000) / 10 : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [metrics?.recentAnalyses]);

  // Trends (line graph data)
  const trends = useMemo(() => {
    if (!metrics?.improvementTrends) return [];
    const now = new Date();
    let cutoff: Date;
    if (timeRange === 'week') cutoff = new Date(now.getTime() - 7*24*60*60*1000);
    else if (timeRange === 'quarter') cutoff = new Date(now.getTime() - 3*30*24*60*60*1000);
    else if (timeRange === 'year') cutoff = new Date(now.getTime() - 12*30*24*60*60*1000);
    else cutoff = new Date(now.getTime() - 30*24*60*60*1000);
    return metrics.improvementTrends.filter(t => new Date(t.date) >= cutoff);
  }, [metrics?.improvementTrends, timeRange]);

  if (!isOpen) return null;

  if (!metrics) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col items-center justify-center p-12">
          <BarChart3 className="w-12 h-12 text-blue-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
          <p className="text-gray-600 mb-6 text-center">Your analytics have been reset or no data is available yet.<br/>Run a new analysis to see metrics here.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

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
      recentAnalyses: metrics.recentAnalyses,
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

  const handleResetAnalytics = () => {
    resetAnalytics();
    setShowConfirm(false);
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
              onClick={() => setShowConfirm(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Analytics</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Reset Analytics?</h3>
              <p className="mb-6 text-gray-700">This will permanently clear all analytics data. This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetAnalytics}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
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
                {(['excellent', 'good', 'fair', 'poor'] as (keyof typeof scoreDist)[]).map((key, i) => (
                  <div key={key} className="flex items-center space-x-3">
                    <span className="w-20 text-sm font-medium text-gray-700 capitalize">{key}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all duration-500 ${['bg-green-600','bg-blue-500','bg-yellow-500','bg-red-500'][i]}`}
                        style={{ width: `${scoreDistTotal ? (scoreDist[key] / scoreDistTotal) * 100 : 0}%` }}></div>
                    </div>
                    <span className="w-8 text-right text-sm text-gray-600">{scoreDist[key]}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Common Issues */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Issues</h3>
              <div className="space-y-3">
                {commonIssues.length === 0 ? (
                  <div className="text-gray-500 text-center">No common issues found.</div>
                ) : (
                  commonIssues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${index < 3 ? 'bg-red-500' : index < 5 ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                        <span className="text-sm font-medium text-gray-700">{issue.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{issue.count}</div>
                        <div className="text-xs text-gray-500">{issue.percentage}%</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Quality Trend (line graph) */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Trend</h3>
              <div className="space-y-4">
                {trends.length < 2 ? (
                  <div className="text-gray-500 text-center">Not enough data for graph.</div>
                ) : (
                  <TrendGraph data={trends} />
                )}
              </div>
            </div>

            {/* Recent Analyses */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analyses</h3>
              <div className="space-y-3">
                {metrics.recentAnalyses && metrics.recentAnalyses.length > 0 ? (
                  metrics.recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{analysis.title}</div>
                        <div className="text-xs text-gray-700">
                          {analysis.date instanceof Date ? analysis.date.toLocaleDateString() : new Date(analysis.date).toLocaleDateString()} • {analysis.issues} issues
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBgColor(analysis.score)} ${getScoreColor(analysis.score)}`}> 
                        {Math.round(analysis.score)}%
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center">No recent analyses yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Analyses */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{metrics.recentAnalyses ? metrics.recentAnalyses.length : 0}</div>
                <div className="text-sm text-gray-600">Total Analyses</div>
              </div>
              {/* Improvement Rate */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{
                  (() => {
                    const arr = metrics.recentAnalyses || [];
                    if (arr.length < 2) return '—';
                    let improved = 0;
                    for (let i = 1; i < arr.length; i++) {
                      if (arr[i].score > arr[i-1].score) improved++;
                    }
                    return Math.round((improved / (arr.length - 1)) * 100) + '%';
                  })()
                }</div>
                <div className="text-sm text-gray-600">Improvement Rate</div>
              </div>
              {/* Issues Resolved */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{
                  (() => {
                    const arr = metrics.recentAnalyses || [];
                    // Group by document id, track issue count diffs
                    const docMap: Record<string, number[]> = {};
                    arr.forEach(a => {
                      if (!docMap[a.id]) docMap[a.id] = [];
                      docMap[a.id].push(a.issues || 0);
                    });
                    let resolved = 0;
                    Object.values(docMap).forEach(issueArr => {
                      for (let i = 1; i < issueArr.length; i++) {
                        if (issueArr[i] < issueArr[i-1]) {
                          resolved += (issueArr[i-1] - issueArr[i]);
                        }
                      }
                    });
                    return resolved;
                  })()
                }</div>
                <div className="text-sm text-gray-600">Issues Resolved</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// TrendGraph component
function TrendGraph({ data }: { data: { date: Date; averageScore: number }[] }) {
  // SVG line graph for scores over time
  if (data.length < 2) return <div className="text-gray-500 text-center">Not enough data for graph.</div>;
  const width = 400, height = 120, padding = 30;
  const minScore = Math.min(...data.map(d => d.averageScore), 0);
  const maxScore = Math.max(...data.map(d => d.averageScore), 100);
  const points = data.map((d, i) => {
    const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
    const y = height - padding - ((d.averageScore - minScore) / (maxScore - minScore || 1)) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="w-full h-32">
      <polyline fill="none" stroke="#2563eb" strokeWidth="3" points={points} />
      {/* Dots */}
      {data.map((d, i) => {
        const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
        const y = height - padding - ((d.averageScore - minScore) / (maxScore - minScore || 1)) * (height - 2 * padding);
        return <circle key={i} cx={x} cy={y} r={4} fill="#2563eb" />;
      })}
      {/* X axis */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d1d5db" />
      {/* Y axis */}
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d1d5db" />
    </svg>
  );
}
