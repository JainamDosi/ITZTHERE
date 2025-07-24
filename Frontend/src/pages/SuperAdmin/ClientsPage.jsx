import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import SuperAdminHeader from "../../components/SuperAdminHeader";
import SuperAdminSidebar from "../../components/SuperAdminSidebar";
import StatCard from "../../components/SuperAdminStatcard";
import { FaCloud, FaFileAlt } from "react-icons/fa";
import { Search } from "lucide-react";

// Fetch grouped clients from backend
const fetchGroupedClients = async () => {
  const res = await axios.get("/super-admin/clients-grouped-by-company");
  return res.data;
};

const ClientsPage = () => {
  const [search, setSearch] = useState("");
  const location = useLocation();
  const companyName = location.state?.companyName;

  const {
    data: groupedClients,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["grouped-clients"],
    queryFn: fetchGroupedClients,
  });

  // Flatten grouped structure into individual client objects
  const flatClientData = groupedClients
    ? groupedClients.flatMap((group) =>
        group.clients.map((client) => ({
          name: client.name,
          affiliatedCompany: group.companyName,
          docsUploaded: client.docsUploaded || 0,
          storageUsed: client.storageUsed || "0 GB",
        }))
      )
    : [];

  // Apply search + optional filter by company
  const filteredClients = flatClientData.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) &&
      (!companyName || client.affiliatedCompany === companyName)
  );

  return (
    <div className="flex flex-col h-screen bg-white/50 overflow-hidden">
      <div className="h-16 shrink-0">
        <SuperAdminHeader />
      </div>

      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-y-hidden pt-4">
        <div className="w-80 h-full overflow-y-scroll scrollbar-hide bg-white pb-2">
          <SuperAdminSidebar />
        </div>

        <div className="flex-1 h-full overflow-y-auto p-6 pt-2">
          {/* Search Bar */}
          <div className="flex items-center w-full max-w-lg bg-white border rounded shadow px-4 py-2 mb-4">
            <div className="flex items-center gap-2">
              <Search size={18} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Clients</span>
            </div>
            <div className="flex-1 ml-4">
              <input
                type="text"
                placeholder="Search here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-gray-700"
              />
            </div>
          </div>

          {/* Client Cards */}
          <div className="space-y-4">
            {isLoading && <p className="text-gray-500">Loading clients...</p>}
            {isError && <p className="text-red-500">Failed to fetch clients.</p>}

            {!isLoading && !isError && filteredClients.length > 0 ? (
              filteredClients.map((client, idx) => (
                <div key={idx} className="border border-gray-300 rounded-md p-4 shadow bg-white">
                  <h3 className="text-sm font-bold text-black mb-2">{client.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-black">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">
                        Affiliated with Comapny : - {client.affiliatedCompany}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              !isLoading && !isError && (
                <p className="text-gray-500">No clients found.</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
