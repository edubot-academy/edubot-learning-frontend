import React, { useState } from "react";

const ProfilePage = () => {
    const [user, setUser] = useState({
        name: "John Doe",
        email: "johndoe@example.com",
        bio: "Passionate learner and tech enthusiast.",
        language: "English",
        notifications: true,
    });

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleInputChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
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

            {/* Profile Info */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                <label className="block text-gray-700">Name</label>
                <input type="text" name="name" value={user.name} onChange={handleInputChange} className="w-full p-2 border rounded-lg mb-4" />

                <label className="block text-gray-700">Email</label>
                <input type="email" name="email" value={user.email} disabled className="w-full p-2 border rounded-lg mb-4 bg-gray-200 cursor-not-allowed" />

                <label className="block text-gray-700">Bio</label>
                <textarea name="bio" value={user.bio} onChange={handleInputChange} className="w-full p-2 border rounded-lg mb-4"></textarea>
            </div>

            {/* Change Password */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange}>
                    <label className="block text-gray-700">New Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded-lg mb-4" required />

                    <label className="block text-gray-700">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded-lg mb-4" required />

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                        Update Password
                    </button>
                </form>
            </div>

            {/* Preferences */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">Preferences</h2>
                <label className="block text-gray-700">Language</label>
                <select name="language" value={user.language} onChange={handleInputChange} className="w-full p-2 border rounded-lg mb-4">
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                </select>

                <label className="flex items-center space-x-2 text-gray-700">
                    <input type="checkbox" checked={user.notifications} onChange={() => setUser({ ...user, notifications: !user.notifications })} />
                    <span>Enable Notifications</span>
                </label>
            </div>

            {/* Payment History */}
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
