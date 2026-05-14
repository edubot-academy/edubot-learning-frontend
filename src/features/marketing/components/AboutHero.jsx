import globus from '@assets/images/globus.png';

function AboutHero() {
    return (
        <section className="grid items-center gap-10 py-10 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:py-16">
            <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-edubot-orange">
                    Биз жөнүндө
                </p>
                <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                    EduBot Learning практикалык санарип билимди жеткиликтүү кылат
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-gray-700 dark:text-gray-300 sm:text-lg">
                    Биз окуучуларга IT, дизайн жана санарип көндүмдөрдү өз темпинде үйрөнүүгө жардам берген онлайн платформабыз. Максатыбыз - түшүнүктүү мазмун, практикалык тапшырмалар жана ментордук колдоо аркылуу окууну ишке жакындатуу.
                </p>
            </div>

            <div className="relative mx-auto w-full max-w-sm md:max-w-md">
                <div className="absolute inset-8 rounded-full bg-orange-100 blur-3xl dark:bg-orange-950/30" aria-hidden="true" />
                <img
                    src={globus}
                    alt=""
                    aria-hidden="true"
                    className="relative w-full object-contain dark:brightness-90 dark:contrast-110"
                />
            </div>
        </section>
    );
}

export default AboutHero;
