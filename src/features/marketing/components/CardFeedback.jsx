import { Rating } from '@chepchik/react-rating';
import { Wicon } from '@assets/icons/Wicon';
import { Yicon } from '@assets/icons/Yicon';
import grayPerson from '@assets/icons/grayPerson.svg';

const CardFeedback = ({ comment, user, value }) => {
    return (
        <div>
            <div
                key={''}
                className="bg-white text-[#141619] dark:bg-[#141619] dark:text-[#E8ECF3] p-6 rounded-xl border border-gray-200 dark:border-[#2A2E35] shadow-sm text-left flex flex-col h-96"
            >
                <div className="flex gap-3 text-[#FACC15]">
                    <div>
                        <Rating
                            value={value}
                            readonly
                            className="[&>span]:!mx-0.5"
                            emptySymbol={
                                <span style={{ color: '#FACC15' }}>
                                    <Wicon />
                                </span>
                            }
                            fullSymbol={
                                <span style={{ color: '#FACC15' }}>
                                    <Yicon />
                                </span>
                            }
                        />
                    </div>
                </div>
                <div className="flex justify-start items-start w-full mt-4">
                    <p className="text-gray-700 dark:text-[#a6adba] leading-relaxed text-sm line-clamp-5">
                        {comment}
                    </p>
                </div>

                <div className="flex items-center gap-3 mt-auto">
                    <>
                        <img
                            src={user.avatar || grayPerson}
                            onError={(e) => {
                                e.currentTarget.src = grayPerson;
                            }}
                            alt={'profile'}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                            <h4 className="font-medium text-lg leading-[32px]">{user.fullName}</h4>
                        </div>
                    </>
                </div>
            </div>
        </div>
    );
};

export default CardFeedback;
