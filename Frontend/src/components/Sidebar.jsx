import React, { useState } from "react";
import {
  FaUser, FaUpload, FaUsers, FaChartPie, FaCalendar
} from "react-icons/fa";
import { FaFileCircleCheck } from "react-icons/fa6";
import { MdOutlineBusiness } from "react-icons/md";
import { FiEdit2, FiPlus, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [newFolder, setNewFolder] = useState("");

  const handleAddFolder = async () => {
    if (!newFolder.trim()) return;

    try {
      await axios.post(
        "http://localhost:3000/api/folders/create",
        { name: newFolder },
        { withCredentials: true }
      );
      setNewFolder("");
      setShowModal(false);
      queryClient.invalidateQueries(["visibleFolders"]);
    } catch (err) {
      console.error("Failed to create folder:", err);
      alert("Error creating folder");
    }
  };

  const { data: companyDivisions = [], isLoading, isError } = useQuery({
    queryKey: ["visibleFolders"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/folders/visible", {
        withCredentials: true,
      });
      return res.data.folders;
    },
  });

  return (
    <>
      <div className="bg-white mt-24 ml-2 flex flex-col pb-2 w-32 sm:w-72 px-2 justify-between transition-all duration-300 h-auto">
        <div className="space-y-4 flex flex-col items-center sm:items-start">
          {/* Profile */}
          <div className="bg-white rounded-xl shadow p-2 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start sm:gap-3 w-full">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-purple-500 to-gray-800" />
            <div className="hidden sm:block flex-1 min-w-0">
              <h2 className="font-bold text-base truncate">{user.name}</h2>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            <FiEdit2 className="text-gray-500 cursor-pointer hidden sm:block" />
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-xl shadow p-1 sm:p-2 space-y-1 w-full">
            <Link to="/main">
              <MenuItem icon={<FaChartPie />} label="Dashboard" active={pathname === "/main"} />
            </Link>
            <Link to="/main/user-management">
              <MenuItem icon={<FaUsers />} label="User Management" active={pathname === "/main/user-management"} />
            </Link>
            <Link to="/main/upload">
              <MenuItem icon={<FaUpload />} label="Upload File" active={pathname === "/main/upload"} />
            </Link>
            <Link to="/main/requests">
              <MenuItem icon={<FaFileCircleCheck />} label="Manage Requests" active={pathname === "/main/requests"} />
            </Link>
          </div>

          {/* Folder List */}
          <div className="bg-white rounded-xl shadow w-full">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="flex items-center gap-2">
                <MdOutlineBusiness className="text-pink-700" />
                <span className="text-sm font-semibold hidden sm:inline">Company Folders</span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="text-pink-700 hover:text-pink-800 transition"
                title="Add Folder"
              >
                <FiPlus className="text-lg" />
              </button>
            </div>
            <div className="px-3 py-2 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : isError ? (
                <div className="text-sm text-red-500">Failed to load folders</div>
              ) : companyDivisions.length === 0 ? (
                <div className="text-sm text-gray-400 italic">No folders</div>
              ) : (
                companyDivisions.map((folder) => (
                  <Link
                    to={`/main/folder/${folder._id}`}
                    key={folder._id}
                    className="flex items-center justify-between text-sm text-gray-700 cursor-pointer hover:text-pink-700 border-b transition px-1 py-1"
                  >
                    <span>{folder.name}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-3 flex flex-col items-center sm:items-start w-full mt-4">
          <div className="bg-white rounded-md shadow p-2 text-xs sm:text-sm flex items-center gap-2 text-gray-600 justify-center sm:justify-start w-full">
            <FaCalendar />
            <span className="hidden sm:inline">
              Plan expires in <span className="text-pink-700 font-semibold">320 days</span>
            </span>
          </div>
          <button className="w-full bg-pink-700 text-white font-semibold py-2 rounded-md shadow hover:bg-pink-800 transition text-xs sm:text-sm">
            <span className="hidden sm:inline">Upgrade now</span>
            <span className="sm:hidden">↑</span>
          </button>
        </div>
      </div>

      {/* Add Folder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-11/12 max-w-sm shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <FiX className="text-xl" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-center">Add New Folder</h2>
            <input
              type="text"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Folder name"
            />
            <button
              onClick={handleAddFolder}
              className="w-full bg-pink-700 text-white py-2 rounded font-semibold hover:bg-pink-800 transition"
            >
              Create Folder
            </button>
          </div>
        </div>
      )}
    </>
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
    <span className={`text-lg ${active ? "text-pink-700" : "text-gray-700"}`}>
      {icon}
    </span>
    <span className={`hidden sm:inline ${active ? "text-pink-700" : "text-gray-700"}`}>
      {label}
    </span>
  </div>
);

export default Sidebar;
