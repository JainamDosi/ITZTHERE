import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const RequestAccess = () => {
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const queryClient = useQueryClient();

  // 🔄 Fetch requestable folders (not allowed yet)
  const { data: folders = [] } = useQuery({
    queryKey: ["requestableFolders"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/folders/requestable", {
        withCredentials: true,
      });
      return res.data.folders;
    },
  });

  // 📄 Fetch request history
  const { data: history = [] } = useQuery({
    queryKey: ["accessRequests"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/access-requests/my", {
        withCredentials: true,
      });
      return res.data.requests;
    },
  });

  // 📩 Submit access request
  const { mutate } = useMutation({
    mutationFn: async (folderId) => {
      return await axios.post(
        "http://localhost:3000/api/access-requests",
        { folderId },
        { withCredentials: true }
      );
    },
    onSuccess: () => {
      toast.success("Request submitted.");
      setSelectedFolderId("");
      queryClient.invalidateQueries(["accessRequests"]);
      queryClient.invalidateQueries(["requestableFolders"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send request");
    },
  });

  const handleRequest = () => {
    if (!selectedFolderId) {
      toast.error("Please select a folder");
      return;
    }
    mutate(selectedFolderId);
  };

  return (
    <div className="p-6 sm:p-10 w-full">
      <h1 className="text-xl font-semibold mb-6">Access Requests</h1>

      {/* 🕓 Request History */}
      <div className="grid grid-cols-2 font-semibold text-sm text-center text-gray-700 px-4 py-2 bg-gray-100 rounded-t-md">
        <span>Folder Name</span>
        <span>Status</span>
      </div>
      <div className="divide-y border border-gray-200 rounded-b-md text-center mb-10">
        {history.length === 0 ? (
          <p className="py-4 text-sm text-gray-500">No requests made yet.</p>
        ) : (
          history.map((req) => (
            <div key={req._id} className="grid grid-cols-2 items-center px-4 py-3 text-sm">
              <span>{req.folderId?.name || "Unknown Folder"}</span>
              <span
                className={`font-medium ${
                  req.status === "Approved"
                    ? "text-green-600"
                    : req.status === "Rejected"
                    ? "text-red-500"
                    : "text-yellow-600"
                }`}
              >
                {req.status}
              </span>
            </div>
          ))
        )}
      </div>

      {/* 📨 New Request Form */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <select
          value={selectedFolderId}
          onChange={(e) => setSelectedFolderId(e.target.value)}
          className="bg-white px-4 py-2 rounded-md shadow text-sm font-semibold text-gray-700 w-64"
        >
          <option value="">Select Folder to Request Access</option>
          {folders.map((folder) => (
            <option key={folder._id} value={folder._id}>
              {folder.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleRequest}
          className="bg-pink-700 hover:bg-pink-800 text-white font-medium px-5 py-2 rounded shadow text-sm"
        >
          Request Access
        </button>
      </div>
    </div>
  );
};

export default RequestAccess;
