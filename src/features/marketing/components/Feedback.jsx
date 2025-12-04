import arrowLeft from '@assets/icons/leftArrow.svg';
import arrowRight from '@assets/icons/rightArrow.svg';
import CardFeedback from './CardFeedback';
import FeedbackSection from '@features/courses/components/FeedbackSection';

function Feedback() {
    const arrows = (
        <div className="flex items-center gap-3">
            <img
                src={arrowLeft}
                alt="prev"
                className="w-10 cursor-pointer opacity-70 hover:opacity-100"
                data-arrow="prev"
            />
            <img
                src={arrowRight}
                alt="next"
                className="w-10 cursor-pointer opacity-70 hover:opacity-100"
                data-arrow="next"
            />
        </div>
    );

    return (
        <>
            <FeedbackSection
                title="Биздин окуучулар эмне дейт"
                subtitle="Тут вы можете посмотреть все отзывы наших студентов которые прошли  все наши онлайн уроки"
                rightContent={arrows}
                CardComponent={CardFeedback}
            />
        </>
    );
}

export default Feedback;
