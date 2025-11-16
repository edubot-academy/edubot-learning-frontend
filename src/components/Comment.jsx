import React from 'react'
import Button from '../components/UI/Button';
import { IoStarOutline } from "react-icons/io5";

function Comment() {
    return (
        <div className='flex border border-[#C5C9D1] p-12 rounded mb-28 mt-6'>
            <div className='flex flex-col items-center gap-8'>
                <div className='text-[#EAB308] flex gap-3 text-5xl '>
                    <IoStarOutline />
                    <IoStarOutline />
                    <IoStarOutline />
                    <IoStarOutline />
                    <IoStarOutline />
                </div>
                <div className='px-8 flex flex-col items-center gap-2'>
                    <h3 className='font-medium text-2xl'>Курс кандай өттү? Сын-пикир калтырыныз</h3>
                    <p className='text-[#3E424A] text-lg font-normal text-center'>Сиздин пикириниз башкаларга курс тандоодо жардам берет.<br /> Сиздин пикириниз биз үчүн баалуу!</p>
                </div>
            </div>
            <div className='flex flex-col items-start gap-5'>
                <textarea
                    placeholder="Билдирүү"
                    className="w-96 h-28 border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-gray resize-none"
                ></textarea>

                <div>
                    <Button>
                        Жиберүү
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Comment
