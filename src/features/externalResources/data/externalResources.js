// Lookup table for Kyrgyz-only label strings returned by older API responses.
// Keyed by the lowercase Kyrgyz value so API-returned plain strings are translated
// transparently without requiring a backend migration.
const LABEL_TRANSLATIONS = {
    // price
    'акысыз':                           { ky: 'Акысыз',                           ru: 'Бесплатно',                         en: 'Free' },
    'толугу менен акысыз':              { ky: 'Толугу менен акысыз',              ru: 'Полностью бесплатно',               en: 'Completely Free' },
    'акысыз / coursera financial aid':  { ky: 'Акысыз / Coursera Financial Aid',  ru: 'Бесплатно / Coursera Financial Aid', en: 'Free / Coursera Financial Aid' },
    // certificate
    'сертификат бар':                   { ky: 'Сертификат бар',                   ru: 'Сертификат есть',                   en: 'Certificate available' },
    'кесипкөй сертификат':              { ky: 'Кесипкөй сертификат',              ru: 'Профессиональный сертификат',        en: 'Professional certificate' },
    'ачкычтамга бар':                   { ky: 'Ачкычтамга бар',                   ru: 'Есть значки',                       en: 'Badges available' },
    'портфолио долбоорлору':            { ky: 'Портфолио долбоорлору',            ru: 'Проекты для портфолио',              en: 'Portfolio projects' },
    // duration
    '12 апта':                          { ky: '12 апта',   ru: '12 недель',   en: '12 weeks' },
    '7 апта':                           { ky: '7 апта',    ru: '7 недель',    en: '7 weeks' },
    '6 ай':                             { ky: '6 ай',      ru: '6 месяцев',   en: '6 months' },
    '7 ай':                             { ky: '7 ай',      ru: '7 месяцев',   en: '7 months' },
    '300 саат':                         { ky: '300 саат',  ru: '300 часов',   en: '300 hours' },
    '~100 саат':                        { ky: '~100 саат', ru: '~100 часов',  en: '~100 hours' },
    'өз темпиңизде':                    { ky: 'Өз темпиңизде',     ru: 'В своём темпе', en: 'Self-paced' },
    'жакынча 6 саат, өз алдынча':       { ky: 'Жакынча 6 саат, өз алдынча', ru: '~6 часов', en: '~6 hours' },
};

/**
 * Resolves a label field to the requested language.
 * Accepts either a localized object { ky, ru, en } or a plain Kyrgyz string
 * (the legacy format returned by older API responses).
 */
export const resolveLabel = (val, lang = 'ky') => {
    if (!val) return null;
    if (typeof val === 'object') return val[lang] ?? val.ky ?? null;
    const entry = LABEL_TRANSLATIONS[val.toLowerCase()];
    if (entry) return entry[lang] ?? entry.ky ?? val;
    return val;
};

