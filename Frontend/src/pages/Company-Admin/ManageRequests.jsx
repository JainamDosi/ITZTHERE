import React from "react";

const requests = [
  // Sample data; you can replace with API data later
  { id: 1, employee: "Alice Johnson", folder: "HR Reports" },
  { id: 2, employee: "Bob Smith", folder: "Finance 2025" },
];

const ManageRequests = () => {
  const handleApprove = (id) => {
    console.log("Approved request", id);
    // Add logic to approve
  };

  const handleReject = (id) => {
    console.log("Rejected request", id);
    // Add logic to reject
  };

  return (
    <div className="max-w-auto mx-auto  bg-white p-4 rounded shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 text-center text-sm font-semibold text-gray-700">
              <th className="px-4 py-3">Employee's name</th>
              <th className="px-4 py-3">Folder name</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr
                key={req.id}
                className="border-t text-center hover:bg-gray-50 text-sm text-gray-800"
              >
                <td className="px-4 py-3">{req.employee}</td>
                <td className="px-4 py-3">{req.folder}</td>
                <td className="px-4 py-3 space-x-2 space-y-2">
                <button
                    onClick={() => handleApprove(req.id)}
                    className="inline-flex  min-w-9 items-center justify-center bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 px-4 rounded-full shadow transition duration-200"
                >
                    Approve
                </button>
                <button
                    onClick={() => handleReject(req.id)}
                    className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1.5 px-4 rounded-full shadow transition duration-200"
                >
                    Reject
                </button>
                </td>

              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-400">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRequests;
