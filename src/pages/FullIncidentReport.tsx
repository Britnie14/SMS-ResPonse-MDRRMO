import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

interface IncidentReport {
  cause: string;
  dateTime: string;
  identityOfCasualties: string;
  images: string[];
  location: string;
  numberOfCasualties: number;
  numberOfDisplacedPersons: number;
  resourcesDeployed: string;
  respondingAgencies: string;
}

const FullIncidentReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");

  useEffect(() => {
    const fetchIncidentReport = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "incidentReports", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as IncidentReport;
          setReport(data);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching incident report: ", error);
      }
    };

    fetchIncidentReport();
  }, [id]);

  const downloadAsWord = async () => {
    if (!report) return;

    setIsProcessing(true);
    setModalMessage("Preparing the document...");

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Incident Report Details",
                  bold: true,
                  size: 28, // Font size (14pt)
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Cause: `, bold: true, font: "Calibri" }),
                new TextRun({ text: `${report.cause}`, font: "Calibri" }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Date and Time: `,
                  bold: true,
                  font: "Calibri",
                }),
                new TextRun({
                  text: `${moment(report.dateTime).format("MMMM-DD-YYYY hh:mm A")}`,
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Location: `, bold: true, font: "Calibri" }),
                new TextRun({ text: `${report.location}`, font: "Calibri" }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Identity of Casualties: `,
                  bold: true,
                  font: "Calibri",
                }),
                new TextRun({
                  text: `${report.identityOfCasualties}`,
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Number of Casualties: `,
                  bold: true,
                  font: "Calibri",
                }),
                new TextRun({
                  text: `${report.numberOfCasualties}`,
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Number of Displaced Persons: `,
                  bold: true,
                  font: "Calibri",
                }),
                new TextRun({
                  text: `${report.numberOfDisplacedPersons}`,
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Resources Deployed: `,
                  bold: true,
                  font: "Calibri",
                }),
                new TextRun({
                  text: `${report.resourcesDeployed}`,
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Responding Agencies: `,
                  bold: true,
                  font: "Calibri",
                }),
                new TextRun({
                  text: `${report.respondingAgencies}`,
                  font: "Calibri",
                }),
              ],
            }),
          ],
        },
      ],
    });

    setModalMessage("Finalizing the document...");
    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(blob, `IncidentReport_${id}.docx`);
        setIsProcessing(false);
        setModalMessage("Document is ready.");
      })
      .catch((error) => {
        console.error("Error saving document:", error);
        setIsProcessing(false);
        setModalMessage("An error occurred.");
      });
  };

  const handleBackButton = () => {
    navigate(-1);
  };

  const handleEditButton = () => {
    navigate(`/edit-incident/${id}`);
  };

  if (!report) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex-1 p-6 bg-gray-100 min-h-screen mt-16">
      <h1 className="text-3xl font-bold mb-4">Incident Report Details</h1>
      <button
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        onClick={handleBackButton}
      >
        Back
      </button>
      <button
        className="mb-4 ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleEditButton}
      >
        Edit
      </button>
      <button
        className="mb-4 ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={downloadAsWord}
      >
        Download as Word
      </button>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-2">{report.cause}</h2>
        <p>
          <strong>Date and Time:</strong>{" "}
          {moment(report.dateTime).format("MMMM-DD-YYYY hh:mm A")}
        </p>
        <p>
          <strong>Location:</strong> {report.location}
        </p>
        <p>
          <strong>Identity of Casualties:</strong> {report.identityOfCasualties}
        </p>
        <p>
          <strong>Number of Casualties:</strong> {report.numberOfCasualties}
        </p>
        <p>
          <strong>Number of Displaced Persons:</strong>{" "}
          {report.numberOfDisplacedPersons}
        </p>
        <p>
          <strong>Resources Deployed:</strong> {report.resourcesDeployed}
        </p>
        <p>
          <strong>Responding Agencies:</strong> {report.respondingAgencies}
        </p>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Processing</h2>
            <p>{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullIncidentReport;
