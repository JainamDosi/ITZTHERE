import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUserPlus } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

function UserManagement() {
  const [selectedTab, setSelectedTab] = useState("Clients");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [folderStates, setFolderStates] = useState({});

  const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["companyUsers"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/create-user/myusers", {
        withCredentials: true,
      });
      return res.data.users;
    },
  });

  const { data: allFolders = [] } = useQuery({
    queryKey: ["allFolders"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/folders/visible", {
        withCredentials: true,
      });
      return res.data.folders;
    },
  });

  const clients = users.filter((u) => u.role === "client");
  const employees = users.filter((u) => u.role === "employee");

  // ✅ Initialize folderStates when users and folders are fetched
  useEffect(() => {
    if (!users.length || !allFolders.length) return;

    const initialState = {};
    users
      .filter((u) => u.role === "employee")
      .forEach((user) => {
        const folderIds = allFolders
          .filter((folder) => folder.allowedUsers.includes(user._id))
          .map((folder) => folder._id);
        initialState[user._id] = { folderIds, updated: false };
      });

    setFolderStates(initialState);
  }, [users, allFolders]);
  console.log("Folder States:", folderStates);

  const createUserMutation = useMutation({
    mutationFn: (payload) =>
      axios.post("http://localhost:3000/api/create-user", payload, {
        withCredentials: true,
      }),
    onSuccess: () => {
      toast.success("User created");
      queryClient.invalidateQueries(["companyUsers"]);
      setShowModal(false);
      setFormData({ name: "", email: "", password: "" });
    },
    onError: () => toast.error("Failed to create user"),
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async ({ folderId, allowedUserIds }) => {
      await axios.put(
        `http://localhost:3000/api/folders/${folderId}/permissions`,
        { allowedUserIds },
        { withCredentials: true }
      );
    },
    onSuccess: () => {
      toast.success("Permissions updated");
      queryClient.invalidateQueries(["allFolders"]);
    },
    onError: () => toast.error("Failed to update permissions"),
  });

  const toggleFolderDropdown = (index) => {
    setDropdownOpenIndex(dropdownOpenIndex === index ? null : index);
  };

  const toggleFolderPermission = (userId, folderId) => {
    setFolderStates((prev) => {
      const state = prev[userId] || { folderIds: [], updated: false };
      const already = state.folderIds.includes(folderId);
      const folderIds = already
        ? state.folderIds.filter((f) => f !== folderId)
        : [...state.folderIds, folderId];
      return {
        ...prev,
        [userId]: { folderIds, updated: true },
      };
    });
  };

  const savePermissions = (userId) => {
    const folderIds = folderStates[userId]?.folderIds || [];

    allFolders.forEach((folder) => {
      const wasAllowed = folder.allowedUsers.includes(userId);
      const shouldBeAllowed = folderIds.includes(folder._id);

      if (wasAllowed !== shouldBeAllowed) {
        let updatedUserIds = [...folder.allowedUsers];
        if (shouldBeAllowed) {
          updatedUserIds.push(userId);
        } else {
          updatedUserIds = updatedUserIds.filter((id) => id !== userId);
        }

        updatePermissionMutation.mutate({
          folderId: folder._id,
          allowedUserIds: updatedUserIds,
        });
      }
    });

    setFolderStates((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], updated: false },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const role = selectedTab === "Clients" ? "client" : "employee";
    createUserMutation.mutate({ ...formData, role });
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading users.</div>;

  return (
    <>
      <main className="flex-1">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <TabButton label="Clients" active={selectedTab === "Clients"} onClick={() => setSelectedTab("Clients")} />
            <TabButton label="Employees" active={selectedTab === "Employees"} onClick={() => setSelectedTab("Employees")} />
          </div>
          <div className="flex items-center gap-4">
            <p>Add User</p>
            <button onClick={() => setShowModal(true)} className="p-2 rounded-md shadow bg-white text-pink-700 hover:bg-pink-50">
              <FaUserPlus className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Clients Table */}
        {selectedTab === "Clients" && (
          <div className="bg-white rounded-xl shadow p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id} className="border-b">
                    <td className="py-3">{client.name}</td>
                    <td>{client.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Employees Table */}
        {selectedTab === "Employees" && (
          <div className="bg-white rounded-xl shadow p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Folder Permissions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, index) => {
                  const selectedFolderIds = folderStates[emp._id]?.folderIds ?? [];

                  return (
                    <tr key={emp._id} className="border-b">
                      <td className="py-3">{emp.name}</td>
                      <td>{emp.email}</td>
                      <td className="relative">
                        <button
                          onClick={() => toggleFolderDropdown(index)}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          {selectedFolderIds.length ? `${selectedFolderIds.length} folders` : "Select"}
                          <IoIosArrowDown />
                        </button>
                        {dropdownOpenIndex === index && (
                          <div className="absolute z-10 bg-white border shadow rounded p-2 mt-1 w-48">
                            {allFolders.map((folder) => (
                              <label key={folder._id} className="flex items-center space-x-2 mb-1">
                                <input
                                  type="checkbox"
                                  checked={selectedFolderIds.includes(folder._id)}
                                  onChange={() => toggleFolderPermission(emp._id, folder._id)}
                                  className="accent-pink-600"
                                />
                                <span>{folder.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        {folderStates[emp._id]?.updated && (
                          <button
                            onClick={() => savePermissions(emp._id)}
                            className="px-3 py-1 text-sm bg-pink-700 text-white rounded hover:bg-pink-800"
                          >
                            Save
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add {selectedTab.slice(0, -1)}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Name"
                required
              />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Email"
                required
              />
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Password"
                required
              />
              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-pink-700 text-white rounded-md">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-md shadow text-sm font-semibold ${
      active ? "bg-pink-700 text-white" : "bg-gray-100 text-gray-800"
    }`}
  >
    {label}
  </button>
);

export default UserManagement;
