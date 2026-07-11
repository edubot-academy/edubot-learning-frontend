import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import CourseSearchBox from './CourseSearchBox';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('CourseSearchBox', () => {
    it('does not close shared search state when interacting with another mounted search box', () => {
        const setShowDropdown = vi.fn();
        const searchState = {
            resetSearch: vi.fn(),
            results: [{ id: 1, title: 'Math' }],
            search: 'math',
            searchError: '',
            searchLoading: false,
            setSearch: vi.fn(),
            setShowDropdown,
            showDropdown: true,
        };

        render(
            <MemoryRouter>
                <CourseSearchBox
                    id="desktop-course-search-results"
                    searchState={searchState}
                />
                <CourseSearchBox
                    id="mobile-course-search-results"
                    mode="mobile"
                    searchState={searchState}
                />
            </MemoryRouter>
        );

        const mobileResult = document.querySelector('#mobile-course-search-results button');
        fireEvent.mouseDown(mobileResult);

        expect(setShowDropdown).not.toHaveBeenCalledWith(false);
    });
});
