import React, { useState } from "react";
import { Link } from "react-router-dom"; // ✅ Add this
import StatCard from "./SuperAdminStatcard";
import { FaCloud, FaServer, FaFileAlt } from "react-icons/fa";
import companiesIcon from "../assets/companies.png";
import clientsIcon from "../assets/clients.png";
import usersIcon from "../assets/users.png";
import { PieChart } from "react-minimal-pie-chart";

const SuperAdminDashboardCards = () => {
  const [enrollments, setEnrollments] = useState({
    companies: 10,
    clients: 55,
    users: 20,
  });

  const handleInputChange = (e, key) => {
    const value = parseInt(e.target.value) || 0;
    setEnrollments((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const total = enrollments.companies + enrollments.clients + enrollments.users;

  return (
    <main className="flex flex-col w-full overflow-y-auto h-[calc(100vh-160px)] p-6 pt-2">
      {/* ✅ Top 3 cards with Links */}
      <section className="flex flex-wrap gap-12">
        <Link to="/superadmin/companies" className="hover:scale-105 transition-transform">
          <StatCard
            icon={<img src={companiesIcon} alt="Companies" className="w-12 h-12" />}
            title="Companies"
            value=""
          />
        </Link>

        <Link to="/superadmin/clients" className="hover:scale-105 transition-transform">
          <StatCard
            icon={<img src={clientsIcon} alt="Clients" className="w-12 h-12 scale-125" />}
            title="Clients"
            value=""
          />
        </Link>

        <Link to="/superadmin/users" className="hover:scale-105 transition-transform">
          <StatCard
            icon={<img src={usersIcon} alt="Users" className="w-12 h-12 scale-125" />}
            title="Users"
            value=""
          />
        </Link>
      </section>


      {/* Section Wise Storage + Bottom 2 cards */}
      <section className="flex gap-12 mt-10">
        {/* Enrollments */}
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-xl mb-4 shadow p-4 flex items-center gap-2 text-lg font-semibold">
            <FaServer className="text-2xl" />
            Enrollments
          </div>

          <div className="-mt-6 flex justify-between items-center px-5">
  {/* Left: Enrollment Inputs */}
  <div className="flex flex-col gap-4">
    {[
      { label: "Companies", key: "companies", color: "bg-blue-500" },
      { label: "Clients", key: "clients", color: "bg-purple-700" },
      { label: "Personal Users", key: "users", color: "bg-gray-400" },
    ].map(({ label, key, color }, i) => (
      <div
        key={i}
        className="flex items-center gap-4 text-sm text-black"
      >
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <label className="w-32 font-medium">{label}</label>
        <input
          type="number"
          min="0"
          value={enrollments[key]}
          onChange={(e) => handleInputChange(e, key)}
          className="border border-gray-300 rounded px-2 py-1 w-24"
        />
      </div>
    ))}
  </div>

  {/* Right: Donut Chart */}
  <PieChart
    data={[
      {
        title: "Companies",
        value: enrollments.companies,
        color: "#3B82F6",
      },
      {
        title: "Clients",
        value: enrollments.clients,
        color: "#6B21A8",
      },
      {
        title: "Users",
        value: enrollments.users,
        color: "#9CA3AF",
      },
    ]}
    lineWidth={20}
    label={({ dataEntry }) =>
      total > 0
        ? `${Math.round((dataEntry.value / total) * 100)}%`
        : "0%"
    }
    labelStyle={{ fontSize: "5px", fill: "#000" }}
    radius={30}
    labelPosition={70}
    className="pl-2"
  />
</div>

        </div>

        {/* Bottom two cards */}
        <div className="flex flex-col gap-8 ml-auto mr-5">
          <StatCard
            icon={<FaCloud />}
            title="Storage"
            progressBar={{
              percent: (4253 / 4916) * 100,
              label: "0.49 GB used of 4916GB",
            }}
          />
          <StatCard icon={<FaFileAlt />} title="Docs Uploaded" value="1253" />
        </div>
      </section>
    </main>
  );
};

export default SuperAdminDashboardCards;
