import React, { useState } from "react";
import SuperAdminHeader from "../components/SuperAdminHeader";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import StatCard from "../components/SuperAdminStatcard";
import { FaCloud, FaFileAlt } from "react-icons/fa";
import { Search } from "lucide-react";

const clientData = [
  {
    name: "Client A",
    affiliatedCompany: "Company A",
    storageUsed: "0.49 GB",
    docsUploaded: 110,
  },
  {
    name: "Client B",
    affiliatedCompany: "Company A",
    storageUsed: "0.49 GB",
    docsUploaded: 110,
  },
  {
    name: "Client C",
    affiliatedCompany: "Company A",
    storageUsed: "0.49 GB",
    docsUploaded: 110,
  },
];

const ClientsPage = () => {
  const [search, setSearch] = useState("");

  const filteredClients = clientData.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
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
          {/* Quick Stats */}
          <section className="flex flex-wrap gap-12 mb-8">
            
            <StatCard
              icon={<FaCloud />}
              title="Total Storage Used By Clients"
              progressBar={{
                percent: (89 / 491) * 100,
                label: "0.49 GB used of 4916GB",
              }}
            />
            <StatCard
              icon={<FaFileAlt />}
              title="Total Docs Uploaded By Clients"
              value="1253"
            />
          </section>

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
            {filteredClients.map((client, idx) => (
              <div key={idx} className="border border-gray-300 rounded-md p-4 shadow bg-white">
                <h3 className="text-sm font-bold text-black mb-2">{client.name}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-black">
                  <div className="flex items-center gap-2">
                    <FaCloud className="text-lg" />
                    <span>{client.storageUsed} used of 4916GB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaFileAlt className="text-lg" />
                    <span>Documents Uploaded - {client.docsUploaded}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Affiliated with {client.affiliatedCompany}</span>
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

export default ClientsPage;