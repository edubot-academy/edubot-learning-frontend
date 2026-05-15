import FeedbackSection from '@features/courses/components/FeedbackSection';
import { useTranslation } from 'react-i18next';

function Feedback() {
    const { t } = useTranslation();

    return (
        <FeedbackSection
            title={t('public.home.feedback.title')}
            subtitle={t('public.home.feedback.subtitle')}
        />
    );
}

export default Feedback;
