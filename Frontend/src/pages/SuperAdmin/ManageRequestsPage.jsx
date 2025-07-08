import React, { useState } from "react";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import SuperAdminSidebar from "../../components/SuperAdminSidebar";
import { FaCheck, FaTimes } from "react-icons/fa";

const initialRequestData = [
  {
    id: 1,
    organization: "Company",
    requestedFrom: "TechCorp Pvt Ltd",
    employeeName: "Riya Sharma",
    folderName: "Quarterly Reports",
    gstNumber: "27AABCU9603R1ZV",
    status: null,
  },
  {
    id: 2,
    organization: "Company",
    requestedFrom: "Alpha Ventures",
    employeeName: "Aman Verma",
    folderName: "HR Onboarding",
    gstNumber: "09AACCA1234F1ZP",
    status: null,
  },
  {
    id: 3,
    organization: "Personal User",
    requestedFrom: "Kavita Raj",
    employeeName: "Kavita Raj",
    folderName: "Finance Docs",
    mobileNumber: "9876543210",
    status: null,
  },
];

const ManageRequestsPage = () => {
  const [requests, setRequests] = useState(initialRequestData);

  const handleAction = (id, action) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: action } : req))
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white/50 overflow-hidden">
      {/* Header */}
      <div className="h-16 shrink-0">
        <SuperAdminHeader />
      </div>

      {/* Main content */}
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden pt-4">
        {/* Sidebar */}
        <div className="w-80 h-full overflow-y-scroll scrollbar-hide bg-white pb-2">
          <SuperAdminSidebar />
        </div>

        {/* Content area */}
        <div className="flex-1 h-full overflow-y-auto p-6 pt-2">
          {/* Table card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-300 text-gray-800">
                    <th className="px-4 py-2 rounded-l-md">Organization Type</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">GST/Mobile Number</th>
                    <th className="px-4 py-2 rounded-r-md">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{req.organization}</td>
                      <td className="px-4 py-3">{req.requestedFrom}</td>
                      <td className="px-4 py-3">
                        {req.organization === "Personal User"
                          ? req.mobileNumber
                          : req.gstNumber}
                      </td>
                      <td className="px-4 py-3">
                        {req.status === null ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(req.id, "approved")}
                              className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                            >
                              <FaCheck />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(req.id, "rejected")}
                              className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                            >
                              <FaTimes />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            className={`px-3 py-1 rounded text-xs font-semibold cursor-default ${
                              req.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                            disabled
                          >
                            Submitted
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-6 text-gray-500"
                      >
                        No pending requests.
                      </td>
                    </tr>
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
