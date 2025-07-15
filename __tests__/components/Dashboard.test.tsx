import { render, screen } from '@testing-library/react'
import { Dashboard } from '@/components/Dashboard'
import { AnalyticsProvider } from '@/lib/useAnalytics'
import { SettingsProvider } from '@/lib/useSettings'

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <SettingsProvider>
      <AnalyticsProvider>
        {component}
      </AnalyticsProvider>
    </SettingsProvider>
  )
}

describe('Dashboard Component', () => {
  test('renders dashboard sections correctly', () => {
    renderWithProviders(<Dashboard />)
    
    expect(screen.getByText('Quick Stats')).toBeDefined()
    expect(screen.getByText('Score Distribution')).toBeDefined()
    expect(screen.getByText('Common Issues')).toBeDefined()
    expect(screen.getByText('Recent Activity')).toBeDefined()
  })

  test('displays quality metrics correctly', () => {
    renderWithProviders(<Dashboard />)
    
    // Should show metric labels
    expect(screen.getByText('Documents')).toBeDefined()
    expect(screen.getByText('Avg Score')).toBeDefined()
    expect(screen.getByText('Issues')).toBeDefined()
    // Use getAllByText for "Links OK" since it appears in multiple places
    expect(screen.getAllByText('Links OK')).toHaveLength(2)
  })

  test('shows initial state with zero values', () => {
    renderWithProviders(<Dashboard />)
    
    // Should show zero values initially
    const zeroValues = screen.getAllByText('0')
    expect(zeroValues.length).toBeGreaterThan(0)
  })

  test('displays score distribution categories', () => {
    renderWithProviders(<Dashboard />)
    
    expect(screen.getByText('excellent')).toBeDefined()
    expect(screen.getByText('good')).toBeDefined()
    expect(screen.getByText('fair')).toBeDefined()
    expect(screen.getByText('poor')).toBeDefined()
  })

  test('has proper accessibility structure', () => {
    renderWithProviders(<Dashboard />)
    
    // Should have multiple h2 headings
    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings.length).toBeGreaterThan(0)
    
    // Check for specific heading text
    expect(screen.getByText('Quick Stats')).toBeDefined()
  })

  test('displays empty state messages', () => {
    renderWithProviders(<Dashboard />)
    
    // Should show empty state in issues section
    expect(screen.getByText('No common issues found.')).toBeDefined()
    
    // Should show empty state in recent activity
    expect(screen.getByText('No recent analyses yet.')).toBeDefined()
  })

  test('renders responsive layout classes', () => {
    renderWithProviders(<Dashboard />)
    
    const container = screen.getByText('Quick Stats').closest('div')?.parentElement?.parentElement
    expect(container?.className).toContain('space-y-6')
  })

  test('shows quality targets section', () => {
    renderWithProviders(<Dashboard />)
    
    expect(screen.getByText('Quality Targets')).toBeDefined()
    expect(screen.getByText('Quality Trend')).toBeDefined()
  })
})
