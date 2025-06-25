import React from "react";
import { FaCloud } from "react-icons/fa";
import StatCard from "../../components/StatCard"; // Adjust the import path as necessary

const Dashboard = () => {
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

      {/* Right Sidebar Widgets */}
      <div className= "flex-1 w-full sm:w-72 space-y-4">
        {/* Storage Card */}
          <StatCard
                        icon={<FaCloud />}
                        title="Storage"
                        progressBar={{
                          percent: (4253 / 4916) * 100,
                          label: "0.49 GB used of 4916GB",
                        }}
                      
                      />
        

        {/* Company Updates Card/Button */}
        <button className="w-full bg-white rounded-xl shadow px-4 py-3 text-center font-medium text-sm text-gray-700 hover:bg-gray-100 transition">
          Company Updates
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
