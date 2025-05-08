import React from 'react';

const AdminPendingCoursesTab = ({ pendingCourses, handleMarkCourseApproved, handleMarkCourseRejected }) => {
    return (
        <div className="bg-white shadow rounded p-4">
            <h2 className="text-2xl font-semibold mb-4">Каралуудагы курстар</h2>
            {pendingCourses.length === 0 ? (
                <p>Азырынча курс жок.</p>
            ) : (
                <ul className="space-y-4">
                    {pendingCourses.map((course) => (
                        <li key={course.id} className="border p-4 rounded shadow flex justify-between items-center">
                            <div>
                                <h2 className="font-semibold text-lg">{course.title}</h2>
                                <p className="text-sm text-gray-600">Окутуучу: {course.instructor?.fullName}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleMarkCourseApproved(course.id)}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Тастыктоо
                                </button>
                                <button
                                    onClick={() => handleMarkCourseRejected(course.id)}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    Жокко чыгаруу
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminPendingCoursesTab;
