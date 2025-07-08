import React, { useState } from "react";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import SuperAdminSidebar from "../../components/SuperAdminSidebar";
import StatCard from "../../components/SuperAdminStatcard";
import {
  FaUser,
  FaCloud,
  FaFileAlt,
  FaCalendarAlt,
  FaIdCard,
} from "react-icons/fa";
import { Search } from "lucide-react";

const userData = [
  {
    name: "User A",
    storageUsed: "0.49 GB",
    totalStorage: "491GB",
    docsUploaded: 110,
    plan: "Monthly",
    membershipLeft: "21 days of membership left",
    membershipDays: 21,
  },
  {
    name: "User B",
    storageUsed: "0.49 GB",
    totalStorage: "491GB",
    docsUploaded: 110,
    plan: "Annually",
    membershipLeft: "7 months of membership left",
    membershipDays: 210, // Approx. 7 months
  },
  {
    name: "User C",
    storageUsed: "0.49 GB",
    totalStorage: "491GB",
    docsUploaded: 110,
    plan: "Monthly",
    membershipLeft: "21 days of membership left",
    membershipDays: 21,
  },
];

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("All");
  const [sortOrder, setSortOrder] = useState("None");

  // Filter + sort logic
  let filteredUsers = userData.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filterPlan !== "All") {
    filteredUsers = filteredUsers.filter((user) => user.plan === filterPlan);
  }

  if (sortOrder === "Asc") {
    filteredUsers.sort((a, b) => a.membershipDays - b.membershipDays);
  } else if (sortOrder === "Desc") {
    filteredUsers.sort((a, b) => b.membershipDays - a.membershipDays);
  }

  return (
    <div className="flex flex-col h-screen bg-white/50 overflow-hidden">
      <div className="h-16 shrink-0">
        <SuperAdminHeader />
      </div>

      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-y-hidden pt-4">
        <div className="w-80 h-full overflow-y-scroll scrollbar-hide bg-white pb-2">
          <SuperAdminSidebar />
        </div>

        <div className="flex-1 h-full overflow-y-auto p-6 pt-2">
          {/* Quick Stats */}
          <section className="flex flex-wrap gap-12 mb-8">
            <StatCard
              icon={<FaCloud />}
              title="Total Storage Used By Users"
              progressBar={{
                percent: (89 / 491) * 100,
                label: "0.49 GB used of 4916GB",
              }}
            />
            <StatCard
              icon={<FaFileAlt />}
              title="Total Documents Uploaded"
              value={userData
                .reduce((acc, u) => acc + u.docsUploaded, 0)
                .toString()}
            />
          </section>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex items-center w-full sm:max-w-md bg-white border rounded shadow px-4 py-2">
              <div className="flex items-center gap-2">
                <Search size={18} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Users
                </span>
              </div>
              <div className="flex-1 ml-4">
                <input
                  type="text"
                  placeholder="Search here..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-700"
                />
              </div>
            </div>

            {/* Filter & Sort */}
            <div className="flex gap-4">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-3 py-2 border rounded text-sm"
              >
                <option value="All">All Plans</option>
                <option value="Monthly">Monthly</option>
                <option value="Annually">Annually</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 border rounded text-sm"
              >
                <option value="None">Sort by Membership</option>
                <option value="Asc">Shortest First</option>
                <option value="Desc">Longest First</option>
              </select>
            </div>
          </div>

          {/* User Cards */}
          <div className="space-y-4">
            {filteredUsers.map((user, idx) => (
              <div
                key={idx}
                className="border border-gray-300 rounded-md p-4 shadow bg-white"
              >
                <h3 className="text-sm font-bold text-black mb-2">
                  {user.name}
                </h3>
                <div className="flex flex-wrap gap-8 text-sm text-black">
                  <div className="flex items-center gap-2">
                    <FaCloud className="text-lg" />
                    <span>
                      {user.storageUsed} used of {user.totalStorage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaFileAlt className="text-lg" />
                    <span>Documents Uploaded - {user.docsUploaded}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-lg" />
                    <span>{user.plan}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaIdCard className="text-lg" />
                    <span>{user.membershipLeft}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
