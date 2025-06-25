import React from "react";

const StatCard = ({ icon, title, value, progressBar }) => {
  return (
    <div className="bg-white rounded-xl shadow-md flex flex-col flex-grow w-full min-w-[140px] max-w-full items-center justify-center text-center px-4 sm:px-6 py-3 sm:py-4 transition-all">
      {/* Icon */}
      <div className="text-2xl text-black mb-2">{icon}</div>

      {/* Title */}
      <h3 className="text-md font-semibold text-black">{title}</h3>

      {/* Progress Bar or Value */}
      {progressBar ? (
        <>
          <div className="relative w-full h-2 bg-gray-300 rounded-full mt-2 mb-1">
            <div
              className="absolute top-0 left-0 h-2 bg-pink-600 rounded-full"
              style={{ width: `${progressBar.percent}%` }}
            />
          </div>
          <p className="text-sm text-gray-800">{progressBar.label}</p>
        </>
      ) : value ? (
        <p className="text-pink-600 text-lg font-bold mt-2">{value}</p>
      ) : null}
    </div>
  );
};

export default StatCard;
