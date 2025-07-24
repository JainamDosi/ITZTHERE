import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import StatCard from "./SuperAdminStatcard";
import { FaCloud, FaServer, FaFileAlt, FaUser } from "react-icons/fa";
import companiesIcon from "../assets/companies.png";
import clientsIcon from "../assets/clients.png";
import usersIcon from "../assets/users.png";
import { PieChart } from "react-minimal-pie-chart";

const fetchEnrollments = async () => {
  const res = await axios.get("/super-admin/enrollments");
 
  return res.data;
};

const fetchStorageStats = async () => {
  const res = await axios.get("/super-admin/storage");

  return res.data;
};




const SuperAdminDashboardCards = () => {
  const { data: enrollments, isLoading, isError, error } = useQuery({
    queryKey: ["enrollments"],
    queryFn: fetchEnrollments,
    });

    const { data: storageStats, isLoading: loadingStorage } = useQuery({
    queryKey: ["storage-stats"],
    queryFn: fetchStorageStats,
  });



  const total = enrollments
    ? enrollments.companies + enrollments.clients + enrollments.individuals + enrollments.users
    : 0;

  if (isLoading) {
    return <div className="p-6 text-gray-700">Loading enrollment data...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Error: {error.message}</div>;
  }

  return (
    <main className="flex flex-col w-full overflow-y-auto h-[calc(100vh-160px)] p-6 pt-2">
      {/* Top 4 cards */}
      <section className="flex flex-wrap gap-12">
        <Link to="/superadmin/companies" className="hover:scale-105 transition-transform">
          <StatCard
            icon={<img src={companiesIcon} alt="Companies" className="w-12 h-12" />}
            title="Companies"
            value={enrollments.companies}
          />
        </Link>

        <Link to="/superadmin/clients" className="hover:scale-105 transition-transform">
          <StatCard
            icon={<img src={clientsIcon} alt="Clients" className="w-12 h-12 scale-125" />}
            title="Clients"
            value={enrollments.clients}
          />
        </Link>

        <Link to="/superadmin/users" className="hover:scale-105 transition-transform">
          <StatCard
            icon={<img src={usersIcon} alt="Users" className="w-12 h-12 scale-125" />}
            title="Users"
            value={enrollments.users}
          />
        </Link>

        <StatCard
          icon={<FaUser />}
          title="Individuals"
          value={enrollments.individuals}
        />
      </section>

      {/* Section-wise chart + bottom 2 cards */}
      <section className="flex gap-12 mt-10">
        {/* Enrollments with chart */}
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-xl mb-4 shadow p-4 flex items-center gap-2 text-lg font-semibold">
            <FaServer className="text-2xl" />
            Enrollments
          </div>

          <div className="-mt-6 flex justify-between items-center px-5">
            {/* Left: breakdown */}
            <div className="flex flex-col gap-4">
              {[
                { label: "Companies", key: "companies", color: "bg-blue-500" },
                { label: "Clients", key: "clients", color: "bg-purple-700" },
                { label: "Individuals", key: "individuals", color: "bg-green-500" },
                { label: "Admins and employees", key: "users", color: "bg-amber-400" },
              ].map(({ label, key, color }, i) => (
                <div key={i} className="flex items-center gap-4 text-sm text-black">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <label className="w-32 font-medium">{label}</label>
                  <input
                    type="number"
                    value={enrollments[key]}
                    disabled
                    className="bg-gray-100 border border-gray-300 rounded px-2 py-1 w-24"
                  />
                </div>
              ))}
            </div>

            {/* Right: donut chart */}
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
                  title: "Individuals",
                  value: enrollments.individuals,
                  color: "#22C55E",
                },
                {
                  title: "Users",
                  value: enrollments.users,
                  color: "#FFBF00",
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
              percent: storageStats ? (storageStats.totalSize / (1 * 1024 * 1024 * 1024)) * 100 : 0,
              label: storageStats
                ? `${(storageStats.totalSize / (1024 * 1024)).toFixed(2)} MB used of 1 GB`
                : "Loading...",
            }}
          />

          <StatCard
            icon={<FaFileAlt />}
            title="Docs Uploaded"
            value={storageStats?.totalFiles ?? "00"}
          />

        </div>
      </section>
    </main>
  );
};

export default SuperAdminDashboardCards;
