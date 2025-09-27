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
    <section className="py-16 px-6 bg-[#F6F6F6] text-center">
      <div className=" max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="flex bg-white p-5 border border-gray rounded-md flex-col items-center">
            <div className="mb-4 flex justify-center items-center w-20 h-16">
              <img src={feature.icon} alt="" className="mx-auto w-[3rem] h-[4rem] object-contain" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="font-normal text-gray-700 max-w-[20rem]">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
