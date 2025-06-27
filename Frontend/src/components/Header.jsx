import React from "react";
import { FiLogOut } from "react-icons/fi";
import logo from "../assets/logo.svg";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex items-center fixed top-0 w-full justify-between align-middle px-6 py-4 bg-white ">
      {/* Logo */}
      <div className="text-3xl font-bold relative">
        <img src={logo} alt="" className="w-28 object-contain ml-5" />
      </div>

      {/* Logout Button */}
      <button
        className="flex items-center gap-2 bg-pink-800 text-white font-medium px-4 py-2 rounded-full shadow hover:bg-pink-900 transition"
        onClick={handleLogout}
      >
        Logout <FiLogOut size={16} />
      </button>
    </div>
  );
};

export default Header;