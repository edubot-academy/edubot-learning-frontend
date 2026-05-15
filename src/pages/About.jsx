import InfoCards from '@features/marketing/components/InfoCards';
import Vision from '@features/marketing/components/Vision';
import AboutHero from '@features/marketing/components/AboutHero';
import Metrics from '@features/marketing/components/Metrics';
import team from '@assets/images/team.png';

const AboutPage = () => {
    return (
        <main id="main-content" className="bg-white text-[#141619] dark:bg-[#222222] dark:text-[#E8ECF3]">
            <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-12">
            <AboutHero />
            <Metrics />
            <img
                src={team}
                alt="EduBot командасынын биргелешип иштеген учуру"
                className="my-10 max-h-[32rem] w-full rounded-2xl object-cover"
                width="1280"
                height="512"
                loading="lazy"
                decoding="async"
            />
            <Vision />
            <InfoCards />
            </div>
        </main>
    );
};

export default AboutPage;
