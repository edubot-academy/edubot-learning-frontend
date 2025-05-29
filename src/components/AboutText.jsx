import React from 'react'

function AboutText() {
    return (
        <div>
            <div className="mb-[-100px] max-w-screen bg-[#1E605E] text-white p-20 rounded-t-[30px] relative overflow-hidden">
                <div className="absolute left-15 top-20 bottom-10 border-l-2 border-white">
                    <div className="w-2 h-2 bg-white rounded-full absolute -top-1 left-[-5px]"></div>
                    <div className="w-2 h-2 bg-white rounded-full absolute -bottom-1 left-[-5px]"></div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-6 pl-8">Биз жөнүндө</h2>

                <p className="mb-6 text-lg pl-8">
                    <strong>EduBot Learning</strong> — бул ар бир адамга ылайыкталган онлайн билим берүү платформасы...
                </p>

                <div className="mb-6 pl-8">
                    <h3 className="text-2xl font-semibold mb-2">Миссиясы</h3>
                    <p className="text-lg">
                        Адамдардын жаш курагына, кесибине же билимин деңгээлине карабастан...
                    </p>
                </div>

                <div className="mb-6 pl-8">
                    <h3 className="text-2xl font-semibold mb-2">Көз карашыбыз</h3>
                    <p className="text-lg">
                        Интерактивдүү жана практикалык окуу аркылуу...
                    </p>
                </div>

                <div className="mb-10 pl-8">
                    <h3 className="text-2xl font-semibold mb-2">Эмне үчүн EduBot Learning?</h3>
                    <ul className="list-disc list-inside text-lg space-y-2">
                        <li>Ар түрдүү темалар жана деңгээлдердеги курстар</li>
                        <li>Өз темпи менен окуу мүмкүнчүлүгү</li>
                        <li>Кесипкөйлөрдөн түзүлгөн мазмун</li>
                        <li>Практикалык тапшырмалар, видео сабактар жана AI жардам</li>
                    </ul>
                </div>

                <div className="pl-8">
                    <h3 className="text-2xl font-semibold mb-4">Онлайн видео сабактардын артыкчылыктары</h3>
                    <ul className="list-disc list-inside text-lg space-y-2">
                        <li><strong>Каалаган убакта, каалаган жерде:</strong> студенттер өз графигине жараша окуй алышат.</li>
                        <li><strong>Кайталап көрүү мүмкүнчүлүгү:</strong> сабакты кайра көрүп...</li>
                        <li><strong>Көрүү жана угуу аркылуу үйрөнүү:</strong> визуалдык, үн жана субтитрлер...</li>
                        <li><strong>Кеңири масштабдуу жеткирүү:</strong> бир видео миңдеген адамдарга жетиши мүмкүн.</li>
                        <li><strong>Прогрессти көзөмөлдөө:</strong> платформа аркылуу канча көргөнүн текшерүүгө болот.</li>
                        <li><strong>Талкуу жана пикир алышуу:</strong> студенттер сабак алдында же соңунда суроо берип, жооп ала алышат.</li>
                        <li><strong>Сапаттын туруктуулугу:</strong> бир жолу жазылган сабак ар бир көрүүчү үчүн бирдей сапатта болот.</li>
                    </ul>
                </div>

                <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 mt-8 rounded-lg block ml-8">
                    Катталуу
                </button>
            </div>

        </div>
    )
}

export default AboutText
