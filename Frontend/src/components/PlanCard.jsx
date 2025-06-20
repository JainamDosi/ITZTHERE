// components/PlanCard.jsx
import React from "react";

const PlanCard = ({ title, desc, color }) => {
  return (
    <div className="bg-slate-300 p-6 h-full rounded-lg shadow hover:shadow-lg transition">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="mb-6 text-sm text-gray-600">{desc}</p>
      <button className={`text-white px-4 py-2 rounded ${color} bg-opacity-75 hover:bg-opacity-80 transition`}>
        Buy now
      </button>
    </div>
  );
};

export default PlanCard;
