'use client';

import { BarChart3, TrendingUp, Target, Clock } from 'lucide-react';

export function Dashboard() {
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
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">24</div>
              <div className="text-sm text-gray-600">Issues</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">96%</div>
              <div className="text-sm text-gray-600">Links OK</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Recent Activity</span>
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  API Guide improved
                </div>
                <div className="text-xs text-gray-700">Score: 89% → 94%</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  Setup Guide needs attention
                </div>
                <div className="text-xs text-gray-700">Structure issues found</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  User Manual analyzed
                </div>
                <div className="text-xs text-gray-700">Readability: Good</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Targets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Quality Targets</span>
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Score</span>
                <span className="text-sm text-gray-600">85% / 90%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Readability</span>
                <span className="text-sm text-gray-600">78% / 80%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Structure</span>
                <span className="text-sm text-gray-600">92% / 85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Trends</span>
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">This week</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">+5.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Documents improved</span>
                <span className="text-sm font-medium text-gray-900">8 of 12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Issues resolved</span>
                <span className="text-sm font-medium text-gray-900">16</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
