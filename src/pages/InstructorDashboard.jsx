import React, { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const InstructorDashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user || user.role !== "instructor") {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen p-6 pt-24 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-center">Инструктордун Тактасы</h1>
            <p className="text-center text-gray-500 mb-10">
                Кош келиңиз, {user.name || "Инструктор"}! Бул сиздин окутуу баракчаңыз.
            </p>

            {/* Ыкчам Аракеттер */}
            <h2 className="text-2xl font-semibold mb-4">Ыкчам Аракеттер</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                <DashboardCard
                    title="Курстарды Башкаруу"
                    description="Бар болгон курстарыңызды көрүңүз, өзгөртүңүз же өчүрүңүз."
                    link="/instructor/courses"
                    buttonText="Курстар"
                    color="blue"
                />

                <DashboardCard
                    title="Жаңы Курстарды Түзүү"
                    description="Сабак жана бөлүмдөрү менен жаңы курс кошуңуз."
                    link="/instructor/course/create"
                    buttonText="Курс Түзүү"
                    color="green"
                />

                <DashboardCard
                    title="Студент Катталуулар"
                    description="Курстарыңызга катталган студенттерди көзөмөлдөңүз."
                    link="/instructor/enrollments"
                    buttonText="Катталгандар"
                    color="yellow"
                />
            </div>

            {/* Жакында */}
            <h2 className="text-2xl font-semibold mb-4">Жакында</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-gray-400">
                <DashboardCard
                    title="Курс Кирешеси"
                    description="Ай сайынгы кирешеңизди жана төлөм абалын текшериңиз."
                    disabled
                />
                <DashboardCard
                    title="Студенттик Билдирүүлөр"
                    description="Студенттерден келген билдирүүлөргө жооп бериңиз."
                    disabled
                />
                <DashboardCard
                    title="Файлдар Китепканасы"
                    description="Курс файлдарыңызды башкаруу жана кайра колдонуу."
                    disabled
                />
            </div>
        </div>
    );
};

const DashboardCard = ({ title, description, link, buttonText, color = "gray", disabled = false }) => {
    const bgColor = {
        blue: "bg-blue-600 hover:bg-blue-700",
        green: "bg-green-600 hover:bg-green-700",
        yellow: "bg-yellow-600 hover:bg-yellow-700",
        gray: "bg-gray-400 cursor-not-allowed"
    }[color];

    return (
        <div className={`bg-white p-6 rounded-lg shadow-md text-center ${disabled ? "opacity-60" : ""}`}>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            {!disabled && link && (
                <Link to={link} className={`${bgColor} text-white px-4 py-2 rounded-lg transition`}>
                    {buttonText}
                </Link>
            )}
        </div>
    );
};

export default InstructorDashboard;
