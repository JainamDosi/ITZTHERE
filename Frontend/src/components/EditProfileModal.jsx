import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const EditProfileModal = ({ isOpen, onClose, user, setUser }) => {
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  useEffect(() => {
    if (user) {
      setEditedName(user.name);
      setEditedEmail(user.email);
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      const res = await axios.patch(
        "http://localhost:3000/api/auth/update-profile",
        { name: editedName, email: editedEmail },
        { withCredentials: true }
      );
      setUser(res.data.user);
      onClose();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile.");
    }
  };

  const handleOwnershipTransfer = async () => {
    if (!selectedEmployeeId) return;
    try {
      await axios.post(
        "http://localhost:3000/api/auth/transfer-ownership",
        { newOwnerId: selectedEmployeeId },
        { withCredentials: true }
      );
      alert("Ownership transferred successfully.");
      onClose();
    } catch (err) {
      console.error("Ownership transfer failed", err);
      alert("Failed to transfer ownership.");
    }
  };

  const { data: employees = [] } = useQuery({
    queryKey: ["companyUsers"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/create-user/myusers", {
        withCredentials: true,
      });
      return res.data.users.filter((u) => u.role === "employee");
    },
    enabled: isOpen && user?.role === "company-admin",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-sm shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FiX className="text-xl" />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-center">Edit Profile</h2>

        <p className="text-sm mb-1 text-gray-500">Current Role: <span className="text-pink-600 font-medium">{user.role}</span></p>

        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Full name"
        />
        <input
          type="email"
          value={editedEmail}
          onChange={(e) => setEditedEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Email address"
        />
        <button
          onClick={handleProfileUpdate}
          className="w-full bg-pink-700 text-white py-2 rounded font-semibold hover:bg-pink-800 transition mb-4"
        >
          Save Changes
        </button>

        {user.role === "company-admin" && (
          <>
            <label className="block text-sm font-medium mb-1 text-gray-700">Transfer Ownership To</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
              ))}
            </select>
            <button
              onClick={handleOwnershipTransfer}
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              Transfer Ownership
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditProfileModal;
