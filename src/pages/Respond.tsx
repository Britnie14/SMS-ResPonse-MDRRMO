import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig"; // Adjust the import according to your Firebase setup
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";

const Respond: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
  const [selectedColorCode, setSelectedColorCode] = useState<string>("");
  const [successModal, setSuccessModal] = useState<boolean>(false); // Success modal state
  const [responseMessage, setResponseMessage] = useState<string>(""); // Response message for modal

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesRef = collection(db, "sms_received");
      const q = query(messagesRef, where("status", "==", "Verified")); // Query to fetch verified messages
      const querySnapshot = await getDocs(q);

      const fetchedMessages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(fetchedMessages);
      setFilteredMessages(fetchedMessages); // Initially, display all verified messages
    };

    fetchMessages();
  }, []);

  // Color Codes Data
  const colorCodesData = [
    { color: "#4CAF50", label: "Non-Emergency Incidents", code: "Green" },
    { color: "#FFEB3B", label: "Warnings or Potential Threats", code: "Yellow" },
    { color: "#2196F3", label: "Medical Emergencies", code: "Blue" },
    { color: "#F44336", label: "Critical or Life-Threatening Incidents", code: "Red" },
    { color: "#E91E63", label: "Police Assistance Button", code: "Pink" },
    { color: "#FFFFFF", label: "Unknown Messages", code: "White" },
  ];

  // Handle color tab click
  const handleTabClick = (color: string) => {
    setSelectedColorCode(color);
    const filtered = messages.filter((message) => message.colorCode === color);
    setFilteredMessages(filtered);
  };

  // Handle response action
  const handleResponse = async (message: any) => {
    try {
      // Create a new document in the 'sms_verification' collection
      const responseRef = doc(collection(db, "sms_verification"));
      await setDoc(responseRef, {
        number: message.sender, // Sender's phone number
        sms_received_documentId: message.id, // Link to the original message
        message: "MDRRMO is on the way.", // Fixed response message
        messageStatus: "waiting",
        response: "waiting",
      });

      // Update the original message's response field in Firestore
      const messageRef = doc(db, "sms_received", message.id);
      await updateDoc(messageRef, {
        response: "Response sent",
      });

      // Set response message and show success modal
      setResponseMessage(`Response successfully sent to ${message.sender}`);
      setSuccessModal(true);
    } catch (error) {
      console.error("Error sending response:", error);
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-100 min-h-screen mt-16">
      <h1 className="text-2xl font-semibold mb-4">Verified Messages</h1>
      <p>This page displays all verified messages from Firestore.</p>

      {/* Color Tabs with added margin */}
      <div className="mt-8 flex space-x-2">
        {colorCodesData.map(({ color, label, code }) => (
          <div
            key={label}
            onClick={() => handleTabClick(code)}
            className={`flex items-center px-4 py-2 rounded-lg border border-gray-300 cursor-pointer ${
              selectedColorCode === code ? "bg-gray-300" : ""
            }`}
            style={{ backgroundColor: color }}
          >
            <span className="text-black">{label}</span>
          </div>
        ))}
      </div>

      {/* Message Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b">Barangay</th>
              <th className="py-2 px-4 border-b">Color Code</th>
              <th className="py-2 px-4 border-b">Incident Type</th>
              <th className="py-2 px-4 border-b">Message</th>
              <th className="py-2 px-4 border-b">Sender</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Timestamp</th>
              <th className="py-2 px-4 border-b">Response</th>
              <th className="py-2 px-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{message.barangay || "N/A"}</td>
                  <td className="py-2 px-4 border-b">{message.colorCode}</td>
                  <td className="py-2 px-4 border-b">{message.incidentType}</td>
                  <td className="py-2 px-4 border-b">{message.message}</td>
                  <td className="py-2 px-4 border-b">{message.sender}</td>
                  <td className="py-2 px-4 border-b">{message.status}</td>
                  <td className="py-2 px-4 border-b">{new Date(message.timestamp).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{message.response || "N/A"}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleResponse(message)} // Pass the message to handleResponse
                      className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Respond
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-2 px-4 border-b text-center">
                  No verified messages available for the selected color.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Response Sent</h2>
            <p className="mb-4">{responseMessage}</p>
            <button
              onClick={() => setSuccessModal(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Respond;
