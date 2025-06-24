import React, { useState } from 'react';
import logo from "../assets/logo.svg";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="flex justify-between items-center px-6 py-4 md:px-12 md:py-6">
        {/* Logo */}
        <img src={logo} alt="Logo" className="w-24 md:w-28 object-contain" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-10 text-base font-medium">
          <Link to="/windo" className="hover:text-[#368c89]">Home</Link>
          <Link to="/about" className="hover:text-[#368c89]">About Us</Link>
          <Link to="/login" className="hover:text-[#368c89]">Login</Link>
          <Link to="/register" className="hover:text-[#368c89]">Register</Link>
        </nav>

        {/* Mobile Toggle Icon */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white px-6 pb-4 shadow-sm flex flex-col space-y-4 text-base font-medium">
          <Link to="/windo" onClick={() => setIsOpen(false)} className="hover:text-[#368c89]">Home</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-[#368c89]">About Us</Link>
          <Link to="/login" onClick={() => setIsOpen(false)} className="hover:text-[#368c89]">Login</Link>
          <Link to="/register" onClick={() => setIsOpen(false)} className="hover:text-[#368c89]">Register</Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;
