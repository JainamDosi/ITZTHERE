import React from "react";
import { FaCloud } from "react-icons/fa";
import StatCard from "../../components/StatCard"; // Adjust the import path as necessary

const Dashboard_Client = () => {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
      
      {/* Main Content Left */}
      <div className="w-3/4 space-y-6">
        {/* Pinned Files Card */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">📌 Pinned Files</h2>
          <hr />
          <p className="text-gray-500 text-sm mt-1">No pinned files yet.</p>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard_Client;
