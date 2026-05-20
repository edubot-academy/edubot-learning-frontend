import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '.';
import AssistantCompanyState from '@features/assistant-dashboard/components/AssistantCompanyState';
import AttendanceTable from '@features/attendance/components/AttendanceTable';
import VideoUpload from '@features/courses/components/VideoUpload';
import Catalog from '@pages/catalog/Catalog';

const catalogMocks = vi.hoisted(() => ({
    useCatalogRouteState: vi.fn(),
    usePublicCatalog: vi.fn(),
}));

vi.mock('@features/offerings/useCatalogRouteState', () => ({
    useCatalogRouteState: catalogMocks.useCatalogRouteState,
}));

vi.mock('@features/offerings/usePublicCatalog', () => ({
    usePublicCatalog: catalogMocks.usePublicCatalog,
}));

describe('localized production surfaces', () => {
    beforeEach(async () => {
        await i18n.changeLanguage('ky');
        catalogMocks.useCatalogRouteState.mockReturnValue({
            catalogQuery: '',
            page: 1,
            q: '',
            setPage: vi.fn(),
            setQ: vi.fn(),
        });
        catalogMocks.usePublicCatalog.mockReturnValue({
            data: { items: [], totalPages: 1 },
            error: null,
            loading: false,
            retry: vi.fn(),
        });
    });

    it('renders catalog labels from the active locale', async () => {
        await i18n.changeLanguage('ru');

        render(
            <MemoryRouter>
                <Catalog />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'Каталог' })).toBeInTheDocument();
        expect(screen.getByLabelText('Поиск курсов')).toBeInTheDocument();
        expect(screen.getByText('В каталоге пока нет курсов.')).toBeInTheDocument();
    });

    it('renders attendance empty state from the active locale', async () => {
        await i18n.changeLanguage('en');

        render(<AttendanceTable students={[]} sessions={[]} />);

        expect(screen.getByText('Attendance overview')).toBeInTheDocument();
        expect(screen.getByText('No students found')).toBeInTheDocument();
        expect(
            screen.getByText('Add students to this group to start tracking attendance.')
        ).toBeInTheDocument();
    });

    it('renders assistant company access copy from the active locale', async () => {
        await i18n.changeLanguage('ky');

        render(<AssistantCompanyState assistantNoCompany companies={[]} />);

        expect(screen.getByText('Ассистент жеткиликтүүлүгү')).toBeInTheDocument();
        expect(screen.getByText('Тенант дайындалган эмес')).toBeInTheDocument();
        expect(screen.getByText('Тенантка кирүү укугу керек')).toBeInTheDocument();
    });

    it('renders video upload label from the active locale', async () => {
        await i18n.changeLanguage('ru');

        render(<VideoUpload courseId={1} sectionId={2} />);

        expect(screen.getByText('Загрузить видео')).toBeInTheDocument();
    });
});
