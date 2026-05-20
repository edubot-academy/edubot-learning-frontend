export const dashboard = {
    dashboardSidebar: {
        collapse: "Менюну жыйуу",
        expand: "Меню",
        navigationMenu: "Панель навигация менюсу",
        sections: "Панель бөлүмдөрү",
        categories: {
            primary: "Негизги функциялар",
            secondary: "Окутуу башкаруу",
            progress: "Окутуу прогресси",
            personal: "Жеке башкаруу",
            content: "Мазмун башкаруу",
            users: "Колдонуучулар башкаруу",
            analytics: "Аналитика жана статистика",
            admin: "Система башкаруу",
            other: "Башкалар"
        }
    },
    dashboardLayout: {
        contentAria: "{{role}} панель мазмуну"
    },
    dashboardTabs: {
        sections: "Панель бөлүмдөрү",
        more: "Дагы",
        moreOptions: "Көбүрөөк опциялар",
        labels: {
            overview: "Башкы",
            courses: "Курс",
            "my-courses": "Менин",
            resources: "Файл",
            students: "Студенттер",
            enrollments: "Жазылуу",
            analytics: "Аналитика",
            ai: "AI",
            attendance: "Катышуу",
            homework: "Тапшырма",
            profile: "Профиль",
            schedule: "График",
            tasks: "Тапшырма",
            progress: "Прогресс",
            notifications: "Билдирүү",
            chat: "Чат",
            leaderboard: "Рейтинг",
            sessions: "Сессия",
            offerings: "Агымдар",
            certificates: "Сертификат",
            groups: "Группа",
            stats: "Статистика",
            users: "Колдонуучу",
            companies: "Компания",
            contacts: "Байланыш",
            "ai-prompts": "AI",
            integration: "Интеграция",
            domain: "Домен",
            billing: "Биллинг",
            crm: "CRM",
            members: "Мүчө",
            branding: "Бренд",
            settings: "Жөндөө",
            flags: "Флаг",
            activity: "Активдүүлүк"
        }
    },
    dashboardErrorStates: {
        actions: {
            retry: "Кайра аракет кылуу",
            home: "Башкы бетке",
            back: "Артка кайтуу",
            contactAdmin: "Администраторго кайрылуу",
            report: "Катаны жөнөтүү",
            refreshPage: "Баракты жаңыртуу"
        },
        general: {
            title: "Ката кетти",
            message: "Маалыматты жүктөөдө ката кетти. Кайра аракет кылып көрүңүз.",
            unknown: "Белгисиз ката кетти"
        },
        network: {
            title: "Туташуу катасы",
            message: "Интернет туташуусу жок же серверге жетүү мүмкүн эмес. Туташууну текшерип, кайра аракет кылыңыз."
        },
        permission: {
            title: "Кирүүгө тыюу салынган",
            message: "Бул бөлүккө кирүү үчүн укуктар жетишсиз.",
            roleRequired: "Бул бөлүккө кирүү үчүн \"{{role}}\" ролу керек.",
            contactAdmin: "Администраторго кайрылыңыз."
        },
        notFound: {
            resource: "Маалымат",
            title: "{{resource}} табылган жок",
            message: "Сиз издеген {{resource}} системада жок же өчүрүлгөн. Издөө критерийлерин текшериңиз же башка бөлүккө өтүңүз."
        },
        server: {
            title: "Сервер катасы",
            message: "Серверде күтүлбөгөн ката кетти. Биз бул маселе тууралуу билебиз жана аны тез арада чечүүгө аракет кылып жатабыз. Кийин кайра аракет кылыңыз."
        },
        boundary: {
            title: "Колдонмо катасы",
            message: "Колдонмодо күтүлбөгөн ката кетти. Баракты жаңыртып көрүңүз.",
            details: "Катанын чоо-жайы (текшерүү режиминде гана)"
        }
    },
    dashboardLoaders: {
        imageLoading: "Сүрөт жүктөлүп жатат",
        progress: "Жүктөлүү прогресси"
    },
    dashboardHeader: {
        roles: {
            instructor: "Инструктор панели",
            student: "Студент панели",
            admin: "Админ панели",
            assistant: "Ассистент панели",
            default: "Панель"
        },
        descriptions: {
            instructor: "Курстарыңызды, сессияларды жана студенттик активдүүлүктү бир жерден башкарыңыз.",
            student: "Окуу прогрессиңизди көзөмөлдөп, маанилүү тапшырмаларга тез кайтыңыз.",
            admin: "Платформанын операциялык абалын жана негизги башкаруу агымдарын көзөмөлдөңүз.",
            assistant: "Инструкторлорду колдоп, күнүмдүк операцияларды ылдам аткарыңыз.",
            default: "Панель функциялары"
        },
        chips: {
            workspace: "EduBot панели",
            liveShell: "Жандуу панель"
        }
    },
    floatingActionButton: {
        menu: "Тез аракеттер менюсу",
        quickActions: "Тез аракеттер",
        toggle: "Тез аракеттер менюсун ачуу же жабуу",
        actions: {
            createCourse: "Жаңы курс",
            addStudent: "Студент кошуу",
            createSession: "Түз эфир сессиясы",
            joinCourse: "Курска кошулуу",
            askQuestion: "Суроо берүү",
            addUser: "Колдонуучу кошуу",
            createCompany: "Компания түзүү",
            viewAnalytics: "Аналитика"
        }
    },
    studentAccessFallback: {
        title: "Окуу мүмкүнчүлүгү активдүү эмес",
        description: "Сизде азырынча активдүү жазылуу жок. Менеджериңиз же администратор менен байланышыңыз.",
        latestEnrollment: "Акыркы жазылуу: {{course}} · {{status}}",
        courseFallback: "Курс",
        actions: {
            viewCourses: "Курстарды көрүү",
            loginOther: "Башка аккаунт менен кирүү"
        }
    },
    assistantCompanyState: {
        eyebrow: "Ассистент жеткиликтүүлүгү",
        noCompany: {
            title: "Тенант дайындалган эмес",
            description: "Ассистент аккаунтуңуз азырынча тенантка туташкан эмес. Студенттер жана курстар менен иштөөдөн мурун платформа админинен же тенант админинен сизди кошууну сураныңыз.",
            emptyTitle: "Тенантка кирүү укугу керек",
            emptySubtitle: "Ассистент куралдары тенантка байланган, ошондуктан студент, курс жана катышуу аракеттери туура компания панелинде калат."
        },
        select: {
            title: "Тенант панелин тандаңыз",
            description: "Сиз бир нече тенантка туташкансыз. Студенттерди, катышууну же катталууларды кароодон мурун компания контекстин тандаңыз.",
            label: "Тенант панели",
            placeholder: "Тенант тандаңыз"
        },
        context: {
            roster: {
                title: "Студенттер тизмеси",
                text: "Студент издөө, каттоо аракеттери жана катышуу контексти тандалган тенант менен чектелет."
            },
            courses: {
                title: "Курска жеткиликтүүлүк",
                text: "Курстарды жүктөө жана дайындоо куралдары компаниялар аралашып кетпеши үчүн тенант тандоосун колдонот."
            },
            operations: {
                title: "Күнүмдүк иштер",
                text: "Катталууну өзгөртүүдөн же катышууну текшерүүдөн мурун бүгүн жардам берип жаткан тенантты тандаңыз."
            }
        }
    },
    assistantDashboard: {
        nav: {
            overview: "Кыскача",
            enrollments: "Студенттер",
            courses: "Курстар",
            attendance: "Катышуу"
        },
        workspaceGroups: {
            dailyActions: "Күнүмдүк иштер",
            referenceViews: "Маалымат бөлүмдөрү"
        },
        header: {
            userFallback: "Ассистент",
            hideMenu: "Менюну жашыруу",
            showMenu: "Менюну көрсөтүү",
            companySubtitle: "Ассистент катары сиз {{company}} компаниясынын курстарын көрүп жатасыз.",
            defaultSubtitle: "Инструкторлордун студент жана курс боюнча күнүмдүк иштерине жардам бериңиз."
        },
        metrics: {
            totalStudents: "Жалпы студенттер",
            enrolledStudents: "Катталган студенттер",
            publishedCourses: "Жарыяланган курстар",
            courses: "Курстар"
        },
        toasts: {
            loadFailed: "Панель маалыматын жүктөө мүмкүн болбоду.",
            companiesLoadFailed: "Компанияларды жүктөө мүмкүн болбоду."
        },
        pagination: {
            previous: "Мурунку",
            next: "Кийинки"
        },
        overview: {
            eyebrow: "Ассистент кыскача көрүнүшү",
            title: "Ассистенттин кыскача көрүнүшү",
            description: "Күнүмдүк студент каттоо жана курс жүктөмү боюнча чечим сигналдары.",
            metrics: {
                studentsWithoutCourse: "Курс керек",
                emptyCourses: "Бош курстар",
                highLoadCourses: "Жүктөмү көп курстар"
            },
            workflow: {
                title: "Иш кезеги",
                description: "Негизги милдеттер жана учурдагы компания контексти."
            },
            company: {
                label: "Компания",
                fallback: "Тандалган компания",
                description: "Ассистент катары ушул компаниянын студент жана курс иштерин башкарып жатасыз."
            },
            signal: {
                label: "Чечим сигналы",
                studentsNeedCourse: "{{count}} студентке курс керек",
                highLoadCourses: "{{count}} курста жүктөм жогору",
                emptyCourses: "{{count}} бош курс",
                description: "Бул сигнал учурда ачылган студенттер тизмесине жана ушул беттеги курс жүктөмүнө жараша эсептелет."
            },
            nextSteps: {
                title: "Кийинки кадам",
                description: "Күнүмдүк иш үчүн тез багыт.",
                students: {
                    title: "1. Студенттерди текшериңиз",
                    text: "Каттоо күтүп турган студенттерди Студенттер табынан караңыз."
                },
                courses: {
                    title: "2. Курстарды салыштырыңыз",
                    text: "Курстар табынан ар бир курс боюнча жүктөмдү көрүңүз."
                },
                attendance: {
                    title: "3. Катышууну жаңыртыңыз",
                    text: "Сабак күнү келгенде Катышуу табынан күндүк белгилөөнү аткарыңыз."
                }
            }
        },
        attendance: {
            title: "Катышуу бөлүмү",
            description: "Катышуу жалпы катышуу доменинде калат; бул таб ассистентке туура контекст берет.",
            decisionReason: "Ассистенттин катышуу иши жалпы катышуу бөлүмүндө калат жана ассистенттерге өзүнчө катышуу процесси керек болгондо гана бөлүнөт."
        },
        courses: {
            eyebrow: "Ассистент курстары",
            title: "Курстар жөнүндө маалымат",
            description: "Компаниядагы жарыяланган курстар жана студент жүктөмү."
        },
        courseStats: {
            title: "Курс жүктөмү",
            description: "Компаниядагы курстар боюнча студенттердин бөлүштүрүлүшү.",
            fallbackDescription: "Компаниядагы активдүү курс",
            studentCount: "{{count}} студент",
            empty: {
                title: "Курс табылган жок",
                subtitle: "Компания үчүн жеткиликтүү жарыяланган курстар чыккандан кийин бул жерде көрүнөт."
            },
            signals: {
                empty: {
                    label: "Каттоо күтөт",
                    hint: "Бул курс азыр бош. Каттоону Студенттер табынан баштаңыз."
                },
                highLoad: {
                    label: "Жогорку жүктөм",
                    hint: "Катталган студент көп. Группа жана катышуу иштерин жакын көзөмөлдөңүз."
                },
                active: {
                    label: "Активдүү",
                    hint: "Курста катталган студенттер бар."
                }
            },
            courseTypes: {
                offline: "Офлайн",
                onlineLive: "Онлайн түз эфир",
                video: "Видео курс"
            }
        },
        students: {
            hero: {
                eyebrow: "Ассистент бөлүмү",
                title: "Студент каттоо процесси",
                description: "Компаниядагы студенттерди көрүп, жеткиликтүү курстарга тез каттап же чыгарыңыз."
            },
            searchPlaceholder: "Студент атын же email изде...",
            searchTooShortHelp: "Издөө үчүн кеминде 3 белги киргизиңиз.",
            list: {
                title: "Студенттер тизмеси",
                description: "Ар бир студент үчүн активдүү курстарды көрүп, жаңы курс тандап каттоо аракетин аткарыңыз."
            },
            empty: {
                searchTooShort: {
                    title: "Издөө үчүн маалымат жетишсиз",
                    subtitle: "Натыйжаларды көрсөтүү үчүн кеминде 3 белги киргизиңиз."
                },
                noSearchResults: {
                    title: "Издөөгө туура келген студент табылган жок",
                    subtitle: "Атын, email дарегин же фильтр контекстин өзгөртүп көрүңүз."
                },
                noCourses: {
                    title: "Каттоо үчүн жарыяланган курс жок",
                    subtitle: "Курстар жарыялангандан кийин ассистент студенттерди каттай алат."
                },
                noStudents: {
                    title: "Бекитилген студенттер жок",
                    subtitle: "Компанияга бекитилген студенттер пайда болгондо бул жерде көрсөтүлөт."
                }
            },
            unenrollAria: "{{student}} студентин {{course}} курсунан чыгаруу",
            unenrollTitle: "Курстан чыгаруу",
            unenrolling: "Чыгарылууда...",
            unenroll: "Чыгаруу",
            noEnrolledCourse: "Катталган курс жок",
            courseSelectLabel: "Каттай турган курс",
            courseSelectPlaceholder: "-- Тандоо --",
            selectedCourse: "Тандалды: {{course}}",
            allCoursesEnrolled: "Бардык курстарга катталган",
            enrolling: "Катталууда...",
            enroll: "Каттоо"
        },
        enrollment: {
            confirmAction: "Ооба",
            courseFallback: "курс",
            confirmEnroll: "<strong>{{student}}</strong> студентин <strong>{{course}}</strong> курсуна каттайсызбы?",
            enrollPending: "{{student}} студентин \"{{course}}\" курсуна каттоо жүрүп жатат.",
            enrollSuccessToast: "<strong>{{student}}</strong> курска ийгиликтүү катталды.",
            enrollSuccessFeedback: "{{student}} \"{{course}}\" курсуна катталды.",
            enrollErrorToast: "Курска каттоодо ката кетти.",
            enrollErrorFeedback: "{{student}} студентин \"{{course}}\" курсуна каттоо ишке ашкан жок.",
            confirmUnenroll: "<strong>{{student}}</strong> студентин <strong>{{course}}</strong> курсунан чыгарасызбы?",
            unenrollPending: "{{student}} студентин \"{{course}}\" курсунан чыгаруу жүрүп жатат.",
            unenrollSuccessToast: "<strong>{{student}}</strong> курстан ийгиликтүү чыгарылды.",
            unenrollSuccessFeedback: "{{student}} \"{{course}}\" курсунан чыгарылды.",
            unenrollErrorToast: "Курстан чыгарууда ката кетти.",
            unenrollErrorFeedback: "{{student}} студентин \"{{course}}\" курсунан чыгаруу ишке ашкан жок."
        }
    },
    assistantPanel: {
        empty: {
            noQuestions: "Бул чатта азырынча суроолор жок. Алгачкы суроону жазыңыз."
        },
        toasts: {
            messagesLoadFailed: "Маалыматты жүктөө мүмкүн болгон жок.",
            chatCreated: "Жаңы чат түзүлдү.",
            chatCreateFailed: "Чат түзүү мүмкүн болгон жок.",
            chatsLoadFailed: "Чаттарды жүктөө мүмкүн болгон жок.",
            chatDeleted: "Чат өчүрүлдү.",
            chatDeleteFailed: "Чатты өчүрүү мүмкүн болгон жок.",
            sendFailed: "Суроону жөнөтүү мүмкүн болгон жок."
        },
        actions: {
            openMenu: "Чат менюсун ачуу",
            newChat: "Жаңы баарлашуу",
            deleteChat: "Баарлашууну өчүрүү"
        },
        hero: {
            eyebrow: "EDU",
            brand: "EDU",
            titleSuffix: "AI ассистент",
            description: "Биздин AI ассистент жоопторду тез табууга, натыйжалуураак үйрөнүүгө жана күн сайын өсүүгө жардам берет."
        },
        chat: {
            label: "Чат: {{title}}",
            untitled: "Аталышы жок",
            greeting: "Салам! Кандай жардам керек?"
        },
        prompts: {
            title: "Тез сунуштар"
        },
        input: {
            placeholder: "Сурооңузду ушул жерге жазыңыз...",
            attachFile: "Файлды тиркөө",
            voiceInputSoon: "Үн киргизүү (жакында)",
            sending: "Жөнөтүлүүдө...",
            send: "Жөнөтүү"
        },
        deleteModal: {
            title: "Баарлашууну өчүрүү",
            message: "Учурдагы чатты чын эле өчүргүңүз келеби?",
            confirm: "Өчүрүү"
        }
    }
};
