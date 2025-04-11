import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const [userData, setUserData] = useState(user || {});
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login"); // Redirect if user is not logged in
        }
    }, [user, navigate]);

    const handleInputChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        alert("Password changed successfully!");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-24 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-center">Profile & Settings</h1>
            {user && user.role === "instructor" && (
                <Link to="/instructor" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Go to Instructor Dashboard
                </Link>
            )}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
                    Profile Information
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-blue-600 hover:underline"
                    >
                        {isEditing ? "Cancel" : "Edit"}
                    </button>
                </h2>
                {isEditing ? (
                    <>
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={userData.fullName || ""}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg mb-4"
                        />
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email || ""}
                            disabled
                            className="w-full p-2 border rounded-lg mb-4 bg-gray-200 cursor-not-allowed"
                        />
                    </>
                ) : (
                    <>
                        <p className="text-gray-700 mb-2"><strong>Name:</strong> {userData.fullName || "N/A"}</p>
                        <p className="text-gray-700 mb-2"><strong>Email:</strong> {userData.email || "N/A"}</p>
                    </>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">Security & Preferences</h2>
                <p className="text-gray-700 mb-4">You can update your password and language preferences below.</p>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-600 hover:underline"
                >
                    {isEditing ? "Cancel" : "Edit Settings"}
                </button>
                {isEditing ? (
                    <>
                        <h3 className="text-xl font-semibold mt-4">Change Password</h3>
                        <form onSubmit={handlePasswordChange}>
                            <label className="block text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded-lg mb-4"
                                required
                            />
                            <label className="block text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border rounded-lg mb-4"
                                required
                            />
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                                Update Password
                            </button>
                        </form>

                        <h3 className="text-xl font-semibold mt-6">Language Preferences</h3>
                        <label className="block text-gray-700">Language</label>
                        <select
                            name="language"
                            value={userData.language || "English"}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg mb-4"
                        >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                        </select>
                    </>
                ) : (
                    <>
                        <p className="text-gray-700 mb-2"><strong>Language:</strong> {userData.language || "English"}</p>
                    </>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Payment History</h2>
                <ul className="list-disc pl-5 text-gray-700">
                    <li>Web Development Course - $19.99 (Completed)</li>
                    <li>Data Science Bootcamp - $29.99 (In Progress)</li>
                </ul>
            </div>
        </div>
    );
};

export default ProfilePage;
