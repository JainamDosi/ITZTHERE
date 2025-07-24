import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const UploadTrendsChart = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
  queryKey: ["uploadTrends", page],
  queryFn: async () => {
    const res = await axios.get(`/files/daily-uploads?page=${page}&limit=7`, {
      withCredentials: true,
    });
    return res.data.data;
  },
  keepPreviousData: true,
});


  return (
    <div className="bg-white rounded-xl shadow p-4 w-full md:w-2/3 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Weekly Upload Trends</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-100 rounded"
          >
            Next
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading chart...</p>
      ) : isError ? (
        <p className="text-red-500">Failed to load data</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="uploads" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default UploadTrendsChart;
