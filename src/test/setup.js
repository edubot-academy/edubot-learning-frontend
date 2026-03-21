import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

Object.defineProperty(global.URL, 'createObjectURL', {
    writable: true,
    value: vi.fn(() => 'blob:mock-url'),
});

Object.defineProperty(global.URL, 'revokeObjectURL', {
    writable: true,
    value: vi.fn(),
});
