import FeedbackSlider from './FeedbackSlider';

const FeedbackSection = ({ title, subtitle, rightContent = null }) => {
    return (
        <div className="px-4 py-16 sm:px-6 lg:px-12 bg-transparent relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
                <div className="flex flex-col gap-2">
                    <h2 className="font-suisse font-bold text-2xl w-64 md:w-auto md:text-4xl text-[#141619] dark:text-[#E8ECF3]">
                        {title}
                    </h2>
                    <p className="font-suisse font-normal text-[#3E424A] dark:text-[#a6adba] text-base max-w-md">
                        {subtitle}
                    </p>
                </div>
            </div>

            <FeedbackSlider arrows={rightContent} />
        </div>
    );
};

export default FeedbackSection;
