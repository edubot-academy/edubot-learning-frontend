import workplace from '@assets/images/workplace.png';

function Vision() {
    return (
        <section className="grid items-center gap-8 py-12 md:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1fr)] lg:gap-14">
            <img
                src={workplace}
                alt="EduBot окуу жана иш чөйрөсү"
                className="h-80 w-full rounded-2xl object-cover dark:brightness-90 dark:contrast-110 md:h-[28rem]"
                width="640"
                height="448"
                loading="lazy"
                decoding="async"
            />
            <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-edubot-orange">
                    Көз карашыбыз
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl">
                    Окуу теориядан аракетке тез өтүшү керек
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#3E424A] dark:text-[#a6adba]">
                    EduBot Learning окуучуга жөн гана маалымат бербейт. Биз окуу жолун практика, тапшырма, кайтарым байланыш жана реалдуу долбоорлор менен байланыштырууга умтулабыз.
                </p>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#3E424A] dark:text-[#a6adba]">
                    Ушундай мамиле окуучуга жаңы кесипти түшүнүүгө, көндүмүн бекемдөөгө жана рынокко даяр ишенимдүү портфолио түзүүгө жардам берет.
                </p>
            </div>
        </section>
    );
}

export default Vision;
