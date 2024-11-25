import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";

interface IncidentColor {
  type: string;
  color: string;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string; // Message to verify
  selectedBarangay: string; // Initial barangay
  smsReceivedDocId: string; // ID of the SMS document being verified
}

const incidentColors: IncidentColor[] = [
  { type: "Non-Emergency Incidents", color: "Green" },
  { type: "Warnings or Potential Threats", color: "Yellow" },
  { type: "Medical Emergencies", color: "Blue" },
  { type: "Critical or Life-Threatening Incidents", color: "Red" },
  { type: "Police Assistance Button", color: "Cyan Blue" },
];

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

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  message,
  selectedBarangay,
  smsReceivedDocId,
}) => {
  const [currentBarangay, setCurrentBarangay] = useState<string>(selectedBarangay);
  const [incidentType, setIncidentType] = useState<string>("");
  const [contactInfo, setContactInfo] = useState<{
    Name: string;
    Number: string;
    Barangay: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirming, setConfirming] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (currentBarangay) {
      fetchBarangayCaptain(currentBarangay);
    } else {
      setContactInfo(null); // Clear contact info if no barangay is selected
      setLoading(false); // Ensure loading is false
    }
  }, [currentBarangay]);

  useEffect(() => {
    if (isOpen) {
      setConfirming(false);
      setSuccess(false);
      setIncidentType("");
      setContactInfo(null);
      setLoading(false); // Ensure loading state resets
    }
  }, [isOpen]);

  const fetchBarangayCaptain = async (barangay: string) => {
    setLoading(true);
    try {
      const contactsRef = collection(db, "Contacts");
      const q = query(
        contactsRef,
        where("Barangay", "==", barangay),
        where("Agency", "==", "Barangay Captain")
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const contact = querySnapshot.docs[0].data();
        setContactInfo({
          Name: contact.Name,
          Number: contact.Number,
          Barangay: contact.Barangay,
        });
      } else {
        setContactInfo(null); // No contact found
      }
    } catch (error) {
      console.error("Error fetching Barangay Captain:", error);
      setContactInfo(null);
    } finally {
      setLoading(false); // Ensure loading ends
    }
  };

  const handleConfirm = async () => {
    if (!contactInfo || !incidentType) return;

    const selectedColor = incidentColors.find((item) => item.type === incidentType)?.color || "Unknown";
    const verificationMessage = `Is this true Barangay Captain ${contactInfo.Name} that this "${message}" needs a fast response here at barangay ${currentBarangay}? Reply "Yes" or "No"`;

    setConfirming(true);

    try {
      await addDoc(collection(db, "sms_verification"), {
        message: verificationMessage,
        messageStatus: "sending",
        number: contactInfo.Number,
        response: "Verifying",
        sms_received_documentId: smsReceivedDocId,
        incidentType,
        colorCode: selectedColor,
        barangay: currentBarangay,
      });

      const smsReceivedRef = doc(db, "sms_received", smsReceivedDocId);
      await updateDoc(smsReceivedRef, {
        incidentType,
        barangay: currentBarangay,
        colorCode: selectedColor,
        status: "Verifying",
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error updating Firestore:", error);
      setConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-1/3">
        {confirming ? (
          <div className="text-center">
            {success ? (
              <p className="text-green-500 font-bold text-lg">Successfully Updated!</p>
            ) : (
              <>
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"></div>
                <p className="mt-2 font-semibold">Confirming...</p>
              </>
            )}
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-4">Confirm Verification</h3>
            {loading ? (
              <p>Loading contact details...</p>
            ) : (
              <>
                <p>
                  <strong>Message to verify:</strong> {message}
                </p>

                <div className="mt-4">
                  <label className="block font-semibold mb-1">Select Barangay:</label>
                  <select
                    value={currentBarangay}
                    onChange={(e) => setCurrentBarangay(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  >
                    {barangays.map((barangay) => (
                      <option key={barangay} value={barangay}>
                        {barangay}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block font-semibold mb-1">Select Incident Type:</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select an incident type</option>
                    {incidentColors.map((incident) => (
                      <option key={incident.type} value={incident.type}>
                        {incident.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <p>
                    <strong>Barangay Captain:</strong>{" "}
                    {contactInfo
                      ? `${contactInfo.Name} (${contactInfo.Number})`
                      : "Not available for the selected barangay"}
                  </p>
                </div>
              </>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                disabled={confirming}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={!contactInfo || loading || !incidentType || confirming}
              >
                Confirm
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmationDialog;
