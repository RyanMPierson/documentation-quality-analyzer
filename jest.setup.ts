import '@testing-library/jest-dom'

// Extend Jest matchers for better TypeScript support
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveValue(value: string): R;
      toBeChecked(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(attribute: string, value?: string): R;
      toHaveTextContent(text: string): R;
    }
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock FileReader
global.FileReader = class {
  constructor() {
    this.readAsText = jest.fn(function(file) {
      // Simulate async file reading
      setTimeout(() => {
        this.onload({ target: { result: 'Mock file content' } })
      }, 100)
    })
  }
  onload = jest.fn()
}
