import React from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaCheck, FaTimes } from "react-icons/fa";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import SuperAdminSidebar from "../../components/SuperAdminSidebar";

const fetchCompanyRequests = async () => {
  const res = await axios.get("http://localhost:3000/api/super-admin/company-requests");
  console.log("Fetched company requests:", res.data); // Log the fetched data
  return res.data; // contains both company and individual requests
};

const patchCompanyStatus = async ({ id, status, type }) => {
  await axios.patch(`http://localhost:3000/api/super-admin/company-requests/${id}`, {
    status,
    type,
  });
};

const fetchSignedUrl = async (fileId) => {
  const res = await axios.get(`http://localhost:3000/api/super-admin/signed-url/${fileId}`);
  return res.data.url;
};

const ManageRequestsPage = () => {
  const queryClient = useQueryClient();
  const [loadingDocs, setLoadingDocs] = React.useState({});

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["company-requests"],
    queryFn: fetchCompanyRequests,
  });

  const mutation = useMutation({
    mutationFn: patchCompanyStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-requests"] });
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const handleOpenDoc = async (fileId) => {
    setLoadingDocs((prev) => ({ ...prev, [fileId]: true }));
    try {
      const url = await fetchSignedUrl(fileId);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Could not fetch signed URL");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching document");
    } finally {
      setLoadingDocs((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  const handleAction = (id, action, type) => {
    mutation.mutate({ id, status: action, type });
  };

  return (
    <div className="flex flex-col h-screen bg-white/50 overflow-hidden">
      <div className="h-16 shrink-0">
        <SuperAdminHeader />
      </div>
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden pt-4">
        <div className="w-80 h-full overflow-y-scroll scrollbar-hide bg-white pb-2">
          <SuperAdminSidebar />
        </div>
        <div className="flex-1 h-full overflow-y-auto p-6 pt-2">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-300 text-gray-800">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">GSTIN</th>
                    <th className="px-4 py-2">Admin</th>
                    <th className="px-4 py-2">Documents</th>
                    <th className="px-4 py-2">Plan</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-gray-500">
                        No pending requests.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{req.name}</td>
                        <td className="px-4 py-3">{req.gstin || "—"}</td>
                        <td className="px-4 py-3">
                          {req.admin ? (
                            <>
                              <div className="text-sm font-semibold">{req.admin.name}</div>
                              <div className="text-xs text-gray-500">{req.admin.email}</div>
                            </>
                          ) : (
                            "Self"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {(req.verificationDocs || []).map((fileId) => (
                            <button
                              key={fileId}
                              onClick={() => handleOpenDoc(fileId)}
                              className="text-blue-600 underline text-xs block hover:text-blue-800 disabled:text-gray-400"
                              disabled={loadingDocs[fileId]}
                            >
                              {loadingDocs[fileId] ? `Opening...` : `View Document`}
                            </button>
                          ))}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                            {req.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {req.status ? (
                            <span
                              className={`px-3 py-1 rounded text-xs font-semibold ${
                                req.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {req.status}
                            </span>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAction(req.id, "approved", req.type)}
                                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                              >
                                <FaCheck />
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(req.id, "rejected", req.type)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                              >
                                <FaTimes />
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRequestsPage;
