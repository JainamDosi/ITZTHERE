import React, { useState, useEffect } from "react";
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
import { Mail, CalendarClock,User  } from "lucide-react";

import axios from "axios";
const UsersPage = () => {
  const [userData, setUserData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("All");
  const [sortOrder, setSortOrder] = useState("None");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/super-admin/users-summary",{
        withCredentials: true,
      }); 

        
        const data=res.data;
 
        setUserData(data.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
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

            <div className="flex gap-4">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-3 py-2 border rounded text-sm"
              >
                <option value="All">All Plans</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Annually</option>
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
          {loading ? (
            <p className="text-sm text-gray-600">Loading users...</p>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user, idx) => (
                <div
                  key={idx}
                  className="border border-gray-300 rounded-md p-4 shadow bg-white"
                >
                  <h3 className="text-sm font-bold text-black mb-1">
                    {user.name}
                  </h3>
                  <div className="flex flex-wrap gap-6 text-sm text-black">
                    <div className="flex items-center gap-2">
                      <Mail className="text-gray-500 w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="text-gray-500 w-4 h-4" />
                      <span>{user.plan || "N/A"} Plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-500 w-4 h-4" />
                      <span>{user.membershipLeft}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <User className="text-gray-500 w-4 h-4" />
                      <span>Role:-{user.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
