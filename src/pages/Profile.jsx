import { useEffect, useState, useContext, useRef, useMemo, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    updateUserProfile,
    fetchUserProfile,
    fetchInstructorProfile,
    updateInstructorProfile,
} from '@services/api';
import PhoneInput from '@shared/ui/forms/PhoneInput';
import Loader from '@shared/ui/Loader';

const SOCIAL_LINK_FIELDS = ['website', 'twitter', 'linkedin', 'instagram', 'youtube', 'facebook'];
const SOCIAL_LABELS = {
    website: 'Сайт / Портфолио',
    twitter: 'Twitter / X',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    youtube: 'YouTube',
    facebook: 'Facebook',
};

const createEmptyInstructorProfile = () => ({
    title: '',
    bio: '',
    yearsOfExperience: '',
    numberOfStudents: '',
    expertiseTagsText: '',
    socialLinks: SOCIAL_LINK_FIELDS.reduce((acc, key) => {
        acc[key] = '';
        return acc;
    }, {}),
    courses: [],
});

const cloneInstructorProfileState = (profile) => ({
    ...profile,
    socialLinks: { ...(profile?.socialLinks || {}) },
    courses: Array.isArray(profile?.courses) ? [...profile.courses] : [],
});

const toInputValue = (value) => (value === undefined || value === null ? '' : String(value));

const normalizeInstructorProfileState = (data = {}) => {
    const base = createEmptyInstructorProfile();
    base.title = data.title || '';
    base.bio = data.bio || '';
    base.yearsOfExperience = toInputValue(data.yearsOfExperience);
    base.numberOfStudents = toInputValue(data.numberOfStudents);
    base.expertiseTagsText = Array.isArray(data.expertiseTags) ? data.expertiseTags.join(', ') : '';
    base.courses = Array.isArray(data.courses) ? data.courses : [];
    SOCIAL_LINK_FIELDS.forEach((key) => {
        base.socialLinks[key] = data.socialLinks?.[key] || '';
    });
    return base;
};

const getEmptyInstructorState = () => cloneInstructorProfileState(createEmptyInstructorProfile());

