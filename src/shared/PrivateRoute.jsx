import React, { useContext, useEffect, useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from '@shared/ui/Loader';
import { fetchStudentAccessState } from '@features/student/api';

const StudentAccessFallback = ({ accessState }) => (
    <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-2xl border border-orange-100 bg-white p-8 shadow-sm text-center">
            <h2 className="mb-4 text-2xl font-bold">Окуу мүмкүнчүлүгү активдүү эмес</h2>
            <p className="mb-3 text-gray-600">
                {accessState?.message ||
                    'Сизде азырынча активдүү жазылуу жок. Менеджериңиз же администратор менен байланышыңыз.'}
            </p>
            {accessState?.latestEnrollment ? (
                <p className="mb-6 text-sm text-gray-500">
                    Акыркы жазылуу: {accessState.latestEnrollment.courseName || 'Курс'} ·{' '}
                    {accessState.latestEnrollment.enrollmentStatus}
                </p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                    to="/courses"
                    className="rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600"
                >
                    Курстарды көрүү
                </Link>
                <Link
                    to="/login"
                    className="rounded-lg border border-gray-200 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                    Башка аккаунт менен кирүү
                </Link>
            </div>
        </div>
    </div>
);

const PrivateRoute = ({ allowedRoles, requireStudentAccess = false }) => {
    const { user } = useContext(AuthContext);
    const [accessLoading, setAccessLoading] = useState(requireStudentAccess);
    const [accessState, setAccessState] = useState(null);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        let mounted = true;

        if (!user || !requireStudentAccess || user.role !== 'student') {
            setAccessLoading(false);
            setAccessDenied(false);
            setAccessState(null);
            return () => {
                mounted = false;
            };
        }

        setAccessLoading(true);
        fetchStudentAccessState()
            .then((data) => {
                if (!mounted) return;
                setAccessState(data || null);
                setAccessDenied(!data?.hasActiveAccess);
            })
            .catch(() => {
                if (!mounted) return;
                setAccessState(null);
                setAccessDenied(true);
            })
            .finally(() => {
                if (mounted) {
                    setAccessLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [requireStudentAccess, user]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (accessLoading) {
        return <Loader fullScreen />;
    }

    if (requireStudentAccess && user.role === 'student' && accessDenied) {
        return <StudentAccessFallback accessState={accessState} />;
    }

    return <Outlet />;
};

export default PrivateRoute;
