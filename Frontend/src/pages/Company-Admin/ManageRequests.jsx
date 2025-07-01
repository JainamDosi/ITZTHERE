import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const ManageRequests = () => {
  // 🔁 Fetch pending requests
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ["accessRequests"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/access-requests/all", {
        withCredentials: true,
      });
      return res.data.requests;
    },
  });

  const handleAction = async (id, action) => {
    try {
      await axios.patch(`http://localhost:3000/api/access-requests/${id}`, { action }, {
        withCredentials: true,
      });
      toast.success(`Request ${action}d`);
      refetch(); // 🔁 refresh data
    } catch (err) {
      toast.error("Failed to process request");
    }
  };

  return (
    <div className="max-w-auto mx-auto bg-white p-4 rounded shadow">
      <div className="overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Pending Access Requests</h2>
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 text-center text-sm font-semibold text-gray-700">
              <th className="px-4 py-3">Employee Name</th>
              <th className="px-4 py-3">Folder Name</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-400">
                  No pending requests.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr
                  key={req._id}
                  className="border-t text-center hover:bg-gray-50 text-sm text-gray-800"
                >
                  <td className="px-4 py-3">{req.userId.name}</td>
                  <td className="px-4 py-3">{req.folderId.name}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleAction(req._id, "approve")}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 px-4 rounded-full shadow transition duration-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(req._id, "reject")}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1.5 px-4 rounded-full shadow transition duration-200"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRequests;
