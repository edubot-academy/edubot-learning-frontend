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
                <div className="flex justify-between items-center mb-10">
                   <div className='w-[827px] flex flex-col gap-3 '> 
                    <h2 className=" text-[44px] font-bold text-[##141619]">
                        Биздин окуучулар эмне дейт?
                    </h2>
                    <p className='font-[Suisse Intl] font-normal text-[25px] leading-[120%] tracking-[0em]'>Тут вы можете посмотреть все отзывы наших студентов которые прошли  все наши онлайн уроки</p></div>
                    <div className="flex gap-[10px]">
                        <button className="bg-white text-black w-[99px] h-[87px] rounded-[8px] border-2 
                 pt-[24px] pr-[30px] pb-[24px] pl-[30px] opacity-100 flex items-center justify-center text-lg rotate-180 border-black">
                            &#8249;
                        </button>
                        <button className="bg-white text-black w-[99px] h-[87px] rounded-[8px] border-2 
                 pt-[24px] pr-[30px] pb-[24px] pl-[30px] opacity-100 flex items-center justify-center text-lg border-black">
                            &#8250;
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {feedbacks.map((fb, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl border shadow-sm text-left">
                            <img src={FeedbackNew} alt="" />
                            <h1 className='font-medium text-[30px] text-[#141619] leading-[40px] tracking-[0.01em] mt-6 mb-[18px]'>Exceptional Service</h1>
                          
                            <p className="text-gray-700 leading-relaxed mb-6 tex-[26px]">{fb.text}</p>
                            <div className="flex items-center gap-3">
                                <img
                                    src={fb.image}
                                    alt={fb.name}
                                    className="w-95 h-95 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-medium text-[30px] text-[#141619] leading-[40px] tracking-[0.01em]">{fb.name}</h4>
                                    <p className="font-normalfont-[Suisse Intl] font-medium text-[20px] leading-[40px] tracking-[0.01em] text-[#3E424A]">{fb.role}</p>
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
