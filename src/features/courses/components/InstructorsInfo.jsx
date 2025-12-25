import React from "react";
import PropTypes from "prop-types";
import Star from "../../../assets/icons/star.svg";
import CheckCircle from "../../../assets/icons/check.svg";
import Briefcase from "../../../assets/icons/academicCap.svg";
import BookOpen from "../../../assets/icons/bookOpen.svg";
import People from "../../../assets/icons/people.svg";
import Instagram from "../../../assets/icons/instagram.svg";
import Telegram from "../../../assets/icons/telegram.svg";
import { FaLinkedin } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";
import { IoLogoFacebook } from "react-icons/io5";
import { FaTwitter } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";

import DefaultAvatar from "../../../assets/icons/personBlack.svg";

const isValidLink = (platform, url) => {
  if (!url || typeof url !== "string") return false;
  if (platform === "email") return url.startsWith("mailto:");
  return url.startsWith("http://") || url.startsWith("https://");
};

const getSocialIcon = (platform) => {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return { type: "img", component: Instagram };
    case "telegram":
      return { type: "img", component: Telegram };
    case "linkedin":
      return { type: "icon", component: FaLinkedin };
    case "portfolio":
    case "github":
      return { type: "icon", component: FaGithub };
    case "facebook":
    case "fb":
      return { type: "icon", component: IoLogoFacebook };
    case "twitter":
    case "x":
      return { type: "icon", component: FaTwitter };
    case "youtube":
    case "yt":
      return { type: "icon", component: FaYoutube };
    case "email":
      return { type: "icon", component: FaEnvelope };
    default:
      return { type: "icon", component: null };
  }
};

function InstructorsInfo({ instructorData }) {
  const {
    avatarUrl,
    fullName = "Инструктор",
    title,
    bio = "Информация об инструкторе отсутствует",
    expertiseTags = [],
    yearsOfExperience,
    coursesCount = 0,
    numberOfStudents = 0,
    socialLinks = {},
    rating = 0,
    reviewsCount = 0,
    topTutor = true,
  } = instructorData || {};

  const safeSocialLinks =
    socialLinks && typeof socialLinks === "object" ? socialLinks : {};

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 md:p-7 shadow-sm flex flex-col md:flex-row gap-5">
      <div className="flex-shrink-0 flex flex-col items-start justify-start">
        <img
          src={avatarUrl || DefaultAvatar}
          alt={fullName}
          className="w-[96px] h-[96px] object-cover rounded-lg"
          onError={(e) => {
            e.target.src = DefaultAvatar;
          }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-start gap-3 max-w-full">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            {topTutor && (
              <span className="bg-green-100 text-green-600 px-2 py-0.5 text-xs font-semibold rounded-md">
                TOP tutor
              </span>
            )}
            <img src={Star} alt="star" className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">
              {rating?.toFixed ? rating.toFixed(1) : rating}{" "}
              {reviewsCount ? `(${reviewsCount})` : ""}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-1 flex-wrap">
            {fullName}
            <img
              src={CheckCircle}
              alt="check"
              className="w-4 h-4 text-orange-500"
            />
          </h2>
        </div>

        <p className="text-sm text-gray-500">{title}</p>

        <div className="flex flex-col gap-4">
          <p className="text-gray-800 text-base leading-relaxed break-words">
            {bio}
          </p>
          <div className="flex flex-wrap gap-2 w-full">
            {expertiseTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center justify-center bg-black text-white text-sm px-3 py-1 rounded-2xl whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-8 text-gray-700 text-sm mt-4">
            {yearsOfExperience !== undefined && yearsOfExperience !== null && (
              <div className="flex items-center gap-2">
                <img src={Briefcase} alt="briefcase" className="w-4 h-4" />
                <span>{yearsOfExperience}+ years experience</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <img src={BookOpen} alt="book" className="w-4 h-4" />
              <span>{coursesCount} courses</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={People} alt="book" className="w-4 h-4" />
              <span>{numberOfStudents}+ students</span>
            </div>

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
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {iconData.type === "img" ? (
                    <div className="w-7 h-7 flex items-center justify-center">
                      <img
                        src={IconComponent}
                        alt={platform}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <IconComponent className="w-full h-full" />
                    </div>
                  )}
                </a>
              );
            })}
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
