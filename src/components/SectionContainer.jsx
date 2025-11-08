import React from "react";

const SectionContainer = ({
  title,
  subtitle,
  buttonText,
  data = [],
  CardComponent,
  hideTitleAndLink = false,
}) => {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-12 bg-white">
      {!hideTitleAndLink && (
        <div className="flex items-center justify-between mb-12">
          <div className="flex flex-col gap-2">
            <h2 className="font-suisse font-bold text-[#141619] text-4xl">
              {title}
            </h2>
            <p className="font-suisse font-normal text-[#3E424A] text-base max-w-md">
              {subtitle}
            </p>
          </div>
          {buttonText && (
            <button className="rounded-lg border border-[#141619] py-3 px-8">
              {buttonText}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {data.slice(0, 3).map((item, index) => (
          <CardComponent key={item.id || index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default SectionContainer;
