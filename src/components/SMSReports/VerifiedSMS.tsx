import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc } from "firebase/firestore"; // Updated imports
import * as XLSX from "xlsx"; // Import XLSX for Excel export

interface VerifiedMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  incidentType: string | null;
  barangay: string | null;
  colorCode: string | null;
  status: string;
  response: string | null;
}

const barangays = [
  "All Barangay",
  "Unknown",
  "Bagacay",
  "Central",
  "Cogon",
  "Dancalan",
  "Dapdap",
  "Lalud",
  "Looban",
  "Mabuhay",
  "Madlawon",
  "Poctol",
  "Porog",
  "Sabang",
  "Salvacion",
  "San Antonio",
  "San Bernardo",
  "San Francisco",
  "Kapangihan",
  "San Isidro",
  "San Jose",
  "San Rafael",
  "San Roque",
  "Buhang",
  "San Vicente",
  "Santa Barbara",
  "Sapngan",
  "Tinampo",
];

const VerifiedSMS: React.FC = () => {
  const [messages, setMessages] = useState<VerifiedMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBarangay, setSelectedBarangay] = useState<string>("All Barangay");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("VerifiedSMS");

  useEffect(() => {
    const baseQuery = collection(db, "sms_received");

    let queryCondition;
    if (selectedBarangay === "All Barangay") {
      queryCondition = query(baseQuery, where("status", "==", "Verified"));
    } else if (selectedBarangay === "Unknown") {
      queryCondition = query(baseQuery, where("status", "==", "Verified"));
    } else {
      queryCondition = query(baseQuery, where("status", "==", "Verified"), where("barangay", "==", selectedBarangay));
    }

    const unsubscribe = onSnapshot(
      queryCondition,
      (snapshot) => {
        const messagesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as VerifiedMessage[];

        const filteredMessages =
          selectedBarangay === "Unknown"
            ? messagesList.filter(
                (message) => !barangays.includes(message.barangay || "")
              )
            : messagesList;

        setMessages(filteredMessages);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching verified messages:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedBarangay]);

  const handleSendResponse = async (message: VerifiedMessage) => {
    try {
      // Create a new document in the 'sms_verification' collection
      const responseRef = doc(collection(db, "sms_verification"));
      await setDoc(responseRef, {
        number: message.sender, // Sender's number
        sms_received_documentId: message.id, // Link to original message
        message: "MDRRMO is on the way.", // Fixed response message
        messageStatus: "waiting",
        response: "waiting",
      });

      // Update the original message's response field
      const messageRef = doc(db, "sms_received", message.id);
      await updateDoc(messageRef, {
        response: "Response sent",
      });

      // Show success modal
      setSuccessModal(true);
    } catch (error) {
      console.error("Error sending response:", error);
    }
  };

  const handleDownload = () => {
    const worksheetData = messages.map((message) => ({
      Sender: message.sender,
      Message: message.message,
      Timestamp: new Date(message.timestamp).toLocaleString(),
      "Incident Type": message.incidentType || "N/A",
      Barangay: message.barangay || "N/A",
      "Color Code": message.colorCode || "N/A",
      Status: message.status,
      Response: message.response || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Verified SMS");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    setModalOpen(false); // Close modal after saving
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Verified SMS</h2>

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

      {/* Download Button */}
      <div className="mb-4">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
        >
          Download as Excel
        </button>
      </div>

      {/* Export Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Export Excel</h2>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4"
              placeholder="Enter file name"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded shadow hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Response Sent</h2>
            <p className="mb-4">The response has been successfully sent to the sender.</p>
            <button
              onClick={() => setSuccessModal(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Verified Messages Table */}
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
              <th className="p-3 border-b border-gray-300 text-left font-semibold">Status</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">Response</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id} className="hover:bg-gray-100 transition-colors duration-200">
                <td className="p-3 border-b border-gray-300">{message.sender}</td>
                <td className="p-3 border-b border-gray-300">{message.message}</td>
                <td className="p-3 border-b border-gray-300">{new Date(message.timestamp).toLocaleString()}</td>
                <td className="p-3 border-b border-gray-300">{message.incidentType}</td>
                <td className="p-3 border-b border-gray-300">{message.barangay}</td>
                <td className="p-3 border-b border-gray-300">{message.colorCode}</td>
                <td className="p-3 border-b border-gray-300">{message.status}</td>
                <td className="p-3 border-b border-gray-300">{message.response || "N/A"}</td>
                <td className="p-3 border-b border-gray-300">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => handleSendResponse(message)}
                  >
                    Respond
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No verified messages found.</p>
      )}
    </div>
  );
};

export default VerifiedSMS;
