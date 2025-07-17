import React from "react";
import { FaCloud, FaFileAlt, FaUsers, FaBriefcase } from "react-icons/fa";

const CompanyCard = ({
  name,
  storagePlan,
  storageUsed,
  docsUploaded,
  clientCount,
  employeeCount,
  membershipDays,
  onClick, admin

}) => {
  return (
    <div
      onClick={onClick} 
      className="border border-black rounded-md p-4 space-y-2 bg-white shadow-sm cursor-pointer hover:bg-gray-100 transition"
    >
      <div className="font-semibold text-base">
        {name} - {storagePlan}
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-gray-800">
        <div className="flex items-center gap-2">
          <FaCloud />
          <span>{storageUsed} used of 1GB</span>
        </div>
        <div className="flex items-center gap-2">
          <FaFileAlt />
          <span>Documents Uploaded - {docsUploaded}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaUsers />
          <span>{clientCount} Clients</span>
        </div>
        <div className="flex items-center gap-2">
          <FaBriefcase />
          <span>{employeeCount} Employees</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🕒 {membershipDays} days of membership left</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Admin:- {admin}</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
