// src/components/SMSReports/SMSReports.tsx
import React, { useState } from "react";
import VerifiedSMS from "../components/SMSReports/VerifiedSMS";
import NonVerifiedSMS from "../components/SMSReports/NonVerifiedSMS";
import RawSMS from "../components/SMSReports/RawSMS";
import IncidentVerificationMessages from "../components/SMSReports/IncidentVerificationMessages"; // Import the new component
import ColorCodes from "../components/ColorCodes"; // Adjust the path as necessary
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Import icons for dropdown

const SMSReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState("verified");
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex-1 p-6 bg-gray-100 min-h-screen mt-16">
      <h1 className="text-3xl font-bold mb-4">SMS Reports</h1>

      <div className="flex justify-between items-center mb-4">
        <div>
          <button
            className={`px-4 py-2 rounded ${activeTab === "verified" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("verified")}
          >
            Verified SMS
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "non-verified" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("non-verified")}
          >
            Non-Verified SMS
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "raw" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("raw")}
          >
            Declined
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "incident" ? "bg-blue-500 text-white" : "bg-gray-200"}`} // New tab styling
            onClick={() => setActiveTab("incident")}
          >
            Not Confirmed
          </button>
        </div>

        {/* Color Codes Dropdown */}
        <div className="relative">
          <button
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Color Codes
            {showDropdown ? <FaChevronUp className="w-5 h-5 ml-2" /> : <FaChevronDown className="w-5 h-5 ml-2" />}
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-12 bg-white p-4 rounded-lg shadow-md z-10">
              <ColorCodes onSelect={(color: string, label: string) => console.log(`Selected: ${color} - ${label}`)} />
            </div>
          )}
        </div>
      </div>

      {activeTab === "verified" && <VerifiedSMS />}
      {activeTab === "non-verified" && <NonVerifiedSMS />}
      {activeTab === "raw" && <RawSMS />}
      {activeTab === "incident" && <IncidentVerificationMessages />} {/* Render new component */}
    </div>
  );
};

export default SMSReports;
