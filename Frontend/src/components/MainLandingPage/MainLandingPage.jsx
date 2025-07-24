import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom"; // ⬅️ for navigation
import logoImg from "../../assets/itzthereLogo.jpg";

const cardsData = [
  { id: 1, title: "Windo", desc: "Secure data management", route: "/windo" },
  { id: 2, title: "Coming Soon", desc: "" },
  { id: 3, title: "Coming Soon", desc: "" },
  { id: 4, title: "Coming Soon", desc: "" },
  { id: 5, title: "Coming Soon", desc: "" },
  { id: 6, title: "Coming Soon", desc: "" },
];

const MainLandingPage = () => {
  const controls = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;
  const CARD_WIDTH = 320 + 24;
  const maxIndex = cardsData.length - cardsPerView;
  const cardsRef = useRef(null);
  const navigate = useNavigate(); // ⬅️ for navigation

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
              loading="lazy"
            />
          </div>
          <span className="text-4xl font-light font-[Oswald]">itzthere</span>
        </div>

        <button
          className="bg-gradient-to-r from-stone-500 to-blue-400 text-white text-sm px-4 py-2 rounded shadow transition-transform duration-300 hover:scale-105"
          onClick={() => cardsRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          Explore products
        </button>
      </div>

      {/* Tagline */}
      <div className="flex flex-col w-full h-[75vh] px-8 bg-[url('/bg2.png')] bg-cover bg-center text-center items-center justify-center space-y-4">
        <h1 className="text-6xl font-bebas tracking-wide">WELCOME</h1>
        <h1 className="text-6xl font-bebas tracking-wide">
          TO THE WORLD OF <span className="text-[#4DA3FF]">BUSINESS</span>
        </h1>
        <h1 className="text-6xl font-bebas tracking-wide">
          <span className="text-[#4DA3FF]">SOLUTIONS</span>, ONE NEED
        </h1>
      </div>

      {/* Cards container */}
      <div ref={cardsRef} className="mt-16 mb-32 flex justify-center p-4">
        <div className="w-[1008px] overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={controls}
            style={{ width: `${cardsData.length * CARD_WIDTH}px` }}
          >
            {cardsData.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  if (card.route) navigate(card.route);
                }}
                className="min-w-[320px] bg-gray-200 p-6 rounded-2xl shadow-md h-72 flex-shrink-0 flex flex-col justify-center items-center cursor-pointer transition-all hover:border-4 hover:border-blue-400"
              >
                <h3 className="text-xl font-bold mb-2 text-center">{card.title}</h3>
                {card.desc ? (
                  <p className="text-sm text-gray-700 text-center">{card.desc}</p>
                ) : (
                  <p className="text-gray-500 italic text-center">Stay tuned...</p>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MainLandingPage;
