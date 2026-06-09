import { Link } from 'react-router-dom';
import SectionContainer from '@features/marketing/components/SectionContainer';
import Button from '@shared/ui/Button';
import ExternalResourceCard from './ExternalResourceCard';
import { EXTERNAL_RESOURCES } from '../data/externalResources';

const HOME_PREVIEW_COUNT = 3;

const ExternalResourcesHomeSection = () => {
    const preview = EXTERNAL_RESOURCES.slice(0, HOME_PREVIEW_COUNT);

    return (
        <SectionContainer
            title="Акысыз дүйнөлүк курстар"
            subtitle="Гарвард, Google жана башка дүйнөлүк университеттерден тандалган курстар — Edubot жетекчилиги менен."
            rightContent={
                <Link to="/resources">
                    <Button variant="secondary">Бардыгын көрүү</Button>
                </Link>
            }
            items={preview}
            CardComponent={ExternalResourceCard}
        />
    );
};

export default ExternalResourcesHomeSection;
