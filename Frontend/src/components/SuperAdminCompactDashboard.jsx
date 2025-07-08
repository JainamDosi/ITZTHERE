import React, { useState } from "react";
import StatCard from "./SuperAdminStatcard";
import CompanyCard from "./CompanyCard";
import { FaCloud, FaFileAlt } from "react-icons/fa";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom"; 

import companiesIcon from "../assets/companies.png";
import clientsIcon from "../assets/clients.png";
import usersIcon from "../assets/users.png";

const SuperAdminCompactDashboard = () => {
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All");

  const navigate = useNavigate(); 

  const companyData = [
    {
      name: "Company A",
      plan: "Business",
      storageUsed: "0.49 GB",
      docsUploaded: 110,
      clients: 25,
      employees: 5,
      membershipDays: 30,
    },
    {
      name: "Company B",
      plan: "Business Plus",
      storageUsed: "0.49 GB",
      docsUploaded: 110,
      clients: 25,
      employees: 5,
      membershipDays: 30,
    },
    {
      name: "Company C",
      plan: "Business",
      storageUsed: "0.49 GB",
      docsUploaded: 110,
      clients: 25,
      employees: 5,
      membershipDays: 30,
    },
  ];

  const filteredCompanies = companyData.filter((company) => {
    const matchesName = company.name.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = selectedPlan === "All" || company.plan === selectedPlan;
    return matchesName && matchesPlan;
  });

  const handleCompanyClick = (company) => {
    navigate("/superadmin/clients", { state: { companyName: company.name } }); 
  };

  return (
    <main className="flex flex-col w-full overflow-y-auto h-[calc(100vh-160px)] p-6 pt-2">
      {/* Top Cards Section */}
      <section className="flex flex-wrap gap-12 mb-8">
        {/* Cards like Storage and Docs Uploaded */}
        <StatCard
          icon={<FaCloud />}
          title="Storage"
          progressBar={{
            percent: (4253 / 4916) * 100,
            label: "0.49 GB used of 4916GB",
          }}
        />
        <StatCard icon={<FaFileAlt />} title="Docs Uploaded" value="1253" />
      </section>

      {/* Search Bar and Filters */}
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
            <option value="Business">Business</option>
            <option value="Business Plus">Business Plus</option>
          </select>
        </div>
      </div>

      {/* Company Cards */}
      <div className="space-y-4">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company, idx) => (
            <CompanyCard
              key={idx}
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
