import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateUserProfile, fetchUserProfile } from '../services/api';

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const errorShown = useRef(false);

    const [formData, setFormData] = useState({ fullName: '', avatar: null });
    const [preview, setPreview] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

    useEffect(() => {
        if (!user) return navigate("/login");

        const loadProfile = async () => {
            try {
                const response = await fetchUserProfile();
                const data = response.data;
                setFormData({
                    fullName: data.fullName || '',
                    avatar: null,
                });
                setInitialData({
                    fullName: data.fullName || '',
                    avatar: null,
                });
                if (data.avatar) setPreview(data.avatar);
                setUser(data);
            } catch {
                if (!errorShown.current) {
                    errorShown.current = true;
                    toast.error("Профилди жүктөө мүмкүн болбоду");
                }
            }
        };

        loadProfile();
    }, []);

    useEffect(() => {
        if (formData.avatar) {
            const objectUrl = URL.createObjectURL(formData.avatar);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [formData.avatar]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files && files.length > 0) {
            setFormData((prev) => ({ ...prev, avatar: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (passwordData.newPassword.length > 0 && passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Купуя сөздөр дал келбейт");
            return;
        }

        try {
            const form = new FormData();
            form.append('fullName', formData.fullName);
            if (formData.avatar) form.append('avatar', formData.avatar);
            if (passwordData.newPassword.length >= 6) {
                form.append('password', passwordData.newPassword);
            } else if (passwordData.newPassword.length > 0) {
                toast.error("Купуя сөз эң аз дегенде 6 белгиден турушу керек");
                return;
            }

            const updated = await updateUserProfile(user.id, form);
            setUser(updated);
            toast.success("Профиль ийгиликтүү жаңыртылды");
            setIsEditing(false);
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error("Профилди жаңыртуу мүмкүн болбоду");
        }
    };

    const isFormChanged = initialData && (
        initialData.fullName !== formData.fullName.trim() ||
        (formData.avatar && formData.avatar instanceof File) ||
        (passwordData.newPassword.length >= 6 && passwordData.newPassword === passwordData.confirmPassword)
    );

    return (
        <div className="pt-24 max-w-4xl mx-auto p-6 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center">Профиль</h1>

            <div className="bg-white p-6 shadow rounded-lg">
                <div className="flex items-center gap-6 mb-4">
                    {(preview || user?.avatar) ? (
                        <img
                            src={preview || user.avatar}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
                            {formData.fullName ? formData.fullName.charAt(0) : user?.fullName?.charAt(0)}
                        </div>
                    )}

                    {isEditing && (
                        <div>
                            <label className="text-sm text-gray-600">Аватарды өзгөртүү</label>
                            <input type="file" accept="image/*" name="avatar" onChange={handleChange} className="border border-blue-600 rounded px-2 py-1" />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {!isEditing ? (
                        <>
                            <p><strong>Толук аты:</strong> {formData.fullName}</p>
                            <p><strong>Email:</strong> {user?.email}</p>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="text-gray-600">Толук аты</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName || ''}
                                    onChange={handleChange}
                                    className="w-full border border-blue-600 p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="text-gray-600">Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full border border-blue-600 p-2 rounded bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="text-gray-600">Жаңы купуя сөз</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-blue-600 p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="text-gray-600">Купуя сөздү кайталаңыз</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-blue-600 p-2 rounded"
                                />
                            </div>
                        </>
                    )}

                    {isEditing && (
                        <div className="flex flex-wrap gap-4 mt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={!isFormChanged}
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >Сактоо</button>
                            <button
                                onClick={() => {
                                    setFormData(initialData);
                                    setPasswordData({ newPassword: '', confirmPassword: '' });
                                    setIsEditing(false);
                                }}
                                className="bg-gray-300 text-black px-6 py-2 rounded"
                            >Жокко чыгаруу</button>
                        </div>
                    )}

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        >Өзгөртүү</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
