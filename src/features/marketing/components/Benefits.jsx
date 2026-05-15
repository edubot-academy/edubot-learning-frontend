import laptop from '@assets/icons/laptop.svg';
import circle from '@assets/icons/circle.svg';
import account from '@assets/icons/account.svg';

const features = [
    {
        icon: laptop,
        title: 'Интерактивдүү окуу',
        description: 'Практикалык тапшырмалар, тесттер жана дароо кайтарым байланыш аркылуу теманы бекемдеңиз.',
    },
    {
        icon: circle,
        title: '100+ курс',
        description: 'Программалоо, санарип көндүмдөр жана карьералык өсүш үчүн тандалган окуу багыттары.',
    },
    {
        icon: account,
        title: 'Тажрыйбалуу окутуучулар',
        description: 'Сабактарды практикада иштеген адистерден үйрөнүп, түшүнүксүз жерлерди тактаңыз.',
    },
];

export default function FeaturesSection() {
    return (
        <section className="bg-[#f6f6f6] px-4 py-16 text-[#141619] dark:bg-[#1A1A1A] dark:text-[#E8ECF3] sm:px-6 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">
                        Эмне үчүн EduBot
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">
                        Окуу процесси түшүнүктүү, практикалык жана өлчөнө турган болушу керек
                    </h2>
                    <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-[#a6adba] sm:text-base">
                        Курстарды тандоодон баштап прогрессти көзөмөлдөөгө чейин негизги окуу кадамдары бир жерде чогулат.
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <article
                            key={feature.title}
                            className="group flex min-h-[260px] flex-col rounded-[24px] border border-gray-200 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.65)] dark:border-[#2A2E35] dark:bg-[#141619] dark:hover:border-orange-500/30"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 transition duration-300 group-hover:scale-105 dark:border-orange-500/20 dark:bg-orange-500/10">
                                <img
                                    src={feature.icon}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-10 w-10 object-contain"
                                    width="40"
                                    height="40"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                            <div className="mt-6 flex items-center gap-3">
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">
                                    0{index + 1}
                                </span>
                                <span className="h-px flex-1 bg-gray-200 dark:bg-[#2A2E35]" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold leading-tight text-[#141619] dark:text-[#E8ECF3]">
                                {feature.title}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-[#a6adba]">
                                {feature.description}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
