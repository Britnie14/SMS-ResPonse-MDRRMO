// src/components/Sidebar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaAddressBook, FaChartBar } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";

const Sidebar: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 h-full bg-gray-800 text-white w-64 z-40">
      <div className="flex items-center justify-center p-4">
        <Link to="/home">
          <img
            src="https://i.ibb.co/QfdM6XR/mddrmo.png"
            alt="mddrmo"
            className="h-24 cursor-pointer"
          />
        </Link>
      </div>
      <nav className="mt-6">
        <ul>
          {/* Move Respond link to the top */}
         
          <li>
            <Link to="/home" className="flex items-center p-4 hover:bg-gray-700">
              <FaHome size={20} className="mr-4" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/contacts" className="flex items-center p-4 hover:bg-gray-700">
              <FaAddressBook size={20} className="mr-4" />
              <span>Contacts</span>
            </Link>
          </li>
          <li>
          <li>
            <Link to="/respond" className="flex items-center p-4 hover:bg-gray-700"> 
              <AiOutlineMail size={20} className="mr-4" />
              <span>Respond</span>
            </Link>
          </li>
            <Link to="/sms-reports" className="flex items-center p-4 hover:bg-gray-700">
              <AiOutlineMail size={20} className="mr-4" />
              <span>SMS Reports</span>
            </Link>
          </li>
          <li>
            <Link to="/generate-reports" className="flex items-center p-4 hover:bg-gray-700">
              <FaChartBar size={20} className="mr-4" />
              <span>File Reports</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
