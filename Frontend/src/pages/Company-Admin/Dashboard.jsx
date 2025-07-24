import React from "react";
import Sidebar from "../../components/Sidebar";
import StatCard from "../../components/StatCard";
import Header from "../../components/Header";
import { FaFileAlt, FaCloud, FaUsers, FaServer } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import UploadTrendsChart from "../../components/TrendsChart";

// Utility to generate distinct HSL colors
const generateColors = (length) => {
  const colors = [];
  for (let i = 0; i < length; i++) {
    const hue = (i * 137.508) % 360;
    colors.push(`hsl(${hue}, 65%, 60%)`);
  }
  return colors;
};

function Dashboard() {
  const { user } = useAuth();

  const {
    data: statsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await axios.get("/auth/stats", {
        withCredentials: true,
      });
      return res.data;
    },
    refetchInterval: 5000,
  });

  const {
    data: sectionData,
    isLoading: loadingSections,
  } = useQuery({
    queryKey: ["sectionWiseStorage"],
    queryFn: async () => {
      const res = await axios.get("/files/section-wise-storage", {
        withCredentials: true,
      });
      return res.data.usage;
    },
  });

  if (!user) return <Navigate to="/login" />;
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError) return <div className="p-6 text-red-500">Error loading stats.</div>;

  const {
    totalFiles = 0,
    totalUsers = 1,
    usedStorageMB = 0,
    totalStorageMB = 1024,
  } = statsData;

  const usedStorageGB = (usedStorageMB / 1024).toFixed(2);
  const totalStorageGB = (totalStorageMB / 1024).toFixed(2);
  const usedPercent = ((usedStorageMB / totalStorageMB) * 100).toFixed(2);

  const normalizedSectionData =
    sectionData?.map((item) => ({
      ...item,
      normalizedSize: item.totalSizeMB,
    })) || [];

  const colors = generateColors(normalizedSectionData.length);

  return (
    <div className="flex flex-col gap-10 p-4">
      {/* Top Stat Cards */}
      <section className="flex flex-wrap md:flex-nowrap gap-6 w-full">
        <StatCard icon={<FaFileAlt />} title="Docs Uploaded" value={totalFiles} />
        <StatCard
          icon={<FaCloud />}
          title="Storage"
          progressBar={{
            percent: usedPercent,
            label: `${usedStorageGB} GB of ${totalStorageGB} GB used`,
          }}
        />
        <StatCard icon={<FaUsers />} title="Users" value={totalUsers} />
      </section>

      {/* Charts Row */}
      <section className="flex flex-col md:flex-row gap-6 w-full">
        {/* Donut Chart */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 text-lg font-semibold mb-4">
            <FaServer className="text-2xl" />
            Section Wise Storage Consumption
          </div>
          <div className="w-full h-64">
            {loadingSections ? (
              <p className="text-sm text-gray-500">Loading chart...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={normalizedSectionData}
                    dataKey="normalizedSize"
                    nameKey="folderName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    label={(entry) => entry.folderName}
                  >
                    {normalizedSectionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)} MB`} />
                  <Legend
                    className="hidden sm:block"
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Upload Trends Chart */}
        <div className="flex-1 min-w-0">
          <UploadTrendsChart />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
