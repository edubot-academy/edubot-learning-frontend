import React from 'react';
import { Link } from 'react-router-dom';
import student from '../assets/images/littleman.png'
import Background from '../assets/images/background.png'
import LogoStudies from "../assets/images/logoEduBot.png"

function Apply({ user }) {
    if (user) return null;

    return (
        <div className="flex items-center justify-center gap-[130px]">
          
         <div className="relative hidden md:flex items-center justify-center left-[80px]w-fuul h-[650px] ">
 
          <img
           src={Background}
           alt="Background"
             className=""
        />

 
           <img
             src={student}
          alt="Student Illustration"
          className="absolute  object-contain  right-[-180px] top-6  scale-80"
           />
             </div>
               
           <div className="relative w-[500px] h-[270px] mx-auto bg-white rounded-lg shadow p-6 text-center">
         <div className="absolute -top-[90px] left-1/2 -translate-x-1/2">
      <img
        src={LogoStudies}
        alt="Logo Studies"
        className="w-30 h-24 object-contain rounded-full"
      />
    </div>

    <h2 className="text-xl font-semibold text-[#141619] mb-2 mt-10">
      Окууга азыр катталыныз
    </h2>
    <p className="text-[#3E424A] mb-4">
      Edubot Learning кошулуу үчүн азыр баштаңыз
    </p>
    <button className="px-6 py-3  bg-gradient-to-r  from-red-500 to-orange-400 text-white rounded-lg shadow hover:opacity-90 transition">
      Сабакты азыр баштоо
    </button>
  </div>
        </div>
    );
}

export default Apply;
