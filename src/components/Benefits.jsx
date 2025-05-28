import laptop from '../assets/icons/laptop.svg';
import circle from '../assets/icons/circle.svg';
import account from '../assets/icons/account.svg';

const features = [
  {
    icon: laptop,
    title: "Интерактивдүү окуу",
    description: "программалоо боюнча практикалык тапшырмалар жана суроо-жооп тесттери",
  },
  {
    icon: circle,
    title: "100+ Курстар",
    description: "Программалоо тилдеринин кеңири тандоосу",
  },
  {
    icon: account,
    title: "Тажрыйбалуу окутуучулар",
    description: "Тармактын адистеринен үйрөнүңүз",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 px-6 bg-gray-50 text-center">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="mb-4 flex justify-center items-center w-20 h-16">
              <img src={feature.icon} alt="" className="mx-auto w-full h-full object-contain" />
            </div>
            <h3 className="text-2xl font-medium mb-2">{feature.title}</h3>
            <p className="font-medium max-w-[250px]">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
