export const CATEGORIES = [
    { key: 'all', label: 'Баардыгы' },
    { key: 'programming', label: 'Программалоо' },
    { key: 'data', label: 'Маалымат' },
    { key: 'web', label: 'Веб' },
    { key: 'ai', label: 'AI / ML' },
];

export const LEVELS = {
    beginner: 'Башталгыч',
    intermediate: 'Орто',
    advanced: 'Жогорку',
};

export const PROVIDER_COLORS = {
    harvard: '#A51C30',
    google: '#4285F4',
    freecodecamp: '#0A0A23',
    mit: '#8A8B8C',
    khanacademy: '#1DB954',
    theodinproject: '#D24317',
    meta: '#0668E1',
    ibm: '#006699',
};

export const PROVIDER_DOMAINS = {
    harvard: 'harvard.edu',
    google: 'google.com',
    freecodecamp: 'freecodecamp.org',
    mit: 'mit.edu',
    khanacademy: 'khanacademy.org',
    theodinproject: 'theodinproject.com',
    meta: 'meta.com',
    ibm: 'ibm.com',
};

// Curated logo URLs — Wikipedia Commons / official CDNs (override Clearbit for these providers)
export const PROVIDER_LOGOS = {
    harvard: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Harvard_shield_wreath.svg/120px-Harvard_shield_wreath.svg.png',
    google: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
    freecodecamp: 'https://upload.wikimedia.org/wikipedia/commons/3/39/FreeCodeCamp_logo.png',
    meta: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/200px-Meta_Platforms_Inc._logo.svg.png',
    khanacademy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Khan_Academy_Logo.svg/200px-Khan_Academy_Logo.svg.png',
    theodinproject: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/The_Odin_Project_Logo.svg/200px-The_Odin_Project_Logo.svg.png',
};

