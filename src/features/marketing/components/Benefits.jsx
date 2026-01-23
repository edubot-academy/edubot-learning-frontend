import laptop from '@assets/icons/laptop.svg';
import circle from '@assets/icons/circle.svg';
import account from '@assets/icons/account.svg';

const features = [
    {
        icon: laptop,
        title: 'Интерактивдүү окуу',
        description: 'программалоо боюнча практикалык тапшырмалар жана суроо-жооп тесттери',
    },
    {
        icon: circle,
        title: '100+ Курстар',
        description: 'Программалоо тилдеринин кеңири тандоосу',
    },
    {
        icon: account,
        title: 'Тажрыйбалуу окутуучулар',
        description: 'Тармактын адистеринен үйрөнүңүз',
    },
];

export default function FeaturesSection() {
    return (
        <section className="px-4 py-8 sm:px-6 lg:px-12 bg-[#f6f6f6] dark:bg-[#1A1A1A] text-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex bg-white dark:bg-[#141619] text-[#141619] dark:text-[#E8ECF3] p-5 border border-gray-200 dark:border-[#2A2E35] rounded-lg flex-col items-center"
                    >
                        <div className="mb-4 flex justify-center items-center w-20 h-16">
                            <img
                                src={feature.icon}
                                alt=""
                                className="mx-auto w-[3rem] h-[4rem] object-contain"
                            />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="font-normal text-gray-700 dark:text-[#a6adba] max-w-[20rem]">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
