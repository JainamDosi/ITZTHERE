import React from "react";
import logoImg from "../../assets/itzthereLogo.jpg";

const Footer = () => {
  return (
    <footer className="bg-black text-white px-6 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-8 gap-x-12 flex-wrap">
        {/* Logo */}
        <div className="flex justify-center md:justify-start items-center">
          <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden">
            <img
              src={logoImg}
              alt="logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Useful links */}
        <div className="font-['Roboto'] tracking-[0.05em] text-center md:text-left">
          <h3 className="text-[20px] font-semibold mb-2">Useful links</h3>
          <ul className="space-y-1 text-[15px]">
            <li>Contact us</li>
            <li>About</li>
            <li>Support</li>
            <li>Privacy Policy</li>
            <li>Data Policy</li>
          </ul>
        </div>

        {/* Our Products */}
        <div className="font-['Roboto'] tracking-[0.05em] text-center md:text-left">
          <h3 className="text-[20px] font-semibold mb-2">Our Products</h3>
          <ul className="text-[15px]">
            <li>windo</li>
          </ul>
        </div>

        {/* Get in Touch */}
        <div className="font-['Roboto'] tracking-[0.05em] text-center md:text-left">
          <h3 className="text-[20px] font-semibold mb-2">Get in Touch</h3>
          <p className="text-[15px]">Email: info@itzthere.com</p>
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
