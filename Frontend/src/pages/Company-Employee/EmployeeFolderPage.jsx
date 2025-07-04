import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { throttle } from "lodash";
import { FiEye, FiDownload, FiTrash2, FiX } from "react-icons/fi";
import { FaThumbtack } from "react-icons/fa";

const FolderFiles = () => {
  const { folderId } = useParams();
  const [page, setPage] = useState(1);
  const [loadingFileId, setLoadingFileId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pinnedLocal, setPinnedLocal] = useState([]);
  const queryClient = useQueryClient();
  const limit = 4;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["folderFiles", folderId, page],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:3000/api/folders/${folderId}/files?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const { data: clientsData = [] } = useQuery({
    queryKey: ["companyClients"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/files/clients", {
        withCredentials: true,
      });
      return res.data.clients;
    },
  });

  const { data: pinnedData } = useQuery({
    queryKey: ["pinnedFiles"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/files/pinned", {
        withCredentials: true,
      });
      console.log("Pinned files data:", res.data.files);
      return res.data.files;
    },
  });

  // Sync pinned file IDs
  useEffect(() => {
    if (data?.files && pinnedData) {
      const pinnedIds = pinnedData.map((file) => file._id);
      const visiblePinned = data.files
        .filter((file) => pinnedIds.includes(file._id))
        .map((file) => file._id);
      setPinnedLocal(visiblePinned);
    }
  }, [data, pinnedData]);

  const throttledSignedAction = useCallback(
    throttle(async (fileId, mode = "view") => {
      setLoadingFileId(fileId);
      try {
        const res = await axios.get(
          `http://localhost:3000/api/files/signed-url/${fileId}?mode=${mode}`,
          { withCredentials: true }
        );
        const url = res.data.signedUrl;
        if (mode === "view") window.open(url, "_blank");
        else {
          const a = document.createElement("a");
          a.href = url;
          a.download = "";
          a.click();
        }
      } catch {
        toast.error("Failed to load file.");
      } finally {
        setLoadingFileId(null);
      }
    }, 3000),
    []
  );

  const throttledPinFile = useCallback(
    throttle(async (fileId) => {
      try {
        await axios.post(`http://localhost:3000/api/files/${fileId}/pin`, null, {
          withCredentials: true,
        });
        toast.success("File pinned");
        queryClient.invalidateQueries(["pinnedFiles"]);
      } catch {
        toast.error("Failed to pin file");
      }
    }, 3000),
    []
  );

  const throttledUnpinFile = useCallback(
    throttle(async (fileId) => {
      try {
        await axios.delete(`http://localhost:3000/api/files/${fileId}/unpin`, {
          withCredentials: true,
        });
        toast.success("File unpinned");
        queryClient.invalidateQueries(["pinnedFiles"]);
      } catch {
        toast.error("Failed to unpin file");
      }
    }, 3000),
    []
  );
  console.log(pinnedLocal)

  const togglePin = async (fileId) => {
    const isPinned = pinnedLocal.includes(fileId);
    setPinnedLocal((prev) =>
      isPinned ? prev.filter((id) => id !== fileId) : [...new Set([...prev, fileId])]
    );
    isPinned ? throttledUnpinFile(fileId) : throttledPinFile(fileId);
  };

  const handleCheckboxToggle = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleShareFiles = async () => {
    if (!selectedFiles.length || !selectedClients.length) {
      toast.warn("Please select files and clients.");
      return;
    }

    const alreadyShared = selectedFiles.some((fileId) => {
      const file = data?.files.find((f) => f._id === fileId);
      return file?.assignedClients?.some((client) =>
        selectedClients.includes(client._id)
      );
    });

    if (alreadyShared) {
      toast.error("One or more files already have selected clients assigned.");
      return;
    }

    try {
      await axios.put(
        "http://localhost:3000/api/files/share",
        { fileIds: selectedFiles, clientIds: selectedClients },
        { withCredentials: true }
      );
      toast.success("Files shared successfully.");
      queryClient.invalidateQueries(["folderFiles", folderId, page]);
      setSelectedFiles([]);
      setSelectedClients([]);
    } catch {
      toast.error("Sharing failed.");
    }
  };

  const handleUnassignClient = async (fileId, clientId) => {
    try {
      await axios.delete(`http://localhost:3000/api/files/${fileId}/unassign/${clientId}`, {
        withCredentials: true,
      });
      toast.success("Client unassigned.");
      queryClient.invalidateQueries(["folderFiles", folderId, page]);
    } catch {
      toast.error("Failed to unassign client.");
    }
  };

  const handleViewFile = (fileId) => {
    if (!loadingFileId) throttledSignedAction(fileId, "view");
  };

  const handleDownloadFile = (fileId) => {
    if (!loadingFileId) throttledSignedAction(fileId, "download");
  };


  return (
    <div className="mt-6 px-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Files in Folder</h1>

      {/* 🔽 Share Clients Dropdown */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Share with Clients
        </label>
        <div
          onClick={() => setShowDropdown((prev) => !prev)}
          className="w-full border px-3 py-2 rounded bg-white cursor-pointer flex justify-between items-center"
        >
          {selectedClients.length > 0
            ? clientsData
                .filter((c) => selectedClients.includes(c._id))
                .map((c) => c.name)
                .join(", ")
            : "Select clients..."}
          <span className="ml-2 text-gray-500">&#9662;</span>
        </div>

        {showDropdown && (
          <div className="absolute z-10 bg-white w-full border mt-1 rounded shadow max-h-64 overflow-y-auto">
            {clientsData.map((client) => (
              <label
                key={client._id}
                className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedClients.includes(client._id)}
                  onChange={() =>
                    setSelectedClients((prev) =>
                      prev.includes(client._id)
                        ? prev.filter((id) => id !== client._id)
                        : [...prev, client._id]
                    )
                  }
                />
                {client.name} ({client.email})
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 🗂 File List */}
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-red-500">Failed to load files.</p>
      ) : !data?.files?.length ? (
        <p className="italic text-gray-500">No files in this folder.</p>
      ) : (
        <>
          <div className="border rounded-lg shadow">
            {data.files.map((file) => (
              <div
                key={file._id}
                className="border-b px-4 py-3 flex justify-between items-start text-sm"
              >
                {/* Left: File info + actions */}
                <div className="flex-1 border-r-2 pr-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file._id)}
                      onChange={() => handleCheckboxToggle(file._id)}
                    />
                    <span className="truncate max-w-[60%]">{file.name}</span>
                    <div className="ml-auto flex gap-3">
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
                      <button
                        onClick={() => handleViewFile(file._id)}
                        title="View"
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        disabled={loadingFileId === file._id}
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadFile(file._id)}
                        title="Download"
                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                        disabled={loadingFileId === file._id}
                      >
                        <FiDownload size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Assigned Clients */}
                <div className="w-[250px] flex flex-wrap gap-2 text-xs pl-4">
                  {file.assignedClients?.map((client) => (
                    <span
                      key={client._id}
                      className="bg-pink-100 text-pink-700 px-2 py-1 rounded flex items-center gap-1"
                    >
                      {client.name}
                      <FiX
                        className="cursor-pointer"
                        onClick={() => handleUnassignClient(file._id, client._id)}
                      />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Prev
              </button>
              <span className="text-sm">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => (p < data.totalPages ? p + 1 : p))
                }
                disabled={page >= data.totalPages}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Next
              </button>
            </div>
          )}

          {/* Share Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleShareFiles}
              disabled={selectedFiles.length === 0 || selectedClients.length === 0}
              className="bg-pink-700 text-white px-6 py-2 rounded shadow hover:bg-fuchsia-900 transition disabled:opacity-50"
            >
              Share with Selected Clients
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FolderFiles;
