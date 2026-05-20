export const courses = {
    catalogPage: {
        title: "Каталог",
        description: "Курстун аталышы, багыты же инструктор боюнча издеңиз.",
        search: {
            label: "Курстарды издөө",
            placeholder: "Курстарды изде...",
            helper: "Издөө кыска тыныгуудан кийин жаңыланат."
        },
        status: {
            loading: "Каталог жүктөлүүдө...",
            loadError: "Каталог жүктөлгөн жок.",
            results: "{{value}} курс көрсөтүлүүдө",
            resultsForQuery: "\"{{query}}\" боюнча {{value}} курс табылды",
            noResults: "Курстар табылган жок"
        },
        price: {
            free: "Акысыз",
            amount: "{{amount}} сом",
            notSpecified: "Баасы көрсөтүлгөн эмес"
        },
        courseTypes: {
            offline: "Офлайн",
            onlineLive: "Онлайн түз эфир",
            video: "Видео курс"
        },
        duration: {
            hours: "{{value}} саат",
            lessons: "{{value}} сабак",
            notSpecified: "Узактыгы көрсөтүлгөн эмес"
        },
        error: {
            title: "Каталог жүктөлгөн жок.",
            description: "Кайра аракет кылып көрүңүз."
        },
        actions: {
            retry: "Кайра жүктөө"
        },
        empty: {
            search: "Бул издөө боюнча курстар табылган жок.",
            default: "Азырынча каталогдо курстар жок."
        },
        pagination: {
            label: "Каталог барактары",
            previous: "Мурунку",
            next: "Кийинки",
            page: "{{page}}-барак"
        }
    },
    videoUpload: {
        label: "Видео жүктөө",
        uploading: "Жүктөлүүдө: {{progress}}%",
        errors: {
            invalidType: "Файл түрү туура эмес. MP4, WebM, AVI, MOV, MKV же WMV жүктөңүз.",
            tooLarge: "Файлдын көлөмү 1 GBдан аз болушу керек.",
            uploadFailed: "Видеону жүктөө мүмкүн болбоду."
        }
    },
    courseApi: {
        toasts: {
            certificatePdfDownloadFailed: "Сертификат PDF жүктөө мүмкүн болбоду.",
            courseDeleted: "Курс өчүрүлдү.",
            courseDeleteFailed: "Курсту өчүрүү мүмкүн болбоду."
        },
        errors: {
            uploadUrlFailed: "Файл жүктөөнү даярдоо мүмкүн болбоду.",
            fileTooLarge: "Тандалган файл өтө чоң.",
            fileUploadFailed: "Файлды жүктөө мүмкүн болбоду."
        }
    },
    courseLearning: {
        actions: {
            back: "Артка",
            home: "Башкы бетке кайтуу"
        },
        quiz: {
            notFound: "Квиз табылган жок.",
            startTitle: "Тестти баштайбыз! Даярсыңбы?",
            startAction: "Тестти баштоо",
            scoreSummary: "{{score}}% ({{correct}}/{{total}}) туура",
            gradeAlt: {
                passed: "Квизден өттү деген баа",
                nearlyPassed: "Квизден өтүүгө жакын деген баа",
                failed: "Квизден өткөн жок деген баа"
            },
            passedMessage: "Сиз терең билим көрсөттүңүз!",
            failedMessage: "Өтө албай калдыңыз. Кайра аракет кылыңыз.",
            retake: "Кайрадан өтүү.",
            viewAnswers: "Жоопторун көрүү",
            yourAnswer: "Сиздин жооп",
            skipped: "Калтырылды",
            correctAnswer: "Туура жооп",
            skip: "Өткөрүү",
            submit: "Жыйынтыктоо",
            next: "Кийинкиси",
            skippedCount: "Калтырылган суроолор: {{skipped}} / {{total}}",
            noQuestions: "Суроолор табылган жок.",
            toasts: {
                allQuestionsRequired: "Бардык суроолор каралышы керек"
            }
        },
        challenge: {
            notFound: "Код тапшырма табылган жок.",
            task: "Тапшырма",
            noInstructions: "Инструкция берилген эмес.",
            visibleTests: "Ачык тесттер",
            args: "args",
            code: "Код",
            timeLimitMinutes: "{{value}} мүн",
            codePlaceholder: "// Каалаган JavaScript кодун жазыңыз",
            checking: "Текшерүүдө...",
            submit: "Жөнөтүү",
            resultsTitle: "Тест натыйжалары",
            allPassed: "Бардык тесттер ийгиликтүү өттү!",
            someFailed: "Айрым тесттер өтпөй калды.",
            testFallback: "Тест {{number}}",
            hiddenSuffix: "(жашыруун)",
            actualResult: "Чыныгы натыйжа",
            expectedResult: "Күтүлгөн натыйжа"
        }
    }
};
