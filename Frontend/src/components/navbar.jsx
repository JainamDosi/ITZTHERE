import React from 'react'
import logo from "../assets/logo.svg";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
function Navbar() {
  return (
    <header className="flex justify-between top-0  fixed w-full items-center px-12 py-7 bg-white shadow-sm ">
        <img src={logo} alt="Logo" className="w-28 object-contain ml-3" />

            <nav className="space-x-16 text-base font-normal flex items-center mr-2 ">
                <Link to="/windo" className="hover:text-[#368c89]">Home</Link>
                <Link to="/about" className="hover:text-[#368c89]">About Us</Link>
                <Link to="/login" className="hover:text-[#368c89]">Login</Link>
                <Link to="/register" className="hover:text-[#368c89]">Register</Link>
            </nav>
        </header>
  )
}

export default Navbar