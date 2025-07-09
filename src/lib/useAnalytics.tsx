"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { QualityMetrics } from '@/types';
import { loadAnalytics, saveAnalytics, clearAnalytics as clearAnalyticsStorage } from './analytics';

interface AnalyticsContextType {
  metrics: QualityMetrics | null;
  setMetrics: (metrics: QualityMetrics | null) => void;
  resetAnalytics: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetricsState] = useState<QualityMetrics | null>(null);

  useEffect(() => {
    setMetricsState(loadAnalytics());
  }, []);

  const setMetrics = (newMetrics: QualityMetrics | null) => {
    setMetricsState(newMetrics);
    if (newMetrics) {
      saveAnalytics(newMetrics);
    } else {
      clearAnalyticsStorage();
    }
  };

  const resetAnalytics = () => {
    setMetrics(null);
  };

  return (
    <AnalyticsContext.Provider value={{ metrics, setMetrics, resetAnalytics }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used within an AnalyticsProvider');
  return context;
}
