import React, { useState, useCallback } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { FaCloud, FaThumbtack } from "react-icons/fa";
import { FiEye, FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import { throttle } from "lodash";

const Dashboard_Individual = () => {
  const [loadingFileId, setLoadingFileId] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pinnedFiles"],
    queryFn: async () => {
      const res = await axios.get("/files/pinned", {
        withCredentials: true,
      });
      return res.data.files;
    },
  });

  const throttledSignedAction = useCallback(
    throttle(async (fileId, mode = "view") => {
      setLoadingFileId(fileId);
      try {
        const res = await axios.get(
          `/files/signed-url/${fileId}?mode=${mode}`,
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
      await axios.delete(`/files/${fileId}/unpin`, {
        withCredentials: true,
      });
      toast.success("Unpinned file");
      refetch(); // refresh pinned list
    } catch (err) {
      toast.error("Failed to unpin");
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
      {/* Main Content Left */}
      <div className="w-full sm:w-3/4 space-y-6">
        {/* Pinned Files Card */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">📌 Pinned Files</h2>
          <hr />
          {isLoading ? (
            <p className="text-gray-400 text-sm mt-2">Loading...</p>
          ) : isError ? (
            <p className="text-red-500 text-sm mt-2">Error loading pinned files</p>
          ) : !data?.length ? (
            <p className="text-gray-500 text-sm mt-2">No pinned files yet.</p>
          ) : (
            <div className="space-y-3 mt-3">
              {data.map((file) => (
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
    </div>
  );
};

export default Dashboard_Individual;
