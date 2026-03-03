import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@shared/ui/Button';

const LeaderBoard = () => {
    const [period, setPeriod] = useState('week');
    
    const studentsData = {
        week: [
            { 
                id: 1, 
                name: "Айбек", 
                points: 1250, 
                avatar: "https://i.pravatar.cc/150?img=1",
                registered: "15.01.2024",
                sphere: "Frontend"
            },
            { 
                id: 2, 
                name: "Асель", 
                points: 1100, 
                avatar: "https://i.pravatar.cc/150?img=2",
                registered: "03.02.2024",
                sphere: "English"
            },
            { 
                id: 3, 
                name: "Бекжан", 
                points: 950, 
                avatar: "https://i.pravatar.cc/150?img=3",
                registered: "20.12.2023",
                sphere: "Backend"
            },
            { 
                id: 4, 
                name: "Нургуль", 
                points: 820, 
                avatar: "https://i.pravatar.cc/150?img=4",
                registered: "10.03.2024",
                sphere: "Frontend"
            },
            { 
                id: 5, 
                name: "Таалай", 
                points: 780, 
                avatar: "https://i.pravatar.cc/150?img=5",
                registered: "25.01.2024",
                sphere: "English"
            },
        ],
        month: [
            { 
                id: 1, 
                name: "Асель", 
                points: 3450, 
                avatar: "https://i.pravatar.cc/150?img=2",
                registered: "03.02.2024",
                sphere: "English"
            },
            { 
                id: 2, 
                name: "Айбек", 
                points: 3200, 
                avatar: "https://i.pravatar.cc/150?img=1",
                registered: "15.01.2024",
                sphere: "Frontend"
            },
            { 
                id: 3, 
                name: "Мээрим", 
                points: 2900, 
                avatar: "https://i.pravatar.cc/150?img=6",
                registered: "05.02.2024",
                sphere: "Design"
            },
            { 
                id: 4, 
                name: "Бекжан", 
                points: 2750, 
                avatar: "https://i.pravatar.cc/150?img=3",
                registered: "20.12.2023",
                sphere: "Backend"
            },
            { 
                id: 5, 
                name: "Таалай", 
                points: 2100, 
                avatar: "https://i.pravatar.cc/150?img=5",
                registered: "25.01.2024",
                sphere: "English"
            },
        ]
    };

    const students = studentsData[period];
    const topThree = [students[1], students[0], students[2]];
    const restStudents = students.slice(3);

    const getSphereColor = (sphere) => {
        const colors = {
            'Frontend': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'Backend': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            'English': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            'Design': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        };
        return colors[sphere] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    };

    const Medals = {
        first: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
                <path d="M12 5L13.5 8.5L17 9L14.5 11.5L15.5 15L12 13L8.5 15L9.5 11.5L7 9L10.5 8.5L12 5Z" fill="#FFE55C"/>
            </svg>
        ),
        second: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L14.5 8L20 9L16 13L17.5 19L12 16L6.5 19L8 13L4 9L9.5 8L12 3Z" fill="#C0C0C0" stroke="#808080" strokeWidth="1.5"/>
            </svg>
        ),
        third: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L14 8L19 9L15 12L16.5 17L12 14.5L7.5 17L9 12L5 9L10 8L12 4Z" fill="#CD7F32" stroke="#8B4513" strokeWidth="1.5"/>
            </svg>
        )
    };

    const Crown = () => (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <svg className="w-10 h-10 text-yellow-400 dark:text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" />
                <rect x="4" y="16" width="16" height="3" fill="currentColor" />
            </svg>
        </div>
    );

    const PointsWithStars = ({ points }) => (
        <div className="flex items-center gap-1">
            <span className="font-bold text-[#141619] dark:text-[#E8ECF3]">{points}</span>
            <svg className="w-4 h-4 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 15L4.122 18.09L5.5 11.545L0.5 7.09L7.061 6.455L10 0.5L12.939 6.455L19.5 7.09L14.5 11.545L15.878 18.09L10 15Z" />
            </svg>
        </div>
    );

    return (
        <section className="px-4 py-8 sm:px-6 lg:px-12 dark:bg-[#1A1A1A] relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#f17e22] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse dark:opacity-5"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1e605e] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000 dark:opacity-5"></div>
            </div>

            <div className="relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[#141619] dark:text-[#E8ECF3] mb-4">
                        Мыкты студенттер 
                    </h2>
                    <div className="flex justify-center gap-4">
                        <Button
                            variant={period === 'week' ? 'primary' : 'secondary'}
                            onClick={() => setPeriod('week')}
                        >
                           Жума
                        </Button>
                        <Button
                            variant={period === 'month' ? 'primary' : 'secondary'}
                            onClick={() => setPeriod('month')}
                        >
                           Ай
                        </Button>
                    </div>
                </div>
                <div className="flex justify-center items-end gap-4 mb-16">
                    {topThree.map((student, index) => {
                        const isCenter = index === 1;
                        const podiumHeight = isCenter ? 'h-36' : 'h-28';
                        const medal = isCenter ? Medals.first : index === 0 ? Medals.second : Medals.third;
                        const bgColor = isCenter ? 'bg-yellow-400' : index === 0 ? 'bg-gray-300' : 'bg-orange-300';
                        const borderColor = isCenter ? 'border-yellow-400' : index === 0 ? 'border-gray-300' : 'border-orange-300';
                        
                        return (
                            <div key={student.id} className="flex flex-col items-center relative">
                                {isCenter && <Crown />}
                                
                                <div className="relative mb-3">
                                    <div className={`w-24 h-24 rounded-full border-4 ${borderColor} overflow-hidden shadow-xl`}>
                                        <img 
                                            src={student.avatar} 
                                            alt={student.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-30 rounded-full dark:via-gray-200"></div>
                                </div>
                                
                                <div className="text-lg font-bold text-[#141619] dark:text-[#E8ECF3]">
                                    {student.name}
                                </div>
                                
                                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${getSphereColor(student.sphere)}`}>
                                    {student.sphere}
                                </span>
                                
                                <PointsWithStars points={student.points} />
                                
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    с {student.registered}
                                </div>
                                
                                <div className={`w-28 ${podiumHeight} mt-3 rounded-t-lg ${bgColor} flex items-center justify-center relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer dark:via-gray-200"></div>
                                    {medal}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="max-w-2xl mx-auto">
                    {restStudents.map((student, index) => (
                        <div 
                            key={student.id} 
                            className="relative group mb-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 dark:via-gray-200"></div>
                            
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#141619] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-[#2A2E35]">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-bold text-gray-300 dark:text-[#4A4F58] w-8">
                                        {index + 4}
                                    </span>
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#f39647] dark:border-[#f39647]">
                                            <img 
                                                src={student.avatar} 
                                                alt={student.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-20 rounded-full dark:via-gray-200"></div>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium text-[#141619] dark:text-[#E8ECF3]">
                                            {student.name}
                                        </span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getSphereColor(student.sphere)}`}>
                                                {student.sphere}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                с {student.registered}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <PointsWithStars points={student.points} />
                            </div>
                        </div>
                    ))}

                    <div className="text-center mt-8">
                        <Link to="/leaderboard">
                            <Button variant="primary" icon={true}>
                                Баардык студенттерди көрүү
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </section>
    );
};

export default LeaderBoard;