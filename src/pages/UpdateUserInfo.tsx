import React, { useEffect, useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebaseConfig";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useNavigate } from "react-router-dom";

// Define an interface to type the user data
interface UserData {
  address: string;
  birthday: string;
  email: string;
  first_name: string;
  gender: string;
  last_name: string;
  phone_number: string;
  profile_image_url: string;
}

const UpdateUserInfo: React.FC = () => {
  const [formValues, setFormValues] = useState<UserData>({
    address: "",
    birthday: "",
    email: "",
    first_name: "",
    gender: "",
    last_name: "",
    phone_number: "",
    profile_image_url: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserData;
            setFormValues(data);
          } else {
            console.error("No user data found");
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = event.target;
    setFormValues((prevValues) => ({ ...prevValues, [id]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateUserInfo = async (event: React.FormEvent) => {
    event.preventDefault();
    const user = auth.currentUser;

    if (user) {
      if (selectedFile) {
        setUploading(true);
        const storageRef = ref(storage, `profile_images/${user.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on(
          "state_changed",
          // Optionally handle progress here
          () => {},
          () => {
            // Handle upload error
            setError("Failed to upload image");
            setUploading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            try {
              await updateDoc(doc(db, "users", user.uid), {
                ...formValues,
                profile_image_url: downloadURL,
              });
              setSuccess("User information updated successfully");
              setError(null);
              navigate("/home"); // Navigate to home page
            } catch (error) {
              setError("Failed to update user information");
            } finally {
              setUploading(false);
            }
          }
        );
      } else {
        try {
          const userDoc = doc(db, "users", user.uid);
          await updateDoc(userDoc, { ...formValues });
          setSuccess("User information updated successfully");
          setError(null);
          navigate("/home"); // Navigate to home page
        } catch (error) {
          setError("Failed to update user information");
          setSuccess(null);
        }
      }
    } else {
      setError("User not logged in");
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-100 mt-16 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Update User Info</h1>
      <form
        onSubmit={handleUpdateUserInfo}
        className="space-y-4 max-w-lg mx-auto"
      >
        {/* First Name */}
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            value={formValues.first_name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            value={formValues.last_name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formValues.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone_number"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="text"
            id="phone_number"
            value={formValues.phone_number}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Address */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <input
            type="text"
            id="address"
            value={formValues.address}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Birthday */}
        <div>
          <label
            htmlFor="birthday"
            className="block text-sm font-medium text-gray-700"
          >
            Birthday
          </label>
          <input
            type="date"
            id="birthday"
            value={formValues.birthday}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Gender */}
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Gender
          </label>
          <select
            id="gender"
            value={formValues.gender}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* File Input for Profile Image */}
        <div>
          <label
            htmlFor="profile_image"
            className="block text-sm font-medium text-gray-700"
          >
            Profile Image
          </label>
          <input
            type="file"
            id="profile_image"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div>
            <p className="text-sm text-gray-600">Image Preview:</p>
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-full"
            />
          </div>
        )}

        {/* Update Button */}
        <button
          type="submit"
          className={`px-4 py-2 text-white rounded-md ${
            uploading ? "bg-gray-400" : "bg-blue-500"
          }`}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Update Info"}
        </button>

        {/* Error and Success Messages */}
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </form>
    </div>
  );
};

export default UpdateUserInfo;
