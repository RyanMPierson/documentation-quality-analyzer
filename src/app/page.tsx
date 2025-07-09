import { DocumentAnalyzer } from '@/components/DocumentAnalyzer';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { AnalyticsProvider } from '@/lib/useAnalytics';
import { SettingsProvider } from '@/lib/useSettings';

export default function Home() {
  return (
    <SettingsProvider>
      <AnalyticsProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <DocumentAnalyzer />
              </div>
              <div className="lg:col-span-1">
                <Dashboard />
              </div>
            </div>
          </main>
        </div>
      </AnalyticsProvider>
    </SettingsProvider>
  );
}
