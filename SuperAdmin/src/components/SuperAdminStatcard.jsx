import React from "react";

const StatCard = ({ icon, title, value, progressBar }) => {
  return (
    <div className="bg-white rounded-xl border hover:scale-105 border-gray-700 shadow-md w-[250px] h-[130px] flex flex-col items-center ease-in-out duration-300 justify-center text-center px-4 py-3">
      <div className="text-2xl text-black mb-2">{icon}</div>
      <h3 className="text-md font-semibold text-black">{title}</h3>

      {progressBar ? (
        <>
          {/* Progress bar */}
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
