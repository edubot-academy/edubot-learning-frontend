export const attendance = {
    attendance: {
        page: {
            title: "Катышуу",
            description: "Студенттердин сессияларга катышуусун башкарыңыз жана көзөмөлдөңүз."
        },
        view: {
            table: "Таблица көрүнүшү",
            session: "Сессия көрүнүшү",
            cards: "Карталар",
            virtualized: "Оптималдуу"
        },
        filters: {
            course: "Курс",
            group: "Группа",
            session: "Сессия",
            status: "Статус",
            all: "Баары",
            allStatuses: "Бардык статус",
            searchStudent: "Студент издөө...",
            rateBelow50: "50%дан аз",
            clearWithCount: "Тазалоо ({{count}})",
            advanced: "Кеңейтилген фильтрлер",
            customDateRange: "Ыңгайлаштырылган күн аралыгы",
            sessionFilter: "Сессия фильтри",
            allSessions: "Бардык сессиялар",
            quickFilters: "Тез фильтрлер",
            onlyAbsent: "Келген жокторду гана көрсөт",
            lowAttendance: "Төмөн катышуу %",
            thisWeek: "Бул жумадагы",
            onlyPresent: "Катышкандарды гана көрсөт"
        },
        placeholders: {
            course: "Курс тандаңыз",
            group: "Группа тандаңыз",
            session: "Сессия тандаңыз",
            notes: "Кыскача эскертүү калтырыңыз"
        },
        labels: {
            selected: "Тандалган",
            activeSession: "Активдүү сессия",
            joinedAt: "Кирди: {{time}}",
            leftAt: "Чыкты: {{time}}"
        },
        fields: {
            notes: "Эскертүү"
        },
        delivery: {
            individual: "Жеке курс",
            group: "Группа"
        },
        status: {
            present: "Катышты",
            late: "Кечикти",
            absent: "Келген жок",
            excused: "Себептүү",
            notScheduled: "Пландалган эмес"
        },
        metrics: {
            students: "Студент",
            total: "Жалпы",
            rate: "Катышуу %"
        },
        workspace: {
            eyebrow: "Катышуу панели",
            title: "Сессия боюнча катышуу",
            description: "Эми катышуу курс/күн эмес, так группа жана сессия боюнча башкарылат."
        },
        summary: {
            eyebrow: "Катышуу жыйынтыгы",
            title: "Тандалган сессиянын жыйынтыгы",
            description: "Төмөнкү блок тандалган сессиядагы реалдуу катышуу абалын жыйынтыктап көрсөтөт.",
            totalAttendance: "Жалпы катышуу",
            trends: "Катышуу тенденциялары",
            attendanceRate: "Катышуу %:",
            studentCategories: "Студенттердин катышуу категориялары",
            studentCategoriesShort: "Студенттердин категориялары",
            distribution: "Катышуу бөлүштүрүүсү",
            bySession: "Сессиялар боюнча катышуу",
            studentCount: "{{count}} студент",
            currentPeriod: "Азыркы мезгил",
            previousPeriod: "Өткөн мезгил",
            categories: {
                excellent: "Мыкты (90-100%)",
                good: "Жакшы (75-89%)",
                fair: "Орточо (50-74%)",
                poor: "Начар (<50%)",
                noData: "Маалымат жок"
            }
        },
        actions: {
            openEditMode: "Өзгөртүү режимин ачуу",
            closeEditMode: "Өзгөртүү режимин жабуу",
            saveAttendance: "Катышууну сактоо",
            noChanges: "Өзгөртүү жок",
            saving: "Сакталууда...",
            save: "Сактоо",
            clear: "Тазалоо"
        },
        admin: {
            overrideOpen: "Админдин өзгөртүү режими ачык",
            readOnly: "Админ режиминде окуу гана",
            overrideOpenDescription: "Азыр катышууну оңдоого болот. Бүткөндөн кийин өзгөртүүлөрдү сактап, режимди кайра жабыңыз.",
            readOnlyDescription: "Админ үчүн бул экран негизинен маалымат көрүүчү. Өзгөртүү керек болсо, адегенде өзгөртүү режимин ачыңыз."
        },
        empty: {
            selectGroupTitle: "Группа тандаңыз",
            selectGroupForTable: "Таблица көрүнүшү үчүн адегенде группа тандаңыз.",
            selectCourseTitle: "Курс тандаңыз",
            selectCourseDescription: "Катышууну көрүү үчүн адегенде офлайн же түз эфир курсун тандаңыз.",
            selectGroupDescription: "Бул курс боюнча катышуу группа аркылуу жүргүзүлөт.",
            selectSessionTitle: "Сессия тандаңыз",
            selectSessionDescription: "Катышуу так бир сессияга сакталат.",
            noStudentsTitle: "Студент табылган жок",
            noStudentsDescription: "Тандалган группа үчүн катышуу тизмеси азырынча бош.",
            noRecordsTitle: "Жазуу табылган жок",
            noRecordsDescription: "Сессияны же статус фильтрин өзгөртүп кайра аракет кылыңыз."
        },
        fallbacks: {
            lesson: "Сабак",
            sessionWithId: "Сессия #{{id}}",
            location: "Локация көрсөтүлгөн эмес",
            timezone: "Timezone жок",
            noSession: "Сессия тандалган эмес",
            noDate: "Күнү жок",
            unknownDate: "Күнү белгисиз"
        },
        loading: {
            title: "Жүктөө жүрүп жатат",
            courses: "Курстар жүктөлүүдө...",
            groups: "Группалар жүктөлүүдө...",
            sessions: "Сессиялар жүктөлүүдө...",
            roster: "Катышуу тизмеси жүктөлүүдө...",
            working: "Иштеп жатат...",
            progressComplete: "{{current}} / {{total}} аякталды"
        },
        notices: {
            coursesLoadErrorTitle: "Курстар жүктөлгөн жок",
            groupsLoadErrorTitle: "Группалар жүктөлгөн жок",
            sessionsLoadErrorTitle: "Сессиялар жүктөлгөн жок",
            rosterLoadErrorTitle: "Катышуу тизмеси жүктөлгөн жок",
            unsavedTitle: "Сакталбаган өзгөртүү бар",
            statusChanged: "Катышуу статусун өзгөрттүңүз. Сактоо баскычын басмайынча өзгөрүү серверге кетпейт.",
            notesChanged: "Эскертүү өзгөрдү. Сактоо баскычын басмайынча өзгөрүү серверге кетпейт.",
            selectionRequiredTitle: "Толук тандоо керек",
            selectionRequired: "Катышууну сактоо үчүн курс, группа жана сессия тандаңыз.",
            editModeClosedTitle: "Өзгөртүү режими жабык",
            editModeClosed: "Админ катары катышууну өзгөртүү үчүн адегенде өзгөртүү режимин ачыңыз.",
            noChangesTitle: "Өзгөртүү жок",
            noChanges: "Учурдагы катышуу тизмеси сакталган абал менен бирдей.",
            noStudentsTitle: "Студент жок",
            noStudentsToSave: "Бул группа үчүн сактай турган катышуу тизмеси бош.",
            savedTitle: "Катышуу сакталды",
            saveErrorTitle: "Катышуу сакталган жок"
        },
        toasts: {
            coursesLoadError: "Катышуу үчүн курстар жүктөлгөн жок.",
            groupsLoadError: "Группалар жүктөлгөн жок.",
            sessionsLoadError: "Сессиялар жүктөлгөн жок.",
            selectionRequired: "Курс, группа жана сессия тандаңыз.",
            openEditModeFirst: "Адегенде өзгөртүү режимин ачыңыз.",
            disabled: "Бул компанияда катышуу өчүрүлгөн.",
            noChanges: "Өзгөртүү жок.",
            noStudents: "Бул группа үчүн студент табылган жок.",
            saved: "Катышуу ийгиликтүү сакталды.",
            updateSuccess: "Катышуу ийгиликтүү жаңыртылды.",
            bulkUpdateSuccess: "{{count}} катышуу жазуусу жаңыртылды.",
            updateFailed: "Катышууну жаңыртуу мүмкүн болбоду."
        },
        bulk: {
            selection: {
                cellsSelected: "{{count}} клетка тандалды",
                summary: "{{students}} студент • {{sessions}} сессия"
            },
            quickActions: {
                markAllPresent: "Баарын катышты деп белгилөө",
                markAllAbsent: "Баарын келген жок деп белгилөө",
                clearAbsent: "Келбей калгандарды тазалоо"
            },
            actions: {
                markPresent: "Катышты деп белгилөө",
                markLate: "Кечикти деп белгилөө",
                markAbsent: "Келген жок деп белгилөө",
                markExcused: "Себептүү деп белгилөө",
                exportCsv: "CSV экспорт",
                exportExcel: "Excel экспорт",
                notifyParents: "Ата-энеге билдирүү",
                clearSelection: "Тандоону тазалоо"
            },
            notificationMessage: "Балаңыздын сессияга катышуусу жөнүндө маалымат",
            toasts: {
                updateSuccess: "{{count}} катышуу жазуусу \"{{status}}\" болуп жаңыртылды.",
                updateFailed: "Көп жаңыртуу мүмкүн болбоду.",
                selectStudentsForExport: "Экспорт үчүн студенттерди тандаңыз.",
                exportSuccess: "Катышуу маалыматы экспорттолду.",
                exportFailed: "Экспорт мүмкүн болбоду.",
                selectStudentsForNotification: "Билдирүү үчүн студенттерди тандаңыз.",
                noStudentsToNotify: "Билдирүү керек болгон студенттер жок.",
                notifySuccess: "{{count}} ата-энеге билдирүү жөнөтүлдү.",
                notifyFailed: "Билдирүү жөнөтүү мүмкүн болбоду.",
                clearAbsentSuccess: "{{count}} келбей калган катышуу жазуусу тазаланды."
            }
        },
        cardView: {
            noStudentsFound: "Студенттер табылган жок",
            unknownStudent: "Белгисиз",
            attendanceRate: "Катышуу %:",
            attended: "Катышкан:"
        },
        table: {
            summary: "Жыйынтык",
            selectCellsHint: "Катышууну белгилөө үчүн клеткаларды тандаңыз.",
            unsavedChanges: "{{count}} өзгөртүү сакталган эмес",
            saveEnabledHint: "Өзгөртүү киргизилгенде сактоо баскычы активдүү болот.",
            clickCellHint: "Катышуу статусун өзгөртүү үчүн таблицадагы клетканы басыңыз.",
            selectStatusTitle: "Катышуу статусун тандаңыз",
            actions: {
                reload: "Кайра жүктөө",
                discard: "Жокко чыгаруу"
            },
            toasts: {
                noChangesToSave: "Сактоо үчүн өзгөртүү жок.",
                saveSuccess: "{{count}} катышуу жазуусу ийгиликтүү сакталды.",
                saveFailed: "Катышууну сактоо мүмкүн болбоду."
            }
        },
        loadingStates: {
            empty: {
                sessionsTitle: "Сессиялар жок",
                sessionsSubtitle: "Бул курс үчүн сессиялар пландалган эмес.",
                dataTitle: "Маалымат жок",
                dataSubtitle: "Көрсөтүү үчүн маалымат жок."
            },
            error: {
                title: "Ката кетти",
                unknown: "Белгисиз ката кетти. Кайра аракет кылыңыз.",
                retry: "Кайра аракет кылуу"
            }
        },
        accessibility: {
            labels: {
                attendanceCell: "{{studentName}} үчүн {{sessionTitle}} сессиясында катышуу статусун өзгөртүү",
                statusButton: "{{studentName}} студентин \"{{status}}\" деп белгилөө",
                bulkAction: "Тандалган студенттерди \"{{status}}\" деп белгилөө",
                clearSelection: "Бардык тандоону тазалоо",
                saveChanges: "Катышуу өзгөртүүлөрүн сактоо"
            },
            announcements: {
                statusChanged: "Катышуу статусу \"{{status}}\" болуп өзгөрдү",
                selectionCleared: "Тандоо тазаланды",
                changesSaved: "Бардык өзгөртүүлөр ийгиликтүү сакталды",
                error: "Ката: {{message}}",
                allCellsSelected: "Бардык клеткалар тандалды"
            },
            shortcuts: {
                cycleStatus: "Статусту өзгөртүү",
                selectMultiple: "Көп тандоо",
                clearSelection: "Тандоону тазалоо",
                saveChanges: "Өзгөртүүлөрдү сактоо",
                navigation: "Навигация",
                markAbsent: "Келген жок деп белгилөө",
                selectAll: "Баарын тандоо"
            }
        },
        errors: {
            sessionExpired: "Сессия мөөнөтү бүттү. Кайра кириңиз.",
            forbidden: "Бул аракетке уруксатыңыз жок.",
            notFound: "Тандалган группа же сессия табылган жок.",
            validation: "Текшерүү катасы болду.",
            rateLimited: "Аракеттер саны ашты. Бир аздан кийин кайра аракет кылыңыз.",
            server: "Сервер катасы болду."
        },
        legacy: {
            overview: "Катышуу обзору",
            loadingData: "Катышуу маалыматтары жүктөлүүдө...",
            loadError: "Катышуу маалыматтарын жүктөөдө ката кетти",
            loadFailed: "Катышуу маалыматтарын жүктөө мүмкүн болбоду",
            empty: "Катышуу маалыматтары жок",
            noStudentsSubtitle: "Катышууну көзөмөлдөө үчүн бул группага студенттерди кошуңуз.",
            groupAttendance: "Группа катышуусу",
            counts: "{{students}} студент · {{sessions}} сессия",
            searchStudents: "Студенттерди издөө...",
            studentName: "Студенттин аты",
            changeAttendanceAria: "{{student}} үчүн {{session}} сессиясында катышууну өзгөртүү",
            cellsSelected: "{{count}} клетка тандалды",
            markPresent: "Катышты деп белгилөө",
            markLate: "Кечикти деп белгилөө",
            markAbsent: "Келген жок деп белгилөө",
            clearSelection: "Тандоону тазалоо",
            paginationSummary: "{{total}} студенттин {{start}}-{{end}} аралыгы көрсөтүлүүдө"
        }
    },
    groupSessions: {
        workspace: {
            tabs: {
                attendance: "Катышуу",
                materials: "Ресурстар",
                homework: "Үй тапшырма",
                activities: "Иштер",
                notes: "Жазуулар",
                engagement: "Кийинки аракеттер"
            },
            errors: {
                unauthorized: "Сессия мөөнөтү бүттү. Кайра кириңиз.",
                forbidden: "Бул курс, группа же сессия сизге бекитилген эмес."
            },
            tabGroups: {
                primary: {
                    label: "Негизги иш агымы",
                    description: "Сессия учурунда эң көп колдонулган аракеттер."
                },
                secondary: {
                    label: "Кошумча иш аймагы",
                    description: "Рефлексия, иш-аракеттер жана катышуу анализи."
                }
            },
            page: {
                sessionModes: {
                    upcoming: "Күтүүдө",
                    live: "Түз эфирде",
                    completed: "Аяктаган",
                    scheduled: "Пландалган"
                },
                deliveryModes: {
                    individual: "Жеке курс",
                    group: "Группа"
                },
                toasts: {
                    selectSession: "Сессия тандаңыз.",
                    notesSaved: "Жазуулар сакталды.",
                    notesSaveError: "Жазууларды сактоо мүмкүн болгон жок."
                },
                primaryTools: {
                    attendance: {
                        label: "Катышууну белгилөө",
                        description: "{{students}} студент, {{rate}}% катышуу"
                    },
                    materials: {
                        label: "Сабак ресурстары",
                        liveDescription: "Түз эфир шилтемеси, жаздыруу жана материалдар",
                        defaultDescription: "Материалдар жана жаздыруулар"
                    },
                    homework: {
                        label: "Үй тапшырма",
                        description: "{{homework}} тапшырма, {{review}} жооп текшерүүдө"
                    }
                },
                emptyUnavailable: {
                    title: "Сессия панели азырынча жеткиликтүү эмес",
                    subtitle: "Бул бөлүм бекитилген офлайн же онлайн түз эфир курстары үчүн ачылат. Алгач ушундай курс түзүңүз же бекитилген курс кошулушун күтүңүз."
                },
                hero: {
                    eyebrow: "Инструктор иш панели",
                    title: "Сессия панели",
                    description: "Инструктор панелиндеги активдүү сессия борбору. Курс, группа жана сессия тандалгандан кийин катышуу, ресурстар жана үй тапшырма ошол контекстте иштейт."
                },
                metrics: {
                    today: "Бүгүнкү сессиялар",
                    attendanceRate: "Катышуу %",
                    homeworkPublished: "Тапшырма жарыяланды",
                    riskStudents: "Кооптуу студенттер"
                },
                activeContext: {
                    title: "Активдүү контекст",
                    description: "Алгач так курс, группа жана сессияны тандаңыз. Андан кийин катышуу, үй тапшырма жана ресурстар ошол активдүү сессия контекстинде иштейт."
                },
                filters: {
                    course: "Курс",
                    selectCourse: "Курс тандаңыз",
                    group: "Группа",
                    selectGroup: "Группа тандаңыз",
                    session: "Сессияны алмаштыруу",
                    selectSession: "Сессия тандаңыз"
                },
                fallbacks: {
                    course: "Курс",
                    groupWithId: "Группа #{{id}}",
                    sessionWithId: "Сессия #{{id}}",
                    groupSession: "Группа сессиясы",
                    notSelected: "Тандала элек",
                    noSession: "Сессия тандала элек"
                },
                today: {
                    title: "Тандалган группанын бүгүнкү сессиялары",
                    descriptionForGroup: "{{group}} үчүн сессияны ушул жерден тез алмаштырыңыз.",
                    descriptionEmpty: "Алгач группа тандаңыз, андан кийин ошол группанын бүгүнкү сессиялары көрүнөт.",
                    empty: "Тандалган группада бүгүн сессия жок."
                },
                countdown: {
                    remainingInline: " • {{value}} калды"
                },
                livePanel: {
                    title: "Онлайн түз эфир сессиясы",
                    startsIn: "Башталышына: {{value}}",
                    endsIn: "Аяктаганга чейин: {{value}}",
                    completed: "Сессия аяктады",
                    joinWindowHint: "Сабакка кирүү 10 мүнөт калганда ачылат."
                },
                actions: {
                    joinClass: "Сабакка кирүү",
                    createSession: "Жаңы сессия түзүү",
                    editSession: "Сессияны түзөтүү",
                    openGroups: "Группалар панелин ачуу"
                },
                setup: {
                    title: "Сессия даярдоо",
                    description: "Түзүү жана түзөтүү аракеттери модалда калат. Негизги аймак активдүү сессияны жүргүзүүгө багытталган."
                },
                context: {
                    title: "Контекст",
                    course: "Курс",
                    group: "Группа",
                    session: "Сессия"
                },
                header: {
                    activeSession: "Активдүү сессия",
                    sessionStatus: "Сессия статусу",
                    updating: "Жаңыртылууда..."
                },
                attendanceMetrics: {
                    totalStudents: "Жалпы студент"
                }
            },
            validation: {
                selectSession: "Сессия тандаңыз."
            },
            activities: {
                toasts: {
                    created: "Иш кошулду.",
                    updated: "Иш жаңыртылды.",
                    deleted: "Иш өчүрүлдү.",
                    createError: "Ишти сактоо мүмкүн болгон жок.",
                    updateError: "Ишти жаңыртуу мүмкүн болгон жок.",
                    deleteError: "Ишти өчүрүү мүмкүн болгон жок.",
                    loadResponsesError: "Иш жыйынтыгын жүктөө мүмкүн болгон жок.",
                    responseUpdated: "Иш жообу жаңыртылды.",
                    responseSaveError: "Иш жообун сактоо мүмкүн болгон жок."
                }
            },
            attendance: {
                title: "Катышуу",
                description: "Сессия боюнча катышууну белгилеп, bulk аракеттер менен тез өзгөртүп сактаңыз.",
                sessionStatus: {
                    present: "Катышты",
                    late: "Кечикти",
                    absent: "Келген жок",
                    excused: "Уруксат менен"
                },
                sessionModes: {
                    upcoming: "Күтүүдө",
                    live: "Түз эфирде",
                    completed: "Аяктаган"
                },
                fallbacks: {
                    session: "Сессия #{{value}}",
                    group: "Группа",
                    noTime: "Убакыт жок"
                },
                actions: {
                    importingZoom: "Импорттолууда...",
                    importZoom: "Zoom импорттоо",
                    saving: "Сакталууда...",
                    save: "Катышууну сактоо",
                    noChanges: "Өзгөртүү жок"
                },
                filters: {
                    searchPlaceholder: "Студент издөө",
                    all: "Баары",
                    unmarked: "Белгилене элек",
                    changed: "Өзгөртүлгөндөр"
                },
                bulk: {
                    present: "Баары катышты",
                    late: "Баары кечикти",
                    absent: "Баары жок",
                    clearVisible: "Көрсөтүлгөндөрдү тазалоо"
                },
                counters: {
                    visible: "Көрсөтүлгөндөр: {{count}}",
                    unmarked: "Белгилене элек: {{count}}",
                    unsaved: "Сакталбаган: {{value}}",
                    marked: "Белгиленгендер: {{marked}}/{{total}}",
                    presentRate: "Катышуу үлүшү: {{value}}%"
                },
                values: {
                    yes: "ооба",
                    no: "жок"
                },
                unsavedMessage: "Өзгөртүүлөр али сактала элек. Сактоо баскычы учурдагы сессия үчүн бардык белгилөөлөрдү сактайт.",
                savedMessage: "Катышуу абалы сакталган. Bulk аракеттер издөө жана фильтрден өткөн студенттерге гана колдонулат.",
                empty: {
                    selectSession: "Катышууну белгилөө үчүн адегенде сессияны тандаңыз.",
                    loadingStudents: "Студенттер жүктөлүүдө...",
                    noStudents: "Студент табылган жок.",
                    noFilteredStudents: "Бул фильтр боюнча студент табылган жок."
                },
                studentStatusHelper: "Ушул сессия үчүн катышуу статусун тандаңыз.",
                notesPlaceholder: "Эскертүү",
                toasts: {
                    loadError: "Сессия маалыматтарын жүктөө катасы.",
                    selectSession: "Катышууну сактоо үчүн сессияны тандаңыз.",
                    noChanges: "Өзгөртүү жок.",
                    saved: "Катышуу ушул сессия үчүн сакталды.",
                    saveError: "Катышууну сактоо катасы."
                },
                notices: {
                    noSessionTitle: "Сессия тандалган эмес",
                    noSessionMessage: "Катышууну сактоо үчүн активдүү сессияны тандаңыз.",
                    unmarkedTitle: "Катышуу толук белгиленген эмес",
                    unmarkedMessage: "Адегенде {{count}} студент үчүн катышуу статусун тандаңыз.",
                    noChangesTitle: "Өзгөртүү жок",
                    noChangesMessage: "Катышуу тизмеси сакталган абал менен бирдей.",
                    savedTitle: "Катышуу сакталды",
                    savedMessage: "Катышуу ушул активдүү сессия үчүн жаңыртылды.",
                    saveFailedTitle: "Катышуу сакталган жок"
                }
            },
            homework: {
                deadlineStates: {
                    noDeadline: "Мөөнөт жок",
                    unknown: "Мөөнөт белгисиз",
                    overdue: "Өтүп кеткен",
                    dueSoon: "Жакында бүтөт",
                    active: "Активдүү"
                },
                validation: {
                    titleRequired: "Үй тапшырманын аталышын жазыңыз.",
                    selectSessionFirst: "Алгач сессия тандаңыз."
                },
                toasts: {
                    loadError: "Үй тапшырмалар жүктөлгөн жок.",
                    reviewRosterLoadError: "Текшерүү тизмеси жүктөлгөн жок.",
                    published: "Үй тапшырма жарыяланды.",
                    unpublished: "Үй тапшырма жарыялоодон алынды.",
                    publishError: "Үй тапшырманы жарыялоо катасы.",
                    updateError: "Үй тапшырманы жаңыртуу катасы.",
                    reviewUpdated: "Тапшырма жооп статусу жаңыртылды.",
                    reviewError: "Тапшырма жоопун баалоо катасы.",
                    statusError: "Үй тапшырма статусун өзгөртүү катасы."
                }
            },
            resources: {
                fallbacks: {
                    lessonVideo: "Сабак видеосу"
                },
                toasts: {
                    courseMaterialsLoadError: "Курстун материалдарын жүктөө мүмкүн болгон жок.",
                    materialsUpdated: "Материалдар жаңыртылды.",
                    materialsUpdateError: "Материалдарды жаңыртуу мүмкүн болгон жок.",
                    fileAdded: "Файл материалдарга кошулду.",
                    fileUploadError: "Файлды жүктөө мүмкүн болгон жок.",
                    materialAlreadyAdded: "Бул материал сессияга мурунтан кошулган.",
                    meetingLinkUpdated: "Жолугушуу шилтемеси жаңыртылды.",
                    meetingLinkSaveError: "Жолугушуу шилтемесин сактоо мүмкүн болгон жок.",
                    meetingStateUpdated: "Жолугушуунун абалы жаңыртылды.",
                    meetingNotFound: "Жолугушуу табылган жок.",
                    meetingDeleted: "Жолугушуу өчүрүлдү.",
                    meetingDeleteError: "Жолугушууну өчүрүү мүмкүн болгон жок.",
                    zoomAttendanceImported: "Zoom attendance импорттолду.",
                    attendanceImportError: "Катышууну импорттоо мүмкүн болгон жок.",
                    zoomRecordingsSynced: "Zoom recordings синхрондолду.",
                    recordingsSyncError: "Жазууларды синхрондоо мүмкүн болгон жок.",
                    meetingLinkMissing: "Жолугушуу шилтемеси табылган жок."
                }
            },
            selections: {
                toasts: {
                    coursesLoadError: "Курстар жүктөлгөн жок.",
                    groupsLoadError: "Группаларды жүктөө мүмкүн болгон жок.",
                    sessionsLoadError: "Сессияларды жүктөө мүмкүн болгон жок."
                },
                notices: {
                    coursesLoadTitle: "Курстар жүктөлгөн жок",
                    groupsLoadTitle: "Группалар жүктөлгөн жок",
                    sessionsLoadTitle: "Сессиялар жүктөлгөн жок"
                }
            }
        },
        notes: {
            title: "Сессия жазуулары",
            description: "Инструктор үчүн бул сессияга байланыштуу жеке эскертмелер жана кийинки кадамдар.",
            status: {
                unsaved: "Өзгөртүүлөр сакталган жок.",
                saved: "Жазуулар сакталган.",
                empty: "Бул сессия үчүн жазуу азырынча жок."
            },
            saveState: {
                saving: "Жазуу сакталып жатат...",
                ready: "Өзгөртүүлөр даяр. Сактап коюңуз.",
                lastSaved: "Акыркы сакталган: {{date}}",
                notCreated: "Бул сессия үчүн өзүнчө жазуу али түзүлгөн жок."
            },
            actions: {
                save: "Жазууну сактоо",
                saving: "Сакталып жатат..."
            },
            field: {
                label: "Сессия боюнча жазуу",
                placeholder: "Бул сессия боюнча байкоо, улантуучу иштер же жеке эскертмелерди жазыңыз."
            },
            empty: {
                selectSession: "Жазуу кошуу үчүн адегенде сессияны тандаңыз."
            }
        },
        engagement: {
            title: "Кийинки аракеттер",
            loadError: "Кийинки аракеттерди жүктөө катасы.",
            loadingDescription: "Бул сессия үчүн ишенимдүү сигналдар жүктөлүп жатат.",
            description: "Катышуу, үй тапшырма жана иштерден чыккан приоритеттүү сигналдар.",
            tabs: {
                attendance: "Катышуу",
                homework: "Үй тапшырма",
                activities: "Иштер"
            },
            metrics: {
                attendanceMarked: "Катышуу белгиленди",
                unmarkedHelper: "{{count}} студент али белгилене элек",
                needsAttention: "Көзөмөл керек",
                attentionLimitHelper: "Алдыңкы {{count}} студент көрсөтүлөт",
                teacherQueue: "Инструктор кезеги",
                teacherQueueHelper: "Текшерүү же белгилөө күтүп турат",
                positiveSignal: "Жакшы сигнал",
                positiveLimitHelper: "Алдыңкы {{count}} позитив студент"
            },
            attention: {
                title: "Кимге кайрылуу керек",
                description: "Приоритет, себеп саны жана олуттуулугу боюнча иреттелген тизме.",
                moreReasons: "+{{count}} дагы"
            },
            severity: {
                high: "Дароо көңүл буруу",
                medium: "Жакын follow-up",
                low: "Эскертме"
            },
            actions: {
                openFirst: "Адегенде ачуу"
            },
            queue: {
                title: "Инструктор кезеги",
                description: "Адегенде кайсы ишти ачуу керектигин ушул жерден тандаңыз.",
                attendanceTitle: "Катышуу толук эмес",
                attendanceDescription: "Белгиленбей калган студенттер",
                homeworkTitle: "Үй тапшырма текшерүү",
                homeworkDescription: "Submitted абалындагы жооптор",
                activitiesTitle: "Иш текшерүү",
                activitiesDescription: "Activity submission карала элек"
            },
            signals: {
                title: "Сигналдардын кыскача көрүнүшү",
                description: "Кайсы блоктон follow-up чыгып жатканын тез көрүңүз. \"Жакында\" = {{hours}} саат.",
                attendance: "Катышуу",
                absentValue: "{{count}} жок",
                attendanceHelper: "{{late}} кечикти, {{excused}} уруксат",
                homework: "ҮТ студент сигналдары",
                homeworkHelper: "{{revision}} оңдотууда, {{dueSoon}} жакында бүтөт",
                activities: "Иш студент сигналдары",
                activitiesHelper: "{{revision}} оңдотууда, {{missing}} жооп жок, {{notStarted}} баштай элек",
                positive: "Жакшы жүрүп жаткандар",
                positiveHelper: "Тобокелдиксиз позитив сигнал"
            },
            positive: {
                title: "Жакшы жүрүп жаткан студенттер",
                description: "Follow-up жок жана туруктуу жакшы сигнал берген студенттер.",
                streak: "{{count}} ирет катар"
            },
            empty: {
                noAttentionStudents: "Бул сессия үчүн өзгөчө follow-up талап кылган студент көрүнгөн жок.",
                noPositiveStudents: "Азырынча өзүнчө positive momentum көрүнбөйт."
            }
        },
        activities: {
            title: "Сессия иштери",
            description: "Бул бөлүм студент менен синхрондолот. Ар бир иш өзүнчө сакталат: пландалды — студентке көрүнбөйт, активдүү — көрүнөт, аяктады — көрүнөт бирок жабык.",
            insightFocus: "Insight фокус",
            focusFallback: "Фокус",
            focusHelpFallback: "Ушул багыттагы жоопторду биринчи караңыз.",
            loading: "Жүктөлүүдө...",
            lastUpdated: "Акыркы жаңыртуу: {{date}}",
            types: {
                discussion: "Талкуу",
                exercise: "Көнүгүү",
                quiz: "Квиз",
                groupWork: "Топтук иш"
            },
            typeHelp: {
                discussion: "Студент текст же кыска жооп бере алат",
                exercise: "Текст, файл же шилтеме менен аткарылат",
                quiz: "Авто бааланат, натыйжа дароо чыгат",
                groupWork: "Ар бир студент өзүнчө жыйынтык же кыска отчет тапшырат"
            },
            status: {
                planned: "Пландалды",
                active: "Азыр жүрүп жатат",
                done: "Аяктады"
            },
            statusHelp: {
                planned: "Студентке көрүнбөйт",
                active: "Студентке көрүнөт",
                done: "Студентке көрүнөт, жабык"
            },
            submissionStatus: {
                submitted: "Текшерилүүдө",
                approved: "Бекитилди",
                needsRevision: "Оңдотуу керек",
                rejected: "Кайтарылды"
            },
            filters: {
                all: "Баары",
                pending: "Текшериле элек",
                reviewed: "Текшерилген",
                revision: "Оңдотуу/кайтаруу",
                passed: "Өткөн квиздер",
                failed: "Өтпөгөн квиздер",
                notStarted: "Башталбаган квиздер",
                missingResponse: "Жооп жок"
            },
            filterHelp: {
                all: "Жалпы көрүнүш",
                pending: "Submitted жоопторго көңүл буруңуз",
                reviewed: "Бүтүп калган жооптор",
                revision: "Кайра кароону талап кылгандар",
                passed: "Ийгиликтүү бүткөн аракеттер",
                failed: "Кайра follow-up талап кылат",
                notStarted: "Студент али аракет кылган жок",
                missingResponse: "Ачык иштерге жооп бере элек"
            },
            metrics: {
                total: "Жалпы",
                visible: "Көрүнөт",
                hidden: "Жашыруун",
                quiz: "Квиз"
            },
            actions: {
                addActivity: "Иш кошуу",
                cancel: "Жокко чыгаруу",
                saving: "Сакталып жатат...",
                save: "Сактоо",
                saveActivity: "Ишти сактоо",
                saveChanges: "Өзгөртүүнү сактоо",
                responses: "Жооптор",
                edit: "Түзөтүү",
                delete: "Өчүрүү",
                deleting: "Өчүрүлүүдө...",
                toggle: "Ачуу/жабуу",
                addQuestion: "Суроо кошуу",
                addOption: "Вариант кошуу",
                openAttachment: "Тиркемени ачуу",
                collapse: "Жыйуу"
            },
            editor: {
                newActivity: "Жаңы иш",
                activityNumber: "Иш #{{number}}",
                reviewHint: "Студентке пайдалуу жыйынтык көрсөтүү үчүн текшерүүдө жок дегенде пикир же баа калтырыңыз."
            },
            fields: {
                title: "Иштин аталышы",
                description: "Кыскача түшүндүрмө же эмне кылыш керек экенин жазыңыз."
            },
            quiz: {
                questionsTitle: "Квиз суроолору",
                questionsHelp: "{{count}} суроо. Ар бир суроо үчүн жок дегенде эки вариант жана бир туура жооп керек.",
                questionCount: "{{count}} суроо",
                questionNumber: "Суроо #{{number}}",
                questionPlaceholder: "Суроону жазыңыз",
                singleChoice: "Бир туура жооп",
                multipleChoice: "Бир нече туура жооп",
                correct: "Туура",
                optionPlaceholder: "Вариант {{number}}",
                summaryTitle: "Квиз кыскача көрүнүшү",
                summaryDescription: "Оң жооптор бул жерде көрсөтүлбөйт. Студентке статус боюнча көрүнөт.",
                viewMode: "Көрүү режими"
            },
            responses: {
                student: "Студент",
                passed: "Өткөндөр",
                failed: "Өтпөгөндөр",
                studentsShown: "{{count}} студент көрсөтүлдү",
                attempt: "Аракет",
                answer: "Жооп",
                result: "Натыйжа",
                passedShort: "Өттү",
                failedShort: "Өткөн жок",
                response: "Жооп",
                responsesShown: "{{count}} жооп көрсөтүлдү"
            },
            review: {
                currentResult: "Учурдагы жыйынтык",
                score: "Баа: {{score}}",
                reviewedAt: "Текшерилген: {{date}}",
                editReview: "Review түзөтүү",
                previousThread: "Мурунку алмашуулар",
                approve: "Бекитүү",
                requestRevision: "Оңдотуу",
                reject: "Кайтаруу",
                scorePlaceholder: "Баа",
                commentPlaceholder: "Пикир",
                requireFeedback: "`Бекитилди`, `Оңдотуу керек`, `Кайтарылды` үчүн жок дегенде пикир же баа керек."
            },
            empty: {
                noActivitiesYet: "Иштер азырынча кошула элек.",
                noResponses: "Азырынча жооп жок.",
                noActivities: "Азырынча сессия иштери жок. Мисалы, талкуу, көнүгүү, топтук иш же квиз кошсоңуз болот."
            },
            fallbacks: {
                student: "Студент",
                instructor: "Инструктор"
            }
        },
        resources: {
            loading: "Жүктөлүүдө...",
            toasts: {
                copyFailed: "Шилтемени көчүрүү мүмкүн болгон жок.",
                joinLinkCopied: "Join шилтемеси көчүрүлдү.",
                recordingLinkCopied: "Жазуу шилтемеси көчүрүлдү."
            },
            validation: {
                httpUrl: "Шилтеме `http://` же `https://` менен башталышы керек."
            },
            notices: {
                materialAdded: "\"{{title}}\" материалы сессияга кошулду.",
                materialUpdated: "\"{{title}}\" материалы жаңыртылды.",
                materialDeleted: "\"{{title}}\" материалдардан өчүрүлдү.",
                fileAdded: "\"{{title}}\" файлы материалдарга кошулду.",
                videoAdded: "\"{{title}}\" видеосу сессияга кошулду."
            },
            empty: {
                noSessionTitle: "Ресурстар үчүн сессия тандаңыз",
                noSessionSubtitle: "Материалдар, жолугушуу шилтемеси жана жазуу ушул активдүү сессияга байланат.",
                noMaterials: "Бул сессияга материал сакталган эмес.",
                noVideoSearchResults: "Издөөгө ылайык видео табылган жок.",
                noReusableVideos: "Бул курста кайра колдончу сабак видеолору табылган жок."
            },
            materials: {
                title: "Сабак материалдары",
                description: "Сессияга керектүү шилтемелерди, файлдарды жана кайра колдонулган видеолорду ушул жерден башкарыңыз.",
                uploadedUrlReadonly: "Жүктөлгөн файл үчүн шилтеме өзгөртүлбөйт."
            },
            actions: {
                uploadingFile: "Файл жүктөлүүдө...",
                uploadFile: "Файл жүктөө",
                addLink: "Шилтеме кошуу",
                addVideoFromCourse: "Курстан видео кошуу",
                saving: "Сакталып жатат...",
                save: "Сактоо",
                cancel: "Жокко чыгаруу",
                play: "Ойнотуу",
                open: "Ачуу",
                rename: "Атын өзгөртүү",
                delete: "Өчүрүү",
                deleting: "Өчүрүлүүдө...",
                copyLink: "Шилтемени көчүрүү",
                collapse: "Жыйноо",
                expand: "Ачуу",
                add: "Кошуу"
            },
            composer: {
                title: "Жаңы шилтеме кошуу",
                description: "Сессияга тышкы шилтемени аталышы менен кошуңуз."
            },
            fields: {
                materialTitle: "Материал аталышы"
            },
            labels: {
                video: "Видео",
                uploadedFile: "Жүктөлгөн файл",
                externalLink: "Тышкы шилтеме"
            },
            meeting: {
                title: "Түз эфир сабак",
                description: "Сессияга байланган кошулуу шилтемесин сактап, сабак учурунда ошол эле жерден кириңиз.",
                platform: "Платформа",
                statusTitle: "Кошулуу абалы",
                joinReady: "Кошулуу шилтемеси сакталган жана сабакка кирүүгө даяр.",
                joinMissing: "Бул сессия үчүн кошулуу шилтемеси сакталган эмес.",
                update: "Кошулуу шилтемесин жаңыртуу",
                create: "Кошулуу шилтемесин түзүү",
                join: "Сабакка кирүү",
                delete: "Кошулуу шилтемесин өчүрүү",
                joinWindowHint: "Кошулуу сабакка 10 мүнөт калганда гана жеткиликтүү."
            },
            format: {
                title: "Сессия форматы",
                description: "Бул сессия онлайн түз эфир эмес, ошондуктан кошулуу шилтемесин башкаруу бул жерде көрсөтүлбөйт.",
                label: "Формат",
                offline: "Офлайн сессия",
                noLiveMeeting: "Түз эфир жолугушуусу талап кылынбайт",
                location: "Локация"
            },
            recording: {
                title: "Жазуу",
                description: "Сессияга сакталган жазуу шилтемеси ушул жерде көрүнөт. Zoom синхрондолсо, сессия талаасы да жаңыланат.",
                statusTitle: "Жазуу абалы",
                found: "Сессияга байланышкан жазуу табылды.",
                missing: "Бул сессия үчүн жазуу шилтемеси азырынча жок.",
                syncing: "Синхрондолууда...",
                sync: "Zoom жазууларын синхрондоо",
                open: "Жазууну ачуу"
            },
            integrations: {
                title: "Интеграция куралдары",
                description: "Бул көмөкчү аракеттер сабак агымынан тышкары колдонулат. Көбүнчө Zoom импорт же калыбына келтирүү керек болгондо гана.",
                note: "Бул аракеттер кадимки сабак агымынан тышкары колдонулат.",
                loadMeetingState: "Кошулуу абалын жүктөө",
                importing: "Импорттолууда...",
                importZoomAttendance: "Zoom катышууну импорттоо"
            },
            assetLibrary: {
                title: "Курстан видео кошуу",
                sourceCourse: "Булак видео курс",
                searchPlaceholder: "Сабак же бөлүм боюнча издөө",
                attachedVideos: "Кошулган видеолор",
                videoCount: "{{count}} видео",
                loading: "Курс материалдары жүктөлүүдө...",
                attached: "Кошулган",
                added: "Кошулду"
            },
            deleteModal: {
                title: "Материалды өчүрүү",
                messageWithTitle: "\"{{title}}\" материалын өчүрөсүзбү?",
                message: "Материалды өчүрөсүзбү?"
            },
            video: {
                loadingPlayer: "Видео ойноткуч жүктөлүүдө..."
            },
            fallbacks: {
                noSection: "Бөлүм жок",
                material: "Материал",
                thisMaterial: "Бул материал",
                noLocation: "Локация көрсөтүлгөн эмес",
                courseWithId: "Курс #{{id}}"
            }
        },
        setup: {
            workspace: {
                createTitle: "Жаңы сессия",
                editTitle: "Сессияны түзөтүү",
                createDescription: "Группанын кийинки сабагын түзүп, убакытын жана кошумча материалын кошуңуз.",
                editDescription: "Тандалган сессиянын убакытын, статусун жана жазуу шилтемесин жаңыртыңыз.",
                createDisabledReason: "Сессия түзүү үчүн алгач группа тандаңыз.",
                editDisabledReason: "Түзөтүү үчүн активдүү сессия тандаңыз.",
                creating: "Түзүлүүдө...",
                createAction: "Сессия түзүү",
                saving: "Сакталууда...",
                saveAction: "Өзгөртүүлөрдү сактоо"
            },
            modal: {
                createContextHint: "Курс жана группа жогору жактагы тандоодон алынат",
                editContextHint: "Түзөтүү активдүү сессиянын контекстинде жүрөт"
            },
            sections: {
                basic: "Негизги маалымат",
                schedule: "Жүгүртмө",
                locationAndMaterials: "Жайгашкан жер жана материалдар",
                materialsAndRecording: "Материалдар жана жазуу",
                materials: "Материалдар",
                context: "Контекст"
            },
            fields: {
                sessionIndex: "Сессия номери *",
                sessionTitle: "Сессия аталышы *",
                groupLocation: "Группанын локациясы",
                recordingUrl: "Жазуу шилтемеси",
                materialTitle: "Материал аталышы",
                materialUrl: "Материал URL"
            },
            help: {
                nextSessionIndex: "Кийинки жеткиликтүү номер: {{index}}. Зарыл болсо гана өзгөртүңүз.",
                uniqueSessionIndex: "Номер ушул группанын ичинде уникалдуу болушу керек.",
                editMaterialsInResources: "Материалдарды өзгөртүү үчүн сессияны түзөтүү режимин колдонуп, ресурстар табындагы сакталган шилтемелерди жаңыртыңыз.",
                saveChangesHere: "Бардык өзгөртүүлөрдү ушул жерде сактаңыз."
            },
            context: {
                course: "Курс",
                group: "Группа",
                format: "Формат",
                newSession: "Жаңы сессия",
                addedToSelectedGroup: "Тандалган группага кошулат",
                session: "Сессия"
            },
            delivery: {
                offline: "Офлайн",
                onlineLive: "Онлайн түз эфир",
                video: "Видео курс"
            },
            status: {
                scheduled: "Пландаштырылган",
                completed: "Аяктаган",
                cancelled: "Жокко чыгарылган"
            },
            actions: {
                close: "Жабуу"
            },
            fallbacks: {
                noLocation: "Локация көрсөтүлгөн эмес",
                notSelected: "Тандала элек"
            },
            feedback: {
                noGroupTitle: "Группа тандалган эмес",
                noGroupMessage: "Жаңы сессия түзүү үчүн адегенде группа тандаңыз.",
                incompleteTitle: "Сессия маалыматы толук эмес",
                createIncompleteMessage: "Сессия үчүн номер, аталыш, башталышы жана аягы милдеттүү.",
                updateIncompleteMessage: "Сессия үчүн аталыш, башталышы жана аягы милдеттүү.",
                createdTitle: "Сессия түзүлдү",
                createdMessage: "{{title}} активдүү иш аймагында ачылды.",
                createFailedTitle: "Сессия түзүлгөн жок",
                noSessionTitle: "Сессия тандалган эмес",
                noSessionMessage: "Түзөтүү үчүн активдүү сессияны тандаңыз.",
                updatedTitle: "Сессия жаңыртылды",
                updatedMessage: "{{title}} үчүн өзгөртүүлөр сакталды.",
                updateFailedTitle: "Сессия жаңырган жок"
            },
            toasts: {
                selectGroup: "Адегенде группаны тандаңыз.",
                createIncomplete: "Сессия үчүн номер, аталыш, башталышы жана аягы милдеттүү.",
                created: "Сессия түзүлдү.",
                createError: "Сессия түзүү мүмкүн болгон жок.",
                selectSession: "Сессияны тандаңыз.",
                updateIncomplete: "Сессия үчүн аталыш, башталышы жана аягы милдеттүү.",
                updated: "Сессия жаңыртылды.",
                updateError: "Сессияны жаңыртуу мүмкүн болгон жок.",
                statusUpdated: "Сессия статусу жаңыртылды.",
                statusUpdateError: "Сессия статусун жаңыртуу мүмкүн болгон жок."
            }
        },
        homeworkModal: {
            header: {
                editEyebrow: "Өзгөртүү",
                createEyebrow: "Түзүү",
                editTitle: "Үй тапшырманы өзгөртүү",
                createTitle: "Жаңы үй тапшырма",
                editDescription: "Тандалган үй тапшырманы өзгөртүңүз.",
                createDescription: "Жаңы үй тапшырма түзүп, студенттерге жөнөтүңүз."
            },
            sections: {
                basic: "Негизги маалымат",
                deadline: "Мөөнөт",
                publishing: "Жарыялоо опциялары",
                context: "Контекст"
            },
            fields: {
                title: "Тапшырма аталышы",
                description: "Тапшырма сүрөттөмө",
                deadline: "Мөөнөт убактысы (ыктыярчы)",
                publishNow: "Дароо жарыялоо"
            },
            placeholders: {
                title: "Тапшырма аталышын киргизиңиз",
                description: "Тапшырманы толук сүрөттөңүз..."
            },
            validation: {
                titleRequired: "Тапшырма аталышын киргизиңиз.",
                descriptionRequired: "Тапшырма сүрөттөмөн киргизиңиз."
            },
            publishHelp: {
                published: "Үй тапшырма дароо студенттерге көрүнөт.",
                draft: "Үй тапшырма черновик катары сакталат, кийин жарыялай аласыз."
            },
            context: {
                session: "Сессия"
            },
            fallbacks: {
                sessionWithId: "Session #{{id}}"
            },
            deadlineHelp: "Мөөнөт коюлбаса, студенттер каалаган убакта тапшырманы жөнөтө алышат.",
            escapeHint: "Бардык өзгөртүүлөрдү сактап, жабуу үчүн Escape басыңыз.",
            actions: {
                cancel: "Жокко чыгаруу",
                create: "Түзүү",
                update: "Өзгөртүү",
                saving: "Сакталууда..."
            }
        },
        homeworkTab: {
            toasts: {
                created: "Үй тапшырма ийгиликтүү түзүлдү.",
                updated: "Үй тапшырма ийгиликтүү өзгөртүлдү.",
                deleted: "Үй тапшырма ийгиликтүү өчүрүлдү.",
                saveError: "Үй тапшырманы сактоо мүмкүн болгон жок.",
                deleteError: "Үй тапшырманы өчүрүүдө ката кетти.",
                previewError: "Тиркемени ачуу мүмкүн болгон жок."
            },
            metrics: {
                total: "Жалпы тапшырма",
                active: "Активдүү",
                dueSoon: "Жакында бүтөт",
                overdue: "Өтүп кеткен"
            },
            filters: {
                all: "Баары",
                active: "Активдүү",
                dueSoon: "Жакында бүтөт",
                overdue: "Өтүп кеткен",
                noDeadline: "Мөөнөт жок"
            },
            labels: {
                deadline: "Deadline",
                session: "Сессия"
            },
            status: {
                published: "Жарыяланган",
                unpublished: "Жарыяланбаган"
            },
            actions: {
                publish: "Жарыялоо",
                unpublish: "Жарыялоону токтотуу",
                delete: "Үй тапшырманы өчүрүү",
                deleteShort: "Өчүрүү",
                edit: "Өзгөртүү",
                view: "Көрүү",
                download: "Жүктөп алуу",
                approve: "Бекитүү",
                requestRevision: "Оңдотуу",
                sendForRevision: "Оңдотууга жөнөтүү",
                reject: "Кайтаруу",
                cancel: "Жокко чыгаруу",
                deleting: "Өчүрүлүүдө...",
                confirmDelete: "Өчүрүүгө макулмун"
            },
            create: {
                title: "Жаңы үй тапшырма",
                description: "Студенттер үчүн жаңы үй тапшырма түзүңүз.",
                action: "Үй тапшырма түзүү",
                assignedTo: "Дайындалат"
            },
            list: {
                title: "Тапшырмалар тизмеси",
                description: "Издеп табыңыз, deadline абалы боюнча чыпкалап, керектүүсүн тандап текшерүүгө өтүңүз.",
                searchPlaceholder: "Тапшырма издөө",
                loading: "Үй тапшырмалар жүктөлүүдө..."
            },
            selected: {
                title: "Тандалган тапшырма",
                description: "Тапшырманын мазмуну жана негизги абалы.",
                assignedStudents: "{{count}} студентке дайындалды",
                needsReviewCount: "{{count}} текшерүү күтөт"
            },
            review: {
                title: "Жоопторду текшерүү",
                description: "Бул тизмеде тапшырма берилген бардык студенттер көрүнөт: ким тапшырды, ким текшерүүнү күтүп жатат жана ким дагы эле жөнөткөн жок.",
                studentsCount: "{{count}} студент",
                needsReview: "Текшерүү керек",
                needsRevision: "Оңдоп келсин",
                missing: "Жөнөткөн жок",
                pending: "Күтүп турат",
                late: "Кеч тапшырган",
                approved: "Бекитилди",
                rejected: "Кайтарылды",
                loading: "Текшерүү тизмеси жүктөлүүдө...",
                submittedAt: "Жөнөтүлгөн: {{date}}",
                missingAfterDeadline: "Deadline өтүп кетти, бирок студент бул тапшырманы жөнөткөн жок.",
                pendingSubmission: "Бул студент азырынча тапшырма жөнөтө элек.",
                answerContent: "Жооп мазмуну",
                attachment: "Тиркелген файл",
                attachmentDescription: "LMSке жүктөлгөн файл же тышкы шилтеме",
                feedback: "Пикир",
                followUpNeeded: "Follow-up керек",
                waiting: "Азырынча күтүп турабыз"
            },
            reviewStates: {
                missing: "Жөнөткөн жок",
                pendingSubmission: "Азырынча жөнөтө элек",
                needsReview: "Текшерүү керек",
                approved: "Бекитилди",
                needsRevision: "Оңдоп кайра жиберүү",
                needsRevisionFilter: "Оңдотуу керек",
                pending: "Күтүүдө",
                rejected: "Кайтарылды",
                late: "Кеч тапшырган",
                lateShort: "Кеч"
            },
            preview: {
                title: "Тиркеме",
                loadError: "Тиркемени жүктөө мүмкүн болгон жок.",
                unsupportedTitle: "Бул файлды барак ичинде алдын ала көрүү колдоого алынбайт.",
                unsupportedDescription: "Файлды жүктөп алып ачсаңыз болот."
            },
            empty: {
                noSessionTitle: "Үй тапшырма үчүн сессия тандаңыз",
                noSessionSubtitle: "Тапшырма жарыялоо, өзгөртүү жана студент жоопторун текшерүү үчүн алгач активдүү группадан бир сессияны тандаңыз.",
                noHomework: "Бул сессия боюнча үй тапшырма азырынча жок.",
                noFilteredHomework: "Издөө же фильтр боюнча тапшырма табылган жок.",
                noStudents: "Бул тапшырма үчүн студент тизмеси табылган жок.",
                noFilteredStudents: "Тандалган фильтрге ылайык студент табылган жок.",
                selectHomeworkPanelTitle: "Тапшырма тандаңыз",
                selectHomeworkPanelDescription: "Тизменин ичинен бир тапшырманы тандасаңыз, мазмуну жана студент жооптору ушул жерде ачылат.",
                selectHomeworkTitle: "Тандалган тапшырма жок",
                selectHomeworkSubtitle: "Сол жактагы тизме аркылуу бир тапшырманы тандап, дароо текшерүү агымына өтүңүз."
            },
            reviewModal: {
                approveTitle: "Жоопту бекитүү",
                revisionTitle: "Оңдотууга кайтаруу",
                rejectTitle: "Жоопту кайтаруу",
                subtitleWithName: "{{name}} үчүн комментарий калтырыңыз.",
                subtitle: "Комментарий калтырыңыз.",
                approveHelp: "Комментарий кааласаңыз кошуңуз. Бекитүү комментарийсиз да сакталат.",
                requiredHelp: "Бул аракет үчүн кыска түшүндүрмө жазыңыз. Студент эмнени оңдошу же эмнеге жооп кайтарылганы түшүнүктүү болушу керек.",
                commentLabel: "Комментарий",
                approvePlaceholder: "Мисалы: Жооп так жана толук.",
                requiredPlaceholder: "Мисалы: Негизги ойлор жетишпейт, тиркемени кайра текшерип жибериңиз.",
                commentRequired: "Бул аракет үчүн комментарий милдеттүү."
            },
            deleteModal: {
                title: "Үй тапшырманы өчүрүү",
                subtitle: "\"{{title}}\" деген үй тапшырманы өчүрүүгө ишендиңиз. Бул аракет кайтарылбайт.",
                warningTitle: "Эскертүү",
                warningDescription: "Үй тапшырманы өчүрүүдөн кийин аны калыбына кайтаруу мүмкүн эмес. Бардык студент жооптору жана байланышкан маалыматтар жок болот."
            },
            fallbacks: {
                noGroup: "Группа тандалган жок",
                homework: "Үй тапшырма",
                noDescription: "Түшүндүрмө кошула элек.",
                noDeadline: "Мөөнөт коюлган эмес",
                answerUploaded: "Жооп текшерүү үчүн жүктөлгөн.",
                attachment: "Тиркеме"
            }
        }
    },
    internalLeaderboard: {
        trackSwitcherLabel: "Рейтинг багыты",
        currentView: "Учурдагы көрүнүш",
        tracks: {
            all: {
                label: "Бардыгы",
                helper: "Жалпы активдүүлүк"
            },
            video: {
                label: "Видео",
                helper: "Өз алдынча окуу"
            },
            live: {
                label: "Жандуу",
                helper: "Сессиялык окуу"
            }
        },
        roles: {
            student: {
                eyebrow: "Student Ranking",
                title: "Менин ички рейтингим",
                description: "Орунуңузду, курстагы лидерлерди жана бул жумадагы активдүүлүктү салыштырып көрүңүз.",
                courseLabel: "Менин курстарым",
                courseDescription: "Катышып жаткан курстарыңыздагы лидерлерди салыштырыңыз."
            },
            instructor: {
                eyebrow: "Instructor Ranking",
                title: "Студенттердин рейтинги",
                description: "Курстарыңыздагы активдүү студенттерди, аптанын студентин жана курс ичиндеги темпти көзөмөлдөңүз.",
                courseLabel: "Менин курстарым",
                courseDescription: "Курс тандап, ошол курс ичиндеги активдүү студенттерди көрүңүз."
            },
            admin: {
                eyebrow: "Админ рейтинги",
                title: "Платформа рейтинги",
                description: "Платформа боюнча жумалык активдүүлүктү, башкы бет лидерлерин жана курс рейтингдерин караңыз.",
                courseLabel: "Платформа курстары",
                courseDescription: "Каалаган курс боюнча ички рейтингди текшериңиз."
            },
            default: {
                eyebrow: "Рейтинг иш аймагы",
                title: "Ички рейтинг",
                description: "Апталык лидерлерди, аптанын студентин жана курс ичиндеги орундарды ушул жерден көрүңүз.",
                courseLabel: "Курс такталары",
                courseDescription: "Тандалган курс ичиндеги мыктыларды салыштырыңыз."
            }
        },
        metrics: {
            weekly: "Апталык лидерлер",
            homepage: "Башкы бет мыктылары",
            studentOfWeek: "Аптанын студенти"
        },
        row: {
            streakDays: "🔥 {{count}} күн",
            quizCount: "{{count}} тест"
        },
        weekly: {
            title: "Апталык рейтинг",
            description: "Учурда эң активдүү студенттер.",
            emptyTitle: "Лидерлер табылган жок",
            emptySubtitle: "Тандалган багыт боюнча азырынча рейтинг маалыматтары жок."
        },
        studentOfWeek: {
            title: "Аптанын студенти",
            description: "Аптанын өзгөчөлөнгөн катышуучусу жана башкы беттеги мыктылар.",
            emptyTitle: "Аптанын студенти жок",
            emptySubtitle: "Бул багыт боюнча айырмаланган студент азырынча аныкталган жок."
        },
        homepage: {
            title: "Башкы беттеги мыктылар",
            emptyTitle: "Башкы бет маалыматы жок",
            emptySubtitle: "Тандалган багыт боюнча башкы бет лидерлери жок."
        },
        courseBoard: {
            title: "Курс рейтинги",
            description: "Тандалган курс ичиндеги мыктыларды салыштырыңыз.",
            courseLabel: "Курс",
            selectCourse: "Курс тандаңыз",
            noCourseTitle: "Курс тандалган жок",
            noCourseSubtitle: "Ички курс рейтингин көрүү үчүн жогортон курс тандаңыз.",
            noDataTitle: "Маалымат жок",
            noDataSubtitle: "Бул курс жана багыт айкалышы боюнча рейтинг азырынча жеткиликсиз."
        },
        fallbacks: {
            student: "Студент",
            course: "Курс"
        },
        errors: {
            coursesLoad: "Курстарды жүктөө мүмкүн болгон жок.",
            leaderboardLoad: "Ички рейтинг маалыматтарын жүктөө мүмкүн болгон жок.",
            courseBoardLoad: "Курс рейтинги азыр жүктөлбөй жатат."
        }
    }
};
