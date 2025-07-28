import React from "react";
import { Link } from "react-router-dom"; 
const PlanCard = ({ title, desc, features, price, trial }) => (
  <div className="relative flex flex-col justify-between bg-white rounded-3xl p-8 text-gray-800 border border-gray-200 shadow-md hover:shadow-xl transition-transform duration-300 transform hover:-translate-y-1">
    
    {/* Trial badge */}
    {trial && (
      <div className="absolute top-4 right-4 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded">
        Trial
      </div>
    )}

    <div>
      <h4 className="text-sm uppercase tracking-wide text-gray-500 mb-1">{desc}</h4>
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className="text-xl font-semibold text-pink-700 mb-6">{price}</p>

      <ul className="text-left text-sm list-disc list-inside space-y-2 text-gray-700">
        {features.map((feature, idx) => (
          <li key={idx}>{feature}</li>
        ))}
      </ul>

      {/* Optional trial note */}
    
    </div>

        <Link to="/register">
      <button className="mt-8 bg-pink-700 text-white font-medium px-5 py-3 rounded-xl hover:bg-teal-700 transition duration-200">
        Start Trial
      </button>
    </Link>
  </div>
);

export default PlanCard;
