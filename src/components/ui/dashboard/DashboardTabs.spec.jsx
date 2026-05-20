import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import i18n from '../../../i18n';
import DashboardTabs from './DashboardTabs';

describe('DashboardTabs', () => {
    afterEach(async () => {
        await i18n.changeLanguage('ky');
    });

    it('prefers item labelKey over generic dashboard tab labels', async () => {
        await i18n.changeLanguage('ru');

        render(
            <DashboardTabs
                items={[
                    {
                        id: 'overview',
                        label: 'Fallback',
                        labelKey: 'nav.courses',
                    },
                ]}
                activeId="overview"
                onSelect={() => {}}
            />
        );

        expect(screen.getByRole('button', { name: /Курсы/i })).toBeInTheDocument();
        expect(screen.queryByText('Главная')).not.toBeInTheDocument();
    });

    it('uses generic translated labels before hardcoded item labels for shared tab ids', async () => {
        await i18n.changeLanguage('en');

        render(
            <DashboardTabs
                items={[
                    { id: 'enrollments', label: 'Студенттер' },
                    { id: 'certificates', label: 'Сертификаттар' },
                    { id: 'groups', label: 'Группалар' },
                ]}
                activeId="enrollments"
                onSelect={() => {}}
            />
        );

        expect(screen.getByRole('button', { name: /Enroll/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Certs/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Groups/i })).toBeInTheDocument();
        expect(screen.queryByText('Студенттер')).not.toBeInTheDocument();
    });

    it('keeps compact mobile tabs accessible when localized labels are long', async () => {
        await i18n.changeLanguage('en');
        const longLabel = 'Detailed certificate configuration and approval workflow';

        render(
            <DashboardTabs
                items={[
                    { id: 'custom-certificates', label: longLabel },
                    { id: 'custom-attendance', label: 'Attendance review and bulk actions' },
                ]}
                activeId="custom-certificates"
                onSelect={() => {}}
                maxVisible={1}
            />
        );

        const visibleTab = screen.getByRole('button', { name: longLabel });
        expect(visibleTab).toHaveAttribute('aria-label', longLabel);
        expect(visibleTab).toHaveAttribute('title', longLabel);

        fireEvent.click(screen.getByRole('button', { name: /more/i }));

        const hiddenTab = screen.getByRole('menuitemradio', {
            name: 'Attendance review and bulk actions',
        });
        expect(hiddenTab).toHaveAttribute('aria-label', 'Attendance review and bulk actions');
        expect(hiddenTab).toHaveAttribute('title', 'Attendance review and bulk actions');
    });
});
