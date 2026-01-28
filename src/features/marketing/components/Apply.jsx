import React from 'react';
import { Link } from 'react-router-dom';
import student from '@assets/images/RightLittleMan.png';
import Background from '@assets/images/background.png';
import BackgroundDark from '@assets/images/background-dark.png';
import LogoStudies from '@assets/images/logoEduBot.png';
import Button from '@shared/ui/Button';

function Apply({ user }) {
    if (user) return null;

    return (
        <div className="flex items-center justify-center gap-[130px] mt-20 bg-white dark:bg-[#1A1A1A] py-12 px-4 sm:px-6 lg:px-12 text-[#141619] dark:text-[#E8ECF3]">
            <div className="relative hidden md:flex items-center left-[80px] h-[650px]">
                <img src={Background} alt="Background" className="flex dark:hidden" />
                <img src={BackgroundDark} alt="Background" className="dark:flex hidden" />

                <img
                    src={student}
                    alt="Student Illustration"
                    className="absolute  object-contain   top-6  scale-80"
                />
            </div>

            <div className="relative w-[500px] h-[270px] mx-auto bg-white dark:bg-[#141619] rounded-lg border border-gray-200 dark:border-[#2A2E35] p-6 text-center">
                <div className="absolute -top-[90px] left-1/2 -translate-x-1/2">
                    <img
                        src={LogoStudies}
                        alt="Logo Studies"
                        className="w-30 h-24 object-contain rounded-full"
                    />
                </div>

                <h2 className="text-xl font-semibold text-[#141619] dark:text-[#E8ECF3] mb-2 mt-10">
                    Окууга азыр катталыныз
                </h2>
                <p className="text-[#3E424A] dark:text-[#a6adba] mb-4">
                    Edubot Learning кошулуу үчүн азыр баштаңыз
                </p>
                <Link to="/register">
                    <Button>Сабакты азыр баштоо</Button>
                </Link>
            </div>
        </div>
    );
}

export default Apply;
