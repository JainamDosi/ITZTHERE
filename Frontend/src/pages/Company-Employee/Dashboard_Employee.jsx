import React, { useState, useCallback } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { FaCloud, FaThumbtack } from "react-icons/fa";
import { FiEye, FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import { throttle } from "lodash";
import StatCard from "../../components/StatCard";

const Dashboard = () => {
  const [loadingFileId, setLoadingFileId] = useState(null);

  // Pinned files query
  const { data: pinnedFiles, isLoading, isError, refetch } = useQuery({
    queryKey: ["pinnedFiles"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/files/pinned", {
        withCredentials: true,
      });
      return res.data.files;
    },
  });

  // Storage stats query
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/auth/stats", {
        withCredentials: true,
      });
      return res.data;
    },
  });

  const throttledSignedAction = useCallback(
    throttle(async (fileId, mode = "view") => {
      setLoadingFileId(fileId);
      try {
        const res = await axios.get(
          `http://localhost:3000/api/files/signed-url/${fileId}?mode=${mode}`,
          { withCredentials: true }
        );
        const url = res.data.signedUrl;
        if (mode === "view") {
          window.open(url, "_blank");
        } else {
          const link = document.createElement("a");
          link.href = url;
          link.download = "";
          link.click();
        }
      } catch {
        toast.error("Failed to access file.");
      } finally {
        setLoadingFileId(null);
      }
    }, 3000),
    []
  );

  const handleUnpin = async (fileId) => {
    try {
      await axios.delete(`http://localhost:3000/api/files/${fileId}/unpin`, {
        withCredentials: true,
      });
      toast.success("Unpinned file");
      refetch();
    } catch {
      toast.error("Failed to unpin");
    }
  };

  // Compute storage display values
  const usedStorageMB = statsData?.usedStorageMB || 0;
  const totalStorageMB = statsData?.totalStorageMB || 1024;
  const usedStorageGB = (usedStorageMB / 1024).toFixed(2);
  const totalStorageGB = (totalStorageMB / 1024).toFixed(2);
  const usedPercent = ((usedStorageMB / totalStorageMB) * 100).toFixed(2);

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
      {/* Left Section */}
      <div className="w-full sm:w-3/4 space-y-6">
        {/* 📌 Pinned Files Card */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">📌 Pinned Files</h2>
          <hr />
          {isLoading ? (
            <p className="text-gray-400 text-sm mt-2">Loading...</p>
          ) : isError ? (
            <p className="text-red-500 text-sm mt-2">Error loading pinned files</p>
          ) : !pinnedFiles?.length ? (
            <p className="text-gray-500 text-sm mt-2">No pinned files yet.</p>
          ) : (
            <div className="space-y-3 mt-3">
              {pinnedFiles.map((file) => (
                <div
                  key={file._id}
                  className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                >
                  <span
                    className="truncate max-w-[60%] text-sm"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <div className="flex gap-3 items-center">
                    <button
                      title="Unpin"
                      onClick={() => handleUnpin(file._id)}
                    >
                      <FaThumbtack className="text-yellow-600 rotate-[35deg]" />
                    </button>

                    <button
                      onClick={() => throttledSignedAction(file._id, "view")}
                      disabled={loadingFileId === file._id}
                      title="View"
                    >
                      <FiEye
                        className={`${
                          loadingFileId === file._id
                            ? "text-gray-400"
                            : "text-blue-600 hover:text-blue-800"
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => throttledSignedAction(file._id, "download")}
                      disabled={loadingFileId === file._id}
                      title="Download"
                    >
                      <FiDownload
                        className={`${
                          loadingFileId === file._id
                            ? "text-gray-400"
                            : "text-green-600 hover:text-green-800"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar Widgets */}
      <div className="flex-1 w-full sm:w-72 space-y-4">
        {/* Storage Card */}
        {statsLoading ? (
          <p className="text-sm text-gray-400">Loading storage...</p>
        ) : statsError ? (
          <p className="text-sm text-red-500">Error fetching storage data</p>
        ) : (
          <StatCard
            icon={<FaCloud />}
            title="Storage"
            progressBar={{
              percent: usedPercent,
              label: `${usedStorageGB} GB used of ${totalStorageGB} GB`,
            }}
          />
        )}

        {/* Company Updates Card */}
        <button className="w-full bg-white rounded-xl shadow px-4 py-3 text-center font-medium text-sm text-gray-700 hover:bg-gray-100 transition">
          Company Updates
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
