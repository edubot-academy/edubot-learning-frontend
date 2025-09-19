
import Card from "./Card";
// import programmerImg from "../assets/images/photoprogrammer.png";
// import StarImg from "../assets/icons/star.svg";

import CardImg from "../assets/images/cradImg.png"


const card = [
  {
    img: CardImg,
    title: "Руководство для начинающих по UX/UI дизайну",
    name:"Рональд Ричардс... Read More",
    rating: "4.9",
    price: "24000",
  },
  {
    img: CardImg,
    title: "Руководство для начинающих по UX/UI дизайну",
    name:"Рональд Ричардс... Read More",
   
    rating: "4.9",
    price: "24000",
  },
  {
    img: CardImg,
    title: "Руководство для начинающих по UX/UI дизайну",
    name:"Рональд Ричардс... Read More",
    rating: "4.9",
    price: "24000",
  },

]


const SectionContainer = ({ noBg = false, hideTitleAndLink = false, data = []  }) => {

  return (
    <div
      className={`${noBg ? "" : " text-white"
        } px-4 py-8 sm:px-6 lg:px-12`}
    >
      {!hideTitleAndLink && (
        <>
         <div className="flex items-center justify-between gap-10 text-black mb-12">
  <div className="w-[640px]">
    <h2 className="font-suisse font-bold text-[44px] leading-[44px] tracking-[0.01em] mb-[26px]">
      Топ курстар
    </h2>
    <p className="font-suisse font-normal text-[26px] leading-[120%] tracking-normal">
      Подборка самых востребованных и эффективных обучающих программ.
    </p>
  </div>

  <button className="w-[373px] h-[72px] rounded-lg border border-[#141619] py-6 px-11">
    Бардыгын көрүү
  </button>
</div>


        
        </>
      )}

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
  {card.slice(0, 3).map((course) => (
    <Card
      key={course.id}
      img={course.img}
      title={course.title}
      description={course.name}
      star={course.img}
      price={course.price}
      ratingCount={course.ratingCount}
    />
  ))}
</div>
    </div>
  );
};

export default SectionContainer;
