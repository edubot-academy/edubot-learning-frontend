import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '@shared/ui/Button';

const AllTopStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSphere, setSelectedSphere] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('points');
    const [sortOrder, setSortOrder] = useState('desc');

    const studentsPerPage = 10;

    useEffect(() => {
        setTimeout(() => {
            const allStudents = [
                {
                    id: 1,
                    name: "Айбек",
                    points: 1250,
                    avatar: "https://i.pravatar.cc/150?img=1",
                    registered: "15.01.2024",
                    sphere: "Frontend",
                    coursesCompleted: 8
                },
                {
                    id: 2,
                    name: "Асель",
                    points: 1100,
                    avatar: "https://i.pravatar.cc/150?img=2",
                    registered: "03.02.2024",
                    sphere: "English",
                    coursesCompleted: 12
                },
                {
                    id: 3,
                    name: "Бекжан",
                    points: 950,
                    avatar: "https://i.pravatar.cc/150?img=3",
                    registered: "20.12.2023",
                    sphere: "Backend",
                    coursesCompleted: 6
                },
                {
                    id: 4,
                    name: "Нургуль",
                    points: 820,
                    avatar: "https://i.pravatar.cc/150?img=4",
                    registered: "10.03.2024",
                    sphere: "Frontend",
                    coursesCompleted: 5
                },
                {
                    id: 5,
                    name: "Таалай",
                    points: 780,
                    avatar: "https://i.pravatar.cc/150?img=5",
                    registered: "25.01.2024",
                    sphere: "English",
                    coursesCompleted: 9
                },
                {
                    id: 6,
                    name: "Мээрим",
                    points: 650,
                    avatar: "https://i.pravatar.cc/150?img=6",
                    registered: "05.02.2024",
                    sphere: "Design",
                    coursesCompleted: 4
                },
                {
                    id: 7,
                    name: "Улан",
                    points: 590,
                    avatar: "https://i.pravatar.cc/150?img=7",
                    registered: "12.04.2024",
                    sphere: "Backend",
                    coursesCompleted: 3
                },
                {
                    id: 8,
                    name: "Чынара",
                    points: 520,
                    avatar: "https://i.pravatar.cc/150?img=8",
                    registered: "18.03.2024",
                    sphere: "Frontend",
                    coursesCompleted: 7
                },
                {
                    id: 9,
                    name: "Бакыт",
                    points: 480,
                    avatar: "https://i.pravatar.cc/150?img=9",
                    registered: "22.02.2024",
                    sphere: "English",
                    coursesCompleted: 5
                },
                {
                    id: 10,
                    name: "Гулназ",
                    points: 450,
                    avatar: "https://i.pravatar.cc/150?img=10",
                    registered: "30.01.2024",
                    sphere: "Design",
                    coursesCompleted: 6
                },
                {
                    id: 11,
                    name: "Данияр",
                    points: 420,
                    avatar: "https://i.pravatar.cc/150?img=11",
                    registered: "14.05.2024",
                    sphere: "Backend",
                    coursesCompleted: 2
                },
                {
                    id: 12,
                    name: "Эльмира",
                    points: 380,
                    avatar: "https://i.pravatar.cc/150?img=12",
                    registered: "07.04.2024",
                    sphere: "Frontend",
                    coursesCompleted: 4
                },
            ];
            setStudents(allStudents);
            setLoading(false);
        }, 1000);
    }, []);

    const spheres = ['all', ...new Set(students.map(s => s.sphere))];

    const filteredStudents = selectedSphere === 'all'
        ? students
        : students.filter(s => s.sphere === selectedSphere);

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'points') {
            comparison = a.points - b.points;
        } else if (sortBy === 'registered') {
            comparison = a.registered.localeCompare(b.registered);
        } else if (sortBy === 'name') {
            comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'courses') {
            comparison = a.coursesCompleted - b.coursesCompleted;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);
    const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const getSphereColor = (sphere) => {
        const colors = {
            'Frontend': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'Backend': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            'English': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            'Design': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        };
        return colors[sphere] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    const PointsWithStars = ({ points }) => (
        <div className="flex items-center gap-1">
            <span className="font-bold text-[#141619] dark:text-[#E8ECF3]">{points}</span>
            <svg className="w-4 h-4 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 15L4.122 18.09L5.5 11.545L0.5 7.09L7.061 6.455L10 0.5L12.939 6.455L19.5 7.09L14.5 11.545L15.878 18.09L10 15Z" />
            </svg>
        </div>
    );

    if (loading) {
        return (
            <section className="px-4 py-8 sm:px-6 lg:px-12 bg-[#f6f6f6] dark:bg-[#1A1A1A] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#f17e22] border-r-transparent"></div>
                    <p className="mt-4 text-[#141619] dark:text-[#E8ECF3]">Студенттер жүктөлүүдө...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="px-4 py-8 sm:px-6 lg:px-12 bg-[#f6f6f6] dark:bg-[#1A1A1A] min-h-screen relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#f17e22] rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1e605e] rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Link to="/" className="hover:text-[#f17e22] transition">Башкы бет</Link>
                    <span>/</span>
                    <span className="text-[#141619] dark:text-[#E8ECF3]">Баардык студенттер</span>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-[#141619] dark:text-[#E8ECF3]">
                        Баардык студенттер
                    </h1>
                </div>

                {/* Фильтры */}
                <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                        {spheres.map(sphere => (
                            <button
                                key={sphere}
                                onClick={() => {
                                    setSelectedSphere(sphere);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedSphere === sphere
                                        ? 'bg-[#f17e22] text-white'
                                        : 'bg-gray-100 dark:bg-[#2A2E35] text-gray-600 dark:text-[#a6adba] hover:bg-gray-200 dark:hover:bg-[#353A43]'
                                    }`}
                            >
                                {sphere === 'all' ? 'Баардык сфера' : sphere}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => handleSort(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-white dark:bg-[#141619] border border-gray-200 dark:border-[#2A2E35] text-[#141619] dark:text-[#E8ECF3] focus:outline-none focus:border-[#f17e22]"
                        >
                            <option value="points">Баллдар боюнча</option>
                            <option value="courses">Курстар боюнча</option>
                            <option value="name">Аты боюнча</option>
                            <option value="registered">Дата боюнча</option>
                        </select>
                    </div>
                </div>

                {/* Список  */}
                <div className="space-y-3">
                    {currentStudents.map((student, index) => (
                        <Link
                            to={`/student/${student.id}`}
                            key={student.id}
                            className="block group"
                        >
                            <div className="relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 dark:via-gray-200"></div>

                                <div className="flex items-center justify-between p-4 bg-white dark:bg-[#141619] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-[#2A2E35]">
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="text-xl font-bold text-gray-300 dark:text-[#4A4F58] w-8">
                                            {indexOfFirstStudent + index + 1}
                                        </span>

                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#f39647]">
                                                <img
                                                    src={student.avatar}
                                                    alt={student.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-20 rounded-full"></div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-bold text-[#141619] dark:text-[#E8ECF3]">
                                                    {student.name}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${getSphereColor(student.sphere)}`}>
                                                    {student.sphere}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                     {student.registered} катталган
                                                </span>
                                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                                <span className="text-[#0ea78b] dark:text-[#0ea78b] font-medium">
                                                    {student.coursesCompleted} курс аяктады
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <PointsWithStars points={student.points} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Пагинация */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg bg-white dark:bg-[#141619] border border-gray-200 dark:border-[#2A2E35] text-[#141619] dark:text-[#E8ECF3] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#f17e22] transition"
                        >
                            ←
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-lg transition ${currentPage === i + 1
                                        ? 'bg-[#f17e22] text-white'
                                        : 'bg-white dark:bg-[#141619] border border-gray-200 dark:border-[#2A2E35] text-[#141619] dark:text-[#E8ECF3] hover:border-[#f17e22]'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg bg-white dark:bg-[#141619] border border-gray-200 dark:border-[#2A2E35] text-[#141619] dark:text-[#E8ECF3] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#f17e22] transition"
                        >
                            →
                        </button>
                    </div>
                )}

                {/* Информация о количестве */}
                <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Жалпы {sortedStudents.length} студенттин {indexOfFirstStudent + 1}-{Math.min(indexOfLastStudent, sortedStudents.length)} көрсөтүлүүдө
                </div>
            </div>
        </section>
    );
};

export default AllTopStudents;