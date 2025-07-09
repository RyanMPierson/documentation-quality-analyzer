// Utility for analytics persistence and reset

const ANALYTICS_KEY = 'dqa_analytics';

export function clearAnalytics() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(ANALYTICS_KEY);
  }
}

export function saveAnalytics(data: any) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  }
}

export function loadAnalytics() {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  return null;
}
