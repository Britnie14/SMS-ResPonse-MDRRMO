// src/pages/Contacts.tsx
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig"; // Import your Firestore config
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

const barangays = [
  "Bagacay", "Central", "Cogon", "Dancalan", "Dapdap",
  "Lalud", "Looban", "Mabuhay", "Madlawon", "Poctol",
  "Porog", "Sabang", "Salvacion", "San Antonio", "San Bernardo",
  "San Francisco", "Kapangihan", "San Isidro", "San Jose",
  "San Rafael", "San Roque", "Buhang", "San Vicente", 
  "Santa Barbara", "Sapngan", "Tinampo",
];

const agencies = ["Fire Station", "Police Station", "Rural Health Unit", "Barangay Captain"];

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [agency, setAgency] = useState<string>("");
  const [barangay, setBarangay] = useState<string>("");
  const [editingContact, setEditingContact] = useState<any | null>(null); // State for editing contact

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const contactsCollection = collection(db, "Contacts");
    const contactsSnapshot = await getDocs(contactsCollection);
    const contactsList = contactsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setContacts(contactsList);
  };

  const handleAddOrUpdateContact = async () => {
    if (name && number && agency && barangay) {
      try {
        if (editingContact) {
          // Update existing contact
          const contactRef = doc(db, "Contacts", editingContact.id);
          await updateDoc(contactRef, {
            Name: name,
            Number: number,
            Agency: agency,
            Barangay: barangay,
          });
        } else {
          // Add new contact
          await addDoc(collection(db, "Contacts"), {
            Name: name,
            Number: number,
            Agency: agency,
            Barangay: barangay,
          });
        }

        // Clear input fields
        setName("");
        setNumber("");
        setAgency("");
        setBarangay("");
        setEditingContact(null); // Reset editing state
        fetchContacts(); // Fetch contacts again to update the displayed list
      } catch (error) {
        console.error("Error adding/updating contact: ", error);
      }
    } else {
      alert("Please fill all fields.");
    }
  };

  const handleEditContact = (contact: any) => {
    setEditingContact(contact); // Set the contact to be edited
    setName(contact.Name);
    setNumber(contact.Number);
    setAgency(contact.Agency);
    setBarangay(contact.Barangay);
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteDoc(doc(db, "Contacts", id));
        fetchContacts(); // Fetch contacts again to update the displayed list
      } catch (error) {
        console.error("Error deleting contact: ", error);
      }
    }
  };

  return (
    <div className="p-12">
      <h2 className="text-2xl font-bold mb-4 pt-4">Contacts</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="border p-2 mr-2"
        />
        <select
          value={agency}
          onChange={(e) => setAgency(e.target.value)}
          className="border p-2 mr-2"
        >
          <option value="" disabled>Select Agency</option>
          {agencies.map((agency) => (
            <option key={agency} value={agency}>{agency}</option>
          ))}
        </select>
        <select
          value={barangay}
          onChange={(e) => setBarangay(e.target.value)}
          className="border p-2 mr-2"
        >
          <option value="" disabled>Select Barangay</option>
          {barangays.map((barangay) => (
            <option key={barangay} value={barangay}>{barangay}</option>
          ))}
        </select>
        <button
          onClick={handleAddOrUpdateContact}
          className="bg-blue-500 text-white px-4 py-2"
        >
          {editingContact ? "Update Contact" : "Add Contact"}
        </button>
      </div>

      <h3 className="text-xl mb-2">Contact List</h3>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Number</th>
            <th className="border px-4 py-2">Agency</th>
            <th className="border px-4 py-2">Barangay</th>
            <th className="border px-4 py-2">Actions</th> {/* Actions Column */}
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td className="border px-4 py-2">{contact.Name}</td>
              <td className="border px-4 py-2">{contact.Number}</td>
              <td className="border px-4 py-2">{contact.Agency}</td>
              <td className="border px-4 py-2">{contact.Barangay}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEditContact(contact)}
                  className="bg-yellow-500 text-white px-2 py-1 mr-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Contacts;
