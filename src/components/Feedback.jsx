import React from 'react';
import quotes from '../assets/icons/quotes.svg';
import account from '../assets/icons/account.svg';

function Feedback() {
    const feedbacks = [
        {
            text: `«Технические курсы Edubot являются первоклассными! Как кто-то, кто всегда хочет оставаться впереди в быстро развивающемся мире технологий, я ценю актуальное содержание и привлечение мультимедиа.»`,
            name: 'Jane Doe',
            role: 'Designer',
            image: account,
        },
        {
            text: `«Технические курсы Edubot являются первоклассными! Как кто-то, кто всегда хочет оставаться впереди в быстро развивающемся мире технологий, я ценю актуальное содержание и привлечение мультимедиа.»`,
            name: 'Jane Doe',
            role: 'Designer',
            image: account,
        },
        {
            text: `«Технические курсы Edubot являются первоклассными! Как кто-то, кто всегда хочет оставаться впереди в быстро развивающемся мире технологий, я ценю актуальное содержание и привлечение мультимедиа.»`,
            name: 'Jane Doe',
            role: 'Designer',
            image: account,
        },
    ];

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-medium text-[#0B1B4B]">
                        Биздин окуучулар эмне дейт?
                    </h2>
                    <div className="flex gap-2">
                        <button className="bg-orange-400 text-white w-10 h-7 rounded-md pb-1 flex items-center justify-center text-lg">
                            &#8249;
                        </button>
                        <button className="bg-orange-400 text-white w-10 h-7 rounded-md pb-1 flex items-center justify-center text-lg">
                            &#8250;
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {feedbacks.map((fb, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl border shadow-sm text-left">
                            <img src={quotes} alt="quote" className="w-8 h-8 text-green-500 mb-4" />
                            <p className="text-gray-700 leading-relaxed mb-6">{fb.text}</p>
                            <div className="flex items-center gap-3">
                                <img
                                    src={fb.image}
                                    alt={fb.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{fb.name}</h4>
                                    <p className="text-sm text-gray-500">{fb.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Feedback;
