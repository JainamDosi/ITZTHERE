import React from "react";
import { FaCloud, FaFileAlt, FaUsers, FaBriefcase } from "react-icons/fa";

const CompanyCard = ({
  name,
  plan,
  storageUsed,
  docsUploaded,
  clients,
  employees,
  membershipDays,
  onClick, 
}) => {
  return (
    <div
      onClick={onClick} 
      className="border border-black rounded-md p-4 space-y-2 bg-white shadow-sm cursor-pointer hover:bg-gray-100 transition"
    >
      <div className="font-semibold text-base">
        {name} - {plan}
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-gray-800">
        <div className="flex items-center gap-2">
          <FaCloud />
          <span>{storageUsed} used of 4916GB</span>
        </div>
        <div className="flex items-center gap-2">
          <FaFileAlt />
          <span>Documents Uploaded - {docsUploaded}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaUsers />
          <span>{clients} Clients</span>
        </div>
        <div className="flex items-center gap-2">
          <FaBriefcase />
          <span>{employees} Employees</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🕒 {membershipDays} days of membership left</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
