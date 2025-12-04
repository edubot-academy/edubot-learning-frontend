import FeedbackSlider from './FeedbackSlider';

const FeedbackSection = ({ title, subtitle, CardComponent, rightContent = null }) => {
    return (
        <div className="px-4 py-16 sm:px-6 lg:px-12 bg-white relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
                <div className="flex flex-col gap-2">
                    <h2 className="font-suisse font-bold text-[#141619] text-4xl">{title}</h2>
                    <p className="font-suisse font-normal text-[#3E424A] text-base max-w-md">
                        {subtitle}
                    </p>
                </div>
            </div>

            <FeedbackSlider CardComponent={CardComponent} arrows={rightContent} />
        </div>
    );
};

export default FeedbackSection;
