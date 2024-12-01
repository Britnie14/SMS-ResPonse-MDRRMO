import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import ConfirmationDialog from "./ConfirmationDialog";
import * as XLSX from "xlsx";

interface NonVerifiedMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  incidentType: string | null;
  barangay: string | null;
  colorCode: string | null;
  status: string;
  actionRespond: string;
  notifStatus: string; // New column
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

const NonVerifiedSMS: React.FC = () => {
  const [messages, setMessages] = useState<NonVerifiedMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>("All Barangay");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [selectedMessageDetails, setSelectedMessageDetails] =
    useState<NonVerifiedMessage | null>(null);
  const [fileNameModalOpen, setFileNameModalOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("NonVerifiedSMS");

  useEffect(() => {
    const responseCollection = collection(db, "sms_received");

    const q = query(responseCollection, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        notifStatus: doc.data().notifStatus || "Unknown", // Default value
      })) as NonVerifiedMessage[];

      const filteredMessages = messagesList.filter((message) => {
        if (selectedTab === "All Barangay") {
          return (
            message.status === "Non Verified" || message.status === "Verifying"
          );
        } else if (selectedTab === "Unknown") {
          return (
            (message.status === "Non Verified" ||
              message.status === "Verifying") &&
            !barangays.includes(message.barangay || "")
          );
        } else {
          return (
            (message.status === "Non Verified" ||
              message.status === "Verifying") &&
            message.barangay === selectedTab
          );
        }
      });

      setMessages(filteredMessages);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedTab]);

  const handleDownloadExcel = () => {
    const worksheetData = messages.map((message) => ({
      Sender: message.sender,
      Message: message.message,
      Timestamp: new Date(message.timestamp).toLocaleString(),
      "Incident Type": message.incidentType || "N/A",
      Barangay: message.barangay || "N/A",
      "Color Code": message.colorCode || "N/A",
      Status: message.status,
      "Action Respond": message.actionRespond || "N/A",
      "Notif Status": message.notifStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Non-Verified SMS");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    setFileNameModalOpen(false);
  };

  const handleDecline = async (id: string) => {
    try {
      const messageRef = doc(db, "sms_received", id);
      await updateDoc(messageRef, { status: "Declined" });
    } catch (error) {
      console.error("Error declining message:", error);
    }
  };

  const openDialog = (message: NonVerifiedMessage) => {
    setSelectedMessageDetails(message);
    setSelectedMessageId(message.id);
    setDialogOpen(true);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleUpdateNotifStatus = async (id: string) => {
    try {
      const messageRef = doc(db, "sms_received", id);
      await updateDoc(messageRef, { notifStatus: "Yes" });
      console.log("Notif status updated to Yes");
    } catch (error) {
      console.error("Error updating notifStatus:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen mt-16">
      <h1 className="text-3xl font-bold mb-4">Non-Verified SMS</h1>

      {/* Barangay Dropdown */}
      <div className="mb-4">
        <label
          htmlFor="barangay-select"
          className="block text-gray-700 font-medium mb-2"
        >
          Select Barangay
        </label>
        <select
          id="barangay-select"
          value={selectedTab}
          onChange={(e) => setSelectedTab(e.target.value)}
          className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {barangays.map((barangay) => (
            <option key={barangay} value={barangay}>
              {barangay}
            </option>
          ))}
        </select>
      </div>

      {/* Download Excel Button */}
      <div className="mb-4">
        <button
          onClick={() => setFileNameModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
        >
          Download as Excel
        </button>
      </div>

      {/* File Name Modal */}
      {fileNameModalOpen && (
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
                onClick={() => setFileNameModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded shadow hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadExcel}
                className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display messages in a table */}
      {messages.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">
                Sender
              </th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">
                Message
              </th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">
                Timestamp
              </th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">
                Incident Type
              </th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">
                Barangay
              </th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">
                Color
              </th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">
                Status
              </th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">
                Response
              </th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">
                Notif
              </th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr
                key={message.id}
                className={`${
                  message.notifStatus === "No" ? "bg-blue-100" : ""
                } hover:bg-gray-100 transition-colors duration-200`}
              >
                <td className="p-3 border-b border-gray-300">
                  {message.sender}
                </td>
                <td className="p-3 border-b border-gray-300">
                  {message.message}
                </td>
                <td className="p-3 border-b border-gray-300">
                  {formatDate(message.timestamp)}
                </td>
                <td className="p-3 border-b border-gray-300">
                  {message.incidentType}
                </td>
                <td className="p-3 border-b border-gray-300">
                  {message.barangay}
                </td>
                <td className="p-3 border-b border-gray-300">
                  {message.colorCode}
                </td>
                <td className="p-3 border-b border-gray-300">
                  {message.status}
                </td>
                <td className="p-3 border-b border-gray-300">
                  {message.actionRespond}
                </td>
                <td className="p-3 border-b border-gray-300">
                  {message.notifStatus}
                </td>
                <td className="p-3 border-b border-gray-300">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        openDialog(message);
                        handleUpdateNotifStatus(message.id); // Update notifStatus when Verify is clicked
                      }}
                      className={`bg-blue-500 text-white px-4 py-2 rounded ${
                        message.status === "Verifying"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={message.status === "Verifying"}
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => {
                        handleDecline(message.id);
                        handleUpdateNotifStatus(message.id); // Update notifStatus when Decline is clicked
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Decline
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No non-verified messages found.</div>
      )}

      {/* Confirmation Dialog */}
      {selectedMessageDetails && (
        <ConfirmationDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          message={selectedMessageDetails.message}
          selectedBarangay={selectedMessageDetails.barangay || ""}
          smsReceivedDocId={selectedMessageId || ""}
        />
      )}
    </div>
  );
};

export default NonVerifiedSMS;