export const CATEGORIES = [
    { key: 'all' },
    { key: 'programming' },
    { key: 'data' },
    { key: 'web' },
    { key: 'ai' },
];

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
        slug: 'cs50-introduction-to-computer-science',
        title: 'CS50: Introduction to Computer Science',
        provider: 'Harvard University',
        providerKey: 'harvard',
        url: 'https://cs50.harvard.edu/x/',
        coverImageUrl: 'https://i.ytimg.com/vi/8mAITcNt710/maxresdefault.jpg',
        category: 'programming',
        level: 'beginner',
        priceLabel: { ky: 'Акысыз', ru: 'Бесплатно', en: 'Free' },
        certificateLabel: { ky: 'Сертификат бар', ru: 'Сертификат есть', en: 'Certificate available' },
        durationLabel: { ky: '12 апта', ru: '12 недель', en: '12 weeks' },
        isFeatured: true,
        content: {
            shortDescription: {
                ky: 'Гарвард университетинин программалоого киришүү курсу. CS50 — дүйнөнүн эң таанымал акысыз CS курсу. Толугу менен акысыз.',
                en: "Harvard University's introduction to computer science. CS50 is the world's most recognized free CS course. Completely free to audit.",
                ru: 'Вводный курс по информатике Гарвардского университета. CS50 — самый известный бесплатный курс по CS в мире. Полностью бесплатен для аудита.',
            },
            whatYouWillLearn: {
                ky: [
                    'C жана Python программалоо тилдерин',
                    'Алгоритмдерди жана маалымат структураларын',
                    'Веб иштеп чыгуунун негиздерин',
                    'SQL жана маалымат базаларын',
                    'Программалоодо чечим кабыл алуу',
                ],
                en: [
                    'C and Python programming languages',
                    'Algorithms and data structures',
                    'Web development fundamentals',
                    'SQL and databases',
                    'Problem-solving in programming',
                ],
                ru: [
                    'Языки программирования C и Python',
                    'Алгоритмы и структуры данных',
                    'Основы веб-разработки',
                    'SQL и базы данных',
                    'Решение задач в программировании',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Программалоону жаңыдан баштагандар',
                    'IT чөйрөсүнө кирүүнү каалагандар',
                    'Системалуу CS билим алгысы келгендер',
                    'Техникалык эмес тармактардан IT-га өтүүчүлөр',
                ],
                en: [
                    'Complete beginners to programming',
                    'Those looking to enter the IT field',
                    'Those seeking a solid CS foundation',
                    'Career changers from non-technical backgrounds',
                ],
                ru: [
                    'Полные новички в программировании',
                    'Желающие войти в IT-сферу',
                    'Те, кто хочет получить системное CS-образование',
                    'Специалисты из нетехнических областей',
                ],
            },
            whyRecommended: {
                ky: 'CS50 — кыргыз студенттери үчүн идеалдуу башлангыч чекити. Курстун педагогикалык сапаты дүйнөдөгү эң жогорку деңгээлде. Дэвид Малан аркылуу берилүүчү лекциялар мотивациялуу жана так. Сертификаты эмгек базарында жогору бааланат.',
                en: 'CS50 is the ideal starting point for any beginner. The course quality is among the highest in the world. Lectures by David Malan are motivating and clear. The certificate is highly valued in the job market.',
                ru: 'CS50 — идеальная отправная точка для любого новичка. Качество курса — одно из лучших в мире. Лекции Дэвида Малана мотивируют и дают чёткое понимание. Сертификат высоко ценится на рынке труда.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'C тилине киришүү', en: 'Intro to C', ru: 'Введение в C' }, description: { ky: 'Scratch, C тилинин негиздери, айнымалдар, шарттар', en: 'Scratch, C basics, variables, conditions', ru: 'Scratch, основы C, переменные, условия' } },
                { week: 2, title: { ky: 'Массивдер', en: 'Arrays', ru: 'Массивы' }, description: { ky: 'Функциялар, массивдер, командалык аргументтер', en: 'Functions, arrays, command-line arguments', ru: 'Функции, массивы, аргументы командной строки' } },
                { week: 3, title: { ky: 'Алгоритмдер', en: 'Algorithms', ru: 'Алгоритмы' }, description: { ky: 'Издөө жана иреттөө алгоритмдери, Big-O', en: 'Search and sort algorithms, Big-O', ru: 'Алгоритмы поиска и сортировки, Big-O' } },
                { week: 4, title: { ky: 'Эс тутум', en: 'Memory', ru: 'Память' }, description: { ky: 'Эс тутум, указатели, heap жана stack', en: 'Memory, pointers, heap and stack', ru: 'Память, указатели, heap и stack' } },
                { week: 5, title: { ky: 'Маалымат структуралары', en: 'Data Structures', ru: 'Структуры данных' }, description: { ky: 'Байланган тизмелер, дарактар, хэш таблицалары', en: 'Linked lists, trees, hash tables', ru: 'Связные списки, деревья, хеш-таблицы' } },
                { week: 6, title: { ky: 'Python', en: 'Python', ru: 'Python' }, description: { ky: 'Python тилине өтүү, кыскача жазуу', en: 'Transitioning to Python, concise syntax', ru: 'Переход на Python, лаконичный синтаксис' } },
                { week: 7, title: { ky: 'SQL', en: 'SQL', ru: 'SQL' }, description: { ky: 'SQL, маалымат базалары, SQLite', en: 'SQL, databases, SQLite', ru: 'SQL, базы данных, SQLite' } },
                { week: 8, title: { ky: 'HTML / CSS / JavaScript', en: 'HTML / CSS / JavaScript', ru: 'HTML / CSS / JavaScript' }, description: { ky: 'Интернеттин негиздери, DOM, React кириш', en: 'Web fundamentals, DOM, intro to React', ru: 'Основы веба, DOM, введение в React' } },
                { week: 9, title: { ky: 'Flask', en: 'Flask', ru: 'Flask' }, description: { ky: 'Python Flask менен серверлик веб-иштеп чыгуу', en: 'Server-side web development with Python Flask', ru: 'Серверная веб-разработка с Python Flask' } },
                { week: 10, title: { ky: 'Emoji', en: 'Final Project', ru: 'Финальный проект' }, description: { ky: 'Cybersecurity, AI жана финалдык долбоор', en: 'Cybersecurity, AI and final project', ru: 'Кибербезопасность, AI и финальный проект' } },
            ],
            difficultyNotes: {
                ky: [
                    'Лекциялар англис тилинде — субтитрлер бар',
                    'Жума сайын 5–10 саат иш убактысы талап кылынат',
                    'Problem set тапшырмалары жеңил эмес, бирок чечүүгө болот',
                ],
                en: [
                    'Lectures are in English — subtitles available',
                    '5–10 hours of work per week required',
                    'Problem sets are challenging but achievable',
                ],
                ru: [
                    'Лекции на английском — субтитры доступны',
                    'Требуется 5–10 часов работы в неделю',
                    'Задачи сложные, но решаемые',
                ],
            },
            relatedCourseSlugs: [],
        },
    },
    {
        slug: 'google-it-support-professional',
        title: 'Google IT Support Professional Certificate',
        provider: 'Google (Coursera)',
        providerKey: 'google',
        url: 'https://grow.google/certificates/it-support/',
        coverImageUrl: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets/meta_images/generated/SPECIALIZATION/SPECIALIZATION~google-it-support/886x500.jpeg',
        category: 'programming',
        level: 'beginner',
        priceLabel: { ky: 'Акысыз / Coursera Financial Aid', ru: 'Бесплатно / Coursera Financial Aid', en: 'Free / Coursera Financial Aid' },
        certificateLabel: { ky: 'Кесипкөй сертификат', ru: 'Профессиональный сертификат', en: 'Professional certificate' },
        durationLabel: { ky: '6 ай', ru: '6 месяцев', en: '6 months' },
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Google компаниясынын IT колдоо боюнча кесипкөй сертификаттоо программасы. IT карьерасына жылдам кирүүнүн жолу.',
                en: "Google's professional IT support certification program. One of the fastest paths to launching an IT career.",
                ru: 'Профессиональная сертификационная программа Google по IT-поддержке. Один из самых быстрых путей в IT-карьеру.',
            },
            whatYouWillLearn: {
                ky: [
                    'Техникалык колдоону берүү',
                    'Тармактарды башкаруу',
                    'Операциялык системалар (Linux, Windows)',
                    'Системалык администрациянын негиздери',
                    'IT коопсуздугу',
                ],
                en: [
                    'Providing technical support',
                    'Network administration',
                    'Operating systems (Linux, Windows)',
                    'System administration fundamentals',
                    'IT security',
                ],
                ru: [
                    'Предоставление технической поддержки',
                    'Администрирование сетей',
                    'Операционные системы (Linux, Windows)',
                    'Основы системного администрирования',
                    'IT-безопасность',
                ],
            },
            whoIsItFor: {
                ky: [
                    'IT чөйрөсүнө кирүүнү каалагандар',
                    'Техникалык колдоо адиси болгусу келгендер',
                    'Системалык администратор болуп иштегилери келгендер',
                ],
                en: [
                    'Those looking to enter the IT field',
                    'Aspiring technical support specialists',
                    'Those wanting to work as system administrators',
                ],
                ru: [
                    'Желающие войти в IT-сферу',
                    'Начинающие специалисты по технической поддержке',
                    'Те, кто хочет стать системным администратором',
                ],
            },
            whyRecommended: {
                ky: 'Google бренди жана кесипкөй сертификат эмгек базарында ишенимдүүлүк берет. Бул IT-га кирүүнүн эң практикалык жолдорунун бири.',
                en: "Google's brand and professional certificate add credibility in the job market. This is one of the most practical ways to break into IT.",
                ru: 'Бренд Google и профессиональный сертификат повышают доверие работодателей. Это один из наиболее практичных способов войти в IT.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Техникалык колдоо негиздери', en: 'Technical Support Fundamentals', ru: 'Основы технической поддержки' }, description: { ky: 'IT тармагына киришүү, тейлөө жаткылалары', en: 'Intro to IT, troubleshooting practices', ru: 'Введение в IT, практики устранения неполадок' } },
                { week: 3, title: { ky: 'Биттер жана Байттар', en: 'Bits and Bytes', ru: 'Биты и байты' }, description: { ky: 'Операциялык системалар, аппараттык камсыздоо', en: 'Operating systems, hardware', ru: 'Операционные системы, аппаратное обеспечение' } },
                { week: 5, title: { ky: 'Тармак', en: 'Networking', ru: 'Сети' }, description: { ky: 'TCP/IP, DNS, тармак администрациясы', en: 'TCP/IP, DNS, network administration', ru: 'TCP/IP, DNS, администрирование сетей' } },
                { week: 8, title: { ky: 'Система администрациясы', en: 'System Administration', ru: 'Системное администрирование' }, description: { ky: 'Active Directory, Cloud, PowerShell', en: 'Active Directory, Cloud, PowerShell', ru: 'Active Directory, Cloud, PowerShell' } },
                { week: 10, title: { ky: 'IT коопсуздугу', en: 'IT Security', ru: 'IT-безопасность' }, description: { ky: 'Шифрлөө, тармак коопсуздугу, коргоо', en: 'Encryption, network security, defense', ru: 'Шифрование, сетевая безопасность, защита' } },
            ],
            difficultyNotes: {
                ky: [
                    'Англис тилинде, субтитрлер жана аудармалар бар',
                    'Financial Aid аркылуу толугу менен акысыз болушу мүмкүн',
                ],
                en: [
                    'In English — subtitles and translations available',
                    'Can be fully free via Financial Aid',
                ],
                ru: [
                    'На английском — субтитры и переводы доступны',
                    'Может быть полностью бесплатным через Financial Aid',
                ],
            },
            relatedCourseSlugs: [],
        },
    },
    {
        slug: 'freecodecamp-responsive-web-design',
        title: 'Responsive Web Design Certification',
        provider: 'freeCodeCamp',
        providerKey: 'freecodecamp',
        url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
        coverImageUrl: 'https://i.ytimg.com/vi/srvUrASNj0s/maxresdefault.jpg',
        category: 'web',
        level: 'beginner',
        priceLabel: { ky: 'Толугу менен акысыз', ru: 'Полностью бесплатно', en: 'Completely Free' },
        certificateLabel: { ky: 'Сертификат бар', ru: 'Сертификат есть', en: 'Certificate available' },
        durationLabel: { ky: '300 саат', ru: '300 часов', en: '300 hours' },
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'HTML жана CSS аркылуу заманбап, жооптуу веб-сайттарды жасоону үйрөнүңүз. freeCodeCamp — дүйнөдөгү эң ишенимдүү акысыз веб-иштеп чыгуу платформасы.',
                en: 'Learn to build modern, responsive websites with HTML and CSS. freeCodeCamp is the world\'s most trusted free web development platform.',
                ru: 'Научитесь создавать современные адаптивные сайты с HTML и CSS. freeCodeCamp — самая надёжная бесплатная платформа для веб-разработки.',
            },
            whatYouWillLearn: {
                ky: [
                    'HTML5 тагдары жана структурасы',
                    'CSS Flexbox жана Grid',
                    'Жооптуу дизайн принциптери',
                    'CSS өзгөрүлмөлөрү жана анимациялар',
                    '5 сертификаттык долбоор',
                ],
                en: [
                    'HTML5 tags and document structure',
                    'CSS Flexbox and Grid',
                    'Responsive design principles',
                    'CSS variables and animations',
                    '5 certification projects',
                ],
                ru: [
                    'Теги HTML5 и структура документа',
                    'CSS Flexbox и Grid',
                    'Принципы адаптивного дизайна',
                    'CSS-переменные и анимации',
                    '5 сертификационных проектов',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Веб-иштеп чыгуучу болгусу келгендер',
                    'Фронтенд карьерасын баштагандар',
                    'HTML/CSS негиздерин үйрөнгүсү келгендер',
                ],
                en: [
                    'Those who want to become web developers',
                    'Those starting a frontend career',
                    'Those wanting to learn HTML/CSS fundamentals',
                ],
                ru: [
                    'Желающие стать веб-разработчиками',
                    'Начинающие фронтенд-карьеру',
                    'Те, кто хочет освоить основы HTML/CSS',
                ],
            },
            whyRecommended: {
                ky: 'freeCodeCamp — дүйнөнүн эң ишенимдүү акысыз веб-иштеп чыгуу платформасы. Бул сертификат практикалык долбоорлорго негизделген жана реалдуу портфолио куруу үчүн идеалдуу.',
                en: 'freeCodeCamp is the world\'s most trusted free web development platform. This certification is project-based and ideal for building a real portfolio.',
                ru: 'freeCodeCamp — самая надёжная бесплатная платформа для веб-разработки. Этот сертификат основан на практических проектах и идеально подходит для создания реального портфолио.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'HTML негиздери', en: 'HTML Basics', ru: 'Основы HTML' }, description: { ky: 'Тагдар, атрибуттар, документ структурасы', en: 'Tags, attributes, document structure', ru: 'Теги, атрибуты, структура документа' } },
                { week: 2, title: { ky: 'CSS негиздери', en: 'CSS Basics', ru: 'Основы CSS' }, description: { ky: 'Стилдер, шрифттер, түстөр, блок модели', en: 'Styles, fonts, colors, box model', ru: 'Стили, шрифты, цвета, блочная модель' } },
                { week: 3, title: { ky: 'CSS Flexbox', en: 'CSS Flexbox', ru: 'CSS Flexbox' }, description: { ky: 'Flexbox менен жайгаштыруу', en: 'Layout with Flexbox', ru: 'Вёрстка с Flexbox' } },
                { week: 4, title: { ky: 'CSS Grid', en: 'CSS Grid', ru: 'CSS Grid' }, description: { ky: 'Grid макеттер', en: 'Grid layouts', ru: 'Grid-макеты' } },
                { week: 5, title: { ky: 'Жооптуу дизайн', en: 'Responsive Design', ru: 'Адаптивный дизайн' }, description: { ky: 'Media queries, мобилдик биринчи', en: 'Media queries, mobile-first', ru: 'Media queries, mobile-first подход' } },
            ],
            difficultyNotes: {
                ky: [
                    'Браузерде түздөн-түз жазуу мүмкүнчүлүгү бар',
                    'Баары акысыз, каттоо керек',
                ],
                en: [
                    'Code directly in the browser — no setup needed',
                    'Completely free, registration required',
                ],
                ru: [
                    'Код прямо в браузере — установка не нужна',
                    'Полностью бесплатно, нужна регистрация',
                ],
            },
            relatedCourseSlugs: [],
        },
    },
    {
        slug: 'freecodecamp-javascript-algorithms',
        title: 'JavaScript Algorithms and Data Structures',
        provider: 'freeCodeCamp',
        providerKey: 'freecodecamp',
        url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
        coverImageUrl: 'https://i.ytimg.com/vi/t2CEgPsws3U/maxresdefault.jpg',
        category: 'programming',
        level: 'intermediate',
        priceLabel: { ky: 'Толугу менен акысыз', ru: 'Полностью бесплатно', en: 'Completely Free' },
        certificateLabel: { ky: 'Сертификат бар', ru: 'Сертификат есть', en: 'Certificate available' },
        durationLabel: { ky: '300 саат', ru: '300 часов', en: '300 hours' },
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'JavaScript тилин тереңирек үйрөнүп, алгоритмдерди жана маалымат структураларын практикада колдонуңуз.',
                en: 'Deepen your JavaScript knowledge and apply algorithms and data structures in practice.',
                ru: 'Углубите знания JavaScript и применяйте алгоритмы и структуры данных на практике.',
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
                en: [
                    'JavaScript fundamentals and ES6+',
                    'Regular expressions',
                    'Data structures',
                    'Algorithm scripting',
                    'Object-oriented programming',
                    'Functional programming',
                ],
                ru: [
                    'Основы JavaScript и ES6+',
                    'Регулярные выражения',
                    'Структуры данных',
                    'Алгоритмические скрипты',
                    'Объектно-ориентированное программирование',
                    'Функциональное программирование',
                ],
            },
            whoIsItFor: {
                ky: [
                    'HTML/CSS билиши барлар',
                    'JavaScript тилин тереңирек үйрөнгүсү келгендер',
                    'Frontend разработчик болгусу келгендер',
                ],
                en: [
                    'Those with HTML/CSS knowledge',
                    'Those wanting to deepen their JavaScript skills',
                    'Aspiring frontend developers',
                ],
                ru: [
                    'Те, кто знает HTML/CSS',
                    'Желающие углубить знания JavaScript',
                    'Начинающие фронтенд-разработчики',
                ],
            },
            whyRecommended: {
                ky: 'JavaScript — веб-иштеп чыгуунун негизги тили. Бул курс практикалык алгоритмдик ойлоону өнүктүрөт жана техникалык интервьюга даярдайт.',
                en: 'JavaScript is the core language of web development. This course develops practical algorithmic thinking and prepares you for technical interviews.',
                ru: 'JavaScript — основной язык веб-разработки. Этот курс развивает алгоритмическое мышление и готовит к техническим собеседованиям.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'JS негиздери', en: 'JS Basics', ru: 'Основы JS' }, description: { ky: 'Айнымалдар, функциялар, объектилер, массивдер', en: 'Variables, functions, objects, arrays', ru: 'Переменные, функции, объекты, массивы' } },
                { week: 2, title: { ky: 'ES6+', en: 'ES6+', ru: 'ES6+' }, description: { ky: 'Arrow functions, destructuring, modules', en: 'Arrow functions, destructuring, modules', ru: 'Стрелочные функции, деструктуризация, модули' } },
                { week: 3, title: { ky: 'Алгоритмдер', en: 'Algorithms', ru: 'Алгоритмы' }, description: { ky: 'Иреттөө, рекурсия, динамикалык программалоо', en: 'Sorting, recursion, dynamic programming', ru: 'Сортировка, рекурсия, динамическое программирование' } },
                { week: 4, title: { ky: 'OOP', en: 'OOP', ru: 'ООП' }, description: { ky: 'Класстар, прототиптер, мурасчылык', en: 'Classes, prototypes, inheritance', ru: 'Классы, прототипы, наследование' } },
                { week: 5, title: { ky: 'Функционалдык JS', en: 'Functional JS', ru: 'Функциональный JS' }, description: { ky: 'Map, filter, reduce, чынчыл функциялар', en: 'Map, filter, reduce, pure functions', ru: 'Map, filter, reduce, чистые функции' } },
            ],
            difficultyNotes: {
                ky: [
                    'HTML/CSS негиздери болушу сунушталат',
                    'Алгоритмдик бөлүм татаал болушу мүмкүн',
                ],
                en: [
                    'HTML/CSS basics are recommended',
                    'The algorithms section can be challenging',
                ],
                ru: [
                    'Рекомендуется знание основ HTML/CSS',
                    'Раздел алгоритмов может быть сложным',
                ],
            },
            relatedCourseSlugs: ['freecodecamp-responsive-web-design'],
        },
    },
    {
        slug: 'khan-academy-computer-programming',
        title: 'Intro to JS: Drawing & Animation',
        provider: 'Khan Academy',
        providerKey: 'khanacademy',
        url: 'https://www.khanacademy.org/computing/computer-programming',
        coverImageUrl: null,
        category: 'programming',
        level: 'beginner',
        priceLabel: { ky: 'Толугу менен акысыз', ru: 'Полностью бесплатно', en: 'Completely Free' },
        certificateLabel: { ky: 'Ачкычтамга бар', ru: 'Есть значки', en: 'Badges available' },
        durationLabel: { ky: 'Өз темпиңизде', ru: 'В своём темпе', en: 'Self-paced' },
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Khan Academy аркылуу JavaScript менен сүрөт тартуу жана анимацияны үйрөнүңүз. Жаш окуучулар жана балдар үчүн идеалдуу башлангыч.',
                en: 'Learn drawing and animation with JavaScript through Khan Academy. An ideal starting point for young learners and children.',
                ru: 'Изучайте рисование и анимацию на JavaScript через Khan Academy. Идеальное начало для юных учеников и детей.',
            },
            whatYouWillLearn: {
                ky: [
                    'JavaScript менен визуалдык программалоо',
                    'Анимация жана интерактивдүүлүк',
                    'ProcessingJS китепканасы',
                    'Оюндарды жасоо негиздери',
                ],
                en: [
                    'Visual programming with JavaScript',
                    'Animation and interactivity',
                    'ProcessingJS library',
                    'Game development basics',
                ],
                ru: [
                    'Визуальное программирование на JavaScript',
                    'Анимация и интерактивность',
                    'Библиотека ProcessingJS',
                    'Основы разработки игр',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Балдар жана жаш окуучулар',
                    'Программалоону кызыктуу жол менен баштагандар',
                    'Визуалдуу натыйжаларды көргүсү келгендер',
                ],
                en: [
                    'Children and young learners',
                    'Those starting programming in a fun way',
                    'Those who want to see visual results quickly',
                ],
                ru: [
                    'Дети и юные ученики',
                    'Те, кто начинает программирование интересным способом',
                    'Те, кто хочет видеть визуальные результаты',
                ],
            },
            whyRecommended: {
                ky: 'Khan Academy — акысыз жана дотируемый. Балдарга жана башталгычтарга программалоого кызыгуу жаратуу үчүн эң мыкты ресурс.',
                en: 'Khan Academy is free and subsidized. The best resource for sparking interest in programming among children and beginners.',
                ru: 'Khan Academy бесплатен и субсидируется. Лучший ресурс для пробуждения интереса к программированию у детей и новичков.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Чийүү', en: 'Drawing', ru: 'Рисование' }, description: { ky: 'Чийим буйруктары, формалар, түстөр', en: 'Drawing commands, shapes, colors', ru: 'Команды рисования, фигуры, цвета' } },
                { week: 2, title: { ky: 'Анимация', en: 'Animation', ru: 'Анимация' }, description: { ky: 'Кыймыл, ылдамдык, draw() функциясы', en: 'Motion, speed, the draw() function', ru: 'Движение, скорость, функция draw()' } },
                { week: 3, title: { ky: 'Интерактивдүүлүк', en: 'Interactivity', ru: 'Интерактивность' }, description: { ky: 'Чычкан, баскыч иштеттери', en: 'Mouse and keyboard events', ru: 'События мыши и клавиатуры' } },
                { week: 4, title: { ky: 'Оюн жасоо', en: 'Game Creation', ru: 'Создание игры' }, description: { ky: 'Таташ аныктоо, эсептегич, деңгээлдер', en: 'Collision detection, score, levels', ru: 'Обнаружение столкновений, счёт, уровни' } },
            ],
            difficultyNotes: {
                ky: [
                    'Оңой. Программалоо тажрыйбасы талап кылынбайт',
                    'Видеолор кыска — 5-10 мүнөт',
                ],
                en: [
                    'Easy. No programming experience required',
                    'Videos are short — 5–10 minutes',
                ],
                ru: [
                    'Легко. Опыт программирования не требуется',
                    'Видео короткие — 5–10 минут',
                ],
            },
            relatedCourseSlugs: [],
        },
    },
    {
        slug: 'odin-project-foundations',
        title: 'The Odin Project: Foundations',
        provider: 'The Odin Project',
        providerKey: 'theodinproject',
        url: 'https://www.theodinproject.com/paths/foundations',
        coverImageUrl: 'https://i.ytimg.com/vi/BMT3iGZW6zk/maxresdefault.jpg',
        category: 'web',
        level: 'beginner',
        priceLabel: { ky: 'Толугу менен акысыз', ru: 'Полностью бесплатно', en: 'Completely Free' },
        certificateLabel: { ky: 'Портфолио долбоорлору', ru: 'Проекты для портфолио', en: 'Portfolio projects' },
        durationLabel: { ky: '~100 саат', ru: '~100 часов', en: '~100 hours' },
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'The Odin Project — толук стек веб-иштеп чыгуу жолу. Реалдуу долбоорлор аркылуу HTML, CSS, JavaScript жана Ruby/Node үйрөнүңүз.',
                en: 'The Odin Project is a full-stack web development path. Learn HTML, CSS, JavaScript and Ruby/Node through real projects.',
                ru: 'The Odin Project — путь к full-stack веб-разработке. Изучайте HTML, CSS, JavaScript и Ruby/Node через реальные проекты.',
            },
            whatYouWillLearn: {
                ky: [
                    'Git жана GitHub менен иштөө',
                    'HTML жана CSS негиздери',
                    'JavaScript программалоо',
                    'Реалдуу портфолио долбоорлорун куруу',
                ],
                en: [
                    'Working with Git and GitHub',
                    'HTML and CSS fundamentals',
                    'JavaScript programming',
                    'Building real portfolio projects',
                ],
                ru: [
                    'Работа с Git и GitHub',
                    'Основы HTML и CSS',
                    'Программирование на JavaScript',
                    'Создание реальных проектов для портфолио',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Full-stack developer болгусу келгендер',
                    'Өз темпиңизде окугандар',
                    'Реалдуу долбоорлор аркылуу үйрөнгүсү келгендер',
                ],
                en: [
                    'Those who want to become full-stack developers',
                    'Self-paced learners',
                    'Those who learn best through real projects',
                ],
                ru: [
                    'Желающие стать full-stack разработчиками',
                    'Те, кто учится в своём темпе',
                    'Те, кто лучше усваивает через реальные проекты',
                ],
            },
            whyRecommended: {
                ky: 'The Odin Project — өз темпиңизде жана акысыз full-stack окуу жолу. Портфолионуздагы реалдуу долбоорлор жумушка орношуу мүмкүнчүлүгүн жогорулатат.',
                en: 'The Odin Project is a free, self-paced full-stack learning path. Real projects in your portfolio significantly increase your chances of getting hired.',
                ru: 'The Odin Project — бесплатный, самостоятельный путь к full-stack разработке. Реальные проекты в портфолио значительно повышают шансы на трудоустройство.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Негиздер', en: 'Foundations', ru: 'Основы' }, description: { ky: 'Git, командалык сап, редактор', en: 'Git, command line, text editor', ru: 'Git, командная строка, текстовый редактор' } },
                { week: 2, title: { ky: 'HTML негиздери', en: 'HTML Basics', ru: 'Основы HTML' }, description: { ky: 'HTML документтер, формалар, таблицалар', en: 'HTML documents, forms, tables', ru: 'HTML-документы, формы, таблицы' } },
                { week: 3, title: { ky: 'CSS негиздери', en: 'CSS Basics', ru: 'Основы CSS' }, description: { ky: 'Каскад, Flexbox, жооптуу дизайн', en: 'Cascade, Flexbox, responsive design', ru: 'Каскад, Flexbox, адаптивный дизайн' } },
                { week: 4, title: { ky: 'JavaScript негиздери', en: 'JS Fundamentals', ru: 'Основы JS' }, description: { ky: 'Айнымалдар, функциялар, DOM манипуляциясы', en: 'Variables, functions, DOM manipulation', ru: 'Переменные, функции, манипуляция DOM' } },
                { week: 5, title: { ky: 'Долбоорлор', en: 'Projects', ru: 'Проекты' }, description: { ky: 'Калкулятор, Etch-a-Sketch, Tic-Tac-Toe', en: 'Calculator, Etch-a-Sketch, Tic-Tac-Toe', ru: 'Калькулятор, Etch-a-Sketch, крестики-нолики' } },
            ],
            difficultyNotes: {
                ky: [
                    'Куратор жок — өз алдыңча үйрөнүүгө даяр болуу керек',
                    'Community Discord аркылуу жардам алса болот',
                ],
                en: [
                    'No instructor — must be prepared for self-directed learning',
                    'Help available via the community Discord',
                ],
                ru: [
                    'Нет куратора — нужно быть готовым к самостоятельному обучению',
                    'Помощь доступна через Discord сообщества',
                ],
            },
            relatedCourseSlugs: ['freecodecamp-responsive-web-design'],
        },
    },
    {
        slug: 'google-data-analytics-professional',
        title: 'Google Data Analytics Professional Certificate',
        provider: 'Google (Coursera)',
        providerKey: 'google',
        url: 'https://grow.google/certificates/data-analytics/',
        coverImageUrl: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets/meta_images/generated/SPECIALIZATION/SPECIALIZATION~google-data-analytics/886x500.jpeg',
        category: 'data',
        level: 'beginner',
        priceLabel: { ky: 'Акысыз / Coursera Financial Aid', ru: 'Бесплатно / Coursera Financial Aid', en: 'Free / Coursera Financial Aid' },
        certificateLabel: { ky: 'Кесипкөй сертификат', ru: 'Профессиональный сертификат', en: 'Professional certificate' },
        durationLabel: { ky: '6 ай', ru: '6 месяцев', en: '6 months' },
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Google компаниясынан маалымат аналитикасы боюнча кесипкөй сертификаттоо. Spreadsheet, SQL, R жана Tableau инструменттерин үйрөнүңүз.',
                en: 'Professional data analytics certification from Google. Learn Spreadsheet, SQL, R, and Tableau tools.',
                ru: 'Профессиональная сертификация по анализу данных от Google. Изучите Spreadsheet, SQL, R и Tableau.',
            },
            whatYouWillLearn: {
                ky: [
                    'Маалыматтарды тазалоо жана даярдоо',
                    'SQL жана R программалоо тили',
                    'Tableau менен визуализация',
                    'Маалыматтарга негизделген чечим кабыл алуу',
                    'Реалдуу кейс-стадилер',
                ],
                en: [
                    'Data cleaning and preparation',
                    'SQL and R programming language',
                    'Visualization with Tableau',
                    'Data-driven decision making',
                    'Real-world case studies',
                ],
                ru: [
                    'Очистка и подготовка данных',
                    'SQL и язык программирования R',
                    'Визуализация с Tableau',
                    'Принятие решений на основе данных',
                    'Реальные кейсы',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Маалымат аналитикасына кирүүнү каалагандар',
                    'Бизнес чечимдерин маалыматка негиздегилери келгендер',
                    'SQL жана R үйрөнгүсү келгендер',
                ],
                en: [
                    'Those looking to enter data analytics',
                    'Those who want data-driven business decisions',
                    'Those wanting to learn SQL and R',
                ],
                ru: [
                    'Желающие войти в сферу анализа данных',
                    'Те, кто хочет принимать решения на основе данных',
                    'Желающие изучить SQL и R',
                ],
            },
            whyRecommended: {
                ky: 'Маалымат аналитикасы — кыргыз компанияларынын эң суроо-талап кылынган тармактарынын бири. Google сертификаты эл аралык деңгээлде таанылат.',
                en: 'Data analytics is one of the most in-demand fields. The Google certificate is internationally recognized.',
                ru: 'Аналитика данных — одна из самых востребованных областей. Сертификат Google признан на международном уровне.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Маалымат аналитикасына киришүү', en: 'Intro to Data Analytics', ru: 'Введение в анализ данных' }, description: { ky: 'Аналитик ролу, маалымат экосистемасы', en: 'Analyst role, data ecosystem', ru: 'Роль аналитика, экосистема данных' } },
                { week: 3, title: { ky: 'Spreadsheet', en: 'Spreadsheet', ru: 'Таблицы' }, description: { ky: 'Google Sheets, Excel негиздери', en: 'Google Sheets, Excel basics', ru: 'Google Sheets, основы Excel' } },
                { week: 5, title: { ky: 'SQL', en: 'SQL', ru: 'SQL' }, description: { ky: 'Маалымат базаларынан суроо берүү', en: 'Querying databases', ru: 'Запросы к базам данных' } },
                { week: 8, title: { ky: 'R программалоо', en: 'R Programming', ru: 'Программирование на R' }, description: { ky: 'R тили, тазалоо, визуализация', en: 'R language, cleaning, visualization', ru: 'Язык R, очистка, визуализация' } },
                { week: 10, title: { ky: 'Tableau жана презентация', en: 'Tableau & Presentation', ru: 'Tableau и презентация' }, description: { ky: 'Дашбоорд, стейкхолдерлерге баяндама', en: 'Dashboard, stakeholder reporting', ru: 'Дашборд, отчётность для стейкхолдеров' } },
            ],
            difficultyNotes: {
                ky: [
                    'Программалоо тажрыйбасы талап кылынбайт',
                    'Financial Aid менен Coursera акысыз',
                ],
                en: [
                    'No programming experience required',
                    'Coursera is free with Financial Aid',
                ],
                ru: [
                    'Опыт программирования не требуется',
                    'Coursera бесплатен при наличии Financial Aid',
                ],
            },
            relatedCourseSlugs: [],
        },
    },
    {
        slug: 'cs50-ai-with-python',
        title: "CS50's Introduction to AI with Python",
        provider: 'Harvard University',
        providerKey: 'harvard',
        url: 'https://cs50.harvard.edu/ai/',
        coverImageUrl: 'https://i.ytimg.com/vi/5NgNicANyqM/maxresdefault.jpg',
        category: 'ai',
        level: 'intermediate',
        priceLabel: { ky: 'Акысыз', ru: 'Бесплатно', en: 'Free' },
        certificateLabel: { ky: 'Сертификат бар', ru: 'Сертификат есть', en: 'Certificate available' },
        durationLabel: { ky: '7 апта', ru: '7 недель', en: '7 weeks' },
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Гарвард университетинен AI жана машина окутуусуна киришүү. Python менен реалдуу AI долбоорлорун жасоону үйрөнүңүз.',
                en: 'Introduction to AI and machine learning from Harvard University. Learn to build real AI projects with Python.',
                ru: 'Введение в ИИ и машинное обучение от Гарвардского университета. Научитесь создавать реальные AI-проекты на Python.',
            },
            whatYouWillLearn: {
                ky: [
                    'Издөө алгоритмдери (BFS, DFS, A*)',
                    'Билим базалары жана логика',
                    'Машина окутуусунун негиздери',
                    'Нейрон тармактары',
                    'Табигый тил иштетүү (NLP)',
                ],
                en: [
                    'Search algorithms (BFS, DFS, A*)',
                    'Knowledge bases and logic',
                    'Machine learning fundamentals',
                    'Neural networks',
                    'Natural language processing (NLP)',
                ],
                ru: [
                    'Алгоритмы поиска (BFS, DFS, A*)',
                    'Базы знаний и логика',
                    'Основы машинного обучения',
                    'Нейронные сети',
                    'Обработка естественного языка (NLP)',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Python билиши барлар',
                    'AI / ML карьерасын баштагандар',
                    'CS50 курсун аяктагандар',
                ],
                en: [
                    'Those with Python knowledge',
                    'Those starting an AI / ML career',
                    'Those who completed CS50',
                ],
                ru: [
                    'Те, кто знает Python',
                    'Начинающие карьеру в AI / ML',
                    'Те, кто прошёл CS50',
                ],
            },
            whyRecommended: {
                ky: 'AI — азыркы эмгек базарынын эң перспективалуу тармагы. Гарварддын CS50 AI курсу теориялык негизди практикалык долбоорлор менен айкалыштырат.',
                en: 'AI is the most promising field in today\'s job market. Harvard\'s CS50 AI combines theoretical foundations with practical projects.',
                ru: 'ИИ — самая перспективная область на современном рынке труда. CS50 AI от Гарварда сочетает теоретическую базу с практическими проектами.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Издөө', en: 'Search', ru: 'Поиск' }, description: { ky: 'BFS, DFS, Greedy, A* алгоритмдери', en: 'BFS, DFS, Greedy, A* algorithms', ru: 'Алгоритмы BFS, DFS, Greedy, A*' } },
                { week: 2, title: { ky: 'Билим', en: 'Knowledge', ru: 'Знания' }, description: { ky: 'Логика, билим базалары, ойлоо', en: 'Logic, knowledge bases, inference', ru: 'Логика, базы знаний, вывод' } },
                { week: 3, title: { ky: 'Белгисиздик', en: 'Uncertainty', ru: 'Неопределённость' }, description: { ky: 'Ыктымалдык, байесиан тармактары', en: 'Probability, Bayesian networks', ru: 'Вероятность, байесовские сети' } },
                { week: 4, title: { ky: 'Оптимизация', en: 'Optimization', ru: 'Оптимизация' }, description: { ky: 'Локалдык издөө, сызыктуу программалоо', en: 'Local search, linear programming', ru: 'Локальный поиск, линейное программирование' } },
                { week: 5, title: { ky: 'Машина окутуусу', en: 'Machine Learning', ru: 'Машинное обучение' }, description: { ky: 'Регрессия, классификация, нейрон тармактары', en: 'Regression, classification, neural networks', ru: 'Регрессия, классификация, нейронные сети' } },
                { week: 6, title: { ky: 'NLP', en: 'NLP', ru: 'NLP' }, description: { ky: 'Табигый тил иштетүү, марков модели', en: 'Natural language processing, Markov models', ru: 'Обработка естественного языка, модели Маркова' } },
            ],
            difficultyNotes: {
                ky: [
                    'Python орто деңгээлде билүү талап кылынат',
                    'Математикалык негиз жардам берет',
                ],
                en: [
                    'Intermediate Python knowledge required',
                    'A math background is helpful',
                ],
                ru: [
                    'Требуется знание Python на среднем уровне',
                    'Математическая база будет полезна',
                ],
            },
            relatedCourseSlugs: ['cs50-introduction-to-computer-science'],
        },
    },
    {
        slug: 'freecodecamp-python-scientific-computing',
        title: 'Scientific Computing with Python',
        provider: 'freeCodeCamp',
        providerKey: 'freecodecamp',
        url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
        coverImageUrl: 'https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg',
        category: 'programming',
        level: 'intermediate',
        priceLabel: { ky: 'Толугу менен акысыз', ru: 'Полностью бесплатно', en: 'Completely Free' },
        certificateLabel: { ky: 'Сертификат бар', ru: 'Сертификат есть', en: 'Certificate available' },
        durationLabel: { ky: '300 саат', ru: '300 часов', en: '300 hours' },
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Python тилин илимий эсептөөлөр жана маалымат анализи үчүн колдонуңуз. freeCodeCamp сертификаттоо программасы.',
                en: 'Use Python for scientific computing and data analysis. A freeCodeCamp certification program.',
                ru: 'Используйте Python для научных вычислений и анализа данных. Программа сертификации freeCodeCamp.',
            },
            whatYouWillLearn: {
                ky: [
                    'Python негиздери жана OOP',
                    'NumPy жана маалымат структуралары',
                    'Алгоритмдик ойлоо',
                    '5 реалдуу долбоор',
                ],
                en: [
                    'Python fundamentals and OOP',
                    'NumPy and data structures',
                    'Algorithmic thinking',
                    '5 real projects',
                ],
                ru: [
                    'Основы Python и ООП',
                    'NumPy и структуры данных',
                    'Алгоритмическое мышление',
                    '5 реальных проектов',
                ],
            },
            whoIsItFor: {
                ky: [
                    'Python үйрөнгүсү келгендер',
                    'Илимий эсептөөлөргө кызыгуучулар',
                    'Маалымат илимине кадам жасагандар',
                ],
                en: [
                    'Those who want to learn Python',
                    'Those interested in scientific computing',
                    'Those taking their first steps into data science',
                ],
                ru: [
                    'Желающие изучить Python',
                    'Интересующиеся научными вычислениями',
                    'Те, кто делает первые шаги в Data Science',
                ],
            },
            whyRecommended: {
                ky: 'Python — учурда эң сурамжыланган программалоо тили. freeCodeCamp сертификаты портфолиоңузду бекемдейт.',
                en: 'Python is currently the most in-demand programming language. The freeCodeCamp certificate strengthens your portfolio.',
                ru: 'Python — самый востребованный язык программирования на сегодняшний день. Сертификат freeCodeCamp укрепит ваше портфолио.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'Python негиздери', en: 'Python Basics', ru: 'Основы Python' }, description: { ky: 'Айнымалдар, тизмелер, функциялар, цикл', en: 'Variables, lists, functions, loops', ru: 'Переменные, списки, функции, циклы' } },
                { week: 2, title: { ky: 'OOP', en: 'OOP', ru: 'ООП' }, description: { ky: 'Класстар, мурасчылык, магик ыкмалары', en: 'Classes, inheritance, magic methods', ru: 'Классы, наследование, магические методы' } },
                { week: 3, title: { ky: 'Алгоритмдер', en: 'Algorithms', ru: 'Алгоритмы' }, description: { ky: 'Рекурсия, Lambda, маалымат структуралары', en: 'Recursion, Lambda, data structures', ru: 'Рекурсия, Lambda, структуры данных' } },
                { week: 4, title: { ky: 'Долбоорлор', en: 'Projects', ru: 'Проекты' }, description: { ky: 'Арифметик форматтер, бюджет тиркемеси', en: 'Arithmetic formatter, budget app', ru: 'Форматировщик арифметики, приложение бюджета' } },
            ],
            difficultyNotes: {
                ky: [
                    'Программалоонун базалык билими жардам берет',
                ],
                en: [
                    'Basic programming knowledge is helpful',
                ],
                ru: [
                    'Базовые знания программирования будут полезны',
                ],
            },
            relatedCourseSlugs: ['cs50-introduction-to-computer-science'],
        },
    },
    {
        slug: 'meta-frontend-developer-professional',
        title: 'Meta Front-End Developer Professional Certificate',
        provider: 'Meta (Coursera)',
        providerKey: 'meta',
        url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
        coverImageUrl: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera_assets/meta_images/generated/SPECIALIZATION/SPECIALIZATION~meta-front-end-developer/886x500.jpeg',
        category: 'web',
        level: 'intermediate',
        priceLabel: { ky: 'Акысыз / Coursera Financial Aid', ru: 'Бесплатно / Coursera Financial Aid', en: 'Free / Coursera Financial Aid' },
        certificateLabel: { ky: 'Кесипкөй сертификат', ru: 'Профессиональный сертификат', en: 'Professional certificate' },
        durationLabel: { ky: '7 ай', ru: '7 месяцев', en: '7 months' },
        isFeatured: false,
        content: {
            shortDescription: {
                ky: 'Meta компаниясынан Frontend иштеп чыгуу боюнча кесипкөй сертификаттоо. React, JavaScript жана UI/UX принциптерин үйрөнүңүз.',
                en: 'Professional frontend development certification from Meta. Learn React, JavaScript, and UI/UX principles.',
                ru: 'Профессиональная сертификация по фронтенд-разработке от Meta. Изучите React, JavaScript и принципы UI/UX.',
            },
            whatYouWillLearn: {
                ky: [
                    'HTML, CSS, JavaScript тереңирек',
                    'React жана компонент архитектурасы',
                    'Version control жана Git',
                    'UI/UX дизайн принциптери',
                    'Capstone долбоор — реалдуу portfolio',
                ],
                en: [
                    'HTML, CSS, JavaScript in depth',
                    'React and component architecture',
                    'Version control and Git',
                    'UI/UX design principles',
                    'Capstone project — real portfolio',
                ],
                ru: [
                    'HTML, CSS, JavaScript углублённо',
                    'React и архитектура компонентов',
                    'Контроль версий и Git',
                    'Принципы UI/UX дизайна',
                    'Capstone-проект — реальное портфолио',
                ],
            },
            whoIsItFor: {
                ky: [
                    'HTML/CSS базалык билими барлар',
                    'React үйрөнгүсү келгендер',
                    'Frontend developer болгусу келгендер',
                ],
                en: [
                    'Those with basic HTML/CSS knowledge',
                    'Those wanting to learn React',
                    'Aspiring frontend developers',
                ],
                ru: [
                    'Те, кто знает основы HTML/CSS',
                    'Желающие изучить React',
                    'Начинающие фронтенд-разработчики',
                ],
            },
            whyRecommended: {
                ky: 'React — азыркы эмгек базарынын эң суроо-талап кылынган frontend технологиясы. Meta сертификаты HR кабыл алуучулар тарабынан жогору бааланат.',
                en: 'React is the most in-demand frontend technology in today\'s job market. The Meta certificate is highly valued by hiring managers.',
                ru: 'React — самая востребованная фронтенд-технология на современном рынке труда. Сертификат Meta высоко ценится рекрутерами.',
            },
            studyPlan: [
                { week: 1, title: { ky: 'HTML/CSS/JS тереңирек', en: 'HTML/CSS/JS In Depth', ru: 'HTML/CSS/JS углублённо' }, description: { ky: 'Семантика, Flexbox, Grid, ES6', en: 'Semantics, Flexbox, Grid, ES6', ru: 'Семантика, Flexbox, Grid, ES6' } },
                { week: 3, title: { ky: 'React негиздери', en: 'React Basics', ru: 'Основы React' }, description: { ky: 'JSX, компоненттер, state, props', en: 'JSX, components, state, props', ru: 'JSX, компоненты, state, props' } },
                { week: 5, title: { ky: 'Advanced React', en: 'Advanced React', ru: 'Продвинутый React' }, description: { ky: 'Hooks, context, тестирлөө', en: 'Hooks, context, testing', ru: 'Hooks, context, тестирование' } },
                { week: 7, title: { ky: 'Capstone', en: 'Capstone', ru: 'Capstone' }, description: { ky: 'Portfolio долбоор, CV даярдоо', en: 'Portfolio project, CV preparation', ru: 'Портфолио-проект, подготовка CV' } },
            ],
            difficultyNotes: {
                ky: [
                    'HTML/CSS базалык билими болушу керек',
                    'Financial Aid менен Coursera акысыз',
                ],
                en: [
                    'Basic HTML/CSS knowledge is required',
                    'Coursera is free with Financial Aid',
                ],
                ru: [
                    'Требуются базовые знания HTML/CSS',
                    'Coursera бесплатен при наличии Financial Aid',
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

export const getResourcesRelatedToCourse = (course, limit = 3) => {
    const haystack = [
        course?.category?.name,
        course?.categoryName,
        course?.title,
    ].filter(Boolean).join(' ').toLowerCase();

    let category = null;
    if (/frontend|html|css|react|vue|angular|веб|web/.test(haystack)) {
        category = 'web';
    } else if (/\bai\b|\bml\b|machine.?learn|artificial|жасалма/.test(haystack)) {
        category = 'ai';
    } else if (/\bdata\b|analytics|sql|маалымат/.test(haystack)) {
        category = 'data';
    } else if (/python|javascript|\bjs\b|programming|программалоо|алгоритм|computer/.test(haystack)) {
        category = 'programming';
    }

    const matched = category
        ? EXTERNAL_RESOURCES.filter((r) => r.category === category)
        : [];

    if (matched.length >= limit) return matched.slice(0, limit);

    const fallback = EXTERNAL_RESOURCES.filter((r) => r.isFeatured && !matched.includes(r));
    return [...matched, ...fallback].slice(0, limit);
};
