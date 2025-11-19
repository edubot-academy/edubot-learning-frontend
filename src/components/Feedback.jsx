import FeedbackImg from '../assets/images/feedbackImg.png';
import FeedbackNew from '../assets/icons/feedbacknew.svg';
import SectionContainer from './SectionContainer';
import arrowLeft from '../assets/icons/leftArrow.svg';
import arrowRight from '../assets/icons/rightArrow.svg';
import CardFeedback from './CardFeedback';
import axios from 'axios';
import { fetchCourseReviews } from '../services/api';

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

	const testFunc = async () => {
		const data = await fetchCourseReviews(2);
		console.log(data);
	};
	testFunc();

	const arrows = (
		<div className='flex items-center gap-3'>
			<img
				src={arrowLeft}
				alt='prev'
				className='w-10 cursor-pointer opacity-70 hover:opacity-100'
				data-arrow='prev'
			/>
			<img
				src={arrowRight}
				alt='next'
				className='w-10 cursor-pointer opacity-70 hover:opacity-100'
				data-arrow='next'
			/>
		</div>
	);

	return (
		<SectionContainer
			title='Биздин окуучулар эмне дейт'
			subtitle='Тут вы можете посмотреть все отзывы наших студентов которые прошли  все наши онлайн уроки'
			data={feedbacks}
			rightContent={arrows}
			buttonText={null}
			// CardComponent={ }
		/>
	);
}

export default Feedback;
