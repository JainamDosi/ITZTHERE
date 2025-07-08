// import React, { useState } from "react";

// import dashboardIcon from "../assets/icons/dashboard.jpg";
// import companiesIcon from "../assets/icons/companies.png";
// import clientsIcon from "../assets/icons/clients.png";
// import usersIcon from "../assets/icons/users.png";
// import requestsIcon from "../assets/icons/requests.png";

// import { Edit2, Briefcase } from "lucide-react";

// const SuperAdminSidebar = () => {
//   const [activeItem, setActiveItem] = useState("Dashboard");

//   const [plansSummary] = useState([
//     { name: "Personal", totalTaken: 35, currentlyActive: 28 },
//     { name: "Business", totalTaken: 35, currentlyActive: 28 },
//     { name: "Business Plus", totalTaken: 35, currentlyActive: 28 },
//   ]);

//   const menuItems = [
//     {
//       name: "Dashboard",
//       icon: <img src={dashboardIcon} alt="Dashboard" className="w-6 h-6 object-contain scale-125" />,
//     },
//     {
//       name: "Companies",
//       icon: <img src={companiesIcon} alt="Companies" className="w-6 h-6 object-contain scale-110" />,
//     },
//     {
//       name: "Clients",
//       icon: <img src={clientsIcon} alt="Clients" className="w-6 h-6 object-contain scale-125" />,
//     },
//     {
//       name: "Personal Users",
//       icon: <img src={usersIcon} alt="Users" className="w-6 h-6 object-contain scale-125" />,
//     },
//     {
//       name: "Manage Requests",
//       icon: <img src={requestsIcon} alt="Requests" className="w-6 h-6 object-contain" />,
//     },
//   ];

//   return (
//     <div className="bg-white/50 mt-2 ml-2 flex flex-col pb-2 w-72 px-3 justify-between transition-all duration-300">
//       <div className="space-y-2 flex flex-col gap-2">

       

//         {/* Profile Card */}
//         <div className="bg-white mt-4 rounded-lg shadow p-2 flex items-center gap-2 w-full border border-gray-200">
//           <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
//             <span className="text-white font-semibold text-sm">T</span>
//           </div>
//           <div className="flex-1 min-w-0">
//             <h2 className="font-semibold text-sm text-black">Telexcell</h2>
//             <p className="text-xs text-black">pk@telexcell.com</p>
//           </div>
//           <Edit2 className="text-black cursor-pointer hover:text-gray-700 text-base" />
//         </div>

//         {/* Navigation Menu */}
//         <div className="bg-white rounded-lg shadow p-1 w-full border border-gray-200">
//           <nav className="flex flex-col divide-y divide-gray-200">
//             {menuItems.map((item) => (
//               <div
//   key={item.name}
//   className={`
//     flex items-center gap-3 px-3 py-2 cursor-pointer text-sm
//     ${activeItem === item.name ? "bg-gray-100 font-medium" : "text-black"}
//     hover:bg-gray-50 transition-all duration-200 ease-in-out
//   `}
//   onClick={() => setActiveItem(item.name)}
// >
//   <div className="w-6 h-6 flex items-center justify-center">
//     {item.icon}
//   </div>
//   <span className="whitespace-nowrap">{item.name}</span>
// </div>

//             ))}
//           </nav>
//         </div>

//         {/* Plans Summary */}
//         <div className="bg-white rounded-lg shadow w-full border border-gray-200 mt-3 mb-3">
//           {/* Header */}
//           <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
//             <div className="flex items-center gap-2">
//               <Briefcase className="text-black text-sm" />
//               <span className="text-sm font-semibold text-black">
//                 Plans Summary
//               </span>
//             </div>
//           </div>

//           {/* Plan Cards */}
//           <div className="px-3 py-2 space-y-2">
//             {plansSummary.map((plan, index) => (
//               <div
//                 key={index}
//                 className="bg-gray-50 border border-gray-200 rounded-md p-2"
//               >
//                 <div className="font-semibold text-sm text-black mb-1 text-center">
//                   {plan.name}
//                 </div>
//                 <div className="flex justify-between">
//                   <div className="text-center">
//                     <div className="text-xs text-black mb-0.5">Total Taken</div>
//                     <div className="font-bold text-base text-black">
//                       {plan.totalTaken}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-xs text-black mb-0.5">Currently Active</div>
//                     <div className="font-bold text-base text-black">
//                       {plan.currentlyActive}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default SuperAdminSidebar;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import dashboardIcon from "../assets/dashboard.jpg";
import companiesIcon from "../assets/companies.png";
import clientsIcon from "../assets/clients.png";
import usersIcon from "../assets/users.png";
import requestsIcon from "../assets/requests.png";

import { Edit2, Briefcase } from "lucide-react";

const SuperAdminSidebar = () => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();

  const [plansSummary] = useState([
    { name: "Personal", totalTaken: 35, currentlyActive: 28 },
    { name: "Business", totalTaken: 35, currentlyActive: 28 },
    { name: "Business Plus", totalTaken: 35, currentlyActive: 28 },
  ]);

  const menuItems = [
    {
      name: "Dashboard",
      icon: (
        <img
          src={dashboardIcon}
          alt="Dashboard"
          className="w-6 h-6 object-contain scale-125"
        />
      ),
      route: "/superadmin/dashboard",
    },
    {
      name: "Companies",
      icon: (
        <img
          src={companiesIcon}
          alt="Companies"
          className="w-6 h-6 object-contain scale-110"
        />
      ),
      route: "/superadmin/companies",
    },
    {
      name: "Clients",
      icon: (
        <img
          src={clientsIcon}
          alt="Clients"
          className="w-6 h-6 object-contain scale-125"
        />
      ),
      route: "/superadmin/clients",
    },
    {
      name: "Users",
      icon: (
        <img
          src={usersIcon}
          alt="Users"
          className="w-6 h-6 object-contain scale-125"
        />
      ),
      route: "/superadmin/users",
    },
    {
      name: "Manage Requests",
      icon: (
        <img
          src={requestsIcon}
          alt="Requests"
          className="w-6 h-6 object-contain"
        />
      ),
      route: "/superadmin/requests",
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
            <h2 className="font-semibold text-sm text-black">Telexcell</h2>
            <p className="text-xs text-black">pk@telexcell.com</p>
          </div>
          <Edit2 className="text-black cursor-pointer hover:text-gray-700 text-base" />
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-lg shadow p-1 w-full border border-gray-200">
          <nav className="flex flex-col divide-y divide-gray-200">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-sm
                  ${activeItem === item.name ? "bg-gray-100 font-medium" : "text-black"}
                  hover:bg-gray-50 transition-all duration-200 ease-in-out`}
                onClick={() => {
                  setActiveItem(item.name);
                  navigate(item.route);
                }}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="whitespace-nowrap">{item.name}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Plans Summary */}
        <div className="bg-white rounded-lg shadow w-full border border-gray-200 mt-3 mb-3">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Briefcase className="text-black text-sm" />
              <span className="text-sm font-semibold text-black">
                Plans Summary
              </span>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="px-3 py-2 space-y-2">
            {plansSummary.map((plan, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-md p-2"
              >
                <div className="font-semibold text-sm text-black mb-1 text-center">
                  {plan.name}
                </div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="text-xs text-black mb-0.5">Total Taken</div>
                    <div className="font-bold text-base text-black">
                      {plan.totalTaken}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-black mb-0.5">Currently Active</div>
                    <div className="font-bold text-base text-black">
                      {plan.currentlyActive}
                    </div>
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
