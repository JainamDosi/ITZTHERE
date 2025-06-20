import React from "react";
import Navbar from "../components/navbar";
import PlanCard from "../components/PlanCard";
 // Adjust the path as necessary
function Windo_landing() {
  const plans = [
  { title: "PERSONAL", desc: "For individuals", color: "bg-pink-600" },
  { title: "BUSINESS", desc: "For professionals", color: "bg-black" },
  { title: "BUSINESS +", desc: "For large teams", color: "bg-black" },
  ];
  return (
    <div className="font-roboto text-gray-800">
      {/* Navbar */}
      <Navbar />
      {/* Hero Section */}
        <section
        className="flex flex-col mt-32 py-24 justify-center items-center text-center  bg-white bg-[url('/bg.png')] bg-cover bg-center"
        >
        <h2 className="text-6xl font-bebas leading-snug tracking-wider text-black">
            A BETTER WAY TO <br />
            <span className="text-[#92C9CC]">ORGANIZE, CENTRALIZE</span> <br />
            AND <span className="text-[#92C9CC]">SHARE DATA</span>
        </h2>
        <button className="mt-2 px-6 py-2 bg-teal-400 text-white rounded-full hover:bg-teal-500 transition">
            Explore Features
        </button>
        </section>



      {/* Tagline + Illustration */}
      <section className="flex flex-col  px-12 items-center md:flex-row justify-around">
        <p className="text-4xl w-1/2 text-center md:text-left">
          A transformative experience just for you and your business
        </p>
          <img src="img3.png" alt="" srcset="" className="object-cover w-50 h-50"/> 
      </section>

      {/* Features Placeholder */}
      <section className="flex justify-center py-12 bg-white">
        <div className="w-4/5 h-64 bg-gray-300 rounded-lg flex items-center justify-center text-gray-700 text-xl font-medium">
          Some screens showing product features
        </div>
      </section>

      {/* Pricing */}
            <section className="py-16 bg-gray-100 h-screen text-center">
        <div className="max-w-7xl h-full mx-auto px-4">
          <h3 className="text-3xl font-bold font-bebas mb-10">Choose Your Plan</h3>
          
          <div className="grid grid-cols-1 h-4/5 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <PlanCard key={plan.title} {...plan} />
            ))}
          </div>

          <div className="w-full h-2 mt-16 bg-fuchsia-800/50 mt-12 mx-auto rounded"></div>
        </div>
      </section>


    </div>
  );
}

export default Windo_landing;
