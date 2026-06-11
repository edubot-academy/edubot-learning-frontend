export const shared = {
    common: {
        appName: "EduBot Learning",
        language: "Тил",
        openMenu: "Менюну ачуу",
        openSearch: "Издөөнү ачуу",
        search: "Издөө",
        searchCourses: "Курстарды издөө",
        searching: "Изделүүдө...",
        loading: "Жүктөлүүдө",
        loadingEllipsis: "Жүктөлүүдө...",
        refresh: "Жаңыртуу",
        clearFilters: "Фильтрди тазалоо",
        all: "Баары",
        copy: "Көчүрүү",
        progress: "Прогресс",
        empty: "Азырынча элементтер жок.",
        searchUnavailable: "Издөө азыр иштебей жатат.",
        noResults: "Натыйжа жок",
        close: "Жабуу",
        closeEsc: "Жабуу (ESC)",
        cancel: "Жокко чыгаруу",
        done: "Даяр",
        login: "Кирүү",
        logout: "Аккаунттан чыгуу",
        signup: "Катталуу",
        closeMenu: "Менюну жабуу",
        userMenu: "Колдонуучу менюсу",
        userFallback: "Колдонуучу",
        identified: "Тастыкталган",
        activeAccount: "Активдүү аккаунт",
        favourites: "Тандалгандар",
        cart: "Себет",
        enums: {
            courseTypes: {
                video: "Видео курс",
                offline: "Офлайн",
                onlineLive: "Онлайн түз эфир"
            },
            deliveryModes: {
                group: "Топтук",
                individual: "Жеке"
            },
            certificateStatuses: {
                issued: "Берилди",
                pendingApproval: "Бекитүүнү күтөт",
                pending: "Күтүүдө",
                rejected: "Четке кагылды",
                revoked: "Жокко чыгарылды",
                none: "Сертификат жок"
            },
            pageOrientations: {
                landscape: "Альбомдук",
                portrait: "Портреттик"
            }
        }
    },
    videoPlayer: {
        play: "Ойнотуу",
        pause: "Тындыруу",
        rewind15: "15 секунд артка",
        forward15: "15 секунд алдыга",
        volume: "Үн",
        quality: "Сапат",
        autoQuality: "Авто",
        fullscreen: "Толук экран",
        exitFullscreen: "Толук экрандан чыгуу"
    },
    cartProvider: {
        messages: {
            videoOnly: "LMS аркылуу өз алдынча сатып алуу видео курстар үчүн гана жеткиликтүү.",
            alreadyInCart: "Курс себетте бар.",
            addFailed: "Курсту себетке кошуу мүмкүн болбоду.",
            added: "Курс себетке кошулду."
        }
    },
    confirmationModal: {
        confirm: "Ырастоо",
        cancel: "Жокко чыгаруу",
        defaultBody: "Бул аракетти улантсаңыз, өзгөртүү дароо колдонулат."
    },
    formControls: {
        phonePlaceholder: "Телефон номер",
        clearSearch: "Издөөнү тазалоо",
        showPassword: "Сырсөздү көрсөтүү",
        hidePassword: "Сырсөздү жашыруу"
    },
    supportContact: {
        addressShort: "Бишкек ш., Ахунбаева 129B",
        addressFull: "Ахунбаева 129B, Бишкек, Кыргызстан",
        workingHours: "Дүйшөмбү - Жума, 9:00 - 21:00"
    },
    chatWorkspace: {
        sidebarTitle: "Сүйлөшүүлөр",
        searchPlaceholder: "Чат издөө",
        composerPlaceholder: "Билдирүү жаз...",
        selectChatTitle: "Чатты тандаңыз",
        backToChats: "Чаттарга кайтуу",
        messagesLog: "Чат билдирүүлөрү",
        emptyMessages: {
            title: "Баарлашууну баштаңыз",
            subtitle: "Бул чатка биринчи билдирүүнү жазыңыз."
        },
        messageOwners: {
            me: "Сиздин",
            them: "Алардын"
        },
        messageAria: "{{owner}} билдирүү: {{content}}",
        fileFallback: "Файл",
        imageAlt: "Чат сүрөтү",
        addAttachment: "Файл кошуу",
        attachmentFile: "Файл",
        attachmentImage: "Сүрөт",
        composerAria: "Билдирүү киргизүү",
        sendMessage: "Билдирүү жөнөтүү",
        selectFile: "Файл тандоо",
        selectImage: "Сүрөт тандоо"
    },
    timeUtils: {
        minutesSecondsShort: "{{minutes}} мүн {{seconds}} сек",
        hoursMinutesShort: "{{hours}} саат {{minutes}} мин",
        hoursShort: "{{count}} саат",
        minutesShort: "{{count}} мин"
    },
    quizUtils: {
        validation: {
            missingQuiz: "Квиз маалыматтары табылган жок.",
            addQuestion: "Кеминде бир суроо кошуңуз.",
            questionPromptRequired: "Суроо {{number}} үчүн текст жазуу керек.",
            questionNeedsOptions: "Суроо {{number}} кеминде 2 вариантка ээ болушу керек.",
            questionNeedsCorrectAnswer: "Суроо {{number}} үчүн туура жооп белгилеңиз.",
            questionOptionsRequired: "Суроо {{number}} ичиндеги бардык варианттар толтурулушу керек."
        }
    },
    challengeUtils: {
        defaults: {
            testTitle: "Тест {{number}}",
            starterCode: "// Кодду бул жерге жазыңыз\n"
        },
        labels: {
            testArgs: "Тест {{number}} аргументтери",
            testExpected: "Тест {{number}} күткөн жыйынтыгы"
        },
        errors: {
            invalidJson: "{{label}} валиддүү JSON болушу керек.",
            missingChallenge: "Код тапшырма маалыматтары толтурулган эмес.",
            missingInstructions: "Код тапшырманын инструкцияларын жазыңыз.",
            addTest: "Кеминде бир тест кошуңуз.",
            testTitleRequired: "Тест {{number}} үчүн аталыш жазыңыз."
        }
    },
    lessonUtils: {
        readTime: "{{count}} мин окуу"
    },
    relativeTime: {
        now: "азыр",
        minutesAgo: "{{count}} мүнөт мурун",
        hoursAgo: "{{count}} саат мурун",
        daysAgo: "{{count}} күн мурун"
    },
    stickyButton: {
        whatsappAria: "WhatsApp аркылуу байланышуу: {{phone}}"
    },
    sidebarOverlay: {
        label: "Каптал панель"
    },
    nav: {
        courses: "Курстар",
        about: "Биз жөнүндө",
        contact: "Байланыш",
        dashboard: "Панель",
        myCourses: "Менин курстарым",
        attendance: "Катышуу",
        notifications: "Билдирүүлөр",
        chat: "Чат",
        career: "Карьера",
        primaryNavigation: "Негизги навигация",
        mobilePrimaryNavigation: "Мобилдик негизги навигация",
        accountMenu: "Аккаунт менюсу",
        guestMenu: "Конок менюсу"
    },
    footer: {
        navigation: "Навигация",
        contact: "Байланыш үчүн",
        address: "Биздин дарек",
        openWebsite: "{{brand}} сайтын ачуу",
        qrAlt: "{{brand}} сайты үчүн QR",
        copyright: "© {{year}} EduBot Learning. Бардык укуктар сакталган."
    },
    chatRedirect: {
        title: "Чат бөлүмү табылган жок",
        description: "Учурдагы аккаунт үчүн түз чат багыты аныкталган эмес. Панелиңизге кайтып, жеткиликтүү билдирүү же колдоо бөлүмүн тандаңыз.",
        actions: {
            dashboard: "Панелге кайтуу",
            support: "Колдоо"
        }
    },
    unauthorized: {
        eyebrow: "Кирүү чектелген",
        title: "Бул баракчага кирүүгө укугуңуз жок",
        signedInAs: "Учурда сиз {{role}} катары кирип турасыз.",
        signInPrompt: "Улантуу үчүн аккаунтуңузга кириңиз же туура аккаунтту тандаңыз.",
        reasons: {
            role: "Бул бөлүм башка роль үчүн ачылган болушу мүмкүн.",
            enrollment: "Курска же уюмга кирүү укугуңуз азырынча активдүү эмес болушу мүмкүн.",
            session: "Сессияңыз аяктап калган болсо, кайра кирүү керек болот.",
            default: "Сиз кирүүгө аракет кылган бөлүм учурдагы аккаунтуңуз үчүн жабык."
        },
        roles: {
            student: "студент",
            instructor: "инструктор",
            assistant: "ассистент",
            admin: "администратор",
            superadmin: "суперадмин",
            account: "аккаунт"
        },
        actions: {
            dashboard: "Панелге кайтуу",
            login: "Кирүү",
            courses: "Курстарды көрүү",
            back: "Артка кайтуу",
            support: "Колдоо менен байланышуу"
        },
        guidance: {
            title: "Эмне кылса болот?",
            role: {
                title: "Ролуңузду текшериңиз",
                description: "Бул бөлүм студент, инструктор, ассистент же админ ролдорунун бирине гана ачылган болушу мүмкүн."
            },
            account: {
                title: "Аккаунтту алмаштырыңыз",
                description: "Эгер башка аккаунт менен иштесеңиз, чыгуу жасап туура аккаунт менен кайра кириңиз."
            },
            access: {
                title: "Кирүү укугун сураңыз",
                description: "Курс, компания же админ панель боюнча укук керек болсо, администратор же колдоо тобу менен байланышыңыз."
            }
        }
    },
    errors: {
        generic: "Сервер катасы болду.",
        CSRF_TOKEN_INVALID: "Сессия коопсуздугу жаңыртылды. Кайра аракет кылыңыз.",
        AUTHENTICATION_REQUIRED: "Кирип, кайра аракет кылыңыз.",
        AUTH_TOKEN_INVALID: "Сессияңыздын мөөнөтү бүттү. Кайра кириңиз.",
        AUTH_CREDENTIALS_INVALID: "Email же сырсөз туура эмес.",
        COMPANY_LOCALE_UNSUPPORTED: "Компаниянын тили колдоого алынбайт.",
        TENANT_CONTEXT_MISMATCH: "Бул аракет тандалган уюм үчүн жеткиликтүү эмес.",
        CHAT_NOT_FOUND: "Чат табылган жок.",
        INSTRUCTOR_CHAT_NOT_FOUND: "Чат табылган жок.",
        categories: {
            ai: "AI ассистент сурамы аткарылган жок.",
            attendance: "Катышуу боюнча сурам аткарылган жок.",
            auth: "Аутентификация сурамы аткарылган жок.",
            cart: "Себет боюнча сурам аткарылган жок.",
            certificate: "Сертификат боюнча сурам аткарылган жок.",
            company: "Компания боюнча сурам аткарылган жок.",
            course: "Курс боюнча сурам аткарылган жок.",
            enrollment: "Каттоо боюнча сурам аткарылган жок.",
            favorite: "Тандалгандар боюнча сурам аткарылган жок.",
            group: "Группа боюнча сурам аткарылган жок.",
            homework: "Үй тапшырма боюнча сурам аткарылган жок.",
            integration: "Интеграция боюнча сурам аткарылган жок.",
            leaderboard: "Рейтинг боюнча сурам аткарылган жок.",
            lesson: "Сабак боюнча сурам аткарылган жок.",
            media: "Медиа боюнча сурам аткарылган жок.",
            meeting: "Жолугушуу боюнча сурам аткарылган жок.",
            notification: "Билдирүү боюнча сурам аткарылган жок.",
            offering: "Курс сунушу боюнча сурам аткарылган жок.",
            session: "Сессия боюнча сурам аткарылган жок.",
            skill: "Көндүм боюнча сурам аткарылган жок.",
            student: "Студент боюнча сурам аткарылган жок.",
            tenant: "Тенант боюнча сурам аткарылган жок.",
            user: "Колдонуучу боюнча сурам аткарылган жок."
        }
    },
    notifications: {
        widget: {
            title: "Билдирүүлөр",
            description: "Жаңылык жана эскертмелер",
            latest: "Акыркы жаңыртуулар"
        },
        center: {
            eyebrow: "Билдирүү борбору",
            title: "Билдирүүлөр",
            description: "Акыркы активдүүлүк, эскертмелер жана окула элек жаңыртуулар ушул жерде топтолот."
        },
        metrics: {
            total: "Бардык билдирүүлөр",
            unread: "Окула элек",
            loadedPage: "Жүктөлгөн барак"
        },
        feed: {
            title: "Билдирүү тасмасы",
            description: "Жаңы эскертмелер жогору жагында, эскилери күн боюнча топтолуп көрсөтүлөт."
        },
        actions: {
            markAllRead: "Баарын окулган деп белгилөө",
            markRead: "Окулду",
            review: "Карап чыгуу",
            loadMore: "Дагы билдирүүлөрдү жүктөө",
            viewAll: "Бардыгын көрүү"
        },
        empty: {
            widgetTitle: "Азырынча билдирүүлөр жок",
            widgetSubtitle: "Жаңы окуялар болгондо бул жерден көрүнө баштайт.",
            feedTitle: "Билдирүүлөр жок",
            feedSubtitle: "Жаңы окуя же жаңыртуу болгондо билдирүүлөр ушул жерде көрүнөт."
        },
        unreadBadge: "{{count}} жаңы",
        fallbackTitle: "Билдирүү"
    },
    analytics: {
        common: {
            chartLoadError: "Графикти жүктөө мүмкүн болбоду",
            chartDataLoadError: "График маалыматтарын жүктөө мүмкүн болбоду",
            dataLoadError: "Маалыматты жүктөөдө ката кетти",
            tableLoadError: "Таблица маалыматтарын жүктөө мүмкүн болбоду. Кайра аракет кылыңыз.",
            tryAgain: "Кайра аракет кылыңыз",
            noData: "Маалымат жок",
            mobileLoading: "Мобилдик үчүн жүктөлүүдө...",
            datasetLabel: "Маалымат топтому {{number}}",
            paginationSummary: "{{total}} натыйжанын {{start}}-{{end}} аралыгы көрсөтүлүүдө",
            previous: "Мурунку",
            next: "Кийинки",
            sectionLoadError: "Бөлүмдү жүктөөдө ката кетти",
            sectionLoadErrorDescription: "Маалыматты жүктөө мүмкүн болбоду. Кайра аракет кылыңыз.",
            retry: "Кайра аракет",
            refresh: "Жаңылоо",
            filter: "Фильтр",
            export: "Экспорт",
            share: "Бөлүшүү",
            quickActions: "Тез аракеттер"
        }
    },
    ratings: {
        card: {
            fallbackInstructor: "Инструктор",
            fallbackTitle: "Инструктор",
            fallbackSpecialty: "Практикалык сабактар",
            newRating: "Жаңы рейтинг",
            topInstructor: "Топ инструктор",
            ratingAria: "Рейтинг {{rating}}",
            reviews: "Пикирлер",
            students: "Студенттер"
        },
        comment: {
            toasts: {
                courseMissing: "Курс табылган жок.",
                ratingRequired: "Алды менен баа коюңуз.",
                commentTooShort: "Сын-пикир кеминде 5 символ болушу керек.",
                submitted: "Сын-пикир ийгиликтүү жөнөтүлдү.",
                submitError: "Сын-пикир жөнөтүүдө ката кетти. Кайра аракет кылыңыз."
            },
            starAria: "{{count}} жылдыз",
            success: {
                title: "Сын-пикириңиз үчүн чоң рахмат!",
                description: "Сиздин пикириңиз башка студенттерге курс тандоодо жардам берет. Биздин курстарды жакшыртууга кошкон салымыңыз үчүн ыраазычылык билдиребиз!",
                yourRating: "Сиздин бааңыз:"
            },
            form: {
                title: "Курс кандай өттү? Сын-пикир калтырыңыз",
                descriptionLine1: "Сиздин пикириңиз башка студенттерге курс тандоодо жардам берет.",
                descriptionLine2: "Сиздин пикир биз үчүн да абдан баалуу!",
                placeholder: "Сиздин тажрыйбаңыз тууралуу жазыңыз...",
                minimum: "Минималдуу: 5 символ. Сиз жаздыңыз: {{count}}.",
                rating: "Баа: {{rating}} / 5"
            },
            actions: {
                sending: "Жөнөтүлүүдө...",
                submit: "Жиберүү"
            }
        }
    },
    setupAccount: {
        imageAlt: "Аккаунтту даярдоо",
        title: "Аккаунтту даярдоо",
        description: "Бир жолу сырсөз коюңуз. Кийинки кирүүлөрдө email жана ушул сырсөз менен киресиз.",
        fields: {
            newPassword: "Жаңы сырсөз",
            confirmPassword: "Сырсөздү кайталаңыз"
        },
        passwordRules: {
            title: "Сырсөз эрежелери",
            length: "Кеминде 8 белги",
            match: "Кайталоо сырсөз менен дал келет"
        },
        missingToken: {
            title: "Аккаунт даярдоо шилтемеси жок.",
            description: "Бул барак бир жолку чакыруу шилтемеси менен иштейт. CRM менеджерден жаңы чакыруу сураңыз же кирүү барагына кайтыңыз."
        },
        actions: {
            goToLogin: "Кирүү барагына өтүү",
            askForHelp: "Жардам суроо",
            activate: "Аккаунтту иштетүү",
            activating: "Даярдалууда..."
        },
        errors: {
            missingToken: "Аккаунтту даярдоо шилтемеси табылган жок.",
            passwordTooShort: "Сырсөз кеминде 8 белгиден турушу керек.",
            passwordMismatch: "Сырсөздөр дал келген жок.",
            passwordMismatchLive: "Сырсөздөр азырынча дал келген жок.",
            invalidOrExpired: "Шилтеме жараксыз же мөөнөтү өтүп кеткен. Жаңы шилтеме сураныңыз.",
            requestNewInvite: "Эгер шилтеменин мөөнөтү өтсө, CRM менеджерден жаңы чакыруу сураңыз."
        },
        success: {
            redirecting: "Аккаунт даяр болду. LMSке өткөрүлүп жатасыз.",
            ready: "Аккаунт даяр болду. Эми LMSке кире аласыз."
        },
        footer: {
            prefix: "Шилтеме иштебей калса, CRM менеджерден жаңысын сураңыз же",
            loginLink: "кирүү барагына өтүңүз"
        }
    },
    ai: {
        answerKey: "Жооптор",
        cancelDraft: "Долбоорду жокко чыгаруу",
        copyDraft: "Долбоорду көчүрүү",
        copyWorksheetText: "Иш барагынын текстин көчүрүү",
        courseDraft: "AI курс долбоору",
        courseDraftAccepted: "AI курс долбоору конструкторго көчүрүлдү.",
        courseDraftFailed: "AI курс долбоорун түзүү мүмкүн болбоду.",
        courseDraftHelp: "Түзөтүлүүчү курс планын түзүңүз. Курсту жана программаны сактаганга чейин эч нерсе сакталбайт.",
        courseDraftReady: "AI курс долбоору даяр.",
        courseDraftRejected: "AI курс долбоору жокко чыгарылды.",
        courseDraftTopicRequired: "AI долбоорун сураардан мурун курстун аталышын кошуңуз.",
        feedbackDraft: "AI пикир долбоору",
        feedbackDraftAccepted: "AI долбоору текшерүү талаасына көчүрүлдү.",
        feedbackDraftActionFailed: "AI долбоорунун абалын жаңыртуу мүмкүн болбоду.",
        feedbackDraftFailed: "AI пикир долбоорун түзүү мүмкүн болбоду.",
        feedbackDraftReady: "AI пикир долбоору даяр.",
        feedbackDraftRejected: "AI долбоору жокко чыгарылды.",
        generating: "Түзүлүүдө...",
        openGenerator: "AI генераторун ачуу",
        openPreview: "AI алдын ала көрүүнү ачуу",
        panelEyebrow: "AI долбоор",
        homeworkDraft: "AI үй тапшырма долбоору",
        homeworkDraftAccepted: "AI долбоору формага көчүрүлдү.",
        homeworkDraftFailed: "AI үй тапшырма долбоорун түзүү мүмкүн болбоду.",
        homeworkDraftReady: "AI үй тапшырма долбоору даяр.",
        homeworkDraftRejected: "AI үй тапшырма долбоору жокко чыгарылды.",
        manualMode: "Кол менен",
        aiDraftMode: "AI черновик",
        regenerateDraft: "Кайра түзүү",
        useInManualForm: "Формага өткөрүү",
        homeworkBrief: {
            collapsedHelp: "Жетектелген долбоор керек болгондо гана AI кыскача маалыматын ачыңыз. Бар аталыш тема катары колдонулат.",
            openBrief: "AI менен түзүү",
            hideBrief: "AI маалыматын жашыруу",
            topic: "Үй тапшырма эмнени текшериши керек?",
            topicPlaceholder: "Мисалы: сызыктуу теңдемелерди турмуштук маселелер менен машыгуу",
            instructions: "Нускама",
            instructionsPlaceholder: "Мисалы: 5 тапшырма түзүңүз, 2 тексттик маселе жана бир татаал суроо кошуңуз",
            difficulty: "Кыйындык",
            difficultyAuto: "Курс деңгээлин колдонуу",
            difficultyBeginner: "Башталгыч",
            difficultyIntermediate: "Орто",
            difficultyAdvanced: "Жогорку",
            maxScore: "Максималдуу балл",
            maxScorePlaceholder: "Мисалы: 100",
            includeRubric: "Баалоо критерийлерин кошуу",
            help: "AI сурамы туура контекст колдонушу жана кайра генерацияны азайтуу үчүн максатты алдын ала жазыңыз.",
            topicIssues: {
                required: "Түзүүдөн мурун тема же максат киргизиңиз.",
                tooShort: "Теманы такыраак жазыңыз.",
                meaningless: "Маанилүү үй тапшырма темасын колдонуңуз.",
                generic: "Окуучулар машыга турган көндүмдү же түшүнүктү кошуңуз."
            }
        },
        lessonDraftRequiresSavedLesson: "AI долбоорун сураардан мурун бул сабакты сактаңыз.",
        lessonKitDraft: "AI сабак топтому долбоору",
        lessonKitDraftAccepted: "AI сабак топтому сабак редакторуна көчүрүлдү.",
        lessonKitDraftFailed: "AI сабак топтому долбоорун түзүү мүмкүн болбоду.",
        lessonKitDraftHelp: "Кыскача мазмундан, максаттардан, мисалдардан жана үй тапшырма идеясынан түзөтүлүүчү макала түзүңүз.",
        lessonKitDraftInvalid: "AI сабак топтому долбоорунда колдонууга жарактуу мазмун жок.",
        lessonKitDraftReady: "AI сабак топтому долбоору даяр.",
        lessonKitDraftRejected: "AI сабак топтому долбоору жокко чыгарылды.",
        lessonKitExamples: "Мисалдар",
        lessonKitHomeworkIdea: "Үй тапшырма идеясы",
        lessonKitObjectives: "Максаттар",
        lessonKitVocabulary: "Сөздүк",
        lessonCount: "{{count}} сабак",
        questionCount: "{{count}} суроо",
        quizDraft: "AI тест долбоору",
        quizDraftCorrect: "Туура:",
        quizDraftAccepted: "AI тест долбоору редакторго көчүрүлдү.",
        quizDraftFailed: "AI тест долбоорун түзүү мүмкүн болбоду.",
        quizDraftHelp: "Түзөтүлүүчү тест суроолорун түзүңүз. Программаны сактаганга чейин эч нерсе сакталбайт.",
        quizDraftFlow: {
            createsLabel: "Түзөт",
            creates: "Тест аталышын, сүрөттөмөнү, суроолорду, варианттарды жана туура жоопторду.",
            appliesLabel: "Кайда түшөт",
            applies: "Долбоорду колдонуу басылганда ушул активдүүлүк редакторуна.",
            nextLabel: "Кийинки кадам",
            next: "Ар бир суроону текшерип, андан кийин активдүүлүктү сактаңыз."
        },
        quizDraftInvalid: "AI тест долбоорунда колдонууга жарактуу суроолор жок.",
        quizDraftReady: "AI тест долбоору даяр.",
        quizDraftRejected: "AI тест долбоору жокко чыгарылды.",
        quizBrief: {
            topicPlaceholder: "Текшериле турган тема же көндүм",
            questionCount: "Суроолордун саны",
            difficultyAuto: "Курс деңгээлин колдонуу",
            modeMixed: "Аралаш суроо түрлөрү",
            includeExplanations: "Түшүндүрмөлөрдү кошуу"
        },
        requestId: "Сурам ID: {{requestId}}",
        rubric: "Баалоо критерийлери",
        suggestFeedback: "AI менен пикир сунуштоо",
        suggestCourse: "AI менен курс сунуштоо",
        suggestHomework: "AI менен үй тапшырма сунуштоо",
        suggestLessonKit: "AI менен сабак топтомун сунуштоо",
        suggestQuiz: "AI менен тест сунуштоо",
        suggestWorksheet: "AI менен иш барагынын текстин түзүү",
        worksheetDraft: "AI иш барагынын текст долбоору",
        worksheetDraftAccepted: "AI иш барагы долбоору колдонулду деп белгиленди.",
        worksheetDraftPreview: "Түзөтүлүүчү иш барагынын тексти",
        worksheetDraftCopied: "AI иш барагы долбоору алмашуу буферине көчүрүлдү.",
        worksheetDraftFailed: "AI иш барагы долбоорун түзүү мүмкүн болбоду.",
        worksheetDraftStatusUpdateFailed: "Материал сакталды, бирок AI долбоорунун абалын жаңыртуу мүмкүн болбоду.",
        worksheetDraftFlow: {
            createsLabel: "Түзөт",
            creates: "Нускама, бөлүмдөр, тапшырмалар жана жооптору бар басып чыгарууга ылайык текст.",
            appliesLabel: "Кайда түшөт",
            applies: "Адегенде түзөтүлүүчү алдын ала көрүүгө түшөт.",
            nextLabel: "Кийинки кадам",
            next: "Алдын ала көрүүнү түзөтүп, PDF же DOCX материал катары сактаңыз."
        },
        worksheetDraftHelp: "Иш барагынын текстин түзүп, текшерип, PDF же DOCX материал катары сактаңыз.",
        worksheetDraftNextStep: "Студенттерге көрүнүүчү материал катары сактоодон мурун текстти текшерип, түзөтүңүз.",
        worksheetMaterialCreateFailed: "Материал файлын түзүү мүмкүн болбоду.",
        createMaterialFile: "Материал файлын түзүү",
        createPdfMaterial: "PDF катары сактоо",
        createDocxMaterial: "DOCX катары сактоо",
        worksheetBrief: {
            topicPlaceholder: "Машыгуу үчүн тема же көндүм",
            formatPractice: "Практикалык иш барагы",
            formatHandout: "Класс үчүн таратма",
            formatDiscussion: "Талкуу нускамасы",
            formatRecap: "Кайталоо жазуулары",
            activityCount: "Активдүүлүктөрдүн саны",
            includeAnswerKey: "Жоопторду кошуу"
        },
        useDraft: "Долбоорду колдонуу"
    },
    media: {
        video: {
            ariaLabel: "Видео окуу",
            playbackError: "Видео ойнотууда ката кетти.",
            playbackFailed: "Тилекке каршы, видео ойнотулбай калды.",
            hlsUnsupported: "Браузер HLS форматын колдобойт. MP4 форматындагы видеону колдонуңуз.",
            notFound: "Видео табылган жок",
            loadFailed: "Видео жүктөлбөй калды.",
            retry: "Кайра аракет кылуу"
        }
    },
    a11y: {
        skipNavigation: {
            label: "Навигацияны өткөрүү шилтемелери",
            main: "Негизги мазмунга өтүү",
            mainWithShortcut: "Негизги мазмунга өтүү (Alt + M)",
            navigation: "Навигацияга өтүү",
            navigationWithShortcut: "Навигацияга өтүү (Alt + N)",
            search: "Издөөгө өтүү",
            searchWithShortcut: "Издөөгө өтүү (Alt + S)"
        }
    }
};
