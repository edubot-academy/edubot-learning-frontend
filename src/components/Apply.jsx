import React from 'react';
import { Link } from 'react-router-dom';
import student from '../assets/images/student.png'

function Apply({ user }) {
    if (user) return null;

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-10">
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-4xl md:text-6xl font-semibold text-[#0B1B4B] mb-4 leading-tight">
                        Окууга азыр<br /> катталыңыз
                    </h2>
                    <p className="text-xl font-semibold text-[#0B1B4B] mb-6">
                        <span className="text-orange-500">Edubot Learning</span> кошулуу үчүн окууну
                        баштаңыз
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-[#0DB297] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#0ca88d] transition"
                    >
                        Катталуу
                    </Link>
                </div>

                <div className="flex-1 hidden md:block">
                    <img
                        src={student}
                        alt="Student Illustration"
                        className="w-full max-w-sm mx-auto"
                    />
                </div>

            </div>
        </section>
    );
}

export default Apply;
