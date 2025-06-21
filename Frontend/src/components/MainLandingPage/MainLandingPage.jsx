import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import logoImg from "../../assets/itzthereLogo.jpg";

const cardsData = [
  { id: 1, title: "Product A", desc: "Solution for businesses" },
  { id: 2, title: "Product B", desc: "Optimize performance" },
  { id: 3, title: "Product C", desc: "Scale faster" },
  { id: 4, title: "Product D", desc: "Automate tasks" },
  { id: 5, title: "Product E", desc: "Manage resources" },
  { id: 6, title: "Product F", desc: "Grow efficiently" },
];

const MainLandingPage = () => {
  const controls = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;
  const CARD_WIDTH = 320 + 24;
  const maxIndex = cardsData.length - cardsPerView;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    controls.start({
      x: -currentIndex * CARD_WIDTH,
      transition: { duration: 0.8, ease: "easeInOut" },
    });
  }, [currentIndex, controls]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Navbar */}
      <div className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
            <img
              src={logoImg}
              alt="logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-4xl font-light font-[Oswald]">itzthere</span>
        </div>

        <button className="bg-gradient-to-r from-stone-500 to-blue-400 text-white text-sm px-4 py-2 rounded shadow transition-transform duration-300 hover:scale-105">
          Explore products
        </button>
      </div>

      {/* Tagline */}
      <div className="px-8 mt-12 font-bold uppercase tracking-[0.05em]">
        <h1 className="text-4xl font-['Bebas Neue']">WELCOME</h1>
        <h2 className="text-2xl mt-1 font-['Bebas Neue']">
          TO THE WORLD OF <span className="text-[#4DA3FF]">BUSINESS</span>
        </h2>
        <h2 className="text-2xl font-['Bebas Neue']">
          <span className="text-[#4DA3FF]">SOLUTIONS</span>, ONE NEED
        </h2>
      </div>

      {/* Cards container */}
      <div className="mt-16 mb-32 flex justify-center">
        <div className="w-[1008px] overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={controls}
            style={{ width: `${cardsData.length * CARD_WIDTH}px` }}
          >
            {cardsData.map((card) => (
              <div
                key={card.id}
                className="min-w-[320px] bg-gray-200 p-6 rounded-2xl shadow-md h-72 flex-shrink-0"
              >
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-sm text-gray-700">{card.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MainLandingPage;
