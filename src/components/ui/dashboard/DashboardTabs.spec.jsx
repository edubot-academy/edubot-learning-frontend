import { render, screen } from '@testing-library/react';
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
});
