import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-white px-8 py-10">
      <div className="flex justify-between flex-wrap gap-6">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-black text-white flex items-center justify-center font-bold text-lg">
            t
          </div>
        </div>

        {/* Useful links */}
        <div className="text-sm">
          <h3 className="font-bold mb-2">Useful links</h3>
          <ul className="space-y-1 text-gray-400">
            <li>Contact us</li>
            <li>About</li>
            <li>Support</li>
          </ul>
        </div>

        {/* Products */}
        <div className="text-sm">
          <h3 className="font-bold mb-2">Our Products</h3>
          <ul className="text-gray-400">
            <li>windo</li>
          </ul>
        </div>

        {/* Get in Touch */}
        <div className="text-sm">
          <h3 className="font-bold mb-2">Get in Touch</h3>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
