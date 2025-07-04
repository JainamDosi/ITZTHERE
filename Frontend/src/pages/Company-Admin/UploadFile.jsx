import React, { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { FaSortDown } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const UploadFile = () => {
  const [department, setDepartment] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: folders = [], isLoading, isError } = useQuery({
    queryKey: ["allowedFolders"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/api/folders/visible", {
        withCredentials: true,
      });
      return res.data.folders;
    },
  });

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleSubmit = async () => {
    if (!department || files.length === 0) return;

    const formData = new FormData();
    formData.append("folderId", department);
    files.forEach((file) => formData.append("files", file)); // must match multer field

    try {
      setIsUploading(true);
      const res = await axios.post(
        "http://localhost:3000/api/files/upload",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Files uploaded successfully!");
      setFiles([]);
      setDepartment("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Folder Dropdown */}
      <div className="relative mb-6">
        <select
          className="w-full px-4 py-3 pr-10 rounded-lg shadow-md text-gray-700
                     border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500
                     appearance-none text-sm text-center"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          disabled={isLoading || isError}
        >
          <option value="">Please Select Folder</option>
          {folders.map((folder) => (
            <option key={folder._id} value={folder._id}>
              {folder.name}
            </option>
          ))}
        </select>
        <FaSortDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>

      {/* File Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center p-24 text-center text-gray-600 cursor-pointer"
        onClick={() => document.getElementById("fileInput").click()}
      >
        <div className="flex flex-col items-center">
          <FiUploadCloud className="text-4xl mb-2 text-pink-700" />
          <p className="font-semibold">Drag & Drop Files Here</p>
          <p>or Click to Upload</p>
        </div>
        <input
          id="fileInput"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <ul className="mt-4 text-sm text-gray-700 list-inside">
          {files.map((file, idx) => (
            <li key={idx} className="flex items-center justify-between py-1 border-b">
              <span>{file.name}</span>
              <button
                onClick={() => {
                  setFiles((prev) => prev.filter((_, i) => i !== idx));
                }}
                className="ml-4 text-red-600 text-xs hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Submit Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSubmit}
          className="bg-pink-700 text-white px-6 py-2 rounded shadow hover:bg-fuchsia-900 transition"
          disabled={!department || files.length === 0 || isUploading}
        >
          {isUploading ? "Uploading..." : "Submit Files"}
        </button>
      </div>
    </div>
  );
};

export default UploadFile;
