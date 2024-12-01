import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import moment from "moment";


interface IncidentReport {
  id: string;
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

const GenerateReports: React.FC = () => {
  const [reports, setReports] = useState<IncidentReport[]>([]);

  useEffect(() => {
    const fetchIncidentReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "incidentReports"));
        const reportsData: IncidentReport[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          cause: doc.data().cause || "",
          dateTime: doc.data().dateTime || "",
          identityOfCasualties: doc.data().identityOfCasualties || "",
          images: doc.data().images || [],
          location: doc.data().location || "",
          numberOfCasualties: doc.data().numberOfCasualties || 0,
          numberOfDisplacedPersons: doc.data().numberOfDisplacedPersons || 0,
          resourcesDeployed: doc.data().resourcesDeployed || "",
          respondingAgencies: doc.data().respondingAgencies || "",
        }));
        setReports(reportsData);
      } catch (error) {
        console.error("Error fetching incident reports: ", error);
      }
    };

    fetchIncidentReports();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "incidentReports", id));
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== id)
      );
      console.log(`Document with id ${id} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const downloadAsWord = (report: IncidentReport) => {
    const formattedDate = moment(report.dateTime).format("MMMM-DD-YYYY hh:mm A"); // Format date
  
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
                  text: `${formattedDate}`, // Use formatted date here
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Location: `,
                  bold: true,
                  font: "Calibri",
                }),
                new TextRun({
                  text: `${report.location}`,
                  font: "Calibri",
                }),
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
  
    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(blob, `IncidentReport_${report.id}.docx`);
      })
      .catch((error) => {
        console.error("Error saving document:", error);
      });
  };
  

  return (
    <div className="flex-1 p-6 bg-gray-100 min-h-screen mt-16">
      <h1 className="text-3xl font-bold mb-4">File Reports</h1>
      <Link to="/create-report">
        <button className="mb-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Add Report
        </button>
      </Link>

      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="p-4 bg-white rounded-lg shadow">
              {report.images.length > 0 ? (
                <img
                  src={report.images[0]}
                  alt="Incident"
                  className="w-full h-40 object-cover rounded mb-4"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded mb-4 flex items-center justify-center">
                  <p>No image available</p>
                </div>
              )}
              <h2 className="text-2xl font-bold mb-2">{report.cause}</h2>
              <p className="mb-1">
                <strong>Location:</strong> {report.location}
              </p>
              <p className="mb-4">
                <strong>Date and Time:</strong> {report.dateTime}
              </p>
              <div className="flex space-x-2">
                <Link to={`/incident/${report.id}`}>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    View Full Details
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <FaTrashAlt />
                </button>
                <button
                  onClick={() => downloadAsWord(report)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Download as Word
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No reports available.</p>
      )}
    </div>
  );
};

export default GenerateReports;
