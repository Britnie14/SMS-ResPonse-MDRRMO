import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { db } from "../firebaseConfig"; // Adjust the import according to your firebase setup
import { collection, getDocs } from "firebase/firestore";
import { FaInfoCircle, FaExclamationTriangle, FaAmbulance, FaFireExtinguisher, FaShieldAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const incidentTypes = [
  { type: "Non-Emergency Incidents", color: "bg-green-500", icon: <FaInfoCircle />, code: "Green", navigateTo: "/respond" },
  { type: "Warnings or Potential Threats", color: "bg-yellow-500", icon: <FaExclamationTriangle />, code: "Yellow", navigateTo: "/respond" },
  { type: "Medical Emergencies", color: "bg-blue-500", icon: <FaAmbulance />, code: "Blue", navigateTo: "/respond" },
  { type: "Critical or Life-Threatening Incidents", color: "bg-red-500", icon: <FaFireExtinguisher />, code: "Red", navigateTo: "/respond" },
  { type: "Police Assistance Button", color: "bg-cyan-500", icon: <FaShieldAlt />, code: "Cyan", navigateTo: "/respond" },
  { type: "Verified", color: "bg-green-600", icon: <FaCheckCircle />, code: "Verified", navigateTo: "/sms-reports" },
  { type: "Non-Verified", color: "bg-orange-500", icon: <FaTimesCircle />, code: "Non-Verified", navigateTo: "/sms-reports" },
  { type: "Verifying", color: "bg-blue-300", icon: <FaExclamationTriangle />, code: "Verifying", navigateTo: "/sms-reports" },
  { type: "Declined", color: "bg-red-700", icon: <FaTimesCircle />, code: "Declined", navigateTo: "/sms-reports" },
  { type: "Not Confirmed", color: "bg-gray-500", icon: <FaExclamationTriangle />, code: "Not Confirmed", navigateTo: "/sms-reports" },
];

interface DocumentData {
  colorCode: string;
  status: string;
  [key: string]: any;
}

const Home: React.FC = () => {
  const [incidentCounts, setIncidentCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "sms_received"));
        const counts: { [key: string]: number } = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          const colorCode = data.colorCode;
          const status = data.status;

          if (colorCode) {
            const matchingIncident = incidentTypes.find((incident) => incident.code === colorCode);
            if (matchingIncident) {
              counts[matchingIncident.type] = (counts[matchingIncident.type] || 0) + 1;
            }
          }

          if (status === "Verified") {
            counts["Verified"] = (counts["Verified"] || 0) + 1;
          } else if (status === "Non Verified") {
            counts["Non-Verified"] = (counts["Non-Verified"] || 0) + 1;
          } else if (status === "Verifying") {
            counts["Verifying"] = (counts["Verifying"] || 0) + 1;
          } else if (status === "Declined") {
            counts["Declined"] = (counts["Declined"] || 0) + 1;
          } else if (status === "Not Confirmed") {
            counts["Not Confirmed"] = (counts["Not Confirmed"] || 0) + 1;
          }
        });

        setIncidentCounts(counts);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 p-6 bg-gray-100 min-h-screen mt-16">
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidentTypes.map((incident, index) => {
          const colorCodeCount = incidentCounts[incident.type] || 0;

          return (
            <div
              key={index}
              className={`flex items-center p-4 rounded-lg shadow-md ${incident.color} text-white cursor-pointer`} // Add cursor-pointer for click effect
              onClick={() => navigate(incident.navigateTo)} // Navigate based on the incident type
            >
              <div className="mr-3">{incident.icon}</div>
              <span className="font-semibold">{incident.type}: {colorCodeCount}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
