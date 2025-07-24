import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FiEye, FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";
import { throttle } from "lodash";
import { FaThumbtack } from "react-icons/fa";

const limit = 20;

const ClientFolderFiles = () => {
  const { folderId } = useParams();
  const [page, setPage] = useState(1);
  const [loadingFileId, setLoadingFileId] = useState(null);
  const [pinnedLocal, setPinnedLocal] = useState([]);

  // 🔄 Fetch folder files
  const {
    data: folderData,
    isLoading: isLoadingFolder,
    isError: isErrorFolder,
  } = useQuery({
    queryKey: ["clientFolderFiles", folderId, page],
    queryFn: async () => {
      const res = await axios.get(
        `/folders/${folderId}/files?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  // 🔄 Fetch all pinned files for current user
  const {
    data: pinnedData,
    isLoading: isLoadingPinned,
    isError: isErrorPinned,
  } = useQuery({
    queryKey: ["pinnedFiles"],
    queryFn: async () => {
      const res = await axios.get("/files/pinned", {
        withCredentials: true,
      });
      return res.data.files; // array of pinned files
    },
  });

  // 🧠 Sync pinned status after both queries load
  useEffect(() => {
    if (folderData?.files && pinnedData) {
      const pinnedIds = pinnedData.map((file) => file._id);
      const currentlyVisiblePinned = folderData.files
        .filter((file) => pinnedIds.includes(file._id))
        .map((file) => file._id);
      setPinnedLocal(currentlyVisiblePinned);
    }
  }, [folderData, pinnedData]);

  // 🔁 View/Download throttled
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

  const handleViewFile = (fileId) => {
    if (!loadingFileId) throttledSignedAction(fileId, "view");
  };

  const handleDownloadFile = (fileId) => {
    if (!loadingFileId) throttledSignedAction(fileId, "download");
  };

  // 🔁 Pin/Unpin handlers
  const throttledPinFile = useCallback(
    throttle(async (fileId) => {
      try {
        await axios.post(`/files/${fileId}/pin`, null, {
          withCredentials: true,
        });
        toast.success("File pinned");
      } catch {
        toast.error("Failed to pin file");
      }
    }, 3000),
    []
  );

  const throttledUnpinFile = useCallback(
    throttle(async (fileId) => {
      try {
        await axios.delete(`/files/${fileId}/unpin`, {
          withCredentials: true,
        });
        toast.success("File unpinned");
      } catch {
        toast.error("Failed to unpin file");
      }
    }, 3000),
    []
  );

  const togglePin = async (fileId) => {
    const isPinned = pinnedLocal.includes(fileId);
    setPinnedLocal((prev) =>
      isPinned ? prev.filter((id) => id !== fileId) : [...new Set([...prev, fileId])]
    );
    isPinned ? throttledUnpinFile(fileId) : throttledPinFile(fileId);
  };

  const isLoading = isLoadingFolder || isLoadingPinned;
  const isError = isErrorFolder || isErrorPinned;
  const files = folderData?.files || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Files in Folder</h2>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-red-500">Failed to load files.</p>
      ) : !files.length ? (
        <p className="text-gray-500 italic">No files shared in this folder.</p>
      ) : (
        <>
          <div className="space-y-3">
            {files.map((file) => (
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
                  {/* 📌 Pin Button */}
                  <button
                    onClick={() => togglePin(file._id)}
                    title={pinnedLocal.includes(file._id) ? "Unpin" : "Pin"}
                  >
                    <FaThumbtack
                      className={`transition ${
                        pinnedLocal.includes(file._id)
                          ? "text-yellow-600 rotate-[35deg]"
                          : "text-gray-400 hover:text-yellow-500"
                      }`}
                    />
                  </button>

                  {/* 👁 View Button */}
                  <button
                    onClick={() => handleViewFile(file._id)}
                    title="View"
                    disabled={loadingFileId === file._id}
                  >
                    <FiEye
                      className={`${
                        loadingFileId === file._id
                          ? "text-gray-400"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                    />
                  </button>

                  {/* ⬇ Download Button */}
                  <button
                    onClick={() => handleDownloadFile(file._id)}
                    title="Download"
                    disabled={loadingFileId === file._id}
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

          {/* 🔁 Pagination Controls */}
          {folderData.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-4 text-sm font-medium">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="mt-1">
                Page {page} of {folderData.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => (p < folderData.totalPages ? p + 1 : p))
                }
                disabled={page === folderData.totalPages}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientFolderFiles;