export const EXTERNAL_RESOURCES = [
    {
        id: 1,
        slug: 'cs50-introduction-to-computer-science',
        title: 'CS50: Introduction to Computer Science',
        provider: 'Harvard University',
        providerKey: 'harvard',
        url: 'https://cs50.harvard.edu/x/',
        coverImageUrl: 'https://i.ytimg.com/vi/8mAITcNt710/maxresdefault.jpg',
        category: 'programming',
        level: 'beginner',
        priceLabel: 'Акысыз',
        certificateLabel: 'Сертификат бар',
        durationLabel: '12 апта',
        isFeatured: true,
        content: {
            shortDescription: {
                ky: 'Гарвард университетинин программалоого киришүү курсу. CS50 — дүйнөнүн эң таанымал акысыз CS курсу. Толугу менен акысыз.',
            },
            whatYouWillLearn: {
                ky: [
                    'C жана Python программалоо тилдерин',
                    'Алгоритмдерди жана маалымат структураларын',
                    'Веб иштеп чыгуунун негиздерин',
                    'SQL жана маалымат базаларын',
                    'Программалоодо чечим кабыл алуу',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Программалоону жаңыдан баштагандар',
                    'IT чөйрөсүнө кирүүнү каалагандар',
                    'Системалуу CS билим алгысы келгендер',
                    'Техникалык эмес тармактардан IT-га өтүүчүлөр',
                ],
            },
            whyRecommended: {
                ky: 'CS50 — кыргыз студенттери үчүн идеалдуу башлангыч чекити. Курстун педагогикалык сапаты дүйнөдөгү эң жогорку деңгээлде. Дэвид Малан аркылуу берилүүчү лекциялар мотивациялуу жана так. Сертификаты эмгек базарында жогору бааланат.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'C тилине киришүү' }, description: { ky: 'Scratch, C тилинин негиздери, айнымалдар, шарттар' } },
                { week: 2, title: { ky: 'Массивдер' }, description: { ky: 'Функциялар, массивдер, командалык аргументтер' } },
                { week: 3, title: { ky: 'Алгоритмдер' }, description: { ky: 'Издөө жана иреттөө алгоритмдери, Big-O' } },
                { week: 4, title: { ky: 'Эс тутум' }, description: { ky: 'Эс тутум, указатели, heap жана stack' } },
                { week: 5, title: { ky: 'Маалымат структуралары' }, description: { ky: 'Байланган тизмелер, дарактар, хэш таблицалары' } },
                { week: 6, title: { ky: 'Python' }, description: { ky: 'Python тилине өтүү, кыскача жазуу' } },
                { week: 7, title: { ky: 'SQL' }, description: { ky: 'SQL, маалымат базалары, SQLite' } },
                { week: 8, title: { ky: 'HTML / CSS / JavaScript' }, description: { ky: 'Интернеттин негиздери, DOM, React кириш' } },
                { week: 9, title: { ky: 'Flask' }, description: { ky: 'Python Flask менен серверлик веб-иштеп чыгуу' } },
                { week: 10, title: { ky: 'Emoji' }, description: { ky: 'Cybersecurity, AI жана финалдык долбоор' } },
            ],
            difficultyNotes: {
                ky: [
                    'Лекциялар англис тилинде — субтитрлер бар',
                    'Жума сайын 5–10 саат иш убактысы талап кылынат',
                    'Problem set тапшырмалары жеңил эмес, бирок чечүүгө болот',
                ],
            },
            relatedCourseSlugs: [],
        },
    },
    {
        id: 2,
        slug: 'google-it-support-professional',
        title: 'Google IT Support Professional Certificate',
        provider: 'Google (Coursera)',
        providerKey: 'google',
        url: 'https://grow.google/certificates/it-support/',
        coverImageUrl: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets/meta_images/generated/SPECIALIZATION/SPECIALIZATION~google-it-support/886x500.jpeg',
        category: 'programming',
        level: 'beginner',
        priceLabel: 'Акысыз / Coursera Financial Aid',
        certificateLabel: 'Кесипкөй сертификат',
        durationLabel: '6 ай',
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Google компаниясынын IT колдоо боюнча кесипкөй сертификаттоо программасы. IT карьерасына жылдам кирүүнүн жолу.',
            },
            whatYouWillLearn: {
                ky: [
                    'Техникалык колдоону берүү',
                    'Тармактарды башкаруу',
                    'Операциялык системалар (Linux, Windows)',
                    'Системалык администрациянын негиздери',
                    'IT коопсуздугу',
                ],
            },
            whoIsItFor: {
                ky: [
                    'IT чөйрөсүнө кирүүнү каалагандар',
                    'Техникалык колдоо адиси болгусу келгендер',
                    'Системалык администратор болуп иштегилери келгендер',
                ],
            },
            whyRecommended: {
                ky: 'Google бренди жана кесипкөй сертификат эмгек базарында ишенимдүүлүк берет. Бул IT-га кирүүнүн эң практикалык жолдорунун бири.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Техникалык колдоо негиздери' }, description: { ky: 'IT тармагына киришүү, тейлөө жаткылалары' } },
                { week: 3, title: { ky: 'Биттер жана Байттар' }, description: { ky: 'Операциялык системалар, аппараттык камсыздоо' } },
                { week: 5, title: { ky: 'Тармак' }, description: { ky: 'TCP/IP, DNS, тармак администрациясы' } },
                { week: 8, title: { ky: 'Система администрациясы' }, description: { ky: 'Active Directory, Cloud, PowerShell' } },
                { week: 10, title: { ky: 'IT коопсуздугу' }, description: { ky: 'Шифрлөө, тармак коопсуздугу, коргоо' } },
            ],
            difficultyNotes: {
                ky: [
                    'Англис тилинде, субтитрлер жана аудармалар бар',
                    'Financial Aid аркылуу толугу менен акысыз болушу мүмкүн',
                ],
            },
            relatedCourseSlugs: [],
        },
    },
    {
        id: 3,
        slug: 'freecodecamp-responsive-web-design',
        title: 'Responsive Web Design Certification',
        provider: 'freeCodeCamp',
        providerKey: 'freecodecamp',
        url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
        coverImageUrl: 'https://i.ytimg.com/vi/srvUrASNj0s/maxresdefault.jpg',
        category: 'web',
        level: 'beginner',
        priceLabel: 'Толугу менен акысыз',
        certificateLabel: 'Сертификат бар',
        durationLabel: '300 саат',
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'HTML жана CSS аркылуу заманбап, жооптуу веб-сайттарды жасоону үйрөнүңүз. freeCodeCamp — дүйнөдөгү эң ишенимдүү акысыз веб-иштеп чыгуу платформасы.',
            },
            whatYouWillLearn: {
                ky: [
                    'HTML5 тагдары жана структурасы',
                    'CSS Flexbox жана Grid',
                    'Жооптуу дизайн принциптери',
                    'CSS өзгөрүлмөлөрү жана анимациялар',
                    '5 сертификаттык долбоор',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Веб-иштеп чыгуучу болгусу келгендер',
                    'Фронтенд карьерасын баштагандар',
                    'HTML/CSS негиздерин үйрөнгүсү келгендер',
                ],
            },
            whyRecommended: {
                ky: 'freeCodeCamp — дүйнөнүн эң ишенимдүү акысыз веб-иштеп чыгуу платформасы. Бул сертификат практикалык долбоорлорго негизделген жана реалдуу портфолио куруу үчүн идеалдуу.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'HTML негиздери' }, description: { ky: 'Тагдар, атрибуттар, документ структурасы' } },
                { week: 2, title: { ky: 'CSS негиздери' }, description: { ky: 'Стилдер, шрифттер, түстөр, блок модели' } },
                { week: 3, title: { ky: 'CSS Flexbox' }, description: { ky: 'Flexbox менен жайгаштыруу' } },
                { week: 4, title: { ky: 'CSS Grid' }, description: { ky: 'Grid макеттер' } },
                { week: 5, title: { ky: 'Жооптуу дизайн' }, description: { ky: 'Media queries, мобилдик биринчи' } },
            ],
            difficultyNotes: {
                ky: [
                    'Браузерде түздөн-түз жазуу мүмкүнчүлүгү бар',
                    'Баары акысыз, каттоо керек',
                ],
            },
            relatedCourseSlugs: [],
        },
    },
    {
        id: 4,
        slug: 'freecodecamp-javascript-algorithms',
        title: 'JavaScript Algorithms and Data Structures',
        provider: 'freeCodeCamp',
        providerKey: 'freecodecamp',
        url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
        coverImageUrl: 'https://i.ytimg.com/vi/t2CEgPsws3U/maxresdefault.jpg',
        category: 'programming',
        level: 'intermediate',
        priceLabel: 'Толугу менен акысыз',
        certificateLabel: 'Сертификат бар',
        durationLabel: '300 саат',
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'JavaScript тилин тереңирек үйрөнүп, алгоритмдерди жана маалымат структураларын практикада колдонуңуз.',
            },
            whatYouWillLearn: {
                ky: [
                    'JavaScript негиздери жана ES6+',
                    'Регулярдуу туюнтмалар',
                    'Маалымат структуралары',
                    'Алгоритм скрипттер',
                    'Объектке багытталган программалоо',
                    'Функционалдык программалоо',
                ],
            },
            whoIsItFor: {
                ky: [
                    'HTML/CSS билиши барлар',
                    'JavaScript тилин тереңирек үйрөнгүсү келгендер',
                    'Frontend разработчик болгусу келгендер',
                ],
            },
            whyRecommended: {
                ky: 'JavaScript — веб-иштеп чыгуунун негизги тили. Бул курс практикалык алгоритмдик ойлоону өнүктүрөт жана техникалык интервьюга даярдайт.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'JS негиздери' }, description: { ky: 'Айнымалдар, функциялар, объектилер, массивдер' } },
                { week: 2, title: { ky: 'ES6+' }, description: { ky: 'Arrow functions, destructuring, modules' } },
                { week: 3, title: { ky: 'Алгоритмдер' }, description: { ky: 'Иреттөө, рекурсия, динамикалык программалоо' } },
                { week: 4, title: { ky: 'OOP' }, description: { ky: 'Класстар, прототиптер, мурасчылык' } },
                { week: 5, title: { ky: 'Функционалдык JS' }, description: { ky: 'Map, filter, reduce, чынчыл функциялар' } },
            ],
            difficultyNotes: {
                ky: [
                    'HTML/CSS негиздери болушу сунушталат',
                    'Алгоритмдик бөлүм татаал болушу мүмкүн',
                ],
            },
            relatedCourseSlugs: ['freecodecamp-responsive-web-design'],
        },
    },
    {
        id: 5,
        slug: 'khan-academy-computer-programming',
        title: 'Intro to JS: Drawing & Animation',
        provider: 'Khan Academy',
        providerKey: 'khanacademy',
        url: 'https://www.khanacademy.org/computing/computer-programming',
        coverImageUrl: 'https://i.ytimg.com/vi/y9cFKkqsI7A/maxresdefault.jpg',
        category: 'programming',
        level: 'beginner',
        priceLabel: 'Толугу менен акысыз',
        certificateLabel: 'Ачкычтамга бар',
        durationLabel: 'Өз темпиңизде',
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Khan Academy аркылуу JavaScript менен сүрөт тартуу жана анимацияны үйрөнүңүз. Жаш окуучулар жана балдар үчүн идеалдуу башлангыч.',
            },
            whatYouWillLearn: {
                ky: [
                    'JavaScript менен визуалдык программалоо',
                    'Анимация жана интерактивдүүлүк',
                    'ProcessingJS китепканасы',
                    'Оюндарды жасоо негиздери',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Балдар жана жаш окуучулар',
                    'Программалоону кызыктуу жол менен баштагандар',
                    'Визуалдуу натыйжаларды көргүсү келгендер',
                ],
            },
            whyRecommended: {
                ky: 'Khan Academy — акысыз жана дотируемый. Балдарга жана башталгычтарга программалоого кызыгуу жаратуу үчүн эң мыкты ресурс.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Чийүү' }, description: { ky: 'Чийим буйруктары, формалар, түстөр' } },
                { week: 2, title: { ky: 'Анимация' }, description: { ky: 'Кыймыл, ылдамдык, draw() функциясы' } },
                { week: 3, title: { ky: 'Интерактивдүүлүк' }, description: { ky: 'Чычкан, баскыч иштеттери' } },
                { week: 4, title: { ky: 'Оюн жасоо' }, description: { ky: 'Таташ аныктоо, эсептегич, деңгээлдер' } },
            ],
            difficultyNotes: {
                ky: [
                    'Оңой. Программалоо тажрыйбасы талап кылынбайт',
                    'Видеолор кыска — 5-10 мүнөт',
                ],
            },
            relatedCourseSlugs: [],
        },
    },
    {
        id: 6,
        slug: 'odin-project-foundations',
        title: 'The Odin Project: Foundations',
        provider: 'The Odin Project',
        providerKey: 'theodinproject',
        url: 'https://www.theodinproject.com/paths/foundations',
        coverImageUrl: 'https://i.ytimg.com/vi/BMT3iGZW6zk/maxresdefault.jpg',
        category: 'web',
        level: 'beginner',
        priceLabel: 'Толугу менен акысыз',
        certificateLabel: 'Портфолио долбоорлору',
        durationLabel: '~100 саат',
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'The Odin Project — толук стек веб-иштеп чыгуу жолу. Реалдуу долбоорлор аркылуу HTML, CSS, JavaScript жана Ruby/Node үйрөнүңүз.',
            },
            whatYouWillLearn: {
                ky: [
                    'Git жана GitHub менен иштөө',
                    'HTML жана CSS негиздери',
                    'JavaScript программалоо',
                    'Реалдуу портфолио долбоорлорун куруу',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Full-stack developer болгусу келгендер',
                    'Өз темпиңизде окугандар',
                    'Реалдуу долбоорлор аркылуу үйрөнгүсү келгендер',
                ],
            },
            whyRecommended: {
                ky: 'The Odin Project — өз темпиңизде жана акысыз full-stack окуу жолу. Портфолионуздагы реалдуу долбоорлор жумушка орношуу мүмкүнчүлүгүн жогорулатат.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Негиздер' }, description: { ky: 'Git, командалык сап, редактор' } },
                { week: 2, title: { ky: 'HTML негиздери' }, description: { ky: 'HTML документтер, формалар, таблицалар' } },
                { week: 3, title: { ky: 'CSS негиздери' }, description: { ky: 'Каскад, Flexbox, жооптуу дизайн' } },
                { week: 4, title: { ky: 'JavaScript негиздери' }, description: { ky: 'Айнымалдар, функциялар, DOM манипуляциясы' } },
                { week: 5, title: { ky: 'Долбоорлор' }, description: { ky: 'Калкулятор, Etch-a-Sketch, Tic-Tac-Toe' } },
            ],
            difficultyNotes: {
                ky: [
                    'Куратор жок — өз алдыңча үйрөнүүгө даяр болуу керек',
                    'Community Discord аркылуу жардам алса болот',
                ],
            },
            relatedCourseSlugs: ['freecodecamp-responsive-web-design'],
        },
    },
    {
        id: 7,
        slug: 'google-data-analytics-professional',
        title: 'Google Data Analytics Professional Certificate',
        provider: 'Google (Coursera)',
        providerKey: 'google',
        url: 'https://grow.google/certificates/data-analytics/',
        coverImageUrl: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets/meta_images/generated/SPECIALIZATION/SPECIALIZATION~google-data-analytics/886x500.jpeg',
        category: 'data',
        level: 'beginner',
        priceLabel: 'Акысыз / Coursera Financial Aid',
        certificateLabel: 'Кесипкөй сертификат',
        durationLabel: '6 ай',
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Google компаниясынан маалымат аналитикасы боюнча кесипкөй сертификаттоо. Spreadsheet, SQL, R жана Tableau инструменттерин үйрөнүңүз.',
            },
            whatYouWillLearn: {
                ky: [
                    'Маалыматтарды тазалоо жана даярдоо',
                    'SQL жана R программалоо тили',
                    'Tableau менен визуализация',
                    'Маалыматтарга негизделген чечим кабыл алуу',
                    'Реалдуу кейс-стадилер',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Маалымат аналитикасына кирүүнү каалагандар',
                    'Бизнес чечимдерин маалыматка негиздегилери келгендер',
                    'SQL жана R үйрөнгүсү келгендер',
                ],
            },
            whyRecommended: {
                ky: 'Маалымат аналитикасы — кыргыз компанияларынын эң суроо-талап кылынган тармактарынын бири. Google сертификаты эл аралык деңгээлде таанылат.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Маалымат аналитикасына киришүү' }, description: { ky: 'Аналитик ролу, маалымат экосистемасы' } },
                { week: 3, title: { ky: 'Spreadsheet' }, description: { ky: 'Google Sheets, Excel негиздери' } },
                { week: 5, title: { ky: 'SQL' }, description: { ky: 'Маалымат базаларынан суроо берүү' } },
                { week: 8, title: { ky: 'R программалоо' }, description: { ky: 'R тили, тазалоо, визуализация' } },
                { week: 10, title: { ky: 'Tableau жана презентация' }, description: { ky: 'Дашбоорд, стейкхолдерлерге баяндама' } },
            ],
            difficultyNotes: {
                ky: [
                    'Программалоо тажрыйбасы талап кылынбайт',
                    'Financial Aid менен Coursera акысыз',
                ],
            },
            relatedCourseSlugs: [],
        },
    },
    {
        id: 8,
        slug: 'cs50-ai-with-python',
        title: "CS50's Introduction to AI with Python",
        provider: 'Harvard University',
        providerKey: 'harvard',
        url: 'https://cs50.harvard.edu/ai/',
        coverImageUrl: 'https://i.ytimg.com/vi/5NgNicANyqM/maxresdefault.jpg',
        category: 'ai',
        level: 'intermediate',
        priceLabel: 'Акысыз',
        certificateLabel: 'Сертификат бар',
        durationLabel: '7 апта',
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Гарвард университетинен AI жана машина окутуусуна киришүү. Python менен реалдуу AI долбоорлорун жасоону үйрөнүңүз.',
            },
            whatYouWillLearn: {
                ky: [
                    'Издөө алгоритмдери (BFS, DFS, A*)',
                    'Билим базалары жана логика',
                    'Машина окутуусунун негиздери',
                    'Нейрон тармактары',
                    'Табигый тил иштетүү (NLP)',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Python билиши барлар',
                    'AI / ML карьерасын баштагандар',
                    'CS50 курсун аяктагандар',
                ],
            },
            whyRecommended: {
                ky: 'AI — азыркы эмгек базарынын эң перспективалуу тармагы. Гарварддын CS50 AI курсу теориялык негизди практикалык долбоорлор менен айкалыштырат.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Издөө' }, description: { ky: 'BFS, DFS, Greedy, A* алгоритмдери' } },
                { week: 2, title: { ky: 'Билим' }, description: { ky: 'Логика, билим базалары, ойлоо' } },
                { week: 3, title: { ky: 'Белгисиздик' }, description: { ky: 'Ыктымалдык, байесиан тармактары' } },
                { week: 4, title: { ky: 'Оптимизация' }, description: { ky: 'Локалдык издөө, сызыктуу программалоо' } },
                { week: 5, title: { ky: 'Машина окутуусу' }, description: { ky: 'Регрессия, классификация, нейрон тармактары' } },
                { week: 6, title: { ky: 'NLP' }, description: { ky: 'Табигый тил иштетүү, марков модели' } },
            ],
            difficultyNotes: {
                ky: [
                    'Python орто деңгээлде билүү талап кылынат',
                    'Математикалык негиз жардам берет',
                ],
            },
            relatedCourseSlugs: ['cs50-introduction-to-computer-science'],
        },
    },
    {
        id: 9,
        slug: 'freecodecamp-python-scientific-computing',
        title: 'Scientific Computing with Python',
        provider: 'freeCodeCamp',
        providerKey: 'freecodecamp',
        url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
        coverImageUrl: 'https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg',
        category: 'programming',
        level: 'intermediate',
        priceLabel: 'Толугу менен акысыз',
        certificateLabel: 'Сертификат бар',
        durationLabel: '300 саат',
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Python тилин илимий эсептөөлөр жана маалымат анализи үчүн колдонуңуз. freeCodeCamp сертификаттоо программасы.',
            },
            whatYouWillLearn: {
                ky: [
                    'Python негиздери жана OOP',
                    'NumPy жана маалымат структуралары',
                    'Алгоритмдик ойлоо',
                    '5 реалдуу долбоор',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Python үйрөнгүсү келгендер',
                    'Илимий эсептөөлөргө кызыгуучулар',
                    'Маалымат илимине кадам жасагандар',
                ],
            },
            whyRecommended: {
                ky: 'Python — учурда эң сурамжыланган программалоо тили. freeCodeCamp сертификаты портфолиоңузду бекемдейт.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Python негиздери' }, description: { ky: 'Айнымалдар, тизмелер, функциялар, цикл' } },
                { week: 2, title: { ky: 'OOP' }, description: { ky: 'Класстар, мурасчылык, магик ыкмалары' } },
                { week: 3, title: { ky: 'Алгоритмдер' }, description: { ky: 'Рекурсия, Lambda, маалымат структуралары' } },
                { week: 4, title: { ky: 'Долбоорлор' }, description: { ky: 'Арифметик форматтер, бюджет тиркемеси' } },
            ],
            difficultyNotes: {
                ky: [
                    'Программалоонун базалык билими жардам берет',
                ],
            },
            relatedCourseSlugs: ['cs50-introduction-to-computer-science'],
        },
    },
    {
        id: 10,
        slug: 'meta-frontend-developer-professional',
        title: 'Meta Front-End Developer Professional Certificate',
        provider: 'Meta (Coursera)',
        providerKey: 'meta',
        url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
        coverImageUrl: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets/meta_images/generated/SPECIALIZATION/SPECIALIZATION~meta-front-end-developer/886x500.jpeg',
        category: 'web',
        level: 'intermediate',
        priceLabel: 'Акысыз / Coursera Financial Aid',
        certificateLabel: 'Кесипкөй сертификат',
        durationLabel: '7 ай',
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Meta компаниясынан Frontend иштеп чыгуу боюнча кесипкөй сертификаттоо. React, JavaScript жана UI/UX принциптерин үйрөнүңүз.',
            },
            whatYouWillLearn: {
                ky: [
                    'HTML, CSS, JavaScript тереңирек',
                    'React жана компонент архитектурасы',
                    'Version control жана Git',
                    'UI/UX дизайн принциптери',
                    'Capstone долбоор — реалдуу portfolio',
                ],
            },
            whoIsItFor: {
                ky: [
                    'HTML/CSS базалык билими барлар',
                    'React үйрөнгүсү келгендер',
                    'Frontend developer болгусу келгендер',
                ],
            },
            whyRecommended: {
                ky: 'React — азыркы эмгек базарынын эң суроо-талап кылынган frontend технологиясы. Meta сертификаты HR кабыл алуучулар тарабынан жогору бааланат.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'HTML/CSS/JS тереңирек' }, description: { ky: 'Семантика, Flexbox, Grid, ES6' } },
                { week: 3, title: { ky: 'React негиздери' }, description: { ky: 'JSX, компоненттер, state, props' } },
                { week: 5, title: { ky: 'Advanced React' }, description: { ky: 'Hooks, context, тестирлөө' } },
                { week: 7, title: { ky: 'Capstone' }, description: { ky: 'Portfolio долбоор, CV даярдоо' } },
            ],
            difficultyNotes: {
                ky: [
                    'HTML/CSS базалык билими болушу керек',
                    'Financial Aid менен Coursera акысыз',
                ],
            },
            relatedCourseSlugs: ['freecodecamp-responsive-web-design', 'freecodecamp-javascript-algorithms'],
        },
    },
];

export const getResourceBySlug = (slug) =>
    EXTERNAL_RESOURCES.find((r) => r.slug === slug) ?? null;

export const getResourcesByCategory = (category) =>
    category === 'all'
        ? EXTERNAL_RESOURCES
        : EXTERNAL_RESOURCES.filter((r) => r.category === category);

export const getFeaturedResources = () =>
    EXTERNAL_RESOURCES.filter((r) => r.isFeatured);
