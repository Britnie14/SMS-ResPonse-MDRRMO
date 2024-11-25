import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebaseConfig"; // Import the initialized Firebase Auth, Firestore, and Storage
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Box, Button, Typography } from "@mui/material";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("Bulusan, Sorsogon");
  const [birthday, setBirthday] = useState("2001-07-23");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("09");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    try {
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      let profileImageUrl = "";
      if (profileImage) {
        // Upload profile image to Firebase Storage
        const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
        const uploadTask = uploadBytesResumable(storageRef, profileImage);
  
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => {
              console.error(error);
              reject();
            },
            async () => {
              profileImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              setProfileImageUrl(profileImageUrl); // Set the image URL state
              resolve();
            }
          );
        });
      }
  
      // Store user information in Firestore 'users' collection
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        address,
        birthday,
        gender,
        phone_number: phoneNumber,
        profile_image_url: profileImageUrl,
      });
  
      // Redirect to home page after successful signup, passing necessary user info via state
      navigate("/home", { state: { user } }); // Pass the user object to the home page
    } catch (error: any) {
      setError("Failed to sign up. Please check your details.");
      console.error(error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setProfileImage(file);

      // Preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh", // Full height of the viewport
        overflow: "hidden", // Hide overflow to ensure the image fits
        backgroundImage: "url('https://i.ibb.co/xsDGfmp/159819834-4159483757419889-9111704459298329734-n.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center", // Center vertically
        justifyContent: "center", // Center horizontally
        margin: 0, // Remove default margin
        padding: 0, // Remove default padding
      }}
    >
      <Box
        className="bg-white bg-opacity-30 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-sm"
        sx={{
          maxHeight: "90vh", // Maximum height for the card
          overflowY: "auto", // Enable vertical scrolling
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1px solid rgba(255, 255, 255, 0.2)", // Optional border for more glass effect
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          className="text-3xl font-bold text-center mb-6"
        >
          Sign Up
        </Typography>
       
        <form onSubmit={handleSignup} className="space-y-6 w-full">
          {/* Form Fields */}
          <div>
            <label htmlFor="firstName" className="block text-gray-700 font-semibold">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-gray-700 font-semibold">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="profileImage" className="block text-gray-700 font-semibold">
              Profile Image
            </label>
            <input
              type="file"
              id="profileImage"
              className="w-full mt-2"
              onChange={handleImageChange}
            />
            {profileImageUrl && (
              <div className="mt-4">
                <img
                  src={profileImageUrl}
                  alt="Profile Preview"
                  className="w-32 h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="address" className="block text-gray-700 font-semibold">
              Address
            </label>
            <input
              type="text"
              id="address"
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="birthday" className="block text-gray-700 font-semibold">
              Birthday
            </label>
            <input
              type="date"
              id="birthday"
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-gray-700 font-semibold">
              Gender
            </label>
            <select
              id="gender"
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 font-semibold">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          {error && (
            <Typography className="text-red-500 text-center">
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" className="w-full">
            Sign Up
          </Button>
        </form>
      </Box>
    </div>
  );
};

export default Signup;
