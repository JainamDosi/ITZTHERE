import React from "react";
import logoImg from "../../assets/itzthereLogo.jpg";

const Footer = () => {
  return (
    <footer className="bg-black text-white px-8 py-6">
      <div className="flex justify-between flex-wrap gap-x-6 gap-y-4">
        {/* Logo */}
        <div className="flex items-center ml-4 mt-6">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
            <img
              src={logoImg}
              alt="logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Useful links */}
        <div className="font-['Roboto'] tracking-[0.05em]">
          <h3 className="text-[22px] font-semibold mb-2">Useful links</h3>
          <ul className="text-white space-y-1 text-[15px]">
            <li>Contact us</li>
            <li>About</li>
            <li>Support</li>
            <li>Privacy Policy</li>
            <li>Data Policy</li>
          </ul>
        </div>

        {/* Our Products */}
        <div className="font-['Roboto'] tracking-[0.05em] -ml-4">
          
          <h3 className="text-[22px] font-semibold mb-2">Our Products</h3>
          <ul className="text-white text-[15px]">
            <li>windo</li>
          </ul>
        </div>

        {/* Get in Touch */}
        <div className="font-['Roboto'] tracking-[0.05em] -ml-6">
         
          <h3 className="text-[22px] font-semibold mb-2">Get in Touch</h3>
          <p className="text-[15px] text-white">Email: info@itzthere.com</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-6 text-center text-sm font-['Inter'] text-gray-400 tracking-[0.03em]">
        © 2025 PKA Consultants. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
