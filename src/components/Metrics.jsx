import React from 'react'

function Metrics() {
    const metrics = [
        {
            num: '10k+',
            title: 'Азыркы күнгө чейинки колдонуучулар'
        },
        {
            num: '200+',
            title: 'Тажрыйбалуу менторлордон онлайн сабактар'
        },
        {
            num: '10+',
            title: 'Айтинин бардык багыты окутулат'
        },

    ]
    return (
        <div className='flex flex-col md:flex-row items-center justify-center gap-5 my-6 mx-4'>
            {metrics.map((x, index) => (
                <div key={index} className='flex items-center justify-center gap-5 border border-[#C5C9D1] py-4 px-2 rounded'>
                    <span className='text-[#141619] text-6xl font-normal'>
                        {x.num}
                    </span>
                    <p className='text-[#3E424A] font-medium text-base max-w-72'>
                        {x.title}
                    </p>
                </div>
            ))}
        </div>
    )
}

export default Metrics
