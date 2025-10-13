import React from 'react';
// import quotes from '../assets/icons/quotes.svg';
import FeedbackImg from '../assets/images/feedbackImg.png';
import FeedbackNew from "../assets/icons/feedbacknew.svg"

function Feedback() {
    const feedbacks = [
        {
            star:FeedbackNew,
            text: `Я прошла онлайн-курсы и осталась очень довольна! Материал подаётся простым и понятным языком, всё структурировано и логично. Особенно понравилось, что можно учиться в удобное время и сразу применять знания на практике. После прохождения курса я чувствую себя гораздо увереннее в новой профессии. Спасибо за такую возможность!`,
            name: 'Jane Doe',
            role: 'Designer',
            image: FeedbackImg,
        },
        {
            text: `Я прошла онлайн-курсы и осталась очень довольна! Материал подаётся простым и понятным языком, всё структурировано и логично. Особенно понравилось, что можно учиться в удобное время и сразу применять знания на практике. После прохождения курса я чувствую себя гораздо увереннее в новой профессии. Спасибо за такую возможность!`,
            name: 'Jane Doe',
            role: 'Designer',
            image: FeedbackImg,
        },
        {
            text: `Я прошла онлайн-курсы и осталась очень довольна! Материал подаётся простым и понятным языком, всё структурировано и логично. Особенно понравилось, что можно учиться в удобное время и сразу применять знания на практике. После прохождения курса я чувствую себя гораздо увереннее в новой профессии. Спасибо за такую возможность`,
            name: 'Jane Doe',
            role: 'Designer',
            image: FeedbackImg,
        },
    ];

    return (
   <section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4">
    
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
      <div className="max-w-2xl flex flex-col gap-3">
        <h2 className="text-[32px] sm:text-[36px] lg:text-[44px] font-bold text-[#141619]">
          Биздин окуучулар эмне дейт?
        </h2>
        <p className="font-[Suisse Intl] font-normal text-[18px] sm:text-[20px] lg:text-[25px] leading-[120%]">
          Тут вы можете посмотреть все отзывы наших студентов которые прошли все наши онлайн уроки
        </p>
      </div>

   
      <div className="hidden lg:flex gap-3 self-end lg:self-auto">
        <button className="bg-white text-black w-[70px] h-[70px] sm:w-[87px] sm:h-[87px] rounded-[8px] border-2 flex items-center justify-center text-2xl rotate-180 border-black">
          &#8249;
        </button>
        <button className="bg-white text-black w-[70px] h-[70px] sm:w-[87px] sm:h-[87px] rounded-[8px] border-2 flex items-center justify-center text-2xl border-black">
          &#8250;
        </button>
      </div>

      <div className="mt-4 lg:hidden">
          <button className="bg-white text-black px-6 py-3 rounded-[8px] border-2 border-black text-[16px] sm:text-[18px]">
            Бардыгын көрүү
          </button>
        </div>
    </div>

   
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {feedbacks.map((fb, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-xl border shadow-sm text-left flex flex-col h-[450px]"
        >
          <img src={FeedbackNew} alt="" className="w-12 h-12 object-contain" />

          <h1 className="font-medium text-[24px] sm:text-[28px] lg:text-[30px] text-[#141619] leading-[36px] mt-6 mb-4">
            Exceptional Service
          </h1>

        <p className="text-gray-700 leading-relaxed text-[16px] sm:text-[18px] lg:text-[20px] line-clamp-3">
        {fb.text}
        </p>
          <div className="flex items-center gap-3 mt-auto pt-6">
            <img
              src={fb.image}
              alt={fb.name}
              className="w-[64px] h-[64px] rounded-full object-cover"
            />
            <div>
              <h4 className="font-medium text-[20px] sm:text-[24px] lg:text-[28px] text-[#141619] leading-[32px]">
                {fb.name}
              </h4>
              <p className="font-normal font-[Suisse Intl] text-[16px] sm:text-[18px] lg:text-[20px] leading-[28px] text-[#3E424A]">
                {fb.role}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
    );
}

export default Feedback;
