import React, { useState } from "react";
import { FaChartPie } from "react-icons/fa";
import { MdBusiness } from "react-icons/md";
import { FiEdit2, FiChevronRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import EditProfileModal from "../components/EditProfileModal"; // <-- modal added

const Sidebar_Client = ({ user, setUser }) => {
  const { pathname } = useLocation();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: shared = [], isLoading } = useQuery({
    queryKey: ["sharedWithMe"],
    queryFn: async () => {
      const res = await axios.get("/files/shared-with-me", {
        withCredentials: true,
      });
      return res.data.shared;
    },
  });

  return (
    <>
      <div className="bg-white mt-24 ml-2 flex flex-col pb-2 w-72 px-2">
        {/* — Profile Card */}
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-gray-800" />
          <div className="flex-1 overflow-hidden">
            <h2 className="font-bold truncate">{user.name}</h2>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            <p className="text-sm text-gray-500 truncate capitalize">{user.role}</p>
          </div>
          <FiEdit2
            className="text-gray-500 cursor-pointer"
            onClick={() => setEditModalOpen(true)}
          />
        </div>

        {/* — Dashboard */}
        <div className="mt-4 bg-white rounded-xl shadow">
          <Link to="/client">
            <MenuItem
              icon={<FaChartPie />}
              label="Dashboard"
              active={pathname === "/client"}
            />
          </Link>
        </div>

        {/* — Shared With Me */}
        <div className="mt-4 bg-white rounded-xl shadow p-2 overflow-y-auto max-h-[60vh]">
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <MdBusiness className="text-pink-700" />
            <span className="text-sm font-semibold">Shared With Me</span>
          </div>

          {isLoading ? (
            <p className="p-3 text-sm text-gray-500">Loading...</p>
          ) : shared.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">No shared content.</p>
          ) : (
            shared.map((company) => (
              <div key={company.companyId} className="pl-2 mt-2">
                <p className="text-sm font-medium text-gray-700">{company.companyName}</p>
                {company.folders.map((folder) => (
                  <Link key={folder.folderId} to={`/client/folder/${folder.folderId}`}>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 text-sm cursor-pointer transition ${
                        pathname.includes(folder.folderId)
                          ? "text-pink-700 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      <FiChevronRight className="text-gray-400" />
                      <span className="truncate">{folder.folderName}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
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
    className={`flex items-center gap-3 px-4 py-2 rounded cursor-pointer text-sm font-medium w-full ${
      active ? "text-pink-700" : "text-gray-700 hover:bg-gray-100"
    } transition`}
  >
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
  </div>
);

export default Sidebar_Client;
