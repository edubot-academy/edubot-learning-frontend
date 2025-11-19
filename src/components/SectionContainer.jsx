import React from "react";
import Button from "../components/UI/Button";

const SectionContainer = ({
  title,
  subtitle,
  buttonText,
  data = [],
  CardComponent,
  hideTitleAndLink = false,
  rightContent = null,
}) => {
  // console.log(data[0].enrollments);
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-12 bg-white">
      {!hideTitleAndLink && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div className="flex flex-col gap-2">
            {title && (
              <h2 className="font-suisse font-bold text-[#141619] text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="font-suisse font-normal text-[#3E424A] text-base max-w-md">
                {subtitle}
              </p>
            )}
          </div>
          <div>{rightContent}</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.slice(0, 1).map((item, index) =>
          item.enrollments.map((e) => (
            <>
              <div>{e.id}</div>
            </>
          ))
        )}
      </div>
    </div>
  );
};

export default SectionContainer;
