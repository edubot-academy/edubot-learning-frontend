import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SectionContainer from '@features/marketing/components/SectionContainer';
import Button from '@shared/ui/Button';
import ExternalResourceCard from './ExternalResourceCard';
import { getFeaturedResources } from '../data/externalResources';

const HOME_PREVIEW_COUNT = 3;

const ExternalResourcesHomeSection = () => {
    const { t } = useTranslation();
    const preview = getFeaturedResources().slice(0, HOME_PREVIEW_COUNT);

    return (
        <SectionContainer
            title={t('public.externalResources.homeSectionTitle')}
            subtitle={t('public.externalResources.homeSectionSubtitle')}
            rightContent={
                <Link to="/resources">
                    <Button variant="secondary">{t('public.externalResources.viewAll')}</Button>
                </Link>
            }
            items={preview}
            CardComponent={ExternalResourceCard}
        />
    );
};

export default ExternalResourcesHomeSection;
