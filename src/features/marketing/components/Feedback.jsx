import arrowLeft from '@assets/icons/leftArrow.svg';
import arrowRight from '@assets/icons/rightArrow.svg';
import FeedbackSection from '@features/courses/components/FeedbackSection';

function Feedback() {

    const arrows = (
        <div className="flex items-center gap-3">
            <img
                src={arrowLeft}
                alt="prev"
                className="w-8 md:w-14 cursor-pointer opacity-70 hover:opacity-100"
                data-arrow="prev"
            />
            <img
                src={arrowRight}
                alt="next"
                className="w-8 md:w-14 cursor-pointer opacity-70 hover:opacity-100"
                data-arrow="next"
            />
        </div>
    );

    return (
        <>
            <FeedbackSection
                title="Биздин окуучулар эмне дейт"
                subtitle="Бул жерде сиз биздин онлайн сабактарыбызды бүтүргөн студенттерибиздин бардык сын-пикирлерин көрө аласыз."
                rightContent={arrows}
            />
        </>
    );
}

export default Feedback;
