import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig"; // Adjust the path if necessary
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Define the structure of a message
interface DeclinedMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  incidentType: string | null;
  barangay: string | null;
  colorCode: string | null;
  actionRespond: string | null;
  status: string;
}

const barangays = [
  "All Barangay",
  "Bagacay", "Central", "Cogon", "Dancalan", "Dapdap", "Lalud", "Looban", "Mabuhay",
  "Madlawon", "Poctol", "Porog", "Sabang", "Salvacion", "San Antonio", "San Bernardo",
  "San Francisco", "Kapangihan", "San Isidro", "San Jose", "San Rafael", "San Roque",
  "Buhang", "San Vicente", "Santa Barbara", "Sapngan", "Tinampo",
  "Unknown"
];

const IncidentVerificationMessages: React.FC = () => {
  const [messages, setMessages] = useState<DeclinedMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBarangay, setSelectedBarangay] = useState<string>("All Barangay");

  useEffect(() => {
    const baseQuery = collection(db, "sms_received");

    let queryCondition;
    if (selectedBarangay === "All Barangay") {
      queryCondition = query(baseQuery, where("status", "==", "Not Confirmed"));
    } else if (selectedBarangay === "Unknown") {
      queryCondition = query(baseQuery, where("status", "==", "Not Confirmed"));
    } else {
      queryCondition = query(
        baseQuery,
        where("status", "==", "Not Confirmed"),
        where("barangay", "==", selectedBarangay)
      );
    }

    const unsubscribe = onSnapshot(
      queryCondition,
      (snapshot) => {
        const messagesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DeclinedMessage[];

        const filteredMessages =
          selectedBarangay === "Unknown"
            ? messagesList.filter((message) => !barangays.includes(message.barangay || ""))
            : messagesList;

        setMessages(filteredMessages);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching messages:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe(); // Clean up listener when component unmounts
    };
  }, [selectedBarangay]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Not Confirmed by Barangay Captain SMS Messages</h2>

      {/* Barangay Dropdown */}
      <div className="mb-4">
        <label htmlFor="barangay-select" className="block text-gray-700 font-medium mb-2">
          Select Barangay
        </label>
        <select
          id="barangay-select"
          value={selectedBarangay}
          onChange={(e) => setSelectedBarangay(e.target.value)}
          className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {barangays.map((barangay) => (
            <option key={barangay} value={barangay}>
              {barangay}
            </option>
          ))}
        </select>
      </div>

      {messages.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">Sender</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">Message</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">Timestamp</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">Incident Type</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">Barangay</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">Color</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">Response</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id} className="hover:bg-gray-100 transition-colors duration-200">
                <td className="p-3 border-b border-gray-300">{message.sender}</td>
                <td className="p-3 border-b border-gray-300">{message.message}</td>
                <td className="p-3 border-b border-gray-300">
                  {new Date(message.timestamp).toLocaleString()}
                </td>
                <td className="p-3 border-b border-gray-300">{message.incidentType || "N/A"}</td>
                <td className="p-3 border-b border-gray-300">{message.barangay || "N/A"}</td>
                <td className="p-3 border-b border-gray-300">{message.colorCode || "N/A"}</td>
                <td className="p-3 border-b border-gray-300">{message.actionRespond || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No messages found for the selected barangay.</div>
      )}
    </div>
  );
};

export default IncidentVerificationMessages;
