import DashboardIcon from "../assets/icons/dashboard-icon.svg"
import StudentsIocn from "../assets/icons/icon-students.svg"
import HugoIocn from "../assets/icons/hugo-icon.svg"
import FileIocn from "../assets/icons/file-icon.svg"
// import { Link } from "react-router-dom";
// import { FaCheckCircle, FaDownload } from "react-icons/fa";

// const enrolledCourses = [
//     {
//         id: 1,
//         title: "Web Development Masterclass",
//         progress: 75,
//         lastLesson: "JavaScript Fundamentals",
//         certificateAvailable: true,
//     },
//     {
//         id: 2,
//         title: "Data Science Bootcamp",
//         progress: 50,
//         lastLesson: "Machine Learning Basics",
//         certificateAvailable: false,
//     },
// ];

// const recommendedCourses = [
//     {
//         id: 3,
//         title: "Machine Learning Fundamentals",
//     },
//     {
//         id: 4,
//         title: "UI/UX Design Essentials",
//     },
// ];

const DashboardPage = () => {
    return (
        <div>
            <div className="flex justify-between items-center bg-[#f9f9fb] p-6 rounded-lg shadow-sm">
                <div>
                    <h3 className="text-2xl font-semibold text-[#14203C]">Кош келдиңиз, Асан!</h3>
                    <p className="text-[#14203C] mt-1">Сиздин курстарыңыз жана иш-аракеттериңиз тууралуу кыскача маалымат</p>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-[#14203C] font-medium">Асанов Асан</p>
                    <div className="w-8 h-8 bg-[#14203C] rounded-full flex items-center justify-center">
                        <img src={DashboardIcon} alt="User Icon" className="w-10 h-10" />
                    </div>
                </div>
            </div>
            <div className="flex justify-center gap-[15px]">
                <div className="w-[360px] h-[120px] rounded-[25px] bg-white flex items-center px-[27px] py-[25px]">
                    <img src={StudentsIocn} alt="" />
                    <div className="flex-col ml-[9.5px] ">
                        <p style={{ color: '#718EBF' }}>Менин студенттерим</p>
                        <p>1200</p>
                    </div>
                </div>
                <div className="w-[360px] h-[120px] rounded-[25px] bg-white flex items-center px-[27px] py-[25px]">
                    <img src={HugoIocn} alt="" />
                    <div className="flex-col ml-[9.5px]">
                        <p style={{ color: '#718EBF' }}>Активдүү курстар</p>
                        <p>1200</p>
                    </div>
                </div>
                <div className="w-[360px] h-[120px] rounded-[25px] bg-white flex items-center px-[27px] py-[25px]">
                    <img src={FileIocn} alt="" />
                    <div className="flex-col ml-[9.5px]">
                        <p style={{ color: '#718EBF' }}>Draft/Каралама</p>
                        <p>1200</p>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-center mt-10">
                <div className="overflow-hidden w-[1110px] rounded-[24px] bg-white shadow">
                    <div className="flex items-center justify-between bg-gray-50 px-6 py-4">
                        <h2 className="text-lg font-semibold">Менин курстарым</h2>
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium">
                            Жаңы курстарды түзүү
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3">Курстун аталышы</th>
                                    <th className="px-6 py-3">Статус</th>
                                    <th className="px-6 py-3">Студенттер</th>
                                    <th className="px-6 py-3">Акыркы жолу жаңыртылган</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t">
                                    <td className="px-6 py-4 whitespace-nowrap">UX дизайн негиздери</td>
                                    <td className="px-6 py-4 font-medium">Активдуу</td>
                                    <td className="px-6 py-4">120</td>
                                    <td className="px-6 py-4 flex justify-between items-center">
                                        <span>2 күн мурун</span>
                                        <span className="text-lg">›</span>
                                    </td>
                                </tr>
                                <tr className="border-t">
                                    <td className="px-6 py-4 whitespace-nowrap">Терен типография</td>
                                    <td className="px-6 py-4">Draft</td>
                                    <td className="px-6 py-4">—</td>
                                    <td className="px-6 py-4 flex justify-between items-center">
                                        <span>5 күн мурун</span>
                                        <span className="text-gray-400 text-lg">›</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-center mt-10">
                <div className="w-[1110px] h-[287px] rounded-[24px] bg-white shadow overflow-hidden">
                    <div className="flex items-center justify-between bg-gray-50 px-6 py-4">
                        <h2 className="text-lg font-semibold">Студенттин прогресси</h2>
                        <button className="  text-edubot-green #0EA78B px-4 py-2 rounded-full text-24px font-medium">
                            Прогрессти көрүү
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3">Студенттер</th>
                                    <th className="px-6 py-3">Курс</th>
                                    <th className="px-6 py-3">Прогресс</th>
                                    <th className="px-6 py-3">Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t">
                                    <td className="px-6 py-4 whitespace-nowrap">GUUCCYCIjhbuo</td>
                                    <td className="px-6 py-4 font-medium">UX дизайн негиздери</td>
                                    <td className="px-6 py-4">80%</td>
                                    <td className="px-6 py-4">Активдүү</td>
                                </tr>
                                <tr className="border-t">
                                    <td className="px-6 py-4 whitespace-nowrap">GUUCCYCIjhbuo</td>
                                    <td className="px-6 py-4">Типография</td>
                                    <td className="px-6 py-4">80%</td>
                                    <td className="px-6 py-4">Draft</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        // <div className="min-h-screen bg-gray-50 p-6 pt-24 max-w-5xl mx-auto">
        //     <h1 className="text-4xl font-bold mb-6 text-center">My Dashboard</h1>

        //     {/* Enrolled Courses */}
        //     <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        //         <h2 className="text-2xl font-bold mb-4">Enrolled Courses</h2>
        //         {enrolledCourses.map((course) => (
        //             <div key={course.id} className="border-b py-4">
        //                 <h3 className="text-lg font-semibold">{course.title}</h3>
        //                 <p className="text-gray-600">Progress: {course.progress}%</p>
        //                 <p className="text-gray-600">Last Lesson: {course.lastLesson}</p>
        //                 {course.certificateAvailable && (
        //                     <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center">
        //                         <FaDownload className="mr-2" /> Download Certificate
        //                     </button>
        //                 )}
        //             </div>
        //         ))}
        //     </div>

        //     {/* Progress Tracking */}
        //     <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        //         <h2 className="text-2xl font-bold mb-4">Progress Tracking</h2>
        //         {enrolledCourses.map((course) => (
        //             <div key={course.id} className="mb-4">
        //                 <h3 className="text-lg font-semibold">{course.title}</h3>
        //                 <div className="w-full bg-gray-200 rounded-full h-4">
        //                     <div
        //                         className="bg-blue-600 h-4 rounded-full"
        //                         style={{ width: `${course.progress}%` }}
        //                     ></div>
        //                 </div>
        //                 <p className="text-gray-600 text-sm mt-2">{course.progress}% completed</p>
        //             </div>
        //         ))}
        //     </div>

        //     {/* Recommended Courses */}
        //     <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        //         <h2 className="text-2xl font-bold mb-4">Recommended Courses</h2>
        //         <ul>
        //             {recommendedCourses.map((course) => (
        //                 <li key={course.id} className="mb-2">
        //                     <Link to={`/courses/${course.id}`} className="text-blue-600 hover:underline">
        //                         {course.title}
        //                     </Link>
        //                 </li>
        //             ))}
        //         </ul>
        //     </div>
        // </div>
    );
};

export default DashboardPage;