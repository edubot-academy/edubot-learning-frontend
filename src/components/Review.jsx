import React from 'react'

function Review() {
    const account = [
        {
            name: 'Leonardo Da Vinch',
            content: 'Да. Я просто подчеркиваю, что использование Photoshop, для не пользователей, становится трудно следовать. Что требует курса, чтобы освоить его. Безопасный и очень дидактический учитель.'
        },
        {
            name: 'Leonardo Da Vinch',
            content: 'Да. Я просто подчеркиваю, что использование Photoshop, для не пользователей, становится трудно следовать. Что требует курса, чтобы освоить его. Безопасный и очень дидактический учитель.'
        },
        {
            name: 'Leonardo Da Vinch',
            content: 'Да. Я просто подчеркиваю, что использование Photoshop, для не пользователей, становится трудно следовать. Что требует курса, чтобы освоить его. Безопасный и очень дидактический учитель.'
        }
    ]
    return (
        <div>
            <h2 className="mb-2 text-lg font-semibold text-[#0EA78B]">Колдонуучулардын сын-пикирлери</h2>
            <div className='border border-black rounded-2xl p-5'>
                {account.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-4 items-center">
                        <img src="" alt="" className="w-12 h-9 rounded-full bg-gray-200" />
                        <div>
                            <span className="font-semibold text-[#122144]">{item.name}</span>
                            <p className="text-sm text-gray-600">{item.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className='flex justify-center'>
                <button className='mt-6 border border-[#122144] rounded-2xl px-6 py-2 text-[#122144]'>Көбүрөөк сын-пикирлерди көрүү</button>
            </div>
        </div>
    )
}

export default Review
