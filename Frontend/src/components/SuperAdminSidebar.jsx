import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import dashboardIcon from "../assets/dashboard.jpg";
import companiesIcon from "../assets/companies.png";
import clientsIcon from "../assets/clients.png";
import usersIcon from "../assets/users.png";
import requestsIcon from "../assets/requests.png";

import { useAuth } from "../context/AuthContext";
import { Edit2, Briefcase } from "lucide-react";

const SuperAdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {user}=useAuth();

  const [activeItem, setActiveItem] = React.useState("");

  const menuItems = [
    { name: "Dashboard", route: "/superadmin/dashboard", icon: <img src={dashboardIcon} alt="Dashboard" className="w-6 h-6 object-contain scale-125" /> },
    { name: "Companies", route: "/superadmin/companies", icon: <img src={companiesIcon} alt="Companies" className="w-6 h-6 object-contain scale-110" /> },
    { name: "Clients", route: "/superadmin/clients", icon: <img src={clientsIcon} alt="Clients" className="w-6 h-6 object-contain scale-125" /> },
    { name: "Users", route: "/superadmin/users", icon: <img src={usersIcon} alt="Users" className="w-6 h-6 object-contain scale-125" /> },
    { name: "Manage Requests", route: "/superadmin/requests", icon: <img src={requestsIcon} alt="Requests" className="w-6 h-6 object-contain" /> },
  ];

  // React to current route
  React.useEffect(() => {
    const current = menuItems.find((item) => location.pathname.startsWith(item.route));
    if (current) setActiveItem(current.name);
  }, [location.pathname]);

  // Fetch plan summary using React Query
  const { data: summary = {}, isLoading } = useQuery({
    queryKey: ["plan-summary"],
    queryFn: async () => {
      const res = await axios.get("/super-admin/plan-summary");
     
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 mins caching
    refetchOnWindowFocus: false,
  });

 const plansSummary = [
  {
    name: "Personal",
    totalTaken: summary?.plans?.individual?.total || 0,
    currentlyActive: summary?.plans?.individual?.active || 0,
  },
  {
    name: "Business",
    totalTaken: summary?.plans?.business?.total || 0,
    currentlyActive: summary?.plans?.business?.active || 0,
  },
  {
    name: "Business Plus",
    totalTaken: summary?.plans?.["business-plus"]?.total || 0,
    currentlyActive: summary?.plans?.["business-plus"]?.active || 0,
  },
];

  return (
    <div className="bg-white/50 mt-2 ml-2 flex flex-col pb-2 w-72 px-3 justify-between transition-all duration-300">
      <div className="space-y-2 flex flex-col gap-2">
        {/* Profile Card */}
        <div className="bg-white mt-4 rounded-lg shadow p-2 flex items-center gap-2 w-full border border-gray-200">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">T</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-black">{user.name}</h2>
            <p className="text-xs text-black">{user.email}</p>
          </div>
          <Edit2 className="text-black cursor-pointer hover:text-gray-700 text-base" />
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-lg shadow p-1 w-full border border-gray-200">
          <nav className="flex flex-col divide-y divide-gray-200">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-sm ${
                  activeItem === item.name ? "bg-gray-100 font-semibold text-pink-700" : "text-black"
                } hover:bg-gray-50 transition-all duration-200 ease-in-out`}
                onClick={() => {
                  setActiveItem(item.name);
                  navigate(item.route);
                }}
              >
                <div className="w-6 h-6 flex items-center justify-center">{item.icon}</div>
                <span className="whitespace-nowrap">{item.name}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Plans Summary */}
        <div className="bg-white rounded-lg shadow w-full border border-gray-200 mt-3 mb-3">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Briefcase className="text-black text-sm" />
              <span className="text-sm font-semibold text-black">Plans Summary</span>
            </div>
          </div>
          <div className="px-3 py-2 space-y-2">
            {plansSummary.map((plan, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-md p-2">
                <div className="font-semibold text-sm text-black mb-1 text-center">{plan.name}</div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="text-xs text-black mb-0.5">Total Taken</div>
                    <div className="font-bold text-base text-black">{isLoading ? "..." : plan.totalTaken}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-black mb-0.5">Currently Active</div>
                    <div className="font-bold text-base text-black">{isLoading ? "..." : plan.currentlyActive}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;
