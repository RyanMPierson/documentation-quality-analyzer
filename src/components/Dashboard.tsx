'use client';

import { BarChart3, TrendingUp, Target, Clock, AlertCircle } from 'lucide-react';
import { useAnalytics } from '@/lib/useAnalytics';
import { useSettings } from '@/lib/useSettings';
import { useMemo, useState } from 'react';

export function Dashboard() {
  const { metrics } = useAnalytics();
  const { settings } = useSettings();
  const [trendRange, setTrendRange] = useState<'week' | 'month' | 'day'>('week');

  // Fallbacks for empty state
  const totalDocs = metrics?.totalDocuments ?? 0;
  const avgScore = metrics?.averageScore ?? 0;
  const totalIssues = metrics?.commonIssues?.reduce((sum, i) => sum + i.count, 0) ?? 0;
  const linksOk = metrics && metrics.totalDocuments > 0 && metrics.scoreDistribution ?
    Math.round(((metrics.scoreDistribution.excellent + metrics.scoreDistribution.good) / metrics.totalDocuments) * 100) : 0;

  // Score Distribution
  const scoreDist = metrics?.scoreDistribution ?? { excellent: 0, good: 0, fair: 0, poor: 0 };
  const scoreDistTotal = scoreDist.excellent + scoreDist.good + scoreDist.fair + scoreDist.poor;

  // Common Issues (top 5)
  const commonIssues = useMemo(() => {
    if (!metrics?.recentAnalyses) return [];
    const issueMap: Record<string, number> = {};
    metrics.recentAnalyses.forEach(a => {
      if (a.issueList && Array.isArray(a.issueList)) {
        a.issueList.forEach((msg: string) => {
          issueMap[msg] = (issueMap[msg] || 0) + 1;
        });
      }
    });
    return Object.entries(issueMap)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [metrics?.recentAnalyses]);

  // Recent Analyses (operational)
  const recentAnalyses = metrics?.recentAnalyses || [];
  const targets = settings.qualityTargets;

  // Trends
  const trends = useMemo(() => {
    if (!metrics?.improvementTrends) return [];
    const now = new Date();
    let cutoff: Date;
    if (trendRange === 'day') cutoff = new Date(now.getTime() - 24*60*60*1000);
    else if (trendRange === 'week') cutoff = new Date(now.getTime() - 7*24*60*60*1000);
    else cutoff = new Date(now.getTime() - 30*24*60*60*1000);
    return metrics.improvementTrends.filter(t => new Date(t.date) >= cutoff);
  }, [metrics?.improvementTrends, trendRange]);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Quick Stats</span>
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalDocs}</div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{avgScore}%</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{totalIssues}</div>
              <div className="text-sm text-gray-600">Issues</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{linksOk}%</div>
              <div className="text-sm text-gray-600">Links OK</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Score Distribution</span>
          </h2>
        </div>
        <div className="p-6 space-y-3">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span>Common Issues</span>
          </h2>
        </div>
        <div className="p-6">
          {commonIssues.length === 0 ? (
            <div className="text-gray-500 text-center">No common issues found.</div>
          ) : (
            <ol className="space-y-2">
              {commonIssues.map((issue, idx) => (
                <li key={issue.type} className="flex items-center space-x-3">
                  <span className="w-6 text-right text-gray-500">{idx + 1}.</span>
                  <span className="flex-1 text-gray-800">{issue.type}</span>
                  <span className="text-sm text-gray-600">{issue.count}x</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Recent Activity (operational) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Recent Activity</span>
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentAnalyses.length === 0 ? (
              <div className="text-gray-500 text-center">No recent analyses yet.</div>
            ) : (
              recentAnalyses.map((a) => (
                <div key={a.id} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.score >= 90 ? '#22c55e' : a.score >= 70 ? '#eab308' : '#ef4444' }}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{a.title}</div>
                    <div className="text-xs text-gray-700">Score: {Math.round(a.score)}% | Issues: {a.issues} | {a.date instanceof Date ? a.date.toLocaleString() : new Date(a.date).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quality Targets (existing) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Quality Targets</span>
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <ProgressBar label="Overall Score" value={Math.round(avgScore)} target={targets.overallScoreTarget} color="blue" />
            <ProgressBar label="Structure" value={metrics?.lastStructureScore ?? 0} target={targets.structureScoreTarget} color="green" />
            <ProgressBar label="Readability" value={metrics?.lastReadabilityScore ?? 0} target={targets.readabilityScoreTarget} color="yellow" />
            <ProgressBar label="Links OK" value={metrics?.lastLinksOk ?? 0} target={targets.linkValidationTarget} color="purple" />
            <ProgressBar label="Style Compliance" value={metrics?.lastStyleCompliance ?? 0} target={targets.styleComplianceTarget} color="indigo" />
            <ProgressBar label="Terminology Consistency" value={metrics?.lastTerminologyConsistency ?? 0} target={targets.terminologyConsistencyTarget} color="pink" />
          </div>
        </div>
      </div>

      {/* Trends (graph) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Quality Trend</span>
          </h2>
          <div>
            <select value={trendRange} onChange={e => setTrendRange(e.target.value as any)} className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option value="day">Last Day</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
        <div className="p-6">
          {trends.length === 0 ? (
            <div className="text-gray-500 text-center">No trend data available.</div>
          ) : (
            <TrendGraph data={trends} />
          )}
        </div>
      </div>
    </div>
  );
}

// ProgressBar component
function ProgressBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const percent = Math.min(100, Math.round((value / (target || 1)) * 100));
  const barColor = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    indigo: 'bg-indigo-600',
    pink: 'bg-pink-600',
  }[color] || 'bg-blue-600';
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">{value}% / {target}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${barColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, value)}%` }}></div>
      </div>
    </div>
  );
}

// TrendGraph component
function TrendGraph({ data }: { data: { date: Date; averageScore: number }[] }) {
  // Simple SVG line graph for scores over time
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
