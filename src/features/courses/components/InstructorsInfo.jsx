import React from 'react';
import PropTypes from 'prop-types';
import { 
    FaStar, 
    FaCheckCircle, 
    FaBriefcase, 
    FaBookOpen, 
    FaUsers,
    FaInstagram,
    FaTelegram,
    FaLinkedin,
    FaGithub,
    FaYoutube,
    FaTwitter,
    FaEnvelope,
    FaUserCircle
} from 'react-icons/fa';
import { IoLogoFacebook } from 'react-icons/io5';
import DefaultAvatar from '../../../assets/icons/personBlack.svg';

const isValidLink = (platform, url) => {
    if (!url || typeof url !== 'string') return false;
    if (platform === 'email') return url.startsWith('mailto:');
    return url.startsWith('http://') || url.startsWith('https://');
};

const getSocialIcon = (platform) => {
    switch (platform?.toLowerCase()) {
        case 'instagram':
            return { component: FaInstagram };
        case 'telegram':
            return { component: FaTelegram };
        case 'linkedin':
            return { component: FaLinkedin };
        case 'portfolio':
        case 'github':
            return { component: FaGithub };
        case 'facebook':
        case 'fb':
            return { component: IoLogoFacebook };
        case 'twitter':
        case 'x':
            return { component: FaTwitter };
        case 'youtube':
        case 'yt':
            return { component: FaYoutube };
        case 'email':
            return { component: FaEnvelope };
        default:
            return { component: null };
    }
};

function InstructorsInfo({ instructorData }) {
    const {
        avatarUrl,
        fullName = 'Инструктор',
        title,
        bio = 'Информация тууралуу маалымат жок',
        expertiseTags = [],
        yearsOfExperience,
        coursesCount = 0,
        numberOfStudents = 0,
        socialLinks = {},
        rating = 0,
        reviewsCount = 0,
        topTutor = true,
    } = instructorData || {};

    const safeSocialLinks = socialLinks && typeof socialLinks === 'object' ? socialLinks : {};

    return (
        <div className="w-full border border-gray-200 rounded-xl p-6 md:p-7 shadow-sm flex flex-col md:flex-row gap-5 dark:border-gray-700 dark:bg-[#222222]">
            <div className="flex-shrink-0 flex flex-col items-start justify-start">
                <img
                    src={avatarUrl || DefaultAvatar}
                    alt={fullName}
                    className="w-[96px] h-[96px] object-cover rounded-lg dark:brightness-90"
                    onError={(e) => {
                        e.target.src = DefaultAvatar;
                    }}
                />
            </div>

            <div className="flex-1 flex flex-col justify-start gap-3 max-w-full">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                        {topTutor && (
                            <span className="bg-green-100 text-green-600 px-2 py-0.5 text-xs font-semibold rounded-md dark:bg-green-900/30 dark:text-green-400">
                                TOP tutor
                            </span>
                        )}
                        <FaStar className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {rating?.toFixed ? rating.toFixed(1) : rating}{' '}
                            {reviewsCount ? `(${reviewsCount})` : ''}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold flex items-center gap-1 flex-wrap text-gray-900 dark:text-white">
                        {fullName}
                        <FaCheckCircle className="w-4 h-4 text-green-500" />
                    </h2>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>

                <div className="flex flex-col gap-4">
                    <p className="text-base leading-relaxed break-words text-gray-700 dark:text-gray-300">{bio}</p>
                    
                    <div className="flex flex-wrap gap-2 w-full">
                        {expertiseTags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center justify-center border border-gray-400 bg-black text-white text-sm px-3 py-1 rounded-2xl whitespace-nowrap dark:bg-gray-700 dark:border-gray-600"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-8 text-sm mt-4">
                        {yearsOfExperience !== undefined && yearsOfExperience !== null && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <FaBriefcase className="w-4 h-4 text-gray-500 dark:text-white" />
                                <span>{yearsOfExperience}+ years experience</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <FaBookOpen className="w-4 h-4 text-gray-500 dark:text-white" />
                            <span>{coursesCount} courses</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <FaUsers className="w-4 h-4 text-gray-500 dark:text-white" />
                            <span>{numberOfStudents}+ students</span>
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                            {Object.entries(safeSocialLinks).map(([platform, url]) => {
                                const iconData = getSocialIcon(platform);
                                if (!iconData || !url || !isValidLink(platform, url)) return null;

                                const IconComponent = iconData.component;

                                return (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors dark:text-gray-400 dark:hover:text-blue-400"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <IconComponent className="w-full h-full" />
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InstructorsInfo;

InstructorsInfo.propTypes = {
    instructorData: PropTypes.shape({
        avatarUrl: PropTypes.string,
        fullName: PropTypes.string,
        title: PropTypes.string,
        bio: PropTypes.string,
        expertiseTags: PropTypes.arrayOf(PropTypes.string),
        yearsOfExperience: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        coursesCount: PropTypes.number,
        numberOfStudents: PropTypes.number,
        socialLinks: PropTypes.objectOf(PropTypes.string),
        rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        reviewsCount: PropTypes.number,
        topTutor: PropTypes.bool,
    }),
};