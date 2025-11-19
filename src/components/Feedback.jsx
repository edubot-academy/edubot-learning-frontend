import React from 'react';
import FeedbackImg from '../assets/images/feedbackImg.png';
import FeedbackNew from "../assets/icons/feedbacknew.svg"
import SectionContainer from './SectionContainer';
import arrowLeft from '../assets/icons/leftArrow.svg';
import arrowRight from '../assets/icons/rightArrow.svg';
import CardFeedback from './CardFeedback';

function Feedback() {
  const feedbacks = [
    {
      star: FeedbackNew,
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
  const arrows = (
    <div className="flex gap-2">
        <img src={arrowLeft} alt="prev" className="w-16" />
        <img src={arrowRight} alt="next" className="w-16" />
    </div>
  );

  return (
    <SectionContainer
      title="Биздин окуучулар эмне дейт"
      subtitle="Тут вы можете посмотреть все отзывы наших студентов которые прошли  все наши онлайн уроки"
      rightContent={arrows}
      data={feedbacks}
      CardComponent={CardFeedback}
    />
  );
}

export default Feedback;
