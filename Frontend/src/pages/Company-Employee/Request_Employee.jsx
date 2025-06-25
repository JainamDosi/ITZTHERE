import React, { useState } from "react";

const RequestAccess = () => {
  const [requests, setRequests] = useState([
    { id: 1, folder: "Finance Reports 2023", status: "Pending" },
    { id: 2, folder: "HR Policies", status: "Approved" },
    { id: 3, folder: "Internal Memos", status: "Rejected" },
    { id: 4, folder: "Engineering Blueprints", status: "Pending" },
  ]);

  const [department, setDepartment] = useState("");

  const handleRequest = () => {
    if (!department) {
      alert("Please select a department");
      return;
    }

    // Handle logic here (e.g., API call)
    console.log("Requested access for:", department);
  };

  return (
    <div className="p-6 sm:p-10 w-full">
      {/* Heading */}
      <h1 className="text-xl font-semibold mb-6">Requests</h1>

      {/* Request History Table */}
      <div className="grid grid-cols-2 font-semibold text-sm text-center text-gray-700 px-4 py-2 bg-gray-100 rounded-t-md">
        <span>Folder Name</span>
        <span>Status</span>
      </div>

      <div className="divide-y border border-gray-200 rounded-b-md text-center mb-10">
        {requests.map((req) => (
          <div key={req.id} className="grid grid-cols-2 items-center px-4 py-3 text-sm">
            <span>{req.folder}</span>
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
        ))}
      </div>

      {/* Request New Access Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Dropdown */}
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="bg-white px-4 py-2 rounded-md shadow text-sm font-semibold text-gray-700 w-64"
        >
          <option value="">Please Select Department</option>
          <option value="HR">Human Resources</option>
          <option value="Finance">Finance</option>
          <option value="Engineering">Engineering</option>
          <option value="Marketing">Marketing</option>
        </select>

        {/* Button */}
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
