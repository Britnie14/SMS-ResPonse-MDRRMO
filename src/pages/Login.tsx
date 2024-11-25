import React, { useState } from "react"; 
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Import the initialized Firebase Auth
import { TextField, Button, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"; // Material UI Components

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false); // State for the forgot password dialog
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home"); // Navigate to the Home page after successful login
    } catch (error: any) {
      setError("Invalid email or password");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox."); // Show success message
      setOpenDialog(false); // Close the dialog
    } catch (error: any) {
      setError("Error sending password reset email. Please try again.");
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
        className="bg-white bg-opacity-30 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-sm" // Max width for responsiveness
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1px solid rgba(255, 255, 255, 0.2)", // Optional border for more glass effect
        }}
      >
        {/* Logo Image */}
        <img 
          src="https://i.ibb.co/QfdM6XR/mddrmo.png" 
          alt="Logo" 
          className="mb-6" 
          style={{ width: '100px', height: 'auto' }} // Adjust the size as needed
        />
        <Typography
          component="h1"
          variant="h5"
          className="text-3xl font-bold text-center mb-6"
        >
          Login
        </Typography>
        <form onSubmit={handleLogin} className="space-y-6 w-full">
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="bg-blue-500 hover:bg-blue-600"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
          {/* Forgot Password Text Link */}
          <Typography 
            variant="body2" 
            color="primary" 
            style={{ cursor: "pointer", textDecoration: "underline" }} 
            onClick={() => setOpenDialog(true)}
            align="center"
          >
            Forgot Password?
          </Typography>
        </form>
        <Typography className="mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </Typography>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Enter your email address to receive a password reset link.
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="forgot-email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleForgotPassword} color="primary">
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Login;
