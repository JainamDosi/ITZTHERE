import React, { useState } from "react";
import { FaUpload, FaChartPie } from "react-icons/fa";
import { MdOutlineBusiness } from "react-icons/md";
import { FiEdit2, FiPlus, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EditProfileModal from "./EditProfileModal";

const Sidebar_Individual = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);


  const { data: companyFolders = [], isLoading, isError } = useQuery({
    queryKey: ["visibleFolders"],
    queryFn: async () => {
      const res = await axios.get("/folders/visible", {
        withCredentials: true,
      });
      return res.data.folders;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const handleAddFolder = async () => {
    if (!newFolder.trim()) return;
    setIsCreatingFolder(true);

    try {
      await axios.post(
        "/folders/create",
        { name: newFolder },
        { withCredentials: true }
      );
      setNewFolder("");
      setShowAddModal(false);
      queryClient.invalidateQueries(["visibleFolders"]);
    } catch (err) {
      console.error("Failed to create folder:", err);
      alert("Error creating folder");
    }finally{
      setIsCreatingFolder(false);
    }
  };

  return (
    <>
      <div className="bg-white mt-24 ml-2 flex flex-col min-h-auto pb-2 w-32 sm:w-72 px-2 justify-start transition-all duration-300">
        <div className="space-y-4 flex flex-col items-center sm:items-start w-full">

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow p-2 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start sm:gap-3 w-full">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-purple-500 to-gray-800" />
            <div className="hidden sm:block flex-1 min-w-0">
              <h2 className="font-bold text-base truncate">{user.name}</h2>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <p className="text-sm text-gray-500 truncate capitalize">
                {user.role}
              </p>
            </div>
            <FiEdit2
              className="text-gray-500 cursor-pointer hidden sm:block"
              onClick={() => setEditModalOpen(true)}
            />
          </div>

          {/* Navigation Menu */}
          <div className="bg-white rounded-xl shadow p-1 sm:p-2 space-y-1 w-full">
            <Link to="/Individual/dashboard">
              <MenuItem icon={<FaChartPie />} label="Dashboard" active={pathname === "/Individual/dashboard"} />
            </Link>
            <Link to="/Individual/upload">
              <MenuItem icon={<FaUpload />} label="Upload File" active={pathname === "/Individual/upload"} />
            </Link>
          </div>

          {/* Company Folders Section */}
          <div className="bg-white rounded-xl shadow w-full">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="flex items-center gap-2">
                <MdOutlineBusiness className="text-pink-700" />
                <span className="text-sm font-semibold hidden sm:inline">My Folders</span>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-pink-700 hover:text-pink-800 transition"
                title="Add Folder"
              >
                <FiPlus className="text-lg" />
              </button>
            </div>
            <div className="px-3 py-2 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              {isLoading ? (
                <p className="text-sm text-gray-500 italic">Loading folders...</p>
              ) : isError ? (
                <p className="text-sm text-red-500 italic">Error loading folders.</p>
              ) : companyFolders.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No folders available.</p>
              ) : (
                companyFolders.map((folder) => {
                  const isActive = pathname === `/employee/folder/${folder._id}`;
                  return (
                    <Link
                      to={`/Individual/folder/${folder._id}`}
                      key={folder._id}
                      className={`flex items-center justify-between text-sm cursor-pointer transition px-1 py-1 border-b rounded
                        ${isActive ? "bg-pink-100 text-pink-700 font-semibold" : "text-gray-700 hover:text-pink-700"}
                      `}
                    >
                      <span>{folder.name}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Folder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-11/12 max-w-sm shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddModal(false)}
            >
              <FiX className="text-xl" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-center">Add New Folder</h2>
            <input
              type="text"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddFolder()}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Folder name"
            />
                      <button
            onClick={handleAddFolder}
            disabled={isCreatingFolder}
            className={`w-full text-white py-2 rounded font-semibold transition
              ${isCreatingFolder ? "bg-pink-400 cursor-not-allowed" : "bg-pink-700 hover:bg-pink-800"}
            `}
          >
            {isCreatingFolder ? "Creating..." : "Create Folder"}
          </button>

          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        setUser={setUser}
      />
    </>
  );
};

const MenuItem = ({ icon, label, active }) => (
  <div
    className={`
      flex items-center sm:justify-start justify-center gap-0 sm:gap-3
      px-2 sm:px-4 py-2 rounded cursor-pointer text-sm font-medium w-full
      ${active ? "text-pink-700 bg-pink-50" : "text-gray-700"}
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

export default Sidebar_Individual;
