// import React, { useEffect, useState } from "react";
// import { motion, useAnimation } from "framer-motion";

// const cardsData = [
//   { id: 1, title: "Product A", desc: "Solution for businesses" },
//   { id: 2, title: "Product B", desc: "Optimize performance" },
//   { id: 3, title: "Product C", desc: "Scale faster" },
//   { id: 4, title: "Product D", desc: "Automate tasks" },
//   { id: 5, title: "Product E", desc: "Manage resources" },
//   { id: 6, title: "Product F", desc: "Grow efficiently" },
// ];

// const HeroSection = () => {
//   const controls = useAnimation();
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const cardsPerView = 3;
//   const CARD_WIDTH = 320 + 24; // 320px card + 24px gap
//   const maxIndex = cardsData.length - cardsPerView;

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
//     }, 3000);

//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     controls.start({
//       x: -currentIndex * CARD_WIDTH,
//       transition: { duration: 0.8, ease: "easeInOut" },
//     });
//   }, [currentIndex, controls]);

//   return (
//     <div className="min-h-screen bg-white text-black flex flex-col">
//       {/* Navbar */}
//       <div className="flex justify-between items-center px-8 py-6">
//         <div className="flex items-center space-x-2">
//           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-black text-white flex items-center justify-center font-bold text-xl">
//             t
//           </div>
//           <span className="text-4xl font-semibold">itzthere</span>
//         </div>
//         <button className="bg-blue-500 text-white text-sm px-4 py-2 rounded shadow hover:bg-blue-600">
//           Explore products
//         </button>
//       </div>

//       {/* Hero Text */}
//       <div className="px-8 mt-12 font-bold uppercase">
//         <h1 className="text-4xl">WELCOME</h1>
//         <h2 className="text-2xl mt-1">
//           TO THE WORLD OF <span className="text-blue-500">BUSINESS</span>
//         </h2>
//         <h2 className="text-2xl">
//           <span className="text-blue-500">SOLUTIONS</span>, ONE NEED
//         </h2>
//       </div>

//       {/* Carousel */}
//       <div className="overflow-hidden mt-16 mb-32 px-8">
//         <div className="max-w-[1100px] mx-auto">
//           <div className="relative w-full overflow-hidden">
//             <motion.div
//               className="flex gap-6"
//               animate={controls}
//               style={{ width: `${cardsData.length * CARD_WIDTH}px` }}
//             >
//               {cardsData.map((card) => (
//                 <div
//                   key={card.id}
//                   className="min-w-[320px] bg-gray-200 p-6 rounded-2xl shadow-md h-72 flex-shrink-0"
//                 >
//                   <h3 className="text-xl font-bold mb-2">{card.title}</h3>
//                   <p className="text-sm text-gray-700">{card.desc}</p>
//                 </div>
//               ))}
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HeroSection;


import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const cardsData = [
  { id: 1, title: "Product A", desc: "Solution for businesses" },
  { id: 2, title: "Product B", desc: "Optimize performance" },
  { id: 3, title: "Product C", desc: "Scale faster" },
  { id: 4, title: "Product D", desc: "Automate tasks" },
  { id: 5, title: "Product E", desc: "Manage resources" },
  { id: 6, title: "Product F", desc: "Grow efficiently" },
];

const HeroSection = () => {
  const controls = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;
  const CARD_WIDTH = 320 + 24; // 320px card + 24px gap
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-black text-white flex items-center justify-center font-bold text-xl">
            t
          </div>
          <span className="text-4xl font-semibold">itzthere</span>
        </div>
        <button className="bg-blue-500 text-white text-sm px-4 py-2 rounded shadow hover:bg-blue-600">
          Explore products
        </button>
      </div>

      {/* Hero Text */}
      <div className="px-8 mt-12 font-bold uppercase">
        <h1 className="text-4xl">WELCOME</h1>
        <h2 className="text-2xl mt-1">
          TO THE WORLD OF <span className="text-blue-500">BUSINESS</span>
        </h2>
        <h2 className="text-2xl">
          <span className="text-blue-500">SOLUTIONS</span>, ONE NEED
        </h2>
      </div>

      {/* Carousel */}
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

export default HeroSection;



