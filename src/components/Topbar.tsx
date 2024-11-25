import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  updateDoc,
  doc,
  onSnapshot,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import { FaUserEdit, FaLock, FaSignOutAlt } from "react-icons/fa";
import { AiOutlineDown, AiOutlineBell } from "react-icons/ai";

const Topbar: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDoc);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.error("No user data found");
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
        } finally {
          setLoading(false);
        }
      }
    };

    // Real-time listener for notifications
    const unsubscribeNotifications = onSnapshot(
      query(
        collection(db, "sms_received"),
        where("notifStatus", "==", "No")
      ),
      (querySnapshot) => {
        const fetchedNotifications = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(fetchedNotifications);
      },
      (error) => {
        console.error("Failed to fetch notifications", error);
      }
    );

    fetchUserData();

    // Clean up real-time listener on unmount
    return () => {
      unsubscribeNotifications();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleNotifDropdown = () => setNotifDropdownOpen(!notifDropdownOpen);

  const markAsRead = async (id: string) => {
    try {
      const notifDoc = doc(db, "sms_received", id);
      await updateDoc(notifDoc, { notifStatus: "Yes" });
      setNotifications(notifications.filter((notification) => notification.id !== id));
    } catch (error) {
      console.error("Failed to update notification", error);
    }
  };

  // Helper function to truncate the message
  const truncateMessage = (message: string, length: number = 100) => {
    if (message.length <= length) return message;
    return message.substring(0, length) + "...";
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-64 right-0 bg-gray-800 text-white p-4 flex items-center justify-between z-50">
        <div className="text-lg font-semibold">Dashboard</div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-64 right-0 bg-gray-800 text-white p-4 flex items-center justify-between z-50">
      <div className="text-lg font-semibold">Dashboard</div>
      {userData && (
        <div className="relative flex items-center space-x-4">
          {/* Notification Icon with Badge */}
          <div className="relative">
            <AiOutlineBell
              size={24}
              className="text-gray-400 cursor-pointer hover:text-white"
              title="Notifications"
              onClick={toggleNotifDropdown}
            />
            {notifications.length > 0 && (
              <span
                className="absolute top-[-15px] right-[-15px] bg-red-600 text-white text-xs font-bold rounded-full px-2 py-1 pointer-events-none"
              >
                {notifications.length}
              </span>
            )}
            {/* Notification Dropdown */}
            {notifDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white text-black border border-gray-300 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-300 font-semibold">
                  Notifications
                </div>
                <ul className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <p>
                        <strong>Barangay:</strong> {notification.barangay || "N/A"}
                      </p>
                      <p>
                        <strong>Incident Type:</strong> {notification.incidentType}
                      </p>
                      <p>
                        <strong>Color Code:</strong> {notification.colorCode}
                      </p>
                      <p>
                        <strong>Time:</strong> {notification.timestamp}
                      </p>
                      <p>
                        <strong>Message:</strong> {truncateMessage(notification.message || "")}
                      </p>
                    </li>
                  ))}
                </ul>
                {notifications.length === 0 && (
                  <div className="p-4 text-center text-gray-500">No new notifications</div>
                )}
              </div>
            )}
          </div>

          {/* User Info */}
          <span>{userData.first_name + " " + userData.last_name}</span>
          <div className="relative">
            <img
              src={userData.profile_image_url}
              alt="Profile"
              className="w-12 h-12 object-cover rounded-full cursor-pointer"
              onClick={toggleDropdown}
            />
            <AiOutlineDown
              size={16}
              className="absolute bottom-0 right-0 mb-1 mr-1 text-gray-400 cursor-pointer"
              onClick={toggleDropdown}
            />
          </div>

          {/* User Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute top-full right-0 mt-2 w-64 bg-white text-black border border-gray-300 rounded-lg shadow-lg z-50"
              style={{ top: "calc(100% + 8px)" }}
            >
              <div className="flex items-center p-4 border-b border-gray-300">
                {userData.profile_image_url && (
                  <img
                    src={userData.profile_image_url}
                    alt="Profile"
                    className="w-12 h-12 object-cover rounded-full mr-4"
                  />
                )}
                <div>
                  <p className="font-semibold">
                    {userData.first_name + " " + userData.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{userData.email}</p>
                </div>
              </div>
              <ul>
                <li>
                  <Link
                    to="/update-user-info"
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <FaUserEdit size={20} className="mr-4" />
                    <span>Update User Info</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/update-password"
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <FaLock size={20} className="mr-4" />
                    <span>Update Password</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 w-full text-left hover:bg-gray-100"
                  >
                    <FaSignOutAlt size={20} className="mr-4" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Topbar;
