import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  DialogContent,
  Typography,
} from '@mui/material';
import { db } from '../../firebaseConfig'; // Adjust the path to your firebase config
import { collection, getDocs, query, where, doc, updateDoc, setDoc } from 'firebase/firestore'; // Import necessary Firestore functions

interface Contact {
  id: string;
  name: string;
  phone: string;
  barangay: string; // Assuming you have a barangay field
  agency: string; // Include agency field to filter contacts
}

interface RespondDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (contact: Contact) => void;
  message: string; // Added
  barangay: string; // Added
  incidentType: string | null; // Added
  timestamp: number; // Added
  messageId: string; // Ensure messageId is always a string
}

const RespondDialog: React.FC<RespondDialogProps> = ({
  open,
  onClose,
  onSelect,
  message,
  barangay,
  incidentType,
  timestamp,
  messageId,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // State to track loading status
  const [selectedContact, setSelectedContact] = useState<string>(''); // State to track selected contact

  // Fetch Contacts from Firestore
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const contactsRef = collection(db, 'Contacts');
        const q = query(contactsRef, where('Agency', '!=', 'Barangay Captain')); // Exclude Barangay Captain
        const snapshot = await getDocs(q);

        const contactsData: Contact[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().Name,
          phone: doc.data().Number,
          barangay: doc.data().Barangay,
          agency: doc.data().Agency, // Include agency in the fetched data
        }));

        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleConfirm = async () => {
    const contact = contacts.find((c) => c.id === selectedContact); // Find the selected contact by ID
    if (contact) {
      onSelect(contact); // Pass the selected contact to the parent

      // Prepare the message string
      const messageString = `Hello ${contact.name}, there is an accident of type ${incidentType}"${message}. Please respond to emergency.`;
      
      // Create a new document in the 'sms_response_sent' collection
      const responseRef = doc(collection(db, 'sms_verification')); // Create a new document reference
      await setDoc(responseRef, {
        number: contact.phone, // Include the selected contact's phone number
        sms_received_documentId: "FJEFGXRngbVQs9LqeqTg",
        message: messageString,
        messageStatus: "waiting",
        response: "waiting",
        
      });

      // Update response in Firestore for the original message
      const responseRefOriginal = doc(db, 'sms_received', messageId);
      await updateDoc(responseRefOriginal, {
        response: `Response sent to ${contact.agency}`,
      });
    }
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select a Contact to Respond</DialogTitle>
      <DialogContent>
        {/* Display message details */}
        <Typography variant="h6" gutterBottom>
          Message Details
        </Typography>
        <Typography variant="body1"><strong>Message:</strong> {message}</Typography>
        <Typography variant="body1"><strong>Barangay:</strong> {barangay}</Typography>
        <Typography variant="body1"><strong>Incident Type:</strong> {incidentType || 'N/A'}</Typography>
        <Typography variant="body1"><strong>Timestamp:</strong> {new Date(timestamp).toLocaleString()}</Typography>
        
        {/* Contacts selection */}
        {loading ? (
          <div>Loading contacts...</div> // Show loading message
        ) : (
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="contact-select-label">Select Contact</InputLabel>
            <Select
              labelId="contact-select-label"
              value={selectedContact}
              onChange={(e) => setSelectedContact(e.target.value)}
              label="Select Contact"
            >
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <MenuItem key={contact.id} value={contact.id}>
                    {contact.name} - {contact.phone}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No contacts available.</MenuItem>
              )}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" disabled={!selectedContact}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RespondDialog;
