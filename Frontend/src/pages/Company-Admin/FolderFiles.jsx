import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const FolderFiles = () => {
  const { folderId } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["folderFiles", folderId],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:3000/api/folders/${folderId}/files`, {
        withCredentials: true,
      });
      return res.data.files;
    },
  });

  return (
    <div className="mt-6 px-4">
      <h1 className="text-xl font-bold mb-4">Files in Folder</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-red-500">Failed to load files.</p>
      ) : data.length === 0 ? (
        <p className="italic text-gray-500">No files in this folder.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((file) => (
            <li key={file._id} className="bg-white p-4 rounded shadow text-sm text-gray-700">
              {file.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FolderFiles;
