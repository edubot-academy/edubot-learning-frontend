export const instructor = {
    instructorHomeworkDetail: {
        back: "Тапшырмалар кезеги",
        header: {
            live: "Активдүү",
            draft: "Жарыялана элек",
            dueDate: "Мөөнөт: {{date}}",
            noDueDate: "Мөөнөт жок",
            maxScore: "Макс. {{count}} балл",
            rubric: "Рубрика",
            exportCsv: "CSV экспорт",
            exportError: "Экспорт ишке ашкан жок"
        },
        stats: {
            total: "Жалпы",
            toReview: "Текшерүүгө",
            approved: "Кабыл алынды",
            rejected: "Четке кагылды",
            needsRevision: "Оңдотуу керек",
            missing: "Жөнөткөн жок"
        },
        filters: {
            all: "Баары",
            pending_submission: "Күтүлүүдө",
            missing: "Жөнөткөн жок",
            needs_review: "Текшерүүгө",
            approved: "Кабыл алынды",
            rejected: "Четке кагылды",
            needs_revision: "Оңдотуу керек"
        },
        roster: {
            title: "Студенттер тизмеси",
            description: "Ар бир студенттин иши тике текшерилет жана бааланат.",
            noStudents: "Бул фильтр боюнча студент табылган жок.",
            noStudentsSubtitle: "Башка абал фильтрин тандап көрүңүз.",
            late: "Кеч",
            score: "{{score}} / {{max}} балл",
            openGrading: "Баалоо",
            closeGrading: "Жабуу"
        },
        grading: {
            answerTitle: "Студенттин жообу",
            noAnswer: "Текст жооп берилген жок.",
            attachment: "Тиркемени жүктөп алуу",
            rubricTitle: "Рубрика",
            score: "Балл",
            feedback: "Пикир",
            approve: "Кабыл алуу",
            revision: "Оңдотуу жөнөтүү",
            reject: "Четке кагуу",
            commentsTitle: "Комментарийлер",
            noComments: "Азырынча комментарий жок.",
            commentPlaceholder: "Комментарий кошуу…",
            send: "Жөнөтүү",
            approveSuccess: "Иш кабыл алынды.",
            rejectedSuccess: "Иш четке кагылды.",
            revisionSuccess: "Оңдотуу жөнөтүлдү.",
            reviewError: "Баалоодо ката чыкты.",
            attachmentError: "Тиркеме жүктөлгөн жок.",
            commentError: "Комментарий жөнөтүлгөн жок.",
            loading: "Жүктөлүүдө…"
        },
        errors: {
            load: "Тапшырма маалыматтары жүктөлгөн жок."
        }
    },
    instructorChat: {
        courseLoading: "Курс маалыматы жүктөлө элек...",
        instructorFallback: "Инструктор",
        onlineStatus: "Онлайн",
        empty: {
            title: "Баарлашууну баштаңыз",
            subtitle: "Инструкторго биринчи билдирүүңүздү жөнөтүңүз."
        },
        imageAlt: "Сүрөт",
        fileFallback: "Файл",
        attachFile: "Файл кошуу",
        attachImage: "Сүрөт кошуу",
        toggleAttachments: "Тиркеме аракеттерин көрсөтүү",
        composerPlaceholder: "Билдирүү жазыңыз...",
        composerAria: "Билдирүү киргизүү",
        send: "Жөнөтүү"
    },
    instructorHomework: {
        hero: {
            eyebrow: "Homework Queue",
            title: "Үй тапшырма кезеги",
            description: "Кайсы курс, группа жана сессия боюнча иш бар экенин табыңыз. Толук текшерүү агымы тиешелүү сессиянын үй тапшырма бөлүгүндө ачылат."
        },
        metrics: {
            total: "Жалпы",
            actionRequired: "Аракет керек",
            missing: "Жөнөткөн жок",
            needsRevision: "Оңдотуу керек"
        },
        filters: {
            title: "Фильтрлер",
            description: "Кезекти курс, группа, абал жана издөө боюнча тарылтыңыз. Метрика карточкаларын бассаңыз, тиешелүү абал автоматтык тандалат.",
            status: "Абал",
            results: "Жыйынтык",
            allCourses: "Бардык курстар",
            allGroups: "Бардык группалар",
            searchPlaceholder: "Издөө",
            limitPlaceholder: "Лимит"
        },
        filterOptions: {
            all: "Баары",
            needsReview: "Текшерүү керек",
            missing: "Жөнөткөн жок",
            needsRevision: "Оңдотуу керек",
            late: "Кеч тапшырган",
            draft: "Жарыялана элек",
            active: "Активдүү",
            dueSoon: "Жакында бүтөт",
            overdue: "Өтүп кеткен",
            checked: "Текшерилген",
            noDeadline: "Мөөнөт жок"
        },
        states: {
            draft: "Жарыялана элек",
            needsReview: "Текшерүү керек",
            missing: "Жөнөткөн жок",
            needsRevision: "Оңдотуу керек",
            late: "Кеч тапшырган",
            checked: "Текшерилген",
            noDeadline: "Мөөнөт жок",
            unknown: "Белгисиз",
            overdue: "Өтүп кеткен",
            dueSoon: "Жакында бүтөт",
            active: "Активдүү"
        },
        nextActions: {
            title: "Кийинки аракеттер",
            description: "Кезек шашылыштык боюнча сорттолду: текшерүү, жөнөтпөгөндөр, оңдотуулар жана кеч тапшыргандар биринчи чыгат.",
            priorityCount: "{{count}} приоритет"
        },
        queueActions: {
            needsReview: {
                label: "Биринчи текшерүү керек",
                description: "{{count}} жооп инструктордун баасын күтүп турат."
            },
            missing: {
                label: "Жөнөтпөгөндөрдү көзөмөлдөө",
                description: "{{count}} студент тапшырма жөнөткөн жок."
            },
            needsRevision: {
                label: "Оңдотууларды кайра караңыз",
                description: "{{count}} жооп оңдотуудан кийин кайра күтүп турат."
            },
            late: {
                label: "Кеч тапшырылган иштерди текшерүү",
                description: "{{count}} жооп мөөнөттөн кийин келген."
            },
            default: {
                label: "Көзөмөлдөө",
                description: "Бул тапшырмада азыр шашылыш аракет жок."
            }
        },
        tasks: {
            title: "Тапшырмалар",
            description: "Тандалган фильтрлер боюнча жыйынтык бул жерде чыгат."
        },
        empty: {
            title: "Үй тапшырмалар табылган жок",
            subtitle: "Курс же группа фильтрлерин өзгөртүп көрүңүз же издөө суроосун тазалаңыз."
        },
        queue: {
            title: "Кезектеги тапшырмалар",
            description: "Ар бир карточка тиешелүү сессияга өтүп, толук текшерүү агымын ачууга жардам берет.",
            recordCount: "{{count}} жазуу"
        },
        card: {
            actionRequired: "Аракет керек",
            needsReview: "Текшерүү керек",
            missing: "Жөнөткөн жок",
            needsRevision: "Оңдотуу керек",
            late: "Кеч тапшырган"
        },
        actions: {
            viewDetail: "Толук маалымат",
            openSession: "Сессияда ачуу"
        },
        fallbacks: {
            homework: "Үй тапшырма",
            noSession: "Сессия көрсөтүлгөн эмес",
            noDeadline: "Мөөнөт коюлган эмес"
        },
        errors: {
            unauthorized: "Сессия мөөнөтү бүттү. Кайра кириңиз.",
            forbidden: "Бул курс же группа сизге бекитилген эмес.",
            coursesLoad: "Курстар жүктөлгөн жок.",
            groupsLoad: "Группалар жүктөлгөн жок.",
            homeworkLoad: "Үй тапшырмалар жүктөлгөн жок.",
            queueLoadTitle: "Кезек жүктөлгөн жок"
        }
    },
    instructorDashboard: {
        nav: {
            overview: "Кыскача",
            courses: "Курстарым",
            students: "Студенттер",
            certificates: "Сертификаттар",
            groups: "Группалар",
            offerings: "Агымдар",
            sessions: "Сессиялар",
            homework: "Үй тапшырма",
            chat: "Чат",
            attendance: "Катышуу",
            templates: "Үлгүлөр",
            aiGenerator: "AI Генератор",
            messageDrafts: "Билдирүү черновиктери",
            analytics: "Аналитика",
            leaderboard: "Рейтинг",
            profile: "Профиль",
            ai: "AI ассистент",
            notifications: "Билдирүүлөр"
        },
        workspaceGroups: {
            overview: {
                label: "Кыскача жана аналитика",
                description: "Жалпы абалды, тренддерди жана рейтинг сигналдарын тез текшерүү."
            },
            courseManagement: {
                label: "Курс башкаруу",
                description: "Курс, студент, группа, агым жана сертификат башкаруу иштери."
            },
            teaching: {
                label: "Окутуучунун жумуш аймагы",
                description: "Сессиялар, үй тапшырма, катышуу, чат жана кайра колдонулуучу үлгүлөр."
            },
            aiStudio: {
                label: "AI Студия",
                description: "AI менен тирүү викториналар, эркин мазмун жана билдирүү черновиктерин жаратыңыз."
            },
            settings: {
                label: "Профиль жана орнотуулар",
                description: "Профиль, AI ассистент жана билдирүү жөндөөлөрү."
            }
        },
        shell: {
            headerSubtitle: "Курстарыңызды жана студенттерди толук көзөмөлдөңүз",
            certificatesDisabledReason: "Айрым курстарда сертификат өчүрүлгөн.",
            workspaceSection: "Инструктор бөлүмү",
            sectionFallback: "Бөлүм",
            tabOpened: "{{tab}} ачылды",
            status: {
                profileLoading: "Профиль жүктөлүүдө",
                coursesLoading: "Курстар жүктөлүүдө",
                workspaceUpdating: "Иш аймагы жаңыланууда"
            },
            actions: {
                analytics: "Аналитика",
                hideMenu: "Менюну жашыруу",
                showMenu: "Менюну көрсөтүү"
            },
            toasts: {
                categoriesLoadError: "Категориялар жүктөлгөн жок.",
                requiredFields: "Сураныч, аталыш, сүрөттөмө жана категорияны толтуруңуз.",
                deliveryCourseCreated: "Курс түзүлдү. Эми группа жана сессия түзө аласыз.",
                deliveryCourseCreateError: "Курсту түзүүдө ката кетти.",
                deliveryCourseUpdated: "Офлайн/түз эфир курс жаңыртылды.",
                deliveryCourseUpdatedForReview: "Офлайн/түз эфир курс жаңыртылды жана кайра карап чыгууга жөнөтүлдү.",
                deliveryCourseUpdateError: "Офлайн/түз эфир курсту жаңыртууда ката кетти.",
                courseSubmittedForApproval: "Курс тастыктоого жөнөтүлдү.",
                courseSubmitError: "Курсту тастыктоого жөнөтүү мүмкүн болбоду."
            }
        },
        coursesSection: {
            hero: {
                eyebrow: "Курс панели",
                title: "Курстарым",
                description: "Жарыяланган жана каралуудагы курстарды көзөмөлдөп, жаңы видео, офлайн же түз эфир курстарды ушул жерден башкарыңыз."
            },
            actions: {
                createDeliveryCourse: "Офлайн / түз эфир курс",
                newCourse: "Жаңы курс",
                createCourse: "Курс түзүү",
                manage: "Башкаруу",
                view: "Көрүү",
                edit: "Өзгөртүү",
                submitting: "Жөнөтүлүүдө...",
                submitForApproval: "Тастыктоого жөнөтүү"
            },
            metrics: {
                totalCourses: "Бардык курстар",
                published: "Жарыяланган",
                pending: "Каралууда",
                students: "Студенттер"
            },
            list: {
                title: "Курс тизмеси",
                description: "Ар бир курстун абалын, категориясын жана акыркы жаңыртылган убактысын ушул жерден көрүңүз."
            },
            status: {
                approved: "Бекитилди",
                pending: "Каралууда",
                rejected: "Баш тартылган",
                draft: "Черновик"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн түз эфир"
            },
            card: {
                noDescription: "Сүрөттөмө жок",
                uncategorized: "Категориясыз",
                price: "{{price}} сом",
                free: "Акысыз",
                students: "Студенттер",
                updated: "Жаңыртылды",
                noData: "Маалымат жок"
            },
            empty: {
                title: "Курстар азырынча жок",
                subtitle: "Биринчи курсуңузду түзүп баштаңыз."
            }
        },
        studentsSection: {
            hero: {
                eyebrow: "Студент панели",
                title: "Студенттер",
                description: "Курстарыңыздагы студенттерди курс боюнча бөлүп, прогрессти жана акыркы активдүүлүктү бир жерден көзөмөлдөңүз."
            },
            metrics: {
                totalStudents: "Жалпы студенттер",
                courses: "Курстар",
                selectedCourseStudents: "Тандалган курстагы студенттер",
                averageProgress: "Орточо прогресс",
                courseStudents: "Бул курстагы студенттер",
                lessons: "Сабактар",
                completed: "Бүтүргөн"
            },
            courseSelection: {
                title: "Курсту тандаңыз",
                description: "Курсту тандасаңыз, ошол агымдагы студенттердин толук тизмеси жана прогресс деталдары ачылат.",
                courseImageAlt: "Курс сүрөтү",
                noCourseImage: "Курс сүрөтү жок",
                created: "Түзүлгөн",
                emptyTitle: "Курстар азырынча жок",
                emptySubtitle: "Алгач курс түзүп баштаңыз, андан кийин студент агымдары ушул жерде көрүнөт."
            },
            courseStatus: {
                published: "Жарыяланды",
                approved: "Бекитилди",
                pending: "Каралууда",
                rejected: "Баш тартылган",
                draft: "Черновик"
            },
            courseWorkspace: {
                description: "Курс тандалгандан кийин издөө, прогресс фильтри жана студент активдүүлүк деталдары ушул блокто иштейт.",
                backToCourses: "Курстарга кайтуу"
            },
            filters: {
                title: "Фильтрлер",
                description: "Студенттерди аталышы, байланыш маалыматы жана прогресс диапазону боюнча чыпкалаңыз.",
                search: "Издөө",
                searchPlaceholder: "Ат, email же телефон",
                progressMin: "Прогресс кеминде",
                progressMax: "Прогресс жогору эмес"
            },
            list: {
                fallbackTitle: "Студенттер тизмеси",
                title: "Студенттер тизмеси",
                description: "Ар бир студенттин байланыш маалыматы, прогресси жана акыркы көргөн сабагы көрсөтүлөт.",
                loadingDescription: "Тизме жүктөлүүдө."
            },
            studentCard: {
                students: "Студенттер",
                completed: "Бүттү",
                inProgress: "Уланууда",
                enrolled: "Катталды",
                lastViewed: "Акыркы көргөн",
                lessonNumber: "Сабак #{{id}}{{time}}",
                tests: "Тесттер",
                testPassed: "Өттү",
                testFailed: "Өтпөдү",
                noTests: "Тест тапшыруулар жок."
            },
            empty: {
                description: "Бул курс боюнча тизмек азырынча бош.",
                title: "Бул курста азырынча студент жок",
                subtitle: "Башка курсту тандап көрүңүз же катталууларды күтүңүз."
            },
            pagination: {
                previous: "Алдыңкы",
                next: "Кийинки",
                page: "Барак {{page}} / {{total}}"
            }
        },
        profileSection: {
            hero: {
                eyebrow: "Профиль панели",
                title: "Профиль",
                description: "Өзүңүз тууралуу негизги маалымат, эксперттик темалар жана коомдук шилтемелер ушул жерде көрүнөт."
            },
            metrics: {
                title: "Наам",
                experience: "Тажрыйба",
                years: "{{count}} жыл",
                years_plural: "{{count}} жыл",
                enrollments: "Катталуулар"
            },
            actions: {
                edit: "Өзгөртүү",
                close: "Жабуу",
                save: "Сактоо",
                saving: "Сакталууда..."
            },
            fields: {
                title: "Наам",
                experience: "Иш тажрыйбасы",
                bio: "Био / Өзүм жөнүндө",
                expertise: "Эксперттик билимдер",
                expertisePlaceholder: "Frontend, UI/UX, Product Design"
            },
            bio: {
                title: "Био / Өзүм жөнүндө",
                description: "Студенттерге жана командага көрүнгөн кыскача тааныштыруу.",
                empty: "Маалымат кошула элек"
            },
            expertise: {
                title: "Эксперттик билимдер",
                description: "Профилде көрүнгөн негизги адистик темалары.",
                emptyTitle: "Эксперттик билимдер кошула элек",
                emptySubtitle: "Профилди түзөтүү бетинде негизги темаларыңызды кошсоңуз, алар ушул жерде көрүнөт."
            },
            social: {
                title: "Социалдык шилтемелер",
                description: "Тышкы профилдер жана коомдук байланыш каналдары.",
                urlPlaceholder: "https://...",
                emptyTitle: "Социалдык шилтемелер жок",
                emptySubtitle: "Портфолио же коомдук профиль шилтемелерин кошкондо алар ушул жерде пайда болот.",
                fields: {
                    website: "Сайт / портфолио",
                    linkedin: "LinkedIn",
                    instagram: "Instagram",
                    youtube: "YouTube",
                    facebook: "Facebook",
                    twitter: "Twitter / X"
                }
            }
        },
        chat: {
            sidebarTitle: "Сүйлөшүүлөр",
            sidebarDescription: "Курс жана студент боюнча активдүү чаттарды ушул жерден тандаңыз.",
            chatAriaLabel: "{{student}} - {{course}} чаты",
            fileFallback: "{{type}} жөнөтүлдү",
            fileTypes: {
                image: "Сүрөт",
                file: "Файл"
            },
            stats: {
                chats: "Чаттар",
                messages: "Билдирүүлөр",
                unread: "Окулбаган"
            },
            statuses: {
                active: "Активдүү",
                closed: "Жабылган",
                pending: "Күтүүдө",
                unknown: "Белгисиз"
            },
            fallbacks: {
                student: "Студент",
                course: "Курс"
            },
            empty: {
                noChatsTitle: "Чат табылган жок",
                noChatsSubtitle: "Издөө суроосун өзгөртүп көрүңүз же студент менен жаңы сүйлөшүүнү күтүңүз.",
                selectionTitle: "Сүйлөшүү тандалган жок",
                selectionSubtitle: "Сол жактагы тизмеден студентти тандасаңыз, баарлашуу ушул жерде ачылат."
            },
            time: {
                now: "азыр",
                minutesAgo: "{{count}} мүнөт мурун",
                hoursAgo: "{{count}} саат мурун",
                daysAgo: "{{count}} күн мурун"
            },
            errors: {
                unknown: "Белгисиз ката",
                chatMissingAfterCreate: "Чат түзүлгөн соң да табылган жок"
            },
            toasts: {
                loadChatsError: "Чаттарды жүктөө мүмкүн болбоду.",
                loadMessagesError: "Баарлашууну жүктөө мүмкүн болбоду.",
                createWithReason: "Чатты түзүү мүмкүн болбоду: {{reason}}",
                sendError: "Билдирүүнү жөнөтүү мүмкүн болбоду.",
                fileWithReason: "Файлды жөнөтүү мүмкүн болбоду: {{reason}}",
                fileUploadError: "Файлды жүктөө мүмкүн болбоду."
            }
        },
        deliveryCourseModal: {
            header: {
                createTitle: "Жаңы курс түзүү",
                createSubtitle: "Офлайн же онлайн түз эфир курс түзүү формасы.",
                editTitle: "Группа менен өтүүчү курсту өзгөртүү",
                editSubtitle: "Офлайн же онлайн түз эфир курсунун негизги маалыматын жаңыртыңыз."
            },
            fields: {
                courseType: "Курс түрү",
                language: "Сабак тили",
                title: "Курс аталышы",
                description: "Курс сүрөттөмө",
                category: "Категория",
                price: "Баасы (сом)"
            },
            courseTypes: {
                offline: {
                    label: "Офлайн",
                    description: "Офлайн тренинг. Жайгашкан жерди көрсөтүңүз."
                },
                onlineLive: {
                    label: "Онлайн түз эфир",
                    description: "Zoom же Google Meet аркылуу жандуу сабак."
                }
            },
            placeholders: {
                title: "Курсунун аталышын киргизиңиз",
                description: "Курс жөнүндө эмне экенин сүрөттөңүз",
                select: "Тандаңыз"
            },
            validation: {
                titleRequired: "Курс аталышын толтуруңуз.",
                descriptionRequired: "Курс сүрөттөмөн толтуруңуз.",
                categoryRequired: "Категорияны тандаңыз.",
                requiredFields: "Сураныч, аталыш, сүрөттөмө жана категорияны толтуруңуз."
            },
            actions: {
                cancel: "Жокко чыгаруу",
                create: "Курс түзүү",
                save: "Сактоо"
            },
            toasts: {
                categoriesLoadError: "Категориялар жүктөлгөн жок.",
                created: "Курс түзүлдү. Эми группа жана сессия түзө аласыз.",
                createError: "Курсту түзүүдө ката кетти."
            },
            currency: "сом",
            priceHelp: "Бош калса акысыз курс болот.",
            characterCount: "{{count}}/{{max}} белги"
        },
        profile: {
            toasts: {
                loadError: "Инструктор маалыматын жүктөө мүмкүн болбоду.",
                saveSuccess: "Инструктор профили сакталды.",
                saveError: "Инструктор профилин сактоо мүмкүн болбоду."
            }
        },
        createCoursePage: {
            title: "Жаңы курс түзүү",
            description: "Курсту үч кадам менен түзүңүз: маалымат, мазмун жана финалдык текшерүү.",
            steps: {
                info: "1. Маалыматты так толтуруңуз",
                lessons: "2. Сабактарды сактаңыз",
                submit: "3. Карап чыгууга жөнөтүңүз"
            },
            draft: {
                title: "Draft автоматтык түрдө ушул браузерде сакталат.",
                description: "Маалымат жана учурдагы кадам сакталат; мазмунду серверге сактоо үчүн \"Жалпы сактоо\" баскычын колдонуңуз.",
                restored: "Калыбына келтирилген draft: {{time}}.",
                lastSaved: "Акыркы автоматтык сактоо: {{time}}."
            },
            actions: {
                clearDraft: "Draft тазалоо"
            },
            toasts: {
                savedForReview: "Курс каралууга сакталды.",
                saveBeforeApproval: "Тастыктоого жөнөтүүдөн мурун өзгөрүүлөрдү сактаңыз.",
                submittedForApproval: "Курс тастыктоого жөнөтүлдү.",
                submitError: "Жөнөтүүдө ката кетти.",
                localDraftClearedServerPreserved: "Жергиликтүү draft тазаланды. Сервердеги курс draft сакталды.",
                localDraftCleared: "Жергиликтүү draft тазаланды.",
                invalidLesson: "Жөнөтүүдөн мурун текшерүү керек: {{issue}} (Бөлүм {{section}}, Сабак {{lesson}})"
            }
        },
        editCoursePage: {
            title: "Курсту оңдоо",
            description: "Курсту үч кадам менен оңдоңуз: маалымат, мазмун жана финалдык текшерүү.",
            notice: {
                title: "Оңдоолорду жарыялоодон мурун таасирин текшериңиз.",
                description: "Сакталбаган өзгөрүүлөр алдын ала көрүү жана тастыктоого жөнөтүү баскычтарын бөгөйт. Тастыктоого жөнөтүлгөн өзгөрүүлөр карап чыгуу процессинен кийин гана студенттерге көрүнүшү керек.",
                unsaved: "Азырынча сакталбаган өзгөрүүлөр бар."
            },
            toasts: {
                saveBeforeApproval: "Тастыктоого жөнөтүүдөн мурун өзгөрүүлөрдү сактаңыз.",
                submittedForApproval: "Курс тастыктоого жөнөтүлдү.",
                submitError: "Жөнөтүүдө ката кетти.",
                invalidLesson: "Жөнөтүүдөн мурун текшерүү керек: {{issue}} (Бөлүм {{section}}, Сабак {{lesson}})"
            }
        },
        courseBuilder: {
            stepLabels: {
                info: "Курс маалыматы",
                curriculum: "Окуу мазмуну",
                media: "Медиа жана башкаруу"
            },
            actions: {
                addLesson: "+ Сабак кошуу",
                addSection: "+ Бөлүм кошуу",
                back: "Артка",
                collapseAll: "Баарын жабуу",
                delete: "Өчүрүү",
                down: "Ылдый",
                expandAll: "Баарын ачуу",
                findNextIssue: "Кийинки катаны табуу",
                refresh: "Жаңыртуу",
                saveAll: "Жалпы сактоо",
                saveAndContinue: "Сактоо жана улантуу",
                saving: "Сакталууда...",
                singleSectionOff: "Бир бөлүм режими: өчүк",
                singleSectionOn: "Бир бөлүм режими: күйүк",
                toggle: "Ачуу/жабуу",
                up: "Өйдө"
            },
            aria: {
                steps: "Курс түзүү кадамдары",
                currentStep: "азыркы кадам",
                completedStep: "аяктаган",
                incompleteStep: "аяктай элек",
                dragLesson: "Сабакты жылдыруу",
                dragSection: "Бөлүмдү жылдыруу",
                moveLessonDown: "{{title}} сабагын ылдый жылдыруу",
                moveLessonUp: "{{title}} сабагын өйдө жылдыруу",
                moveSectionDown: "{{title}} бөлүмүн ылдый жылдыруу",
                moveSectionUp: "{{title}} бөлүмүн өйдө жылдыруу"
            },
            assets: {
                title: "Файлдар жана материалдар",
                videoUpload: "Видео жүктөө",
                videoExists: "Видео файл бар",
                resourceUpload: "Материал жүктөө (PDF, ZIP)",
                resourceExists: "Материал файл бар",
                resourceName: "Материалдын аталышы",
                resourceNameHelp: "Бул аталыш студенттерге көрсөтүлөт.",
                previewVideo: "Алдын ала көрүү видеосун белгилөө",
                uploadedPercent: "{{percent}}% жүктөлдү"
            },
            challenge: {
                instructions: "Инструкциялар",
                instructionsTooltip: "Мисалы: 'solution функциясы жуп сандардын суммасын кайтарсын'. Студентке тапшырма эмне экенин түшүндүрүңүз.",
                instructionsPlaceholder: "Тапшырма боюнча толук нускама",
                instructionsHelp: "Студенттерге эмне кылуу керек экенин жана кайсы нерселер текшерилерин түшүндүрүңүз. Каалаган JS кодго уруксат берилет.",
                timeLimit: "Убакыт лимити (миллисекунд)",
                timeLimitTooltip: "Код канча убакытта иштеши керек. Мисалы 5000 = 5 секунд. Негизги мааниси 5000.",
                starterCode: "Баштапкы код",
                starterCodeTooltip: "Студенттер көрө турган баштапкы шаблон. Бош калтырсаңыз да болот.",
                starterCodeHelp: "Кааласаңыз, бош калтырып студенттерге өз кодун толук жазууга шарт түзүңүз.",
                tests: "Тесттер",
                addTest: "+ Тест кошуу",
                testTitle: "Тест аталышы",
                testTitleTooltip: "Мисалы: 'Мисал тест', 'Жашыруун тест'. Инструктор гана көрөт.",
                testPlaceholder: "Тест {{number}}",
                hidden: "Жашыруун",
                args: "Аргументтер (JSON)",
                argsTooltip: "Функциянын параметрлери. Бир параметр массив болсо: [[1,2,3]]. Эки параметр: [5,3]. Объект: [{\"name\":\"Aida\"}].",
                expected: "Күтүлгөн жыйынтык (JSON)",
                expectedTooltip: "solution(...) кайтаруусу керек болгон мааниси. Мисалы: 6, \"Hello\", {\"ok\":true}"
            },
            confirmDelete: {
                sectionTitle: "Бөлүмдү өчүрүү",
                lessonTitle: "Сабакты өчүрүү",
                sectionMessage: "\"{{title}}\" бөлүмүн жана андагы бардык сабактарды өчүрөсүзбү? Бул аракет кайтарылбайт.",
                lessonMessage: "\"{{title}}\" сабагын өчүрөсүзбү? Бул аракет кайтарылбайт.",
                confirm: "Ооба, өчүрүү"
            },
            curriculum: {
                workspaceMode: "Курулуш режими",
                stats: {
                    sectionsLessons: "Бөлүмдөр: {{sections}} • Сабактар: {{lessons}}",
                    readiness: "Даярдык: {{ready}}/{{total}} ({{percent}}%)"
                },
                saveHint: "Адегенде бөлүм жана сабактарды толтуруңуз, андан соң каталарды текшерип жалпы сактаңыз.",
                title: "Окуу мазмуну",
                validationTitle: "Алдын ала көрүү кадамына өтүүдөн мурун оңдоого тийиш болгон сабактар",
                issueChip: "Б{{section}} / С{{lesson}}: {{issue}}",
                sectionSummary: "{{lessons}} сабак · {{ready}}/{{total}} даяр",
                issueCount: "{{count}} маселе",
                skillHelper: "Көндүм тандаңыз — ушул бөлүмгө байланышкан прогресс жана рейтинг эсептелет.",
                lessonOrder: "Сабак тартиби",
                articleText: "Макала тексти",
                readingTime: "Окуу убактысы (мүнөт)",
                sectionFooter: "Даяр сабактар: {{ready}}/{{total}}. Өзгөрүүлөрдү сактап, анан улантыңыз."
            },
            fallbacks: {
                section: "Бөлүм {{number}}",
                lesson: "Сабак {{number}}",
                lessonWithHash: "Сабак #{{number}}"
            },
            info: {
                editMode: {
                    title: "Оңдоо режими",
                    description: "Курс маалыматын өзгөрткөндөн кийин сактоо керек. Категория сыяктуу агымга таасир берген талаалар бул экранда бекитилген бойдон калат."
                },
                sections: {
                    basic: "Негизги маалымат",
                    settings: "Орнотуулар",
                    cover: "Курс сүрөтү"
                },
                fields: {
                    title: "Курс аталышы",
                    subtitle: "Кыскача аталыш",
                    description: "Курс сүрөттөмөсү",
                    category: "Категория",
                    price: "Курс баасы (сом)",
                    isPaid: "Бул курс акы төлөнүүчү",
                    aiAssistantEnabled: "EDU AI ассистенттин бул курста иштешине уруксат берүү",
                    language: "Сабак тили",
                    learningOutcomes: "Бул курстан эмнени үйрөнөсүз? (ар бир сапка бир пункт)",
                    coverFile: "Курс сүрөт файлы"
                },
                languageOptions: {
                    ky: "Кыргызча",
                    ru: "Орусча",
                    en: "Англисче"
                },
                placeholders: {
                    title: "Курс аталышы",
                    subtitle: "Кыскача сүрөттөмө",
                    description: "Курс сүрөттөмөсү",
                    category: "Категорияны тандаңыз",
                    price: "Курс баасы",
                    learningOutcomes: "Мисалы:\n- UX негиздери\n- Figma менен иштөө\n- UI китепкана түзүү"
                },
                helpers: {
                    categoryLocked: "Категория жарыяланган курс агымына таасир берет, ошондуктан бул жерде өзгөртүлбөйт.",
                    pendingCover: "Тандалган сүрөт браузерде сакталбайт: {{file}}. Сураныч, файлды кайра тандаңыз.",
                    coverFormat: "PNG/JPG, максимум 5MB"
                },
                footer: {
                    fixErrors: "Улантуу үчүн белгиленген маалымат талааларын оңдоңуз.",
                    ready: "Негизги маалымат даяр. Сактап, мазмун кадамына өтсөңүз болот."
                },
                coverAlt: "Курс сүрөтү"
            },
            lessonFields: {
                title: "Сабак аталышы",
                type: "Сабактын тиби"
            },
            lessonIssues: {
                missingTitle: "Аталыш жок",
                missingVideo: "Видео жүктөлгөн эмес.",
                incompleteArticle: "Макала толук эмес",
                incompleteQuiz: "Квиз толук эмес",
                incompleteCode: "Код тапшырма толук эмес",
                missingContent: "Мазмун жок",
                ready: "Даяр"
            },
            lessonKinds: {
                video: "Видео",
                article: "Макала (текст)",
                quiz: "Квиз",
                code: "Код тапшырма"
            },
            duration: {
                seconds: "{{count}}с",
                minutes: "{{count}}м",
                minutesSeconds: "{{minutes}}м {{seconds}}с"
            },
            fileValidation: {
                noFile: "Файл тандалган жок.",
                invalidVideo: "Видео файлын тандаңыз (MP4, WebM, AVI, MOV, MKV).",
                fileTooLarge: "Файл өлчөмү {{size}}MB ашпашы керек.",
                noImage: "Сүрөт файлын тандаңыз.",
                invalidImage: "Сураныч, сүрөт файлын тандаңыз.",
                imageTooLarge: "Сүрөт көлөмү 5MB ашпашы керек."
            },
            placeholders: {
                articleText: "Сабактын негизги тексти",
                lessonTitle: "Сабак аталышы",
                minutesExample: "мисалы: 5",
                optionalSkill: "Skill тандаңыз (опция)",
                resourceName: "мисалы: Практикалык тапшырмалар.pdf",
                sectionTitle: "Бөлүм аталышы"
            },
            quiz: {
                passingScore: "Өтүү упайы (%)",
                timeLimit: "Убакыт лимити (мүнөт, бош болсо чексиз)",
                fillMode: {
                    manual: "Кол менен түзөтүү",
                    paste: "Квиз маалыматын коюу"
                },
                formattingHelp: "Текст форматтоо:",
                boldSample: "калың",
                boldInsertSample: "калың текст",
                codeSample: "код",
                codeInsertSample: "код",
                and: "жана",
                question: "Суроо {{number}}",
                questionPlaceholder: "Суроонун тексти",
                preview: "Алдын ала көрүү",
                option: "Вариант {{number}}",
                addOption: "+ Вариант кошуу",
                addQuestion: "+ Жаңы суроо кошуу",
                paste: {
                    title: "Квиз маалыматын коюу",
                    help: "Учурдагы квиз редакторун толтуруу үчүн JSON, code fence ичиндеги JSON же жөнөкөй квиз текстин коюңуз.",
                    placeholder: "{\n  \"passingScore\": 70,\n  \"questions\": [\n    {\n      \"prompt\": \"Суроо\",\n      \"options\": [\n        { \"text\": \"Вариант 1\", \"isCorrect\": true },\n        { \"text\": \"Вариант 2\", \"isCorrect\": false }\n      ]\n    }\n  ]\n}",
                    fill: "Коюлганынан толтуруу",
                    supportedFormats: "JSON, markdown code fence, акылдуу тырмакча, ашыкча үтүр жана жөнөкөй суроо/вариант тексти колдоого алынат.",
                    success: "Квиз коюлган мазмундан толтурулду.",
                    errorInvalidInput: "Коюлган мазмунда жарактуу квиз түзүмү жок."
                },
                richTextHint: "Форматтоо үчүн текстти тандаңыз: калың, курсив же код",
                explanation: {
                    label: "Түшүндүрмө",
                    hint: "(студент жооп бергенден кийин көрүнөт)",
                    placeholder: "Туура жооп эмне үчүн туура экенин түшүндүрүңүз…",
                },
            },
            articleEditor: {
                placeholder: "Макаланын текстин бул жерге жазыңыз...",
                linkUrlPrompt: "Шилтемени жазыңыз (https://...)",
                linkTextPrompt: "Шилтеменин тексти",
                keyboardHint: "Кеңеш: Ctrl/Cmd + B — калың, Ctrl/Cmd + I — курсив. Google Docs, Word же веб-баракчалардан чаптаганда форматтоо автоматтык сакталат.",
                toolbar: {
                    bold: "Калың",
                    italic: "Курсив",
                    underline: "Астын сызуу",
                    bulletedList: "Маркерленген тизме",
                    numberedList: "Номерленген тизме",
                    quote: "Цитата",
                    inlineCode: "Inline код",
                    insertLink: "Шилтеме кошуу",
                    removeLink: "Шилтемени алып салуу",
                    undo: "Артка кайтаруу",
                    redo: "Кайра кылуу",
                    clearFormat: "Форматты тазалоо"
                }
            },
            previewStep: {
                createTitle: "Курс текшерүүсү",
                editTitle: "Оңдоо текшерүүсү",
                createDescription: "Жергиликтүү draft ушул браузерде гана сакталат. Серверге сактоо жана карап чыгууга жөнөтүү үчүн төмөнкү аракеттерди колдонуңуз.",
                editDescription: "Тастыктоого жөнөтүүдөн мурун өзгөрүүлөр сакталганын текшериңиз. Карап чыгуу бүткөндөн кийин гана өзгөртүлгөн мазмун студенттерге таасир этиши керек.",
                unsavedWarning: "Сакталбаган өзгөрүүлөр бар, ошондуктан тастыктоого жөнөтүү азырынча жабык.",
                actions: {
                    saveDraft: "Draft сактоо",
                    submitForApproval: "Тастыктоого жөнөтүү",
                    saveFirst: "Алгач өзгөрүүлөрдү сактаңыз"
                },
                checks: {
                    infoComplete: "Курс маалыматтары толтурулган",
                    noBlockingErrors: "Сабактарда бөгөттөөчү ката жок",
                    noUnsavedChanges: "Сакталбаган өзгөрүү калган жок"
                }
            },
            preview: {
                eyebrow: "Финалдык алдын ала көрүү",
                practice: "Практика",
                mixLabel: "{{video}} видео · {{article}} макала · {{quiz}} квиз · {{code}} код",
                price: "Баасы: {{price}} сом",
                freeCourse: "Акысыз курс",
                level: "Деңгээл: {{level}}",
                language: "Тил: {{language}}",
                warningTitle: "Жөнөтүүдөн мурун текшерүү керек: {{count}}",
                moreWarnings: "Дагы {{count}} маселе бар. Мазмун кадамына кайтып оңдоңуз.",
                structure: "Курстун түзүмү",
                lessonCount: "{{count}} сабак",
                previewBadge: "Алдын ала көрүү",
                emptySection: "Бул бөлүмдө азырынча сабак жок.",
                emptyCourse: "Азырынча бөлүм кошула элек.",
                learningOutcomes: "Бул курста эмнени үйрөнөсүз",
                fixWarningsTitle: "Алгач алдын ала көрүүдөгү каталарды оңдоңуз",
                stats: {
                    sections: "Бөлүмдөр",
                    lessons: "Сабактар",
                    totalTime: "Жалпы убакыт",
                    previewLessons: "Алдын ала көрүү сабактары"
                },
                fallbacks: {
                    courseTitle: "Курс аталышы жок",
                    description: "Сүрөттөмө али кошула элек.",
                    cover: "Cover сүрөт кошула элек"
                },
                warnings: {
                    missingCourseTitle: "Курс аталышы жок.",
                    missingDescription: "Курс сүрөттөмөсү толтурулган эмес.",
                    missingCover: "Cover сүрөт кошула элек.",
                    noSections: "Курста бир да бөлүм жок.",
                    noPreviewLessons: "Бир да алдын ала көрүү сабагы белгиленген эмес (видеолор үчүн сунушталат).",
                    sectionMissingTitle: "Бөлүм {{section}}: аталышы жок.",
                    sectionNoLessons: "Бөлүм {{section}}: сабактар жок.",
                    lessonMissingTitle: "Бөлүм {{section}}, Сабак {{lesson}}: аталышы жок.",
                    lessonMissingVideo: "Бөлүм {{section}}, Сабак {{lesson}}: видео жүктөлгөн эмес.",
                    lessonMissingDuration: "Бөлүм {{section}}, Сабак {{lesson}}: узактыгы/окуу убактысы көрсөтүлгөн эмес.",
                    lessonMissingArticleText: "Бөлүм {{section}}, Сабак {{lesson}}: макала тексти жок.",
                    lessonMissingQuizQuestions: "Бөлүм {{section}}, Сабак {{lesson}}: квиз суроолору кошулган эмес.",
                    lessonMissingCodeTests: "Бөлүм {{section}}, Сабак {{lesson}}: код тапшырма тесттери толук эмес."
                }
            },
            status: {
                ready: "Даяр"
            },
            toasts: {
                changesSaveError: "Өзгөрүүлөрдү сактоодо ката кетти.",
                changesSaved: "Бардык өзгөрүүлөр сакталды!",
                contentSaveError: "Мазмунду сактоодо ката кетти.",
                contentSaved: "Мазмун сакталды!",
                courseCreateError: "Курс түзүүдө ката кетти.",
                courseCreated: "Курс ийгиликтүү түзүлдү!",
                courseSaveError: "Курс сактоодо ката кетти.",
                courseSaved: "Курс ийгиликтүү сакталды!",
                dataLoadError: "Маалымат жүктөлбөдү",
                fileUploadError: "Файл жүктөөдө ката кетти.",
                fixInfoErrors: "Маалымат табындагы каталарды оңдоңуз.",
                lessonExtraWarnings: "{{count}} сабактын кошумча материалы жүктөлгөн жок. Курс ачылды, бирок ошол сабактарды текшериңиз.",
                noValidationIssues: "Текшериле турган ката жок.",
                sectionAutoSaveError: "Бөлүмдү түзүүдө ката кетти. Адегенде кол менен сактаңыз.",
                sectionAutoSaved: "Бөлүм автоматтык түрдө сакталды",
                skillsLoadError: "Skills жүктөлгөн жок.",
                someLessonsIncomplete: "Айрым сабактар толук эмес.",
                validationIssue: "Текшерүү керек: {{issue}}"
            },
            validation: {
                categoryRequired: "Категория тандаңыз",
                descriptionRequired: "Сүрөттөмө милдеттүү",
                languageRequired: "Тилди тандаңыз",
                lessonIssue: "Бөлүм {{section}}, Сабак {{lesson}}: {{issue}}",
                lessonRequired: "Кеминде бир сабак болушу керек.",
                maxChars: "Максимум {{max}} символ",
                pricePositive: "Акы төлөнүүчү курс үчүн баа 0дөн чоң болушу керек",
                sectionMissingTitle: "Бөлүм {{section}}: Аталыш жок",
                sectionRequired: "Кеминде бир бөлүм болушу керек.",
                titleRequired: "Курс аталышы милдеттүү"
            }
        },
        coursesPage: {
            title: "Менин курстарым",
            workflowSummaryLabel: "Курс процесстеринин абалы",
            filtersLabel: "Курс башкаруу чыпкалары",
            workflows: {
                video: "Өз темпиндеги видео",
                delivery: "Группа менен өтүүчү курс"
            },
            workflowCards: {
                videoDescription: "Мазмун, алдын ала көрүү жана тастыктоо аркылуу башкарылат.",
                deliveryDescription: "Группа, жүгүртмө жана катышуу процесси менен иштейт.",
                lastUpdated: "Акыркы жаңыртуу"
            },
            filters: {
                all: "Баары",
                allWorkflows: "Бардык процесстер",
                search: "Курс издөө",
                searchPlaceholder: "Аталыш, инструктор же түрү боюнча",
                status: "Статус",
                workflow: "Процесс"
            },
            lifecycle: {
                draft: "Черновик",
                pending: "Каралууда",
                published: "Жарыяланган",
                rejected: "Оңдоо керек",
                aria: "Курс статусу: {{status}}"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн түз эфир"
            },
            price: {
                label: "Баасы",
                value: "{{value}} сом",
                missing: "Баасы көрсөтүлгөн эмес"
            },
            actions: {
                refresh: "Жаңыртуу",
                reload: "Кайра жүктөө",
                manage: "Башкаруу",
                review: "Текшерүү",
                fix: "Оңдоо",
                edit: "Өзгөртүү",
                unavailable: "Өзгөртүү жеткиликсиз",
                createFirst: "Биринчи курсту түзүү"
            },
            errors: {
                load: "Курстарды алуу ишке ашкан жок."
            },
            loading: "Курстар жүктөлүүдө...",
            empty: {
                noCourses: "Азырынча курстарыңыз жок.",
                noFilteredCourses: "Бул чыпкалар боюнча курс табылган жок."
            },
            fallbacks: {
                courseWithId: "Курс {{id}}",
                untitledCourse: "Аталышы жок курс",
                noInstructor: "Инструктор көрсөтүлгөн эмес",
                noImage: "Курс сүрөтү жок"
            }
        },
        overview: {
            header: {
                eyebrow: "Instructor overview",
                description: "Профилди толтуруңуз, курстарды жаңыртыңыз жана студенттердин жумуш агымын алдыга жылдырыңыз."
            },
            focus: {
                eyebrow: "Бүгүнкү фокус",
                title: "Инструктор панели даяр",
                description: "Курстарды, катталууларды жана аналитиканы бир жерден башкаруу үчүн ушул негизги кыска жолдорду колдонуңуз."
            },
            stats: {
                publishedCourses: "Жарыяланган курстар",
                pendingCourses: "Каралуудагы курстар",
                aiEnabled: "AI ассистент иштетилген",
                enrollments: "Катталуулар"
            },
            actions: {
                createCourse: "Жаңы курс түзүү",
                openAnalytics: "Аналитиканы ачуу"
            },
            quickActionsPanel: {
                title: "Ыкчам аракеттер",
                description: "Күндөлүк инструктор жумуш агымдарына түз өтүңүз."
            },
            quickActions: {
                manageCourses: {
                    title: "Курстарды башкаруу",
                    description: "Бар болгон курстарыңызды карап чыгып, мазмунун жана статусун жаңыртыңыз.",
                    button: "Курстар"
                },
                createCourse: {
                    title: "Жаңы курс түзүү",
                    description: "Сабак, бөлүм жана тапшырмалар менен жаңы курс жарыялоого даярдаңыз.",
                    button: "Курс түзүү"
                },
                enrollments: {
                    title: "Катталуулар",
                    description: "Студенттердин катталуусун, топторду жана катышуу агымын көзөмөлдөңүз.",
                    button: "Катталгандар"
                },
                analytics: {
                    title: "Аналитика",
                    description: "Катышуу, үй тапшырма жана тобокелдик метрикаларын бир жерден көрүңүз.",
                    button: "Аналитика"
                }
            }
        },
        analytics: {
            eyebrow: "Аналитика иш аймагы",
            title: "Инструктор аналитикасы",
            description: "Курстарыңыздын аткарылышын, тобокелдиктеги студенттерди жана жетишкендик тренддерин ушул жерден караңыз.",
            toasts: {
                loadError: "Инструктор аналитикасын жүктөө мүмкүн болбоду."
            },
            filters: {
                title: "Мезгил фильтри",
                description: "Белгилүү убакыт аралыгын тандасаңыз, аналитика ошол терезе боюнча кайра эсептелет.",
                fromPlaceholder: "Башталган күнү",
                toPlaceholder: "Аяктаган күнү"
            },
            metrics: {
                totalCourses: "Бардык курстар",
                students: "Студенттер",
                averageCompletion: "Орточо аяктоо",
                atRiskStudents: "Тобокелдиктеги студенттер"
            },
            columns: {
                course: "Курс",
                enrollments: "Катышуулар",
                averageProgress: "Орточо прогресс",
                completionRate: "Аяктоо деңгээли",
                student: "Студент",
                riskReason: "Тобокелдик себеби",
                lastActivity: "Акыркы активдүүлүк",
                lesson: "Сабак"
            },
            coursePerformance: {
                title: "Курстардын жетишкендиги",
                subtitle: "Курстарыңыз кантип жүрүп жатканын көрүңүз"
            },
            atRisk: {
                title: "Тобокелдиктеги студенттер",
                subtitle: "Кошумча жардам керек болушу мүмкүн студенттер"
            },
            weakLessons: {
                title: "Алсыз сабактар",
                subtitle: "Жакшыртууга муктаж сабактар"
            },
            charts: {
                performanceTrendTitle: "Окуу натыйжаларынын тренди",
                performanceTrendSubtitle: "Тандалган мезгилдеги жалпы аткаруу баллы",
                courseCompletionTitle: "Курстар боюнча аяктоо үлүшү",
                courseCompletionSubtitle: "Ар бир курстун аяктоо деңгээлин салыштыруу"
            },
            teachingInsights: {
                title: "Окутуу боюнча сунуштар",
                subtitle: "Метрикаларга негизделген кийинки аракеттер"
            },
            insights: {
                completion: {
                    title: "Аяктоо деңгээлин көтөрүү керек",
                    message: "Аяктоо көрсөткүчү 60%дан төмөн. Узун сабактарды кыска бөлүктөргө бөлүп, ар бир бөлүктөн кийин текшерүү суроосун кошуңуз."
                },
                risk: {
                    title: "Эрте кийлигишүү керек",
                    message: "{{count}} студент тобокелдикте. Акыркы активдүүлүгү жок же прогресси төмөн студенттерга жеке тапшырма же билдирүү жөнөтүңүз."
                },
                audience: {
                    title: "Аудиторияны кеңейтүү мүмкүнчүлүгү бар",
                    message: "Студенттер аз болгон курстарда кириш сабакты, курс сүрөттөмөсүн жана биринчи тапшырманы тактап чыгыңыз."
                },
                stable: {
                    title: "Курстар туруктуу темпте жүрүп жатат",
                    message: "Аяктоо деңгээли жана тобокелдик көрсөткүчү нормалдуу. Эми эң алсыз сабактарды карап, мазмунду майда жакшыртуулар менен жаңыртыңыз."
                }
            },
            fallbacks: {
                courseWithId: "Курс #{{id}}",
                studentWithId: "Студент #{{id}}",
                lessonWithId: "Сабак #{{id}}",
                unknown: "Белгисиз",
                never: "Эч качан эмес"
            }
        },
        mobileOverview: {
            welcome: "Кош келиңиз, {{name}}!",
            profileLine: "{{title}} • {{count}} курс",
            stats: {
                published: "Жарыяланган",
                pending: "Күтүлүүдө",
                aiCourses: "AI курстар",
                students: "Студенттер"
            },
            actions: {
                newCourse: "Жаңы курс",
                analytics: "Аналитика",
                students: "Студенттер",
                profile: "Профиль"
            },
            recentCourses: {
                title: "Акыркы курстар",
                viewAll: "Бардыгы",
                meta: "{{students}} студент • {{lessons}} сабак"
            },
            fallbacks: {
                instructor: "Инструктор",
                instructorInitial: "И",
                courseInitial: "К"
            }
        },
        ai: {
            eyebrow: "AI иш аймагы",
            title: "EDU AI ассистент",
            description: "AI жардамчысы кайсы курстарда иштеп жатканын, канча курс даяр экенин жана кийинки жөндөө кадамдарын ушул жерден көрүңүз.",
            actions: {
                settings: "AI жөндөөлөрү",
                edit: "Өзгөртүү",
                createCourse: "Курс түзүү"
            },
            metrics: {
                activeCourses: "AI активдүү курстар",
                totalCourses: "Жалпы курстар",
                notReady: "AI даяр эмес"
            },
            enabledCourses: {
                title: "AI иштетилген курстар",
                description: "AI ассистенти активдүү курстарды түзөтүүгө же толуктоого бул тизмеден өтүңүз.",
                updatedAt: "Жаңыртылды: {{date}}",
                noUpdateInfo: "Жаңыртуу маалыматы жок"
            },
            empty: {
                title: "AI ассистенти иштетилген курс жок",
                subtitle: "Курс редакторунда AI жардамчыны активдештиргенден кийин ушул жерде активдүү курстар чыгат."
            },
            stepsPanel: {
                title: "Колдонуу кадамдары",
                description: "AI ассистентти жөндөөнүн негизги агымы."
            },
            steps: {
                activate: "Курс редакторунда AI ассистентти активдештириңиз.",
                reviewPrompts: "Ассистент сценарийлерин жана промпттарын текшериңиз.",
                verifyStudentChat: "Студент чатында AI жардамчынын жеткиликтүүлүгүн текшериңиз."
            }
        },
        createOfferingModal: {
            header: {
                title: "{{title}} - Кадам {{step}}/{{total}}",
                createTitle: "Жаңы курс сунушу",
                editTitle: "Курс сунушун өзгөртүү"
            },
            steps: {
                basic: "Негизги маалымат",
                schedule: "График",
                review: "Текшерүү"
            },
            fields: {
                course: "Курс",
                modality: "Өткөрүү форматы",
                price: "Баасы (сом)",
                schedule: "График"
            },
            modalities: {
                online: {
                    label: "Онлайн",
                    description: "Zoom же Google Meet аркылуу жандуу сабак."
                },
                offline: {
                    label: "Офлайн",
                    description: "Офлайн тренинг. Жайгашкан жерди көрсөтүңүз."
                },
                hybrid: {
                    label: "Аралаш",
                    description: "Онлайн жана офлайн аралаш формат."
                }
            },
            placeholders: {
                course: "Курс тандаңыз",
                select: "Тандаңыз"
            },
            validation: {
                courseRequired: "Курс тандаңыз.",
                modalityRequired: "Өткөрүү форматын тандаңыз.",
                priceRequired: "Бааны киргизиңиз.",
                scheduleRequired: "График блогун кошуңуз.",
                dayRequired: "Күн тандаңыз.",
                startTimeRequired: "Башталыш убактысы керек.",
                endTimeRequired: "Аягы убактысы керек.",
                timeInvalid: "Убакыт аралыгы туура эмес."
            },
            schedule: {
                blockNumber: "Блок #{{number}}",
                deleteAria: "{{number}}-блокту өчүрүү",
                day: "Күн",
                startTime: "Башталыш убактысы",
                endTime: "Аягы убактысы"
            },
            weekdays: {
                mon: "Дүйшөмбү",
                tue: "Шейшемби",
                wed: "Шаршемби",
                thu: "Бейшемби",
                fri: "Жума",
                sat: "Ишемби",
                sun: "Жекшемби"
            },
            review: {
                title: "Курс сунушун текшерүү",
                course: "Курс: {{course}}",
                modality: "Формат: {{modality}}",
                price: "Баасы: {{price}}",
                priceValue: "{{price}} сом",
                free: "Акысыз",
                scheduleCount: "График блоктору: {{count}}",
                confirm: "Бардык маалыматты текшериңиз. Эгер баары туура болсо, \"{{action}}\" басыңыз."
            },
            actions: {
                cancel: "Жокко чыгаруу",
                next: "Кийинки кадам",
                back: "Артка",
                review: "Текшерүү",
                create: "Түзүү",
                update: "Өзгөртүү",
                addSchedule: "График блогун кошуу"
            },
            fallbacks: {
                notSelected: "Тандалган эмес"
            },
            currency: "сом",
            priceHelp: "Бош калса акысыз курс болот."
        },
        offerings: {
            hero: {
                eyebrow: "Курс сунуштарын башкаруу",
                title: "Курс сунуштары",
                description: "Курстарыңызга арналган корпоративдик, ачык жана атайын сунуштарды бир жерден көзөмөлдөңүз."
            },
            metrics: {
                total: "Бардык курс сунуштары",
                upcoming: "Жакынкы курс сунуштары",
                company: "Компаниялар үчүн",
                public: "Ачык сунуштар",
                active: "Активдүү",
                draft: "Долбоор",
                closed: "Жабылган"
            },
            filters: {
                title: "Фильтр жана издөө",
                description: "Курс, убакыт жана сунуш аталышы боюнча натыйжаларды тарытыңыз.",
                allCourses: "Бардык курстар",
                upcoming: "Жакынкы",
                past: "Өткөн",
                all: "Баары",
                searchPlaceholder: "Курс сунушу боюнча издөө..."
            },
            list: {
                title: "Курс сунуштарынын тизмеси",
                description: "{{count}} курс сунушу табылды"
            },
            empty: {
                title: "Курс сунуштары азырынча жок",
                subtitle: "Биринчи курс сунушун түзүп, катталуу агымын баштаңыз."
            },
            actions: {
                create: "Курс сунушун түзүү"
            },
            card: {
                fallbackTitle: "{{course}} сунушу",
                course: "Курс: {{course}}",
                capacity: "{{count}} орун",
                unlimitedCapacity: "Орун чектелбеген",
                featured: "Өзгөчөлөнгөн",
                enrolled: "Катталган: {{count}}",
                seatsRemaining: "Калган орун: {{count}}",
                schedule: "Жүгүртмө:",
                note: "Белгилей кетүү: {{note}}",
                editCourse: "Курсту өзгөртүү",
                editOffering: "Курс сунушун өзгөртүү",
                addStudent: "Студент кошуу",
                copyLink: "Шилтеме көчүрүү"
            },
            modalities: {
                online: "Онлайн",
                offline: "Офлайн",
                hybrid: "Гибрид"
            },
            visibility: {
                public: "Ачык",
                private: "Жабык"
            },
            statuses: {
                active: "Активдүү",
                draft: "Долбоор",
                completed: "Аяктады",
                archived: "Архив"
            },
            fallbacks: {
                course: "Курс",
                student: "Студент",
                unknown: "Белгисиз"
            },
            toasts: {
                courseRequired: "Курс тандаңыз.",
                created: "Курс сунушу ийгиликтүү түзүлдү.",
                updated: "Курс сунушу жаңыртылды.",
                saveError: "Курс сунушун сактоо мүмкүн болбоду.",
                studentsLoadError: "Студенттердин тизмесин жүктөө мүмкүн болбоду.",
                studentSearchError: "Студенттерди издөөдө ката кетти.",
                invalidUser: "Колдонуучу ID туура эмес.",
                studentAdded: "Студент курс сунушуна кошулду.",
                studentAddError: "Студентти курс сунушуна кошууда ката кетти."
            }
        },
        data: {
            errors: {
                courseForbidden: "Бул курс сизге бекитилген эмес."
            },
            toasts: {
                coursesLoadError: "Инструктор курстарын жүктөө мүмкүн болбоду.",
                studentCoursesLoadError: "Студенттер тизмесин жүктөө мүмкүн болбоду.",
                courseStudentsLoadError: "Курс студенттерин жүктөө мүмкүн болбоду."
            }
        },
        groupsSection: {
            header: {
                eyebrow: "Группалар панели",
                title: "Группалар",
                description: "Офлайн жана онлайн түз эфир курстары үчүн группа, тизме жана кийинки сессия контексти ушул жерде башкарылат.",
                activeDescription: "Офлайн жана онлайн түз эфир курстары үчүн группа академиялык контейнер болуп саналат: катталуу группага байланышат, сессиялар ошол группадан окуйт."
            },
            noDelivery: {
                title: "Группа курстары табылган жок",
                description: "Группа түзүү жана студентти группага каттоо үчүн алгач офлайн же онлайн түз эфир курс керек.",
                emptyTitle: "Группага ылайыктуу курс жок",
                emptySubtitle: "Алгач группа менен окула турган курс түзүңүз. Видео курстар группа талап кылбайт.",
                pendingCount: "{{count}} курс азырынча группага даяр эмес. Группа түзүү үчүн курс тастыкталып, жарыяланышы керек."
            },
            actions: {
                createCourse: "Курс түзүү",
                openSessions: "Сессия панели",
                createGroup: "Группа түзүү",
                manageSessions: "Сессияларды башкаруу",
                generateSessions: "Сессия түзүү",
                addIndividualStudent: "Жеке студент кошуу",
                addStudent: "Студент кошуу",
                edit: "Өзгөртүү"
            },
            metrics: {
                groups: "Группалар",
                active: "Активдүү",
                planned: "Пландалган",
                seats: "Орундар"
            },
            courseGroups: {
                title: "Курс боюнча группалар",
                description: "Группа менен окула турган курсту тандап, ошол курс астындагы группаларды көрүңүз. Катталуу ушул группалардын бирине байланышы керек.",
                courseLabel: "Группа курсу",
                selectCourse: "Курс тандаңыз",
                pendingHidden: "{{count}} курс тастыкталып, жарыяланмайынча бул жерде көрсөтүлбөйт.",
                anchorLabel: "Катталуу байланышы:",
                anchorValue: "группа"
            },
            deliveryModes: {
                group: "Группа",
                individual: "Жеке курс"
            },
            fallbacks: {
                groupWithId: "Группа #{{id}}",
                student: "Студент"
            },
            card: {
                code: "Код: {{code}}",
                individualStudent: "Жеке студент: {{student}}",
                individualStudentNotFound: "Жеке студент табылган жок",
                individualStudentLoading: "Жеке студент жүктөлүүдө...",
                format: "Формат",
                period: "Период",
                seats: "Орун",
                unlimited: "Чектелбеген",
                noLocation: "Локация жок",
                noTimezone: "Убакыт алкагы жок",
                defaultSchedule: "Дефолт график",
                noSchedule: "Азырынча коюлган эмес",
                individualLimitTitle: "Жеке курс бир гана активдүү студентке арналган"
            },
            empty: {
                noGroupsTitle: "Бул курс боюнча группа жок",
                selectCourseTitle: "Курс тандаңыз",
                noGroupsSubtitle: "Группа түзүлгөндөн кийин студент катталуусу, сессия жана катышуу ушул контейнерден башталат.",
                selectCourseSubtitle: "Группа менен окула турган курсту тандасаңыз, анын группалары ушул жерде көрүнөт."
            },
            sessionProcess: {
                title: "Сессия процесси",
                description: "Группа маалыматы модал терезе аркылуу башкарылат. Сессия түзүү, өзгөртүү жана күнүмдүк иштер сессия панелинде калат.",
                body: "Бул бөлүмдө группага каттоо жана группа маалыматы башкарылат. Катышуу, үй тапшырма, жолугушуу жана сессия маалыматы өзүнчө сессия процессинде калат."
            },
            toasts: {
                selectCourse: "Адегенде курсту тандаңыз.",
                groupNameAndCodeRequired: "Группа үчүн аталыш жана код милдеттүү.",
                individualNameRequired: "Жеке курс үчүн аталыш милдеттүү.",
                studentRequired: "Жеке курс үчүн студентти тандаңыз.",
                firstSessionScheduleRequired: "Биринчи сессия үчүн баштоо датасын жана толук график блогун кошуңуз.",
                liveMeetingRequired: "Жеке онлайн live курс түзүүдөн мурун жолугушуу платформасын же шилтемесин кошуңуз.",
                enrollmentNotReady: "Группа ачылып, live сессиялар жолугушуу маалыматы менен пландалмайынча каттоо жабык.",
                individualCreated: "Жеке курс түзүлдү.",
                groupCreated: "Группа түзүлдү.",
                selectGroupForEdit: "Өзгөртүү үчүн группа тандаңыз.",
                groupUpdated: "Группа жаңыртылды.",
                defaultScheduleRequired: "Адегенде группа үчүн дефолт график сактаңыз.",
                sessionsCreated: "{{count}} сессия түзүлдү.",
                noNewSessions: "Жаңы сессия жок, мурунтан барлары өткөрүп жиберилди.",
                invalidUserId: "Колдонуучу ID туура эмес.",
                studentAdded: "Студент группага кошулду."
            }
        },
        groupForm: {
            header: {
                editEyebrow: "Группаны өзгөртүү",
                createEyebrow: "Группа түзүү",
                editTitle: "Группаны түзөтүү",
                createTitle: "Жаңы группа",
                description: "{{course}} үчүн академиялык группа метамаалыматын башкаруу."
            },
            sections: {
                basic: "Негизги маалымат",
                period: "Период жана орундар",
                student: "Студент тандоо",
                delivery: "Өткөрүү форматы"
            },
            deliveryModes: {
                group: {
                    label: "Группа",
                    description: "Бир нече студент үчүн окуу тобу."
                },
                individual: {
                    label: "Жеке курс",
                    description: "Бир студентке арналган жеке агым."
                }
            },
            delivery: {
                offlineGroup: "Офлайн группа",
                onlineLiveGroup: "Онлайн түз эфир группа",
                deliveryGroup: "Окуу группасы",
                courseFormat: "Бул курс форматы:",
                learningFormat: "Окутуу форматы:",
                noExtraFields: "Бул курс үчүн кошумча өткөрүү форматы талаалары талап кылынбайт."
            },
            fields: {
                individualName: "Жеке курстун аты *",
                groupName: "Группа аты *",
                groupCode: "Группа коду *",
                instructorId: "Инструктор ID",
                seatLimit: "Орун лимити",
                timezone: "Убакыт алкагы",
                location: "Локация",
                meetingProvider: "Жолугушуу платформасы",
                meetingUrl: "Жолугушуу URL"
            },
            help: {
                groupCode: "Код группа үчүн уникалдуу идентификатор."
            },
            statuses: {
                planned: "Пландалды",
                active: "Активдүү",
                completed: "Аяктады",
                cancelled: "Жокко чыгарылды"
            },
            student: {
                description: "Жеке курс бир студентке байланып түзүлөт.",
                searchPlaceholder: "Аты же email (кеминде 2 тамга)",
                notFound: "Студент табылган жок.",
                selectedId: "Тандалган студент ID: {{id}}",
                pickHint: "Кеминде эки тамга жазыңыз жана студентти тизмеден тандаңыз."
            },
            firstSession: {
                title: "Биринчи сессияны кошо түзүү",
                description: "График блогу толтурулса, жеке курс үчүн баштапкы сессия процесси даярдалат."
            },
            notice: {
                title: "Эскертүү",
                offline: "Бул группа офлайн окутулат. Локацияны так кармаңыз, ал сессия иш аймагында көрсөтүлөт.",
                onlineLive: "Бул группа онлайн түз эфирде окутулат. Жолугушуу платформасы жана URL сессия процесси үчүн негизги маанилер болуп калат.",
                delivery: "Группа катталуу үчүн контейнер болуп саналат. Сессия, катышуу, үй тапшырма жана жолугушуу процесстери өзүнчө сессия иш аймагында калат."
            },
            schedule: {
                eyebrow: "Пландоо блогу",
                title: "Жумалык дефолт график",
                description: "Бул сессияларды автоматтык түзбөйт. Бирок группа үчүн кадимки жумалык графикти сактап, кийинки сессияларды пландаштырууну жеңилдетет.",
                noteLabel: "Кыскача эскертүү",
                notePlaceholder: "Мисалы: Дүйшөмбү, Шаршемби · 19:00-21:00",
                day: "Күн",
                start: "Башталышы",
                end: "Аягы",
                blockNumber: "Блок #{{number}}",
                dayAria: "Блок {{number}} күнү",
                startAria: "Блок {{number}} башталышы",
                endAria: "Блок {{number}} аягы",
                primaryBlock: "Негизги блок"
            },
            weekdays: {
                mon: "Дүйшөмбү",
                tue: "Шейшемби",
                wed: "Шаршемби",
                thu: "Бейшемби",
                fri: "Жума",
                sat: "Ишемби",
                sun: "Жекшемби"
            },
            actions: {
                regenerate: "Кайра түзүү",
                addBlock: "Блок кошуу",
                delete: "Өчүрүү",
                close: "Жабуу",
                saving: "Сакталууда...",
                updateGroup: "Группаны жаңыртуу",
                createIndividual: "Жеке курс түзүү",
                createGroup: "Группа түзүү"
            },
            fallbacks: {
                deliveryCourse: "Группа менен өтүүчү курс",
                unknownStudent: "Белгисиз студент",
                studentWithId: "Студент #{{id}}"
            },
            toasts: {
                loadFailed: "Группаларды жүктөө мүмкүн болбоду.",
                createFailed: "Группа түзүү мүмкүн болбоду.",
                updateFailed: "Группаны жаңыртуу мүмкүн болбоду."
            }
        },
        enrollStudentModal: {
            eyebrow: "Курс сунушуна каттоо",
            description: "{{offering}} үчүн студент кошуу.",
            seats: "Орундар",
            unlimited: "Чектелбеген",
            search: {
                title: "Студент издөө",
                description: "Аты же email менен издеп, курс сунушуна кошула турган студентти тандаңыз.",
                placeholder: "Аты же email (кеминде 2 тамга)",
                notFound: "Студент табылган жок.",
                selectedId: "Тандалган студент ID: {{id}}",
                pickHint: "Тизмеден студент тандалгандан кийин жаздыруу даяр болот."
            },
            discount: {
                title: "Скидка",
                label: "Скидка %",
                placeholder: "Мисалы: 10"
            },
            currentStudents: {
                title: "Азыркы студенттер",
                description: "Курс сунушунун учурдагы курамын текшерип туруп кошуңуз.",
                empty: "Бул курс сунушунда азырынча студент жок."
            },
            actions: {
                close: "Жабуу",
                enrolling: "Кошууда...",
                enroll: "Студент кошуу"
            },
            fallbacks: {
                offering: "Курс сунушу",
                unknownStudent: "Белгисиз студент",
                studentWithId: "Студент #{{id}}",
                noEmail: "Email жок"
            }
        },
        enrollGroupStudentModal: {
            eyebrow: "Группага каттоо",
            description: "{{course}} курсунан студентти бул группага кошуу.",
            course: "Курс",
            groupCode: "Группа коду",
            seats: "Орундар",
            unlimited: "Чектелбеген",
            search: {
                title: "Студент издөө жана тандоо",
                description: "Аты, email же аккаунт маалыматы менен издеп, тизмеден так студентти тандаңыз.",
                placeholder: "Аты же email (кеминде 2 тамга)",
                notFound: "Студент табылган жок.",
                selectedId: "Тандалган студент ID: {{id}}",
                pickHint: "Кеминде эки тамга жазыңыз жана студентти тизмеден тандаңыз."
            },
            discount: {
                title: "Баа шарты",
                description: "Керек болсо ручной скидка көрсөтүңүз. Бош калса стандарттуу баа колдонулат.",
                label: "Скидка %",
                placeholder: "Мисалы: 10"
            },
            snapshot: {
                title: "Группа кыскача маалыматы",
                groupId: "Группа ID",
                fill: "Толтурулушу"
            },
            currentStudents: {
                title: "Азыркы студенттер",
                description: "Группадагы азыркы курамды тез текшерип туруп кошсоңуз болот.",
                empty: "Бул группада азырынча студент жок."
            },
            actions: {
                close: "Жабуу",
                enrolling: "Кошулууда...",
                enroll: "Студент кошуу"
            },
            fallbacks: {
                deliveryCourse: "Группа менен өтүүчү курс",
                groupWithId: "Группа #{{id}}",
                unknownStudent: "Белгисиз студент",
                studentWithId: "Студент #{{id}}",
                noEmail: "Email жок"
            },
            toasts: {
                studentsLoadFailed: "Группанын студенттерин жүктөө мүмкүн болбоду.",
                studentSearchFailed: "Студенттерди издөөдө ката кетти.",
                enrollFailed: "Студентти группага кошууда ката кетти."
            }
        },
        templates: {
            eyebrow: "Иш аймагы",
            quizTab: "Тест шаблондору",
            lessonPlanTab: "Сабак пландары",
            quizTemplates: {
                title: "Тест шаблондору",
                description: "Сессияларга тиркее турган кайта колдонулуучу тесттер.",
                createPlaceholder: "Шаблон аты",
                create: "Түзүү",
                empty: { title: "Тест шаблону жок", subtitle: "Биринчи кайта колдонулуучу тест шаблонун түзүңүз." },
                actions: { duplicate: "Көчүрүү", delete: "Өчүрүү" },
                toasts: { createFailed: "Шаблонду түзүү мүмкүн болбоду.", deleteFailed: "Шаблонду өчүрүү мүмкүн болбоду.", duplicated: "Шаблон көчүрүлдү." }
            },
            lessonPlanTemplates: {
                title: "Сабак планынын шаблондору",
                description: "Сессиялар үчүн кайта колдонулуучу пландар жана конспекттер.",
                titlePlaceholder: "План аты",
                contentPlaceholder: "Мазмун, план же эскертүүлөр...",
                save: "Планды сактоо",
                update: "Планды жаңыртуу",
                new: "Жаңы план",
                empty: { title: "Сабак планы жок", subtitle: "Биринчи кайта колдонулуучу сабак планын түзүңүз." },
                actions: { edit: "Түзөтүү", delete: "Өчүрүү", cancel: "Жокко чыгаруу" },
                toasts: { createFailed: "Планды сактоо мүмкүн болбоду.", updateFailed: "Планды жаңыртуу мүмкүн болбоду.", deleteFailed: "Планды өчүрүү мүмкүн болбоду." }
            }
        },
        aiGenerator: {
            eyebrow: "AI Studio",
            liveQuizTab: "Жандуу тест",
            freeFormTab: "Эркин форма",
            liveQuiz: {
                title: "Жандуу тест черногу",
                description: "Келерки сессияга тест тапшырмасын жаратыңыз.",
                topicLabel: "Тема",
                topicPlaceholder: "мис. Present perfect",
                questionCountLabel: "Суроолордун саны",
                difficultyLabel: "Кыйынчылык",
                difficulty: { easy: "Жеңил", medium: "Орто", hard: "Кыйын" },
                generate: "Тест жаратуу",
                generating: "Жаратылууда..."
            },
            freeForm: {
                title: "Эркин форматтагы мазмун",
                description: "Каалаган тема боюнча түшүндүрмө, машыгуу же иш барагын жаратыңыз.",
                topicLabel: "Тема",
                topicPlaceholder: "мис. Тексти түшүнүү стратегиялары",
                typeLabel: "Мазмун түрү",
                types: { explanation: "Түшүндүрмө", exercise: "Машыгуу", worksheet: "Иш барагы" },
                generate: "Мазмун жаратуу",
                generating: "Жаратылууда..."
            },
            result: {
                title: "Генерация натыйжасы",
                copy: "Көчүрүү",
                accept: "Кабыл алуу",
                reject: "Четке кагуу",
                toasts: { accepted: "Натыйжа кабыл алынды.", rejected: "Натыйжа четке кагылды.", copied: "Көчүрүлдү." }
            },
            toasts: { error: "Генерация ийгиликсиз. Кайра аракет кылыңыз." }
        },
        messageDrafts: {
            eyebrow: "AI Studio",
            title: "Кат черногу",
            description: "Студенттерге жекелештирилген каттарды AI жардамы менен жаратыңыз.",
            courseLabel: "Курс",
            coursePlaceholder: "Курс тандаңыз",
            studentLabel: "Студент",
            studentPlaceholder: "Студент тандаңыз",
            purposeLabel: "Максат / контекст",
            purposePlaceholder: "мис. 3 сессияны өткөрүп жиберди — колдоп-шыктандыруу.",
            generate: "Черног жаратуу",
            generating: "Жаратылууда...",
            result: { title: "Черног", copy: "Көчүрүү", toasts: { copied: "Черног көчүрүлдү." } },
            empty: { course: "Студенттерди жүктөө үчүн курс тандаңыз.", student: "Бул курста студент табылган жок." },
            toasts: { selectStudent: "Алгач курс жана студент тандаңыз.", error: "Кат черногун жаратуу ийгиликсиз болду." }
        },
        generateSessions: {
            eyebrow: "Сессия түзүү",
            title: "Сессияларды түзүү",
            description: "{{group}} үчүн дефолт графиктен чыныгы сессияларды алдын ала көрүп, анан гана түзөсүз.",
            range: {
                title: "Диапазон",
                description: "Бул алдын ала көрүү мурда бар сессияларды өткөрүп жиберет. Жаңы сессиялар гана түзүлөт.",
                from: "Башталышы",
                to: "Аягы"
            },
            metrics: {
                blocks: "Блоктор",
                newSessions: "Жаңы сессия",
                existing: "Бар болгон"
            },
            steps: {
                preview: "1. Алдын ала көрүү",
                generate: "2. Сессияларды түзүү"
            },
            actions: {
                preview: "Алдын ала көрүү",
                generate: "Сессияларды түзүү",
                generating: "Түзүлүп жатат..."
            },
            preview: {
                title: "Алдын ала көрүү",
                description: "Диапазондогу сессиялар ушундай түзүлөт.",
                recordCount: "{{count}} жазуу",
                emptyBeforePreview: "Диапазонду тандап, алдын ала көрүүнү басыңыз.",
                loading: "Алдын ала көрүү даярдалып жатат...",
                empty: "Бул диапазондо сессия табылган жок.",
                new: "Жаңы",
                existing: "Мурунтан бар"
            },
            fallbacks: {
                selectedGroup: "Тандалган группа"
            },
            toasts: {
                previewFailed: "Алдын ала көрүү жүктөлгөн жок.",
                generateFailed: "Сессияларды түзүү мүмкүн болбоду."
            }
        }
    }
};
