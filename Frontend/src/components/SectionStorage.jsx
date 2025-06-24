import React from "react";

const SectionStorage = () => {
  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="text-sm font-semibold mb-2">Section Wise Storage Consumption</h3>
      <ul className="space-y-2 mt-4">
        {[...Array(4)].map((_, i) => (
          <li key={i} className="w-6 h-6 bg-gray-300 rounded" />
        ))}
      </ul>
    </div>
  );
};

export default SectionStorage;
