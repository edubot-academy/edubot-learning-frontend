export const admin = {
    adminPanel: {
        subtitle: "Платформаны башкаруу жана көзөмөлдөө",
        hideMenu: "Менюну жашыруу",
        showMenu: "Менюну көрсөтүү",
        workspaceSection: "Админ бөлүмү",
        workspaceGroups: {
            governance: "Платформа көзөмөлү",
            contentOperations: "Контент операциялары",
            technicalOperations: "Техникалык операциялар"
        },
        tabs: {
            stats: "Статистика",
            courses: "Курстар жана категориялар",
            pending: "Жаңы курстарды бекитүү",
            certificates: "Сертификаттар",
            users: "Колдонуучулар",
            companies: "Компаниялар",
            contacts: "Байланыштар",
            analytics: "Аналитика",
            aiPrompts: "AI промпттар",
            skills: "Скиллдер",
            notifications: "Билдирүүлөр",
            integration: "Интеграциялар",
            attendance: "Катышуу"
        },
        status: {
            statsUpdating: "Статистика жаңыланууда",
            aiPromptsLoading: "AI промпттар жүктөлүүдө",
            transcodeRunning: "Транскоддоо жүрүп жатат",
            sectionOpened: "{{section}} ачылды",
            sectionFallback: "Бөлүм"
        },
        notifications: {
            markReadSuccess: "Билдирүү окулган деп белгиленди.",
            markReadError: "Билдирүүнү окулган деп белгилөө мүмкүн болбоду.",
            deleteTitle: "Билдирүүнү өчүрүү",
            deleteMessage: "Бул билдирүү өчүрүлсүнбү?",
            deleteConfirm: "Өчүрүү",
            deleteSuccess: "Билдирүү өчүрүлдү.",
            deleteError: "Билдирүүнү өчүрүү мүмкүн болбоду."
        }
    },
    adminAnalytics: {
        hero: {
            eyebrow: "Analytics overview",
            title: "Административдик аналитика",
            description: "Платформанын жалпы көрүнүшү, колдонуучулар метрикалары, курстардын жетишкендиги жана киреше боюнча маалымат."
        },
        actions: {
            refresh: "Жаңылоо",
            loading: "Жүктөлүүдө..."
        },
        toasts: {
            loadError: "Аналитиканы жүктөө мүмкүн болгон жок."
        },
        metrics: {
            totalUsers: "Бардык колдонуучулар",
            students: "Студенттер",
            courses: "Курстар",
            enrollments: "Катышуулар"
        },
        filters: {
            from: "Күндөн",
            to: "Күнгө чейин",
            status: "Фильтр абалы",
            rangeSelected: "Күн аралыгы тандалды",
            allTime: "Бардык убакыт"
        },
        courseAnalytics: {
            title: "Курс аналитикасы",
            description: "Эң күчтүү курстарды жана көңүл бурууну талап кылган курстарды бир компакттуу блокто салыштырыңыз.",
            metrics: {
                topCourses: "Эң мыкты курстар",
                riskCourses: "Тобокел курстар"
            },
            topCourses: {
                title: "Эң мыкты курстар",
                subtitle: "Студенттер көп катышкан курстар"
            },
            lowPerforming: {
                title: "Көңүл бурууну талап кылган курстар",
                subtitle: "Аяктоо жана орточо прогресс төмөн курстар"
            }
        },
        trends: {
            title: "Тренд отчету",
            description: "Катышуу жана киреше динамикасын убакыт боюнча караңыз.",
            metrics: {
                enrollmentPoints: "Катышуу чекити",
                revenuePoints: "Киреше чекити"
            },
            enrollments: {
                title: "Катышуу тренддери",
                subtitle: "Убакыттын ичиндеги студенттердин катышуусу"
            },
            revenue: {
                title: "Киреше тренддери",
                subtitle: "Убакыттын ичиндеги платформанын кирешеси"
            }
        },
        columns: {
            course: "Курс",
            enrollments: "Катышуулар",
            completionRate: "Аяктоо деңгээли",
            averageProgress: "Орточо прогресс"
        },
        fallbacks: {
            courseWithId: "Курс #{{id}}"
        }
    },
    adminContacts: {
        eyebrow: "Кирген куту",
        title: "Байланыштар",
        description: "Колдонуучулардын байланыш билдирүүлөрүн көрүп, иштетилгенин белгилеңиз.",
        metrics: {
            total: "Бардык билдирүүлөр",
            unread: "Окула элек",
            withMessage: "Толук билдирүү менен"
        },
        inbox: {
            title: "Кирген билдирүүлөр",
            description: "Форма жана байланыш каналдары аркылуу келген суроолор."
        },
        status: {
            read: "Окулган",
            new: "Жаңы"
        },
        actions: {
            markRead: "Окулган деп белгилөө",
            delete: "Өчүрүү"
        },
        empty: {
            title: "Байланыштар табылган жок",
            subtitle: "Азырынча байланыш билдирүүлөрү жок."
        },
        toasts: {
            loadError: "Байланыш каттарын жүктөө мүмкүн болбоду."
        }
    },
    adminStats: {
        currency: {
            kgs: "{{amount}} сом"
        },
        hero: {
            eyebrow: "Акыркы 7 күн",
            title: "Платформанын статистикасы",
            description: "Жалпы көрсөткүчтөр, активдүүлүк, киреше жана өсүү тенденциялары."
        },
        actions: {
            refresh: "Жаңыртуу"
        },
        metrics: {
            students: "Студенттер",
            courses: "Курстар",
            publishedCourses: "Жарыяланган курстар",
            totalEnrollments: "Жалпы каттоолор",
            activeEnrollments: "Активдүү каттоолор",
            totalRevenue: "Жалпы киреше",
            last30Days: "Акыркы 30 күн",
            last7Days: "Акыркы 7 күн",
            courseCompletion: "Курс аяктоо",
            activeStudents: "Активдүү студенттер"
        },
        trends: {
            eyebrow: "Тренд кыскача",
            title: "Тренддер",
            description: "Кыска мөөнөттүү өсүү жана катышуу өзгөрүүсү.",
            dailySignups: "Күнүмдүк каттоо (студент)",
            dailyEnrollments: "Күнүмдүк каттоолор",
            period7d: "7 күн"
        },
        topCourses: {
            eyebrow: "Курс рейтинги",
            title: "Эң активдүү жана кирешелүү курстар",
            table: {
                course: "Курс",
                enrollments: "Каттоолор",
                active7d: "Активдүү (7к)",
                completion: "Аяктоо",
                revenue: "Киреше"
            },
            empty: "Алдыңкы курстар азырынча жок."
        },
        toasts: {
            loadError: "Статистиканы жүктөө мүмкүн болбоду."
        }
    },
    adminSkills: {
        eyebrow: "Скилл каталогу",
        title: "Скиллдер",
        description: "Курс жана талант маалыматтарында колдонулуучу скиллдерди башкарыңыз.",
        metrics: {
            total: "Бардык скиллдер",
            initials: "Топтолгон баш тамгалар",
            editMode: "Түзөтүү режиминде"
        },
        create: {
            title: "Жаңы скилл",
            description: "Кыска, стандартташкан аталыш колдонуңуз.",
            placeholder: "Жаңы скиллдин аталышы"
        },
        list: {
            title: "Скилл тизмеси",
            description: "Бардык активдүү скиллдер."
        },
        actions: {
            add: "Кошуу",
            delete: "Өчүрүү"
        },
        empty: {
            title: "Скиллдер жок",
            subtitle: "Азырынча скилл каталогу бош."
        },
        confirm: {
            deleteTitle: "Скиллди өчүрүү",
            deleteMessage: "Бул скилл өчүрүлсүнбү?"
        },
        toasts: {
            loadError: "Скиллдерди жүктөө мүмкүн болбоду.",
            created: "Скилл кошулду.",
            createError: "Скилл кошуу мүмкүн болбоду.",
            updated: "Скилл жаңыртылды.",
            updateError: "Скиллди жаңыртуу мүмкүн болбоду.",
            deleted: "Скилл өчүрүлдү.",
            deleteError: "Скиллди өчүрүү мүмкүн болбоду."
        }
    },
    adminPendingCourses: {
        eyebrow: "Бекитүү кезеги",
        title: "Каралуудагы курстар",
        description: "Инструкторлор жөнөткөн жаңы курстарды ушул жерден текшерип, бекитиңиз же четке кагыңыз.",
        metrics: {
            pending: "Күтүүдөгү курстар",
            instructors: "Инструкторлор",
            paid: "Акы төлөнүүчү",
            newest: "Акыркысы: {{date}}"
        },
        queue: {
            title: "Бекитүү тизмеси",
            description: "Ар бир курс боюнча түрүн, баасын, инструкторун жана алдын ала көрүү шилтемесин текшериңиз."
        },
        courseTypes: {
            offline: "Офлайн",
            onlineLive: "Онлайн түз эфир",
            video: "Видео"
        },
        status: {
            pending: "Каралууда",
            pendingApproval: "Бекитүүнү күтөт"
        },
        actions: {
            details: "Ички маалымат",
            preview: "Алдын ала көрүү",
            approve: "Бекитүү",
            reject: "Баш тартуу"
        },
        fields: {
            price: "Баасы",
            createdAt: "Түзүлгөн күнү",
            status: "Статус"
        },
        empty: {
            title: "Каралуудагы курстар жок",
            subtitle: "Азырынча бекитүүнү күткөн курс табылган жок."
        },
        confirm: {
            approveTitle: "Курсту бекитүү",
            approveMessage: "\"{{title}}\" курсун бекитесизби? Бекитилгенден кийин курс студенттерге жана каталог агымдарына жеткиликтүү болушу мүмкүн.",
            rejectTitle: "Курстан баш тартуу",
            rejectMessage: "\"{{title}}\" курсун четке кагасызбы? Инструктор курсун оңдоп кайра жөнөтүшү керек болот."
        },
        toasts: {
            loadError: "Каралуудагы курстарды жүктөө мүмкүн болбоду.",
            approved: "Курс ийгиликтүү бекитилди.",
            approveError: "Курсту бекитүү мүмкүн болбоду.",
            rejected: "Курс баш тартылган тизмеге жылдырылды.",
            rejectError: "Курстан баш тартуу мүмкүн болбоду."
        },
        courseFallback: "Курс #{{id}}",
        uncategorized: "Категориясыз",
        instructor: "Инструктор",
        currency: {
            kgs: "{{amount}} сом"
        },
        free: "Акысыз"
    },
    adminDeliveryCourseDetails: {
        title: "Группа менен өтүүчү курс маалыматы",
        subtitle: "Бул курс коомдук видео-баракчага эмес, ички башкаруу агымдарына тиешелүү.",
        close: "Жабуу",
        fields: {
            category: "Категория",
            note: "Эскертүү"
        },
        note: "Группа менен өтүүчү курстар үчүн деталдуу башкаруу группа, сессия жана катталуу табдары аркылуу жүргүзүлөт."
    },
    adminAiPrompts: {
        eyebrow: "AI промпттар",
        title: "AI промпттар",
        description: "Курс боюнча жардамчыга берилген системалык промпттарды башкарыңыз.",
        metrics: {
            total: "Бардык промпттар",
            active: "Активдүү",
            selectedCourse: "Тандалган курс"
        },
        create: {
            title: "Курс жана жаңы промпт",
            description: "Алгач курс тандап, андан кийин жаңы промпт кошуңуз.",
            selectCourse: "Курс тандаңыз",
            promptPlaceholder: "Промпт текстин киргизиңиз",
            editPlaceholder: "Промпт тексти"
        },
        list: {
            title: "Промпт тизмеси",
            description: "Тандалган курс үчүн учурдагы промпттар."
        },
        languages: {
            ky: "Кыргызча",
            ru: "Русский",
            en: "English"
        },
        order: {
            "0": "Жогорку",
            "1": "Ортосу",
            "2": "Аягы"
        },
        status: {
            active: "Активдүү",
            inactive: "Өчүрүлгөн"
        },
        actions: {
            add: "Промпт кошуу",
            save: "Сактоо",
            cancel: "Жокко чыгаруу",
            edit: "Өзгөртүү",
            delete: "Өчүрүү"
        },
        promptMeta: "Тил: {{language}} · Тартип: {{order}} · {{status}}",
        empty: {
            title: "AI промпттар табылган жок",
            subtitle: "Бул курс үчүн азырынча промпт кошула элек."
        },
        confirm: {
            deleteTitle: "AI промптти өчүрүү",
            deleteMessage: "Бул AI промптти өчүрүүгө ишенимдүүсүзбү?"
        },
        toasts: {
            loadError: "AI промпттарды жүктөө мүмкүн болбоду.",
            selectCourse: "AI промпт кошуу үчүн курс тандаңыз.",
            created: "AI промпт ийгиликтүү кошулду.",
            createError: "AI промпт кошуу мүмкүн болбоду.",
            updated: "AI промпт ийгиликтүү жаңыртылды.",
            updateError: "AI промптти жаңыртуу мүмкүн болбоду.",
            deleted: "AI промпт ийгиликтүү өчүрүлдү.",
            deleteError: "AI промптти өчүрүү мүмкүн болбоду."
        }
    },
    adminUsers: {
        eyebrow: "Адамдар жана кирүү укуктары",
        title: "Колдонуучулар",
        description: "Колдонуучуларды издеп, ролдорун өзгөртүп жана аккаунттарды башкарыңыз.",
        metrics: {
            currentPage: "Ушул баракта",
            total: "Жалпы колдонуучу",
            instructors: "Инструкторлор",
            admins: "Админдер"
        },
        roles: {
            student: "Студент",
            instructor: "Инструктор",
            assistant: "Ассистент",
            admin: "Admin",
            superadmin: "Super Admin",
            unknown: "белгисиз"
        },
        filters: {
            title: "Фильтрлер",
            description: "Издөө жана роль боюнча тизмени тактаңыз.",
            searchPlaceholder: "Ат же Email боюнча издөө",
            allRoles: "Бардык ролдор"
        },
        list: {
            title: "Колдонуучулар тизмеси"
        },
        fallbacks: {
            noName: "Аты жок",
            noEmail: "email жок"
        },
        actions: {
            delete: "Өчүрүү",
            changeRole: "Ролду өзгөртүү",
            changeRoleAria: "{{user}} ролун өзгөртүү",
            deleteSelfTitle: "Өз аккаунтуңузду өчүрүүгө болбойт"
        },
        empty: {
            title: "Колдонуучулар табылган жок",
            subtitle: "Фильтрлерди өзгөртүп же жаңы колдонуучуларды күтүңүз."
        },
        pagination: {
            summary: "Баракча {{page}} / {{totalPages}} · Бардыгы: {{total}}",
            previous: "Алдыңкы",
            next: "Кийинки"
        },
        confirm: {
            deleteTitle: "Колдонуучуну өчүрүү",
            deleteMessage: "{{user}} колдонуучусун өчүрүүгө ишенимдүүсүзбү? Бул аракет аккаунтка кирүүнү токтотот.",
            roleTitle: "Ролду өзгөртүү",
            roleMessage: "{{user}} колдонуучусунун ролун \"{{currentRole}}\" → \"{{newRole}}\" кылып өзгөртөсүзбү? Бул кирүү укуктарына дароо таасир берет."
        },
        toasts: {
            loadError: "Колдонуучуларды жүктөө мүмкүн болбоду.",
            loadStudentsError: "Студенттерди жүктөө мүмкүн болбоду.",
            deleted: "Колдонуучу ийгиликтүү өчүрүлдү.",
            deleteError: "Колдонуучуну өчүрүү мүмкүн болбоду.",
            roleChanged: "Роль ийгиликтүү өзгөртүлдү.",
            roleError: "Ролду өзгөртүү мүмкүн болбоду.",
            selectGroup: "Группа менен өтүүчү курс үчүн адегенде группаны тандаңыз.",
            enrolled: "Студент курска ийгиликтүү катталды.",
            enrollError: "Каттоо мүмкүн болбоду."
        }
    },
    adminCourses: {
        eyebrow: "Каталог операциялары",
        title: "Курстар жана категориялар",
        description: "Курстарды, категорияларды жана техникалык курс операцияларын башкарыңыз.",
        operations: "Курс операциялары",
        metrics: {
            courses: "Курстар",
            published: "Жарыяланган",
            categories: "Категориялар",
            delivery: "Группа менен өтүүчү курстар"
        },
        workflows: {
            catalog: {
                label: "Каталог",
                description: "Курстарды жана категорияларды башкаруу."
            },
            enrollment: {
                label: "Жаздыруу",
                description: "Колдонуучуларды видео курстарга же офлайн/түз эфир группаларга кошуу."
            },
            media: {
                label: "Медиа операциялар",
                description: "HLS транскоддоо жана техникалык видео аракеттери."
            }
        },
        catalog: {
            title: "Курстар",
            description: "Курс карталарын карап чыгып, алдын ала көрүп жана каталогду тазалаңыз."
        },
        enrollment: {
            title: "Курска жаздыруу",
            description: "Студенттерди туура курс же группа контекстине кошуңуз.",
            selectGroup: "Группа тандаңыз",
            enrollInGroup: "Колдонуучуну группага жазуу",
            enrollInCourse: "Колдонуучуну курска жазуу",
            selectGroupFirst: "Адегенде группа тандаңыз",
            selectUser: "Колдонуучуну тандаңыз"
        },
        categories: {
            title: "Категориялар",
            description: "Категорияларды кошуп, атын өзгөртүп жана тазалаңыз.",
            placeholder: "Жаңы категориянын аталышы"
        },
        status: {
            published: "Жарыяланган",
            draft: "Даярдалууда"
        },
        deliveryModes: {
            individual: "Жеке",
            group: "Группа"
        },
        actions: {
            add: "Кошуу",
            view: "Көрүү",
            edit: "Өзгөртүү",
            save: "Сактоо",
            cancel: "Жокко чыгаруу",
            delete: "Өчүрүү"
        },
        empty: {
            title: "Системада курстар жок",
            subtitle: "Платформада курстар жазылган эмес."
        },
        fallback: {
            course: "Курс #{{id}}",
            category: "Категория #{{id}}",
            group: "Группа #{{id}}",
            section: "Секция #{{id}}",
            lesson: "Сабак #{{id}}",
            courseGeneric: "Курс",
            sectionGeneric: "Секция",
            unknownError: "Белгисиз ката"
        },
        confirm: {
            deleteCourseTitle: "Курсту өчүрүү",
            deleteCourseMessage: "\"{{title}}\" курсун өчүрүүгө ишенимдүүсүзбү? Бул аракет каталогдон жана студенттердин окуу агымынан курсту алып салышы мүмкүн.",
            deleteCategoryTitle: "Категорияны өчүрүү",
            deleteCategoryMessage: "\"{{name}}\" категориясын өчүрүүгө ишенимдүүсүзбү? Бул категорияга байланган курстарды кайра текшерүү керек болушу мүмкүн."
        },
        toasts: {
            loadError: "Курстарды жана категорияларды жүктөө мүмкүн болбоду.",
            courseDeleted: "Курс ийгиликтүү өчүрүлдү.",
            courseDeleteError: "Курсту өчүрүү мүмкүн болбоду.",
            categoryCreated: "Категория ийгиликтүү кошулду.",
            categoryCreateError: "Категория кошуу мүмкүн болбоду.",
            categoryUpdated: "Категория ийгиликтүү жаңыртылды.",
            categoryUpdateError: "Категорияны жаңыртуу мүмкүн болбоду.",
            categoryDeleted: "Категория ийгиликтүү өчүрүлдү.",
            categoryDeleteError: "Категорияны өчүрүү мүмкүн болбоду."
        },
        transcode: {
            title: "HLS транскоддоо",
            description: "Видеолор азыр автоматтык түрдө HLSке транскоддолот. Бул жерде тек ката кеткен же эски видеолор үчүн колдонуңуз.",
            autoNotice: "Авто-транскоддоо иштейт: жаңы видеолор жүктөлгөндө автоматтык түрдө HLSке айланат.",
            labels: {
                course: "Курс",
                section: "Секция",
                lesson: "Сабак"
            },
            selectCourse: "Курс тандаңыз",
            selectSection: "Секция тандаңыз",
            selectLesson: "Сабак тандаңыз (же бош калтырыңыз бардыгы үчүн)",
            allVideoLessons: "Бардык видео сабактар",
            processingSuffix: "(транскоддолууда)",
            lessonIdsLabel: "Же ID ларды киргизиңиз (бөлүүчү: 61,62,63)",
            lessonIdsPlaceholder: "Сабак IDлери (топтук үчүн)",
            alreadySingle: "\"{{title}}\" буга чейин HLSке транскоддолгон.",
            alreadyBulk: "Бардык видео сабактар буга чейин HLSке транскоддолгон.",
            help: "Курс жана секция милдеттүү. Даяр HLS видеолор өткөрүлөт; транскоддоо бир нече мүнөт созулушу мүмкүн.",
            statusLabel: "Транскоддоо статусу",
            bulkStatusLabel: "Топтук транскоддоо статусу",
            statusAria: "Видео транскоддоо абалы: {{status}}",
            statusAriaWithError: "Видео транскоддоо абалы: {{status}}. {{error}}",
            status: {
                missing: "Видео жок",
                uploaded: "Транскоддоого даяр",
                stuck: "Токтоп калды: мажбурлап кайра баштоо керек",
                starting: "Транскоддоо башталууда...",
                processing: "Транскоддоо жүрүп жатат",
                ready: "Ойнотууга даяр",
                failed: "Транскоддоо ката менен бүттү"
            },
            errorTitle: "Транскоддоо катасы",
            errors: {
                statusFetchFailed: "Транскоддоо абалын жаңыртуу мүмкүн болбоду.",
                playbackFailed: "Видео транскоддоо ишке ашкан жок. Кайра транскоддоп көрүңүз."
            },
            readyMessage: "Транскоддоо ийгиликтүү аяктады. Видео ойнотууга даяр.",
            processingMessage: "Видеонун HLS форматына айланышын күтүүдө...",
            bulkProcessingMessage: "Бул секциядагы бардык видеолор HLS форматына айланып жатат. Бул процесс бир нече мүнөт созулушу мүмкүн. Статусун көрүү үчүн секцияны кайра жүктөңүз.",
            actions: {
                retry: "Кайра транскоддоо",
                bulk: "Топтук транскоддоо",
                refreshStatus: "Транскоддоо статусун кайра текшерүү"
            },
            retry: {
                title: "Видео транскоддоону кайра баштоо",
                button: "Кайра транскоддоо",
                loading: "Кайра башталууда...",
                aria: "Видео транскоддоону кайра баштоо",
                shortTitle: "Кайра транскоддоо",
                shortButton: "Кайра баштоо",
                forceAria: "Токтоп калган транскоддоону мажбурлап кайра баштоо",
                forceTitle: "Токтоп калган транскоддоону кайра жүргүзүү",
                forceButton: "Мажбурлап баштоо",
                errors: {
                    missingIds: "Кайра баштоо үчүн курс, секция жана сабак IDлери керек.",
                    missingHandler: "Кайра баштоо функциясы жеткиликсиз.",
                    failed: "Транскоддоону кайра баштоо мүмкүн болбоду. Кайра аракет кылыңыз."
                }
            },
            history: {
                title: "Акыркы транскоддоо аракеттери",
                singleStartFailed: "Бир сабакты транскоддоо башталбай калды",
                bulkStartFailed: "Топтук транскоддоо башталбай калды",
                completed: "Транскоддоо аяктады",
                skipped: "Транскоддоо өткөрүлдү",
                bulkSkipped: "Топтук транскоддоо өткөрүлдү",
                allReady: "Бул секциядагы бардык видеолор даяр.",
                bulkStarted: "Топтук транскоддоо башталды",
                videoLessonCount: "{{count}} видео сабак"
            },
            toasts: {
                fillAllIds: "Бардык ID талааларын толтуруңуз.",
                started: "Транскоддоо ийгиликтүү башталды.",
                startError: "Транскоддоону баштоо мүмкүн болбоду.",
                fillCourseSection: "Курс жана секция IDлерин толтуруңуз.",
                bulkStarted: "Топтук транскоддоо башталды: {{started}}/{{total}}",
                bulkError: "Топтук транскоддоону баштоо мүмкүн болбоду.",
                lessonComplete: "{{id}}-сабактын транскоддоосу аяктады",
                lessonFailed: "{{id}}-сабактын транскоддоосу ката менен аяктады"
            }
        }
    }
};
