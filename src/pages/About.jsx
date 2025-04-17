import React from 'react';

const AboutPage = () => {
    return (
        <div className="bg-gray-50 min-h-screen px-4 py-24 md:px-20 text-gray-800"> {/* py-24 instead of py-10 to push content below header */}
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-6">Биз жөнүндө</h1>

                <p className="mb-6 text-lg">
                    <strong>EduBot Learning</strong> — бул ар бир адамга ылайыкталган онлайн билим берүү платформасы. Биздин максат – заманбап, жеткиликтүү жана сапаттуу билимди дүйнө жүзүндөгү бардык адамдарга жеткирүү.
                </p>

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-2">🎯 Миссиясы</h2>
                    <p className="text-lg">
                        Адамдардын жаш курагына, кесибине же билимин деңгээлине карабастан, сапаттуу билимге жеткиликтүү болушун камсыздоо. Биз IT, жасалма интеллект, тил үйрөнүү, дизайн жана башка тармактар боюнча курстарды сунуштайбыз.
                    </p>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-2">👁 Көз карашыбыз</h2>
                    <p className="text-lg">
                        Интерактивдүү жана практикалык окуу аркылуу адамдардын мүмкүнчүлүктөрүн кеңейтип, жаңы кесиптерди өздөштүрүүгө шарт түзүү.
                    </p>
                </div>

                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-2">🎓 Эмне үчүн EduBot Learning?</h2>
                    <ul className="list-disc list-inside text-lg space-y-2">
                        <li>Ар түрдүү темалар жана деңгээлдердеги курстар</li>
                        <li>Өз темпи менен окуу мүмкүнчүлүгү</li>
                        <li>Кесипкөйлөрдөн түзүлгөн мазмун</li>
                        <li>Практикалык тапшырмалар, видео сабактар жана AI жардам</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-blue-600 mb-4">🎥 Онлайн видео сабактардын артыкчылыктары</h2>
                    <ul className="list-disc list-inside text-lg space-y-2">
                        <li><strong>Каалаган убакта, каалаган жерде:</strong> студенттер өз графигине жараша окуй алышат.</li>
                        <li><strong>Кайталап көрүү мүмкүнчүлүгү:</strong> сабакты кайра көрүп, токтотуп, артка кайтарып түшүнүүнү тереңдетет.</li>
                        <li><strong>Көрүү жана угуу аркылуу үйрөнүү:</strong> визуалдык, үн жана субтитрлер ар кандай үйрөнүү ыкмаларына туура келет.</li>
                        <li><strong>Кеңири масштабдуу жеткирүү:</strong> бир видео миңдеген адамдарга жетиши мүмкүн.</li>
                        <li><strong>Прогрессти көзөмөлдөө:</strong> платформа аркылуу канча көргөнүн, бүтүргөнүн текшерүүгө болот.</li>
                        <li><strong>Талкуу жана пикир алышуу:</strong> студенттер сабак алдында же соңунда суроо берип, жооп ала алышат.</li>
                        <li><strong>Сапаттын туруктуулугу:</strong> бир жолу жазылган сабак ар бир көрүүчү үчүн бирдей сапатта болот.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;