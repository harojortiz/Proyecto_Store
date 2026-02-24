import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement, ReactNode } from 'react';

// Wrapper with Router for components that use navigation
function AllTheProviders({ children }: { children: ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
}

// Custom render function that includes providers
export function renderWithRouter(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithRouter as render };
