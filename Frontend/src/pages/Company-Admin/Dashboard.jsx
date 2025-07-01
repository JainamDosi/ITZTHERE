import React from "react";
import Sidebar from "../../components/Sidebar";
import StatCard from "../../components/StatCard";
import Header from "../../components/Header";
import { FaFileAlt, FaCloud, FaUsers, FaServer } from "react-icons/fa";

function Dashboard() {
  return (
    <>
      <div className="flexbg-white text-black items-center justify-center w-full">
        <main className="flex flex-col ">

          {/* Top Stat Cards */}
                <section className="flex flex-wrap md:flex-nowrap gap-16 w-11/12">
                      <StatCard icon={<FaFileAlt />} title="Docs Uploaded" value="1253" />
                      <StatCard
                        icon={<FaCloud />}
                        title="Storage"
                        progressBar={{
                          percent: (4253 / 4916) * 100,
                          label: "0.49 GB used of 4916GB",
                        }}
                      />
                      <StatCard icon={<FaUsers />} title="Users" value="37" />
                  </section>

          {/* Section Wise Storage */}
          <section className="mt-10 w-1/2">
            <div className="bg-white rounded-xl shadow p-4 flex items-center gap-2 text-lg font-semibold">
              <FaServer className="text-2xl" />
              Section Wise Storage Consumption
            </div>
               <section className="mt-8 flex justify-between items-center px-11">
            <div className="flex flex-col gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-gray-300 rounded" />
              ))}
            </div>

            {/* Placeholder for Donut Chart */}
            <div className="w-40 h-40 hidden md:block rounded-full border-[10px] border-gray-500" />
          </section>


          </section>

         
        </main>
      </div>
    </>
  );
}

export default Dashboard;
