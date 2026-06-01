import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import i18n from '../../../i18n';
import HomeworkModal from './HomeworkModal';

const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    homework: null,
    mode: 'create',
    loading: false,
    selectedSession: { id: 7, title: 'Session topic', sessionIndex: 1 },
    aiDraftEnabled: true,
    aiDraftLoading: false,
    aiDraftError: '',
    onRequestAiDraft: vi.fn(),
    onCancelAiDraft: vi.fn(),
};

describe('HomeworkModal', () => {
    afterEach(async () => {
        vi.clearAllMocks();
        await i18n.changeLanguage('ky');
    });

    it('uses normalized nested AI homework output when copying a draft into the form', async () => {
        await i18n.changeLanguage('en');
        const user = userEvent.setup();
        const onUseAiDraft = vi.fn().mockResolvedValue(true);

        render(
            <HomeworkModal
                {...baseProps}
                onUseAiDraft={onUseAiDraft}
                aiDraft={{
                    generationId: 42,
                    output: {
                        description: JSON.stringify({
                            title: 'Nested homework title',
                            description: 'Line one\\nLine two',
                            rubric: [{ criterion: 'Accuracy', points: 5 }],
                        }),
                    },
                }}
            />
        );

        expect(await screen.findByText('Nested homework title')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /use in manual form/i }));

        await waitFor(() => expect(onUseAiDraft).toHaveBeenCalledTimes(1));
        expect(screen.getByDisplayValue('Nested homework title')).toBeInTheDocument();
        expect(screen.getByDisplayValue(/Line one[\s\S]*Line two[\s\S]*Rubric:/)).toBeInTheDocument();
    });
});
