import React from "react";
import { FiLogOut } from "react-icons/fi";
import logo from "../assets/logo.svg"; // Adjust the path as necessary
const Header = () => {
  return (
    <div className="flex items-center fixed top-0 w-full justify-between align-middle px-6 py-4 bg-white mt-2">
      
      {/* Logo */}
      <div className="text-3xl font-bold relative">
        <img src={logo} alt="" srcset="" className="w-28 object-contain ml-5" />
      </div>

      {/* Logout Button */}
      <button className="flex items-center gap-2 bg-pink-800 text-white font-medium px-4 py-2 rounded-full shadow hover:bg-pink-900 transition">
        Logout <FiLogOut size={16} />
      </button>
    </div>
  );
};

export default Header;
