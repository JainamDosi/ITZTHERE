import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import StatCard from "./SuperAdminStatcard";
import CompanyCard from "./CompanyCard";
import { FaCloud, FaFileAlt } from "react-icons/fa";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SuperAdminCompactDashboard = () => {
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All");

  const navigate = useNavigate();

  // ✅ Fetch companies from backend
  const { data: companyData = [], isLoading, isError, error } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await axios.get("/super-admin/companies", {
        withCredentials: true,
      });
     
      return res.data;
    },
  });

  // ✅ Filter companies based on search and plan
  const filteredCompanies = companyData.filter((company) => {
    const matchesName = company.name.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = selectedPlan === "All" || company.storagePlan === selectedPlan;
    return matchesName && matchesPlan;
  });

  // ✅ Handle company card click
  const handleCompanyClick = (company) => {
    navigate("/superadmin/clients", { state: { companyName: company.name } });
  };

  return (
    <main className="flex flex-col w-full overflow-y-auto h-[calc(100vh-160px)] p-6 pt-2">
      {/* Top Stat Cards */}
      

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center w-full max-w-lg bg-white border rounded shadow px-4 py-2">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Companies</span>
          </div>
          <div className="flex-1 ml-4">
            <input
              type="text"
              placeholder="Search here...."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-gray-700"
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Plan:</label>
          <select
            className="border px-2 py-1 rounded text-sm text-gray-700"
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          >
            <option value="All">All</option>
            <option value="business">Business</option>
            <option value="business-plus">Business Plus</option>
          </select>
        </div>
      </div>

      {/* Company Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500">Loading companies...</p>
        ) : isError ? (
          <p className="text-red-500">Error: {error.message}</p>
        ) : filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id || company.name} // Use unique key
              {...company}
              onClick={() => handleCompanyClick(company)}
            />
          ))
        ) : (
          <p className="text-gray-500">No companies found.</p>
        )}
      </div>
    </main>
  );
};

export default SuperAdminCompactDashboard;
