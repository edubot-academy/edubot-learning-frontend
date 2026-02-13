import PropTypes from 'prop-types';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import NoImage from '@assets/icons/noImage.svg';

const CardInstructor = ({ avatarUrl, fullName, title, totalStudents }) => {
    return (
        <div className="bg-white text-[#141619] dark:bg-[#141619] dark:text-[#E8ECF3] rounded flex flex-col overflow-hidden p-3 border border-gray-200 dark:border-[#2A2E35]">
            <img
                src={avatarUrl || NoImage}
                onError={(e) => {
                    e.currentTarget.src = NoImage;
                }}
                alt={fullName}
                className="w-full h-96 object-cover rounded"
            />
            <h3 className="text-lg font-semibold mt-4 mb-2">{fullName}</h3>
            <p className="text-sm text-gray-500 dark:text-[#a6adba]">{title}</p>
            <div className="flex mt-4 gap-2 items-center">
                <div className="flex items-center gap-1">
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                onClick={() => setRating(star)}
                                style={{ cursor: 'pointer' }}
                            >
                                {star <= totalStudents ? (
                                    <AiFillStar color="#ffc107" size={25} />
                                ) : (
                                    <AiOutlineStar color="#ccc" size={25} />
                                )}
                            </span>
                        ))}
                    </div>
                </div>
                <span className="text-sm text-[#a6adba]">({totalStudents ?? 0} студентов)</span>
            </div>
        </div>
    );
};

export default CardInstructor;

CardInstructor.propTypes = {
    avatarUrl: PropTypes.string,
    fullName: PropTypes.string,
    position: PropTypes.string,
    totalStudents: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