const mapProfileForCompare = (profile) => ({
    title: (profile.title || '').trim(),
    bio: (profile.bio || '').trim(),
    yearsOfExperience: profile.yearsOfExperience === '' ? '' : Number(profile.yearsOfExperience),
    numberOfStudents: profile.numberOfStudents === '' ? '' : Number(profile.numberOfStudents),
    expertiseTags: (profile.expertiseTagsText || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    socialLinks: SOCIAL_LINK_FIELDS.reduce((acc, key) => {
        acc[key] = (profile.socialLinks?.[key] || '').trim();
        return acc;
    }, {}),
});

const parseNumberValue = (value) => {
    if (value === '' || value === undefined || value === null) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
};

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const errorShown = useRef(false);

    const [formData, setFormData] = useState({
        fullName: '',
        avatar: null,
        email: '',
        phoneNumber: '',
    });
    const [preview, setPreview] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [instructorProfile, setInstructorProfile] = useState(getEmptyInstructorState);
    const [instructorProfileInitial, setInstructorProfileInitial] =
        useState(getEmptyInstructorState);
    const [loadingInstructorProfile, setLoadingInstructorProfile] = useState(false);
    const [savingInstructorProfile, setSavingInstructorProfile] = useState(false);
    const [loadedUserId, setLoadedUserId] = useState(null);
    const [isInstructorEditing, setIsInstructorEditing] = useState(false);
    const isInstructor = user?.role === 'instructor';

    const applyInstructorProfileState = useCallback(
        (data) => {
            const normalized = cloneInstructorProfileState(normalizeInstructorProfileState(data));
            setInstructorProfile(normalized);
            setInstructorProfileInitial(cloneInstructorProfileState(normalized));
            setIsInstructorEditing(false);
        },
        [setInstructorProfile, setInstructorProfileInitial]
    );

    const loadInstructorProfileData = useCallback(
        async (instructorId) => {
            if (!instructorId) return;
            setLoadingInstructorProfile(true);
            try {
                const data = await fetchInstructorProfile(instructorId);
                applyInstructorProfileState(data);
            } catch (error) {
                console.error('Failed to load instructor profile', error);
                toast.error('Инструктор профилин жүктөө мүмкүн болбоду');
            } finally {
                setLoadingInstructorProfile(false);
            }
        },
        [applyInstructorProfileState]
    );

    const handleInstructorProfileChange = (field, value) => {
        setInstructorProfile((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSocialLinkChange = (field, value) => {
        setInstructorProfile((prev) => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [field]: value,
            },
        }));
    };

    const handleInstructorProfileReset = () => {
        setInstructorProfile(cloneInstructorProfileState(instructorProfileInitial));
        setIsInstructorEditing(false);
    };

    const handleInstructorProfileSubmit = async () => {
        if (!user) return;
        setSavingInstructorProfile(true);
        const expertiseTags = (instructorProfile.expertiseTagsText || '')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);
        const socialLinksPayload = SOCIAL_LINK_FIELDS.reduce((acc, key) => {
            const value = (instructorProfile.socialLinks?.[key] || '').trim();
            if (value) acc[key] = value;
            return acc;
        }, {});

        const payload = {
            title: instructorProfile.title?.trim() || null,
            bio: instructorProfile.bio?.trim() || null,
            yearsOfExperience: parseNumberValue(instructorProfile.yearsOfExperience),
            numberOfStudents: parseNumberValue(instructorProfile.numberOfStudents),
            expertiseTags,
        };

        if (Object.keys(socialLinksPayload).length > 0) {
            payload.socialLinks = socialLinksPayload;
        }

        try {
            const updatedProfile = await updateInstructorProfile(user.id, payload);
            applyInstructorProfileState(updatedProfile);
            setIsInstructorEditing(false);
            toast.success('Инструктор маалыматы сакталды');
        } catch (error) {
            console.error('Failed to save instructor profile', error);
            const message =
                error.response?.data?.message ||
                error.message ||
                'Инструктор маалыматын сактоо мүмкүн болбоду';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setSavingInstructorProfile(false);
        }
    };

    const isInstructorProfileChanged = useMemo(
        () =>
            JSON.stringify(mapProfileForCompare(instructorProfile)) !==
            JSON.stringify(mapProfileForCompare(instructorProfileInitial)),
        [instructorProfile, instructorProfileInitial]
    );

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (loadedUserId === user.id) return;

        const loadProfile = async () => {
            try {
                const response = await fetchUserProfile();
                const data = response.data;
                setFormData({
                    fullName: data.fullName || '',
                    avatar: null,
                    email: data.email || '',
                    phoneNumber: data.phoneNumber || '',
                });
                setInitialData({
                    fullName: data.fullName || '',
                    avatar: null,
                    email: data.email || '',
                    phoneNumber: data.phoneNumber || '',
                });
                if (data.avatar) setPreview(data.avatar);
                setUser(data);

                if (data.role === 'instructor') {
                    await loadInstructorProfileData(data.id);
                } else {
                    applyInstructorProfileState(createEmptyInstructorProfile());
                }
                setLoadedUserId(data.id);
            } catch {
                if (!errorShown.current) {
                    errorShown.current = true;
                    toast.error('Профилди жүктөө мүмкүн болбоду');
                }
            }
        };

        loadProfile();
    }, [
        applyInstructorProfileState,
        loadInstructorProfileData,
        navigate,
        setUser,
        user,
        loadedUserId,
    ]);

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

    const handlePhoneChange = (value) => {
        setFormData((prev) => ({ ...prev, phoneNumber: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (
            passwordData.newPassword.length > 0 &&
            passwordData.newPassword !== passwordData.confirmPassword
        ) {
            toast.error('Купуя сөздөр дал келбейт');
            return;
        }

        try {
            const form = new FormData();
            form.append('fullName', formData.fullName);
            if (formData.phoneNumber) form.append('phoneNumber', formData.phoneNumber);
            if (formData.avatar) form.append('avatar', formData.avatar);
            if (passwordData.newPassword.length >= 6) {
                form.append('password', passwordData.newPassword);
            } else if (passwordData.newPassword.length > 0) {
                toast.error('Купуя сөз эң аз дегенде 6 белгиден турушу керек');
                return;
            }

            if (formData.phoneNumber) {
                const digitsOnly = formData.phoneNumber.replace(/\D/g, '');
                if (digitsOnly.length < 10) {
                    toast.error('Тел номер кеминде 10 цифра болушу керек.');
                    return;
                }

                if (!/^\+\d{10,15}$/.test(formData.phoneNumber)) {
                    toast.error(
                        'Телефон номери эл аралык форматта болсун. Мисалы: +996700123456 же +14155552671'
                    );
                    return;
                }
            }

            const updated = await updateUserProfile(user.id, form);
            setUser(updated.data.user);
            toast.success('Профиль ийгиликтүү жаңыртылды');
            setIsEditing(false);
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error(err);
            toast.error('Профилди жаңыртуу мүмкүн болбоду');
        }
    };

    const isFormChanged =
        initialData &&
        (initialData.fullName !== formData.fullName.trim() ||
            initialData.phoneNumber !== formData.phoneNumber.trim() ||
            (formData.avatar && formData.avatar instanceof File) ||
            (passwordData.newPassword.length >= 6 &&
                passwordData.newPassword === passwordData.confirmPassword));

    const expertiseTagsList = (instructorProfile.expertiseTagsText || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

    const socialLinkEntries = SOCIAL_LINK_FIELDS.map((field) => ({
        key: field,
        label: SOCIAL_LABELS[field],
        value: instructorProfile.socialLinks[field],
    })).filter(({ value }) => value);

    return (
        <div className="pt-24 max-w-4xl mx-auto p-6 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center">Профиль</h1>

            <div className="bg-white dark:bg-[#141619] p-6 shadow rounded-lg">
                <div className="flex items-center gap-6 mb-4">
                    {preview || user?.avatar ? (
                        <img
                            src={preview || user.avatar}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover"
                            decoding="async"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white dark:text-black">
                            {formData.fullName
                                ? formData.fullName.charAt(0)
                                : user?.fullName?.charAt(0)}
                        </div>
                    )}

                    {isEditing && (
                        <div>
                            <label className="text-sm text-gray-600 dark:text-[#a6adba]">Аватарды өзгөртүү</label>
                            <input
                                type="file"
                                accept="image/*"
                                name="avatar"
                                onChange={handleChange}
                                className="border border-blue-600 rounded px-2 py-1"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {!isEditing ? (
                        <>
                            <p>
                                <strong>Толук аты:</strong> {formData.fullName}
                            </p>
                            <p>
                                <strong>Email:</strong> {formData.email}
                            </p>
                            <p>
                                <strong>Телефон:</strong> {formData.phoneNumber || '—'}
                            </p>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="text-gray-600 dark:text-[#a6adba]">Толук аты</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName || ''}
                                    onChange={handleChange}
                                    className="w-full border border-blue-600 p-2 rounded text-black dark:text-white bg-white dark:bg-[#222222]"
                                />
                            </div>
                            <div>
                                <label className="text-gray-600 dark:text-[#a6adba]">Email</label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    disabled
                                    className="w-full border border-blue-600 p-2 rounded bg-gray-100 text-black dark:text-white bg-white dark:bg-[#222222]"
                                />
                            </div>
                            <div>
                                <label className="text-gray-600 dark:text-[#a6adba]">
                                    Телефон номери{' '}
                                    <span className="text-sm text-gray-500 dark:text-[#a6adba]">(милдеттүү эмес)</span>
                                </label>
                                <PhoneInput
                                    value={formData.phoneNumber}
                                    onChange={handlePhoneChange}
                                    className="border-blue-600"
                                />
                            </div>
                            <div>
                                <label className="text-gray-600 dark:text-[#a6adba]">Жаңы купуя сөз</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-blue-600 p-2 rounded text-black dark:text-white bg-white dark:bg-[#222222]"
                                />
                            </div>
                            <div>
                                <label className="text-gray-600 dark:text-[#a6adba]">Купуя сөздү кайталаңыз</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-blue-600 p-2 rounded text-black dark:text-white bg-white dark:bg-[#222222]"
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
                            >
                                Сактоо
                            </button>
                            <button
                                onClick={() => {
                                    setFormData(initialData);
                                    setPasswordData({ newPassword: '', confirmPassword: '' });
                                    setIsEditing(false);
                                }}
                                className="bg-gray-300 text-black px-6 py-2 rounded"
                            >
                                Жокко чыгаруу
                            </button>
                        </div>
                    )}

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        >
                            Өзгөртүү
                        </button>
                    )}
                </div>
            </div>

            {isInstructor && (
                <div className="bg-white dark:bg-[#141619] p-6 shadow rounded-lg mt-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold">Инструктор маалыматы</h2>
                            <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                                Курсту сатып ала турган студенттер үчүн тажрыйбаңыз жана социалдык
                                тармактар тууралуу айтып бериңиз.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {loadingInstructorProfile && (
                                <Loader fullScreen={false} />
                            )}
                            {!isInstructorEditing ? (
                                <button
                                    onClick={() => setIsInstructorEditing(true)}
                                    className="px-4 py-2 border border-edubot-dark text-edubot-dark dark:text-blue-700 dark:border-blue-700 rounded"
                                >
                                    Өзгөртүү
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {!isInstructorEditing ? (
                        <div className="space-y-5">
                            <div>
                                <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">Био / Өзүм жөнүндө</p>
                                <p className="text-gray-800 dark:text-white whitespace-pre-line">
                                    {instructorProfile.bio?.trim() || 'Маалымат кошула элек'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <p className="text-xs uppercase text-gray-500 dark:text-[#a6adba] tracking-wide">
                                        Тажрыйба (жыл)
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                        {instructorProfile.yearsOfExperience || '—'}
                                    </p>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <p className="text-xs uppercase text-gray-500 dark:text-[#a6adba] tracking-wide">
                                        Студенттердин саны
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                        {instructorProfile.numberOfStudents || '—'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">Экспертиза</p>
                                {expertiseTagsList.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {expertiseTagsList.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs bg-[#F3F4F6] text-[#111827] px-2 py-1 rounded-full"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-[#a6adba] text-sm">Экспертиза кошула элек</p>
                                )}
                            </div>

                            <div>
                                <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">
                                    Социалдык тармактар
                                </p>
                                {socialLinkEntries.length ? (
                                    <div className="flex flex-col gap-1">
                                        {socialLinkEntries.map(({ key, label, value }) => (
                                            <a
                                                key={key}
                                                href={value}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                {label}
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-[#a6adba] text-sm">
                                        Социалдык шилтемелер кошула элек
                                    </p>
                                )}
                            </div>

                            {instructorProfile.courses?.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-3">Менин курстарым</h3>
                                    <div className="space-y-3">
                                        {instructorProfile.courses.map((course) => (
                                            <div
                                                key={course.id || course.title}
                                                className="border border-gray-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                                            >
                                                <div>
                                                    <p className="font-medium">{course.title}</p>
                                                    {course.category?.name && (
                                                        <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                                                            {course.category.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-[#a6adba]">
                                                    {course.studentsCount
                                                        ? `${course.studentsCount} студент`
                                                        : course.status
                                                          ? `Статус: ${course.status}`
                                                          : ''}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div>
                                <label className="text-gray-600 dark:text-[#a6adba] block mb-1">Наам</label>
                                <input
                                    type="text"
                                    value={instructorProfile.title}
                                    onChange={(e) =>
                                        handleInstructorProfileChange('title', e.target.value)
                                    }
                                    className="w-full border border-blue-600 rounded p-2 text-black dark:text-white bg-white dark:bg-[#222222]"
                                    placeholder="мисалы: UX/UI designer"
                                />
                            </div>

                            <div>
                                <label className="text-gray-600 dark:text-[#a6adba] block mb-1">
                                    Био / Өзүм жөнүндө
                                </label>
                                <textarea
                                    value={instructorProfile.bio}
                                    onChange={(e) =>
                                        handleInstructorProfileChange('bio', e.target.value)
                                    }
                                    className="w-full border border-blue-600 rounded p-3 text-sm min-h-[120px]"
                                    placeholder="Кыскача өз тажрыйбаңыз жана окуткан курстарыңыз тууралуу жазыңыз"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-600 dark:text-[#a6adba] block mb-1">
                                        Тажрыйба (жыл)
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={instructorProfile.yearsOfExperience}
                                        onChange={(e) => {
                                            const { value } = e.target;
                                            if (value === '' || /^\d+$/.test(value)) {
                                                handleInstructorProfileChange(
                                                    'yearsOfExperience',
                                                    value
                                                );
                                            }
                                        }}
                                        className="w-full border border-blue-600 rounded p-2 text-black dark:text-white bg-white dark:bg-[#222222]"
                                        placeholder="мисалы: 5"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-600 dark:text-[#a6adba] block mb-1">
                                        Студенттердин саны
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={instructorProfile.numberOfStudents}
                                        onChange={(e) => {
                                            const { value } = e.target;
                                            if (value === '' || /^\d+$/.test(value)) {
                                                handleInstructorProfileChange(
                                                    'numberOfStudents',
                                                    value
                                                );
                                            }
                                        }}
                                        className="w-full border border-blue-600 rounded p-2 text-black dark:text-white bg-white dark:bg-[#222222]"
                                        placeholder="мисалы: 350"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-gray-600 dark:text-[#a6adba] block mb-1">
                                    Экспертиза (тегдер)
                                </label>
                                <input
                                    type="text"
                                    value={instructorProfile.expertiseTagsText}
                                    onChange={(e) =>
                                        handleInstructorProfileChange(
                                            'expertiseTagsText',
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-blue-600 rounded p-2 text-black dark:text-white bg-white dark:bg-[#222222]"
                                    placeholder="мисалы: Frontend, UI/UX, Product Design"
                                />
                                <p className="text-xs text-gray-500 dark:text-[#a6adba] mt-1">
                                    Үтүр менен бөлүп жазыңыз.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {SOCIAL_LINK_FIELDS.map((field) => (
                                    <div key={field}>
                                        <label className="text-gray-600 dark:text-[#a6adba] block mb-1">
                                            {SOCIAL_LABELS[field]}
                                        </label>
                                        <input
                                            type="url"
                                            value={instructorProfile.socialLinks[field]}
                                            onChange={(e) =>
                                                handleSocialLinkChange(field, e.target.value)
                                            }
                                            className="w-full border border-blue-600 rounded p-2 text-black dark:text-white bg-white dark:bg-[#222222]"
                                            placeholder="https://..."
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleInstructorProfileSubmit}
                                    disabled={
                                        !isInstructorProfileChanged || savingInstructorProfile
                                    }
                                    className="bg-edubot-dark dark:bg-blue-950 text-white px-6 py-2 rounded disabled:opacity-50"
                                >
                                    Инструктор маалыматын сактоо
                                </button>
                                <button
                                    onClick={handleInstructorProfileReset}
                                    disabled={savingInstructorProfile}
                                    className="border border-gray-300 px-6 py-2 rounded"
                                >
                                    Жокко чыгаруу
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
