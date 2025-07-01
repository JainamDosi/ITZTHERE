import React from "react";
import { FaUpload, FaChartPie } from "react-icons/fa";
import { MdOutlineBusiness } from "react-icons/md";
import { FiEdit2 } from "react-icons/fi";
import { HiOutlineLockClosed } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const Sidebar_employee = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();

  const { data: allowedFolders = [], isLoading, isError } = useQuery({
    queryKey: ["allowedFolders"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/folders/visible", {
        withCredentials: true,
      });
      return res.data.folders;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="bg-white mt-24 ml-2 flex flex-col min-h-auto pb-2 w-32 sm:w-72 px-2 justify-start transition-all duration-300">
      <div className="space-y-4 flex flex-col items-center sm:items-start w-full">

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow p-2 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start sm:gap-3 w-full">
          <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-purple-500 to-gray-800" />
          <div className="hidden sm:block flex-1 min-w-0">
            <h2 className="font-bold text-base truncate">{user.name}</h2>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            <p className="text-sm text-gray-500 truncate">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
            </p>
          </div>
          <FiEdit2 className="text-gray-500 cursor-pointer hidden sm:block" />
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-xl shadow p-1 sm:p-2 space-y-1 w-full">
          <Link to="/employee">
            <MenuItem icon={<FaChartPie />} label="Dashboard" active={pathname === "/employee"} />
          </Link>
          <Link to="/employee/request-access">
            <MenuItem icon={<HiOutlineLockClosed />} label="Request Access" active={pathname === "/employee/request-access"} />
          </Link>
          <Link to="/employee/upload">
            <MenuItem icon={<FaUpload />} label="Upload File" active={pathname === "/employee/upload"} />
          </Link>
        </div>

        {/* Allowed Folders */}
        <div className="bg-white rounded-xl shadow w-full">
          <div className="flex items-center gap-2 px-3 py-2 justify-center sm:justify-start border-b">
            <MdOutlineBusiness className="text-pink-700" />
            <span className="text-sm font-semibold hidden sm:inline">Your Folders</span>
          </div>
          <div className="px-3 py-2 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {isLoading ? (
              <p className="text-sm text-gray-500 italic">Loading folders...</p>
            ) : isError ? (
              <p className="text-sm text-red-500 italic">Error loading folders.</p>
            ) : allowedFolders.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No folders assigned.</p>
            ) : (
              allowedFolders.map((folder) => (
                <Link
                  to={`/employee/folder/${folder._id}`}
                  key={folder._id}
                  className="flex items-center justify-between text-sm text-gray-700 cursor-pointer hover:text-pink-700 transition px-1 py-1 border-b"
                >
                  <span>{folder.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, active }) => (
  <div
    className={`
      flex items-center sm:justify-start justify-center gap-0 sm:gap-3
      px-2 sm:px-4 py-2 rounded cursor-pointer text-sm font-medium w-full
      ${active ? "text-pink-700" : "text-gray-700"}
      hover:bg-gray-100
      transition-all duration-300 ease-in-out
    `}
  >
    <span className={`text-lg ${active ? "text-pink-700" : "text-gray-700"} transition-colors duration-300`}>
      {icon}
    </span>
    <span className={`hidden sm:inline ${active ? "text-pink-700" : "text-gray-700"} transition-all duration-300`}>
      {label}
    </span>
  </div>
);

export default Sidebar_employee;
