import '@testing-library/jest-dom';

// Extend global types for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveStyle: (style: Record<string, any>) => R;
    }
  }
} 