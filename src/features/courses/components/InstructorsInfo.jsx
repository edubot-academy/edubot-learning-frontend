import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
    FaBriefcase,
    FaBookOpen,
    FaCheckCircle,
    FaEnvelope,
    FaGithub,
    FaInstagram,
    FaLinkedin,
    FaStar,
    FaTelegram,
    FaTwitter,
    FaUsers,
    FaYoutube,
} from 'react-icons/fa';
import { IoLogoFacebook } from 'react-icons/io5';
import DefaultAvatar from '../../../assets/icons/personBlack.svg';

const SOCIAL_LABELS = {
    instagram: 'Instagram',
    telegram: 'Telegram',
    linkedin: 'LinkedIn',
    portfolio: 'Portfolio',
    github: 'GitHub',
    facebook: 'Facebook',
    fb: 'Facebook',
    twitter: 'X',
    x: 'X',
    youtube: 'YouTube',
    yt: 'YouTube',
    email: 'Email',
};

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

function InstructorsInfo({ instructorData, ratingAverage, ratingCount, priority = false }) {
    const { t } = useTranslation();
    const {
        avatarUrl,
        fullName = t('public.courseShared.instructorInfo.fallbackName'),
        title,
        bio = t('public.courseShared.instructorInfo.fallbackBio'),
        expertiseTags = [],
        yearsOfExperience,
        coursesCount = 0,
        numberOfStudents = 0,
        socialLinks = {},
        rating,
        reviewsCount = 0,
        topTutor = false,
        ratingAverage: instructorRatingAverage,
        ratingCount: instructorRatingCount,
    } = instructorData || {};

    const safeSocialLinks = socialLinks && typeof socialLinks === 'object' ? socialLinks : {};
    const ratingValue = instructorRatingAverage ?? ratingAverage ?? rating;
    const ratingCountValue = instructorRatingCount ?? ratingCount ?? reviewsCount;
    const displayRating = Number.isFinite(Number(ratingValue))
        ? Number(ratingValue)
        : 0;
    const displayRatingCount = Number.isFinite(Number(ratingCountValue))
        ? Number(ratingCountValue)
        : 0;
    const isTopTutor = topTutor ?? (displayRating >= 4.7 && displayRatingCount >= 30);
    const validSocialLinks = Object.entries(safeSocialLinks)
        .map(([platform, url]) => {
            const iconData = getSocialIcon(platform);

            return {
                platform,
                url,
                IconComponent: iconData.component,
                label: SOCIAL_LABELS[platform.toLowerCase()] || platform,
            };
        })
        .filter(({ platform, url, IconComponent }) => IconComponent && isValidLink(platform, url));
    const proofPoints = [
        yearsOfExperience !== undefined && yearsOfExperience !== null
            ? {
                  id: 'experience',
                  icon: FaBriefcase,
                  label: t('public.courseShared.instructorInfo.experience', {
                      count: Number(yearsOfExperience),
                  }),
              }
            : null,
        {
            id: 'courses',
            icon: FaBookOpen,
            label: t('public.courseShared.instructorInfo.courses', { count: coursesCount }),
        },
        {
            id: 'students',
            icon: FaUsers,
            label: t('public.courseShared.instructorInfo.students', {
                count: numberOfStudents,
            }),
        },
    ].filter(Boolean);

    return (
        <div className="w-full border border-gray-200 rounded-xl p-6 md:p-7 shadow-sm flex flex-col md:flex-row gap-5 dark:border-gray-700 dark:bg-[#222222]">
            <div className="flex h-[104px] w-[104px] flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                <img
                    src={avatarUrl || DefaultAvatar}
                    alt={fullName}
                    className="h-full w-full rounded-lg object-contain dark:brightness-90"
                    width="96"
                    height="96"
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority={priority ? 'high' : 'auto'}
                    decoding="async"
                    onError={(e) => {
                        e.target.src = DefaultAvatar;
                    }}
                />
            </div>

            <div className="flex-1 flex flex-col justify-start gap-3 max-w-full">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                        {isTopTutor && (
                            <span className="bg-green-100 text-green-600 px-2 py-0.5 text-xs font-semibold rounded-md dark:bg-green-900/30 dark:text-green-400">
                                {t('public.courseShared.instructorInfo.topInstructor')}
                            </span>
                        )}
                        <FaStar className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {displayRating.toFixed(1)} {displayRatingCount ? `(${displayRatingCount})` : ''}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold flex items-center gap-1 flex-wrap text-gray-900 dark:text-white">
                        {fullName}
                        <FaCheckCircle className="w-4 h-4 text-green-500" />
                    </h2>
                </div>

                {title && <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>}

                <div className="flex flex-col gap-4">
                    <p className="text-base leading-relaxed break-words text-gray-700 dark:text-gray-300">{bio}</p>

                    <div className="flex flex-wrap gap-2 w-full">
                        {expertiseTags?.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center justify-center border border-gray-400 bg-black text-white text-sm px-3 py-1 rounded-2xl whitespace-nowrap dark:bg-gray-700 dark:border-gray-600"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-col gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-600 dark:text-gray-300">
                            {proofPoints.map(({ id, icon: Icon, label }, index) => (
                                <div key={id} className="flex items-center gap-5">
                                    {index > 0 && (
                                        <span
                                            className="hidden h-5 w-px bg-gray-300 dark:bg-gray-700 md:block"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <Icon className="w-4 h-4 text-gray-500 dark:text-white" />
                                        <span>{label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {validSocialLinks.length > 0 && (
                            <div className="flex items-center gap-3 xl:justify-end">
                                {validSocialLinks.map(({ platform, url, IconComponent, label }) => (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={t('public.courseShared.instructorInfo.openProfile', {
                                            label,
                                        })}
                                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors dark:text-gray-400 dark:hover:text-blue-400"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <IconComponent className="w-full h-full" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
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
        ratingAverage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ratingCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
    ratingAverage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ratingCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    priority: PropTypes.bool,
};
