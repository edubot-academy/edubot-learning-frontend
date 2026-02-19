import React from "react";

const Loader = ({ size = 40, fullScreen = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "w-full h-screen" : "w-full h-full"
      }`}
    >
      <div
        className="animate-spin rounded-full border-4 border-gray-300 border-t-orange-500"
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
};

export default Loader;
