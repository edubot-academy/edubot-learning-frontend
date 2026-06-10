export const student = {
    studentDashboard: {
        toasts: {
            courseNotFound: "Курс табылган жок.",
            openCourseError: "Курсту ачуу мүмкүн болбоду."
        },
        data: {
            toasts: {
                overviewLoadError: "Кыскача маалымат жүктөлгөн жок.",
                coursesLoadError: "Курстарды жүктөө мүмкүн болбоду.",
                scheduleLoadError: "Жүгүртмө жүктөлгөн жок.",
                tasksLoadError: "Тапшырмаларды жүктөө мүмкүн болбоду.",
                resourcesLoadError: "Ресурстарды жүктөө мүмкүн болбоду.",
                progressLoadError: "Прогресс маалыматтары жүктөлгөн жок.",
                certificatesLoadError: "Сертификаттар жүктөлгөн жок."
            },
            fallbacks: {
                student: "Студент",
                section: "Секция",
                course: "Курс",
                instructor: "Инструктор"
            },
            access: {
                unknownTitle: "Окуу мүмкүнчүлүгүн текшерүү мүмкүн болбоду",
                unknownDescription: "Курстар же сабактар көрүнбөй калса, баракты жаңыртып көрүңүз же колдоо кызматына кайрылыңыз.",
                unloadedTitle: "Окуу мүмкүнчүлүгү текшерилип жатат",
                unloadedDescription: "Курстар, сабактар жана прогресс жүктөлгөндөн кийин жеткиликтүүлүк так көрсөтүлөт.",
                gatedTitle: "Окуу мүмкүнчүлүгү азырынча активдүү эмес",
                gatedDescription: "Сизде активдүү курс же пландагы сабак жок. Төлөм ырасталгандан же каттоо иштетилгенден кийин окуу материалдары ачылат.",
                activeTitle: "Окуу мүмкүнчүлүгү активдүү",
                activeDescription: "Активдүү курстарыңыз жана окуу материалдарыңыз жеткиликтүү."
            }
        },
        shell: {
            subtitle: "Чыгармачыл окуу жолуңузду көзөмөлдөңүз",
            workspaceSection: "Студент бөлүмү",
            actions: {
                hideMenu: "Менюну жашыруу",
                showMenu: "Менюну көрсөтүү"
            },
            workspaceGroups: {
                learning: {
                    label: "Окуу иш аймагы",
                    description: "Курстар, сабак жүгүртмөсү жана окуу материалдары боюнча негизги аракеттер."
                },
                progress: {
                    label: "Аткаруу жана прогресс",
                    description: "Тапшырмалар, прогресс, сертификаттар жана рейтинг мониторинги."
                },
                support: {
                    label: "Байланыш жана орнотуулар",
                    description: "Чат, профиль жана билдирүү жөндөөлөрү үчүн жеке иш аймагы."
                }
            },
            nav: {
                overview: "Кыскача",
                myCourses: "Курстарым",
                schedule: "Жүгүртмө",
                resources: "Ресурстар",
                freeResources: "Акысыз окуу",
                tasks: "Тапшырмалар",
                progress: "Прогресс",
                certificates: "Сертификаттар",
                chat: "Чат",
                leaderboard: "Рейтинг",
                profile: "Профиль",
                notifications: "Билдирүүлөр"
            }
        },
        freeResources: {
            eyebrow: "Акысыз тышкы ресурстар",
            title: "Менин акысыз окуум",
            description: "Сакталган акысыз ресурстарды башкарыңыз, жуманын прогрессин белгилеңиз, жазбалар жазыңыз жана AI куралдарын колдонуңуз.",
            empty: {
                title: "Азырынча сакталган ресурс жок",
                description: "Тандалган каталогду карап чыгыңыз жана ресурстарды окуу планыңызга кошуңуз.",
                cta: "Акысыз ресурстарды карап чыгуу"
            },
            metrics: {
                saved: "Сакталган",
                inProgress: "Жүрүүдө",
                completed: "Аяктады"
            },
            filters: {
                all: "Баары",
                started: "Окулуп жатат",
                saved: "Сакталган",
                completed: "Аяктады"
            },
            detail: {
                weekProgress: "{{done}} / {{total}} жума",
                noStudyPlan: "Окуу планы жок.",
                weekDone: "{{n}}-жума — бүттү",
                weekTodo: "{{n}}-жума",
                notesLabel: "Менин жазбаларым",
                notesPlaceholder: "Бул ресурс жөнүндө жазбалар...",
                aiSection: "AI Окуу Жардамчысы",
                officialSite: "Расмий курс",
                edubotGuide: "EduBot гид",
                removeFromPlan: "Пландан өчүрүү"
            }
        },
        overview: {
            eyebrow: "Студент кыскача көрүнүшү",
            title: "Кош келиңиз, {{name}}!",
            description: "Бүгүнкү негизги окуу аракеттери, жакынкы сессиялар жана прогресс ушул бетке топтолду.",
            focusLabel: "Бүгүнкү фокус",
            nextSessionLabel: "Кийинки сессия:",
            recommendedCourseLabel: "Улантууга ылайыктуу курс:",
            sessionFallback: "Сессия",
            sessionTitleWithNumber: "Сессия {{number}}",
            progressLabel: "Прогресс: {{value}}%",
            joinOpensSoon: "Кошулуу шилтемеси сабакка 10 мүнөт калганда ачылат.",
            courseTypes: {
                offline: "Офлайн",
                onlineLive: "Онлайн түз эфир",
                video: "Видео"
            },
            metrics: {
                activeCourses: "Активдүү курстар",
                completedLessons: "Бүткөн сабак",
                upcomingSessions: "Кийинки сессиялар",
                needsAction: "Аракет керек",
                upcomingSession: "Жакынкы сессия",
                recordings: "Жазуулар"
            },
            hero: {
                mixed: {
                    title: "Окуу жана сессиялар бир жерде",
                    description: "Өз алдынча видеокурстарыңызды улантып, жакынкы түз эфир же офлайн сабактарыңызды өткөрүп жибербей көзөмөлдөңүз."
                },
                delivery: {
                    title: "Кийинки сессияңызга даярданыңыз",
                    description: "Жакынкы сабак, кошулуу шилтемеси же жайгашкан жер, жана ошол сессияга тиешелүү тапшырмалар бул жерден көрүнөт."
                },
                video: {
                    title: "Окууну улантууга даярсыз",
                    description: "Акыркы токтогон жериңизден улантып, видеокурстардагы прогрессиңизди ишенимдүү көзөмөлдөңүз."
                }
            },
            pills: {
                videoCourses: "Видео курстар",
                sessionCourses: "Сессия курстары",
                attendance: "Катышуу",
                recordings: "Жазуулар"
            },
            nextAction: {
                deliveryTitle: "Кийинки негизги аракет",
                videoTitle: "Улантуу чекити",
                deliveryDescription: "Жакынкы сабак же дароо көңүл бурууга тийиш болгон иш.",
                videoDescription: "Өз алдынча окууда азыр кайсы курска кайрылуу керек.",
                empty: "Азырынча негизги аракет табылган жок."
            },
            labels: {
                format: "Формат",
                startsIn: "Башталышына"
            },
            actions: {
                joinLesson: "Сабакка кошулуу",
                join: "Кошулуу",
                continueLearning: "Окууну улантуу"
            },
            sessions: {
                eyebrow: "Түз эфир / офлайн окуу",
                title: "Жакынкы сессиялар",
                description: "Түз эфир же офлайн окуудагы кийинки сессиялар жана алардын контексти.",
                empty: "Жакынкы сабактар азырынча жок."
            },
            videoProgress: {
                eyebrow: "Видео окуу",
                title: "Видео курстардагы прогресс",
                description: "Өз алдынча окууда улантууга ылайыктуу курстар жана учурдагы прогресс.",
                lessonsCompleted: "{{completed}}/{{total}} сабак бүттү",
                progress: "Прогресс"
            },
            homework: {
                title: "Аракет керек болгон тапшырмалар",
                description: "Жакын арада көңүл буруу керек болгон үй тапшырмалары.",
                empty: "Азырынча ачык тапшырма жок."
            },
            learningFormat: {
                title: "Окуу форматы",
                description: "Катышып жаткан курстар боюнча негизги багыттар."
            },
            fallbacks: {
                unknownTime: "Белгисиз убакыт",
                recordingTitle: "Сабактын жазуусу",
                offlineLocationLater: "Офлайн сессия. Жайгашкан жер кийин көрсөтүлөт.",
                locationMissing: "Жайгашкан жер көрсөтүлгөн эмес",
                offlineCheckLocation: "Офлайн сессия. Жайгашкан жерди алдын ала текшериңиз.",
                task: "Тапшырма",
                courseMissing: "Курс көрсөтүлгөн эмес",
                pending: "Күтүүдө",
                notCalculated: "Эсептелбейт"
            }
        },
        profile: {
            eyebrow: "Профиль иш аймагы",
            title: "Профиль",
            description: "Аккаунт маалыматыңызды жаңыртып, кайсы каналдар боюнча эскертме алууну көзөмөлдөңүз.",
            fields: {
                fullName: "Аты-жөнү",
                phone: "Телефон",
                phoneHelper: "Эл аралык форматта киргизсеңиз болот, мисалы +996..."
            },
            account: {
                title: "Аккаунт маалыматы",
                description: "Жеке маалымат жана байланыш маалыматтары.",
                profilePhoto: "Профиль сүрөтү",
                avatarPreviewAlt: "Профиль сүрөтүнүн алдын ала көрүнүшү",
                selectedFile: "Тандалды: {{file}}",
                visibleInfo: "Аккаунтта көрүнгөн негизги маалымат жана байланыш каналдары."
            },
            security: {
                title: "Коопсуздук",
                description: "Сырсөздү жеке маалыматтан бөлөк жаңыртыңыз.",
                newPassword: "Жаңы сырсөз",
                passwordPlaceholder: "Кеминде 6 белги",
                confirmPassword: "Сырсөздү кайталоо",
                confirmPasswordPlaceholder: "Сырсөздү дагы бир жолу киргизиңиз"
            },
            notificationSettings: {
                title: "Эскертме жөндөөлөрү",
                description: "Эскертмелер азырынча профиль ичинде калат; каналдар көбөйсө өз алдынча иш аймагы болуп бөлүнөт.",
                on: "Күйгүзүлгөн",
                off: "Өчүрүлгөн",
                emptyTitle: "Эскертме параметрлери табылган жок",
                emptySubtitle: "Бул аккаунт үчүн эскертме жөндөөлөрү жүктөлгөн жок."
            },
            actions: {
                edit: "Өзгөртүү",
                uploadAvatar: "Аватар жүктөө",
                saving: "Сакталууда...",
                saveProfile: "Профилди сактоо",
                cancel: "Жокко чыгаруу",
                updatePassword: "Сырсөздү жаңыртуу",
                clear: "Тазалоо",
                saveNotifications: "Эскертмелерди сактоо"
            },
            validation: {
                passwordMismatch: "Жаңы сырсөздөр дал келбейт.",
                passwordTooShort: "Сырсөз кеминде 6 белги болушу керек.",
                phoneInternational: "Телефон номери эл аралык форматта болсун. Мисалы: +996700123456"
            },
            toasts: {
                notificationsLoadError: "Эскертмелерди жүктөө мүмкүн болбоду.",
                profileLoadError: "Профиль маалыматы жүктөлгөн жок.",
                notificationsSaved: "Эскертмелер сакталды.",
                notificationsSaveError: "Эскертмелерди сактоо мүмкүн болбоду.",
                profileSaved: "Профиль ийгиликтүү жаңыртылды.",
                profileSaveError: "Профилди сактоо мүмкүн болбоду."
            },
            notifications: {
                lessonReminders: {
                    label: "Сабак эскертмелери",
                    description: "Сабак башталар алдында эскертүү алыңыз."
                },
                announcementEmails: {
                    label: "Курс боюнча жаңылыктар",
                    description: "Жаңы модулдар жана маанилүү окуу жаңылыктары email аркылуу жетет."
                },
                taskUpdates: {
                    label: "Тапшырма эскертмелери",
                    description: "Тапшырмалардын мөөнөтү жакындаганда эскертүү алыңыз."
                },
                smsAlerts: {
                    label: "SMS эскертүүлөр",
                    description: "Маанилүү окуялар боюнча SMS кабыл алыңыз."
                },
                pushNotifications: {
                    label: "Калтырылган сабак эскертмелери",
                    description: "Калтырылган сабактар боюнча дароо билдирүү алыңыз."
                }
            }
        },
        empty: {
            accessEyebrow: "Студент мүмкүнчүлүгү",
            accessTitle: "Окуу мүмкүнчүлүгү азырынча активдүү эмес",
            accessDescription: "Сизде азырынча активдүү курс жок. Төлөм ырасталгандан же каттоо иштетилгенден кийин бул жерде курстарыңыз, сабактарыңыз жана прогрессиңиз көрүнөт.",
            actions: {
                viewVideoCourses: "Видео курстарды көрүү",
                openProfile: "Профилди ачуу"
            }
        },
        courses: {
            eyebrow: "Менин курстарым",
            title: "Менин курстарым",
            emptyHeroDescription: "Бул жерде активдүү курстар, кийинки сессиялар жана окуу темпи көрүнөт.",
            description: "Курс прогрессин, инструкторду, кийинки сабакты жана жазууларды бир экрандан башкарыңыз.",
            searchPlaceholder: "Курс же инструктор боюнча издөө",
            noImage: "Курс сүрөтү жок",
            progress: "Прогресс",
            scheduledCourseNotice: "Бул курс график менен өтөт. Негизги маалыматтар жүгүртмө жана катышуу бөлүмдөрүндө көрсөтүлөт.",
            metrics: {
                courses: "Курстар",
                averageProgress: "Орточо прогресс",
                live: "Түз эфир",
                offline: "Офлайн"
            },
            filters: {
                allTypes: "Бардык типтер"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн түз эфир"
            },
            courseModes: {
                selfPaced: "Өз алдынча",
                offlineGroup: "Офлайн топ",
                liveGroup: "Түз эфир тобу"
            },
            stats: {
                lessons: "Сабактар",
                format: "Формат",
                group: "Топ",
                nextStatus: "Кийинки абал",
                upcoming: "Алдыдагы"
            },
            statuses: {
                continue: "Улантуу",
                completed: "Аяктады",
                pending: "Күтүүдө"
            },
            fallbacks: {
                unknownTime: "Белгисиз убакыт"
            },
            actions: {
                openCourse: "Курсту ачуу",
                openSchedule: "Расписаниени ачуу"
            },
            nextStep: {
                title: "Кийинки кадам",
                videoDescription: "Кийинки видео сабак же уланта турган жериңиз.",
                groupDescription: "Жакынкы сессия же топ боюнча маалымат.",
                selfPacedHint: "Видео курс өз темпиңизде өтүлөт. Курсту ачып, окууну улантыңыз.",
                instructor: "Инструктор: {{instructor}}",
                videoCompleted: "Бул видео курстун бардык сабактары аяктаган окшойт.",
                location: "Жайгашкан жери: {{location}}",
                noClassroom: "Класс али дайындала элек",
                liveWaiting: "Онлайн түз эфир сабагы күтүп турат",
                schedulePending: "График такталып жатат",
                openCourseHint: "Курсту ачып, кийинки сабакты улантыңыз.",
                noUpcomingSession: "Жакынкы сессия азырынча дайындалган жок."
            },
            quickAccess: {
                title: "Ыкчам кирүү",
                description: "Курсту ачып, окууну улантыңыз.",
                liveHint: "Түз эфир сабактары үчүн расписание жана жазуулар бөлүмүн колдонуңуз.",
                offlineHint: "Офлайн сабактар үчүн расписание жана катышуу бөлүмүн ачыңыз.",
                videoHint: "Видео сабактарды токтогон жериңизден уланта аласыз."
            },
            empty: {
                title: "Сизде активдүү курстар жок",
                description: "Жаңы курс кошулганда, бул жерде окуу жол картасыңыз көрүнөт.",
                noResultTitle: "Курс табылган жок",
                noResultDescription: "Издөө сөзүн же фильтрди өзгөртүп көрүңүз."
            }
        },
        schedule: {
            eyebrow: "Жүгүртмө",
            title: "Жүгүртмө",
            heroTitle: "Жүгүртмө жана түз эфир сессиялары",
            emptyHeroDescription: "Жакынкы сабактар, түз эфир убакыттары жана жазуулар ушул жерде көрсөтүлөт.",
            description: "Кийинки сабактарды, кошулуу мүмкүнчүлүгүн жана жазууларды бир экрандан көрүңүз.",
            searchPlaceholder: "Курс, инструктор же жайгашкан жер боюнча издөө",
            offlineNotice: "Офлайн сессия. Келүү убактысын жана жайгашкан жерди алдын ала текшериңиз.",
            metrics: {
                total: "Жалпы",
                upcoming: "Жакынкы",
                live: "Түз эфир",
                offline: "Офлайн"
            },
            filters: {
                allTypes: "Бардык типтер"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн түз эфир"
            },
            statuses: {
                past: "Өтүп кетти"
            },
            fallbacks: {
                session: "Сессия",
                sessionNumber: "Сессия {{number}}",
                course: "Курс",
                classroom: "Класс али дайындала элек",
                unknownTime: "Белгисиз убакыт"
            },
            actions: {
                joinLesson: "Сабакка кошулуу",
                livePanel: "Түз эфир панели"
            },
            live: {
                startsIn: "Башталышына",
                joinOpensSoon: "Кошулуу шилтемеси 10 мүнөт мурун ачылат",
                panelTitle: "Түз эфир сабак барагы",
                sessionPill: "Түз эфир сессиясы",
                remainingTime: "Калган убакыт:",
                focusTitle: "Түз эфир фокусу",
                focusDescription: "Онлайн түз эфир сессияны тандасаңыз, бул жерден кошулуу жана жазуу башкарылат.",
                noSelection: "Азырынча тандалган түз эфир сессиясы жок."
            },
            recordings: {
                title: "Жазуулар",
                count: "Жазуулар: {{count}}",
                fallback: "Жазуу",
                empty: "Азырынча жазуу жок."
            },
            empty: {
                title: "Жакынкы класстар табылган жок",
                description: "Сессиялар пайда болгондо, алар бул жерде топтолуп көрүнөт.",
                noResultTitle: "Сессия табылган жок",
                noResultDescription: "Издөө же фильтрди өзгөртүп көрүңүз."
            }
        },
        certificates: {
            eyebrow: "Сертификаттар",
            title: "Сертификаттар",
            description: "Берилген жана кароодо турган сертификаттарыңыз бир жерде көрсөтүлөт.",
            fallbackCourseTitle: "Курс сертификаты",
            statuses: {
                issued: "Берилди",
                pending: "Кароодо",
                revoked: "Жокко чыгарылды",
                rejected: "Четке кагылды",
                unknown: "Белгисиз"
            },
            metrics: {
                total: "Жалпы",
                issued: "Берилди",
                pending: "Кароодо"
            },
            registry: {
                title: "Сертификат реестри",
                description: "PDF жүктөө же коомдук текшерүү барагын ачуу үчүн сертификатты тандаңыз."
            },
            actions: {
                downloading: "Жүктөлүүдө...",
                downloadPdf: "PDF жүктөө",
                verify: "Текшерүү"
            },
            empty: {
                title: "Сертификаттар азырынча жок",
                description: "Инструктор сертификат бергенден кийин ал ушул жерде көрүнөт. Берилген сертификатты PDF катары жүктөп же текшерүү шилтемесин ача аласыз."
            }
        },
        progress: {
            eyebrow: "Студент прогресси",
            title: "Прогресс жана сертификаттар",
            emptyHeroDescription: "Окуу темпи, жетишкендиктер жана кийинки кадамдар ушул жерде көрсөтүлөт.",
            description: "Чыныгы курс прогрессин, улантуу чекитин жана окуу форматына жараша негизги көрсөткүчтөрдү бул жерден көрүңүз.",
            progress: "Прогресс",
            metrics: {
                averageProgress: "Орточо прогресс",
                activeCourses: "Активдүү курстар",
                completedCourses: "Бүткөн курстар",
                certificates: "Сертификат"
            },
            progressLabels: {
                completed: "Аяктады",
                nearFinish: "Финишке жакын",
                steady: "Туруктуу жүрүүдө",
                needsAttention: "Көңүл буруу керек"
            },
            certificateBadges: {
                ready: "Сертификат даяр",
                pending: "Кароодо",
                rejected: "Четке кагылды",
                revoked: "Жокко чыгарылды"
            },
            lessonKinds: {
                quiz: "Квиз",
                article: "Макала",
                code: "Код",
                video: "Видео"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн түз эфир"
            },
            hero: {
                pill: "Окуу прогресси",
                totalProgress: "жалпы прогресс",
                focusTitle: "Азыркы окуу фокусу",
                focusDescription: "Азыр эң чоң өсүү мүмкүнчүлүгү {{course}} курсунда. Бул жерде {{completed}}/{{total}} сабак бүтүп, жалпы прогресс {{progress}}% болуп турат.",
                courses: "Курстар",
                completedLessons: "Бүткөн сабак",
                certificates: "Сертификат"
            },
            formats: {
                title: "Окуу форматтары",
                description: "Кайсы түрдөгү курстарга катышып жатканыңыз.",
                videoCourses: "Видео курстар",
                sessionCourses: "Сессия курстары",
                attendance: "Катышуу",
                notCalculated: "Эсептелбейт"
            },
            courseCard: {
                lessonCount: "{{completed}}/{{total}} сабак",
                remaining: "{{count}} калган"
            },
            nextAction: {
                title: "Кийинки аракет",
                resumeDescription: "Акыркы токтогон жерден улантыңыз.",
                pickLessonDescription: "Курс кыймылын улантуу үчүн кийинки сабакты тандаңыз.",
                noResumeLesson: "Улантуучу сабак азырынча табылган жок."
            },
            actions: {
                continueLesson: "Улантуу: {{lesson}}",
                downloadPdf: "PDF жүктөө",
                verify: "Текшерүү",
                hide: "Жашыруу",
                expand: "Кеңейтүү"
            },
            stats: {
                completed: "Бүткөн",
                remaining: "Калды",
                sections: "Секция"
            },
            sections: {
                title: "Секциялар жана сабак деталдары",
                completedCount: "{{completed}}/{{total}} сабак бүттү"
            },
            quiz: {
                passed: "Квиз өттү",
                failed: "Квиз өтпөдү"
            },
            lesson: {
                lastTime: "Акыркы убакыт: {{time}}",
                completed: "Бүткөн",
                inProgress: "Жүрүштө"
            },
            certificateReadiness: {
                title: "Сертификат даярдыгы",
                description: "Кайсы курстар финишке жакындап калганын байкаңыз.",
                percentComplete: "{{progress}}% бүткөн",
                ready: "Даяр",
                pending: "Кароодо",
                rejected: "Четке кагылды",
                notReady: "Даяр эмес"
            },
            sessionFormats: {
                title: "Сессия форматындагы окуу",
                description: "Офлайн жана түз эфир курстары үчүн прогресс кошумча уюштуруу иштери менен коштолот.",
                onlineLive: "Онлайн түз эфир",
                onlineLiveDescription: "Бул форматта прогресс менен кошо кошулуу убактысы, сессиялар жана жазуулар маанилүү.",
                offline: "Офлайн",
                offlineDescription: "Офлайн окууда сабакка катышуу, жайгашкан жер жана сессия ресурстары өзүнчө маанилүү бөлүк."
            },
            advanced: {
                eyebrow: "Advanced Progress",
                title: "Активдүүлүк тарыхы жана тренддер",
                description: "Курс активдүүлүгүңүздү жана акыркы окуу кыймылын тереңирээк көрүү үчүн ушул блокту колдонуңуз."
            },
            empty: {
                title: "Азырынча катталган курстар жок",
                description: "Курс кошулганда, бул жерден прогрессти, улантуу чекитин жана сертификат абалын көрөсүз.",
                noLessons: "Бул курс боюнча сабактар табылган жок."
            }
        },
        analytics: {
            eyebrow: "Advanced Progress",
            title: "Тереңирээк прогресс",
            description: "Чыныгы окуу прогрессиңизди, акыркы активдүүлүгүңүздү жана кайсы курста улантуу керек экенин ушул жерден көрүңүз.",
            toasts: {
                loadError: "Студент аналитикасын жүктөө мүмкүн болбоду."
            },
            context: {
                title: "Учурдагы контекст",
                description: "Тереңирээк прогресс учурда тандалган курс чыпкасы менен шайкеш иштейт.",
                courseFilterActive: "Курс чыпкасы активдүү"
            },
            filters: {
                title: "Мезгил фильтри",
                description: "Көрсөткүчтөрдү белгилүү күн аралыгы боюнча чыпкалоо.",
                fromPlaceholder: "Башталган күнү",
                toPlaceholder: "Аяктаган күнү"
            },
            metrics: {
                enrolledCourses: "Катышкан курстар",
                completedCourses: "Аякталган курстар",
                completedLessons: "Аякталган сабактар",
                averageProgress: "Орточо прогресс"
            },
            continueLearning: {
                title: "Окууну улантуу",
                subtitle: "Акыркы активдүү курс жана сабак"
            },
            courseProgress: {
                title: "Курстар боюнча прогресс",
                subtitle: "Катышып жаткан курстар жана алардын абалы",
                enrolledAt: "Катышкан күнү: {{date}}",
                emptyTitle: "Азырынча курстар жок",
                emptySubtitle: "Биринчи курсуңузду баштоо үчүн каталогду караңыз"
            },
            recentActivity: {
                title: "Акыркы активдүүлүк",
                subtitle: "Сиздин акыркы окуу аракеттериңиз",
                emptyTitle: "Активдүүлүк жок",
                emptySubtitle: "Азырынча аракеттериңиз жок"
            },
            charts: {
                courseProgressTitle: "Курс прогресс көрүнүшү",
                courseProgressSubtitle: "Катышкан курстардагы реалдуу прогрессиңиз",
                activityDistributionTitle: "Активдүүлүк бөлүштүрүлүшү",
                activityDistributionSubtitle: "Акыркы аракеттериңиз кайсы типке көбүрөөк туура келет"
            },
            workspaceLink: {
                title: "Студент иш аймагы менен байланыш",
                description: "Бул аналитика негизги студент панелиндеги окуу багытын деталдайт: кайсы курста улантуу, кайсы мезгилде активдүүлүк төмөндөдү жана жалпы прогресс эмнеден турат.",
                coursesTitle: "Курстар",
                coursesDescription: "Панель көрсөткөн жалпы прогресстин кайсы курстардан турганын бул жерде бөлүп көрөсүз.",
                timeTitle: "Убакыт",
                timeDescription: "Акыркы аракеттер жана мезгил фильтри окуу темпи качан өзгөргөнүн көрсөтөт.",
                progressTitle: "Прогресс",
                progressDescription: "Орточо көрсөткүчтөн тышкары конкреттүү курс, сабак жана активдүүлүк деталдары ачылат."
            },
            activityTypes: {
                lesson: "Сабак",
                quiz: "Квиз",
                course: "Курс",
                other: "Башка"
            },
            actions: {
                continueLearning: "Окууну улантуу",
                continue: "Улантуу",
                viewCourses: "Курстарды көрүү"
            },
            fallbacks: {
                courseWithId: "Курс #{{id}}",
                unknownDate: "Белгисиз",
                unknownTime: "Белгисиз убакыт",
                activity: "Активдүүлүк"
            }
        },
        chat: {
            sidebarTitle: "Сүйлөшүүлөр",
            sidebarDescription: "Инструкторлор менен болгон активдүү чаттарыңызды ушул жерден башкарыңыз.",
            composerPlaceholder: "Баарлашууну баштаңыз",
            chatAriaLabel: "{{instructor}} - {{course}} чаты",
            fileFallback: "📎 {{type}} жөнөтүлдү",
            fileTypes: {
                image: "Сүрөт",
                file: "Файл"
            },
            actions: {
                newChat: "Жаңы чат",
                close: "Жабуу",
                sending: "Жөнөтүлүүдө...",
                openChat: "Чат ачуу"
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
                instructor: "Инструктор",
                course: "Курс"
            },
            empty: {
                noChatsTitle: "Чат табылган жок",
                noChatsSubtitle: "Жаңы чат ачып көрүңүз же издөө суроосун өзгөртүңүз.",
                selectionTitle: "Сүйлөшүү тандалган жок",
                selectionSubtitle: "Сол жактагы тизмеден инструкторду тандасаңыз, баарлашуу ушул жерде ачылат.",
                noCourses: "Курстар табылган жок."
            },
            modal: {
                title: "Инструктор менен чат ачуу",
                description: "Курсту тандап, биринчи билдирүү жазыңыз.",
                messageLabel: "Билдирүү",
                messagePlaceholder: "Салам! Суроом бар..."
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
                loadChatsError: "Чатты жүктөө мүмкүн болбоду.",
                loadMessagesError: "Баарлашууну жүктөө мүмкүн болбоду.",
                createWithReason: "Чатты түзүү мүмкүн болбоду: {{reason}}",
                sendError: "Билдирүүнү жөнөтүү мүмкүн болбоду.",
                fileWithReason: "Файлды жөнөтүү мүмкүн болбоду: {{reason}}",
                fileUploadError: "Файлды жүктөө мүмкүн болбоду.",
                loadCoursesError: "Курстарды жүктөө мүмкүн болбоду.",
                selectCourse: "Курс тандаңыз.",
                writeMessage: "Билдирүү жазыңыз.",
                noInstructor: "Инструктор маалыматы жок.",
                createError: "Чатты түзүү мүмкүн болбоду."
            }
        },
        tasks: {
            eyebrow: "Студент тапшырмалары",
            title: "Тапшырмалар иш мейкиндиги",
            description: "Тапшырмалардын абалын көрүңүз, мөөнөттөрдү байкаңыз жана жоопторду ушул эле жерден жөнөтүңүз.",
            searchPlaceholder: "Тапшырма же курс боюнча издөө",
            metrics: {
                total: "Жалпы",
                pending: "Күтүүдө",
                overdue: "Мөөнөт өттү",
                needsRevision: "Оңдотуу керек",
                submitted: "Текшерилип жатат",
                approved: "Бекитилди"
            },
            filters: {
                attention: "Иш-аракет керек",
                allStatuses: "Бардык статустар",
                allCourses: "Бардык курстар",
                submitted: "Жөнөтүлгөн",
                closed: "Жабылган"
            },
            statuses: {
                overdue: "Мөөнөт өттү",
                pending: "Күтүүдө",
                submitted: "Жөнөтүлдү",
                needsRevision: "Оңдотуу керек",
                rejected: "Кайтарылды",
                completed: "Бекитилди",
                unavailable: "Туташкан эмес"
            },
            activityTypes: {
                discussion: "Талкуу",
                exercise: "Көнүгүү",
                quiz: "Квиз",
                groupWork: "Топтук иш",
                work: "Иш"
            },
            reviewStatuses: {
                submitted: "Текшерилип жатат",
                approved: "Бекитилди",
                needsRevision: "Оңдотуу керек",
                rejected: "Кайтарылды"
            },
            fallbacks: {
                noDueDate: "Мөөнөт көрсөтүлгөн эмес",
                course: "Белгисиз курс",
                taskTitle: "Тапшырма",
                description: "Тапшырма сүрөттөмөсү азырынча берилген эмес."
            },
            submissionTypes: {
                attachment: "Файл же шилтеме тиркелген",
                text: "Текст жооп",
                answer: "Жооп берилген"
            },
            thread: {
                student: "Сиз",
                teacher: "Инструктор",
                answer: "Жооп",
                previousExchanges: "Мурунку алмашуулар"
            },
            validation: {
                activityFileType: "Активдүүлүк үчүн PDF же Word файлын тандаңыз.",
                homeworkFileType: "Тапшырма үчүн PDF же Word файлын тандаңыз.",
                fileTooLarge: "Файл өтө чоң. Максималдуу көлөм {{size}}."
            },
            toasts: {
                activitySubmitUnavailable: "Бул иш үчүн submit жеткиликтүү эмес.",
                homeworkSubmitUnavailable: "Бул тапшырма үчүн submit жеткиликтүү эмес.",
                addAnswerLinkOrFile: "Жооп, шилтеме же файл кошуңуз.",
                activitySubmitted: "Иш ийгиликтүү жөнөтүлдү.",
                homeworkSubmitted: "Тапшырма ийгиликтүү жөнөтүлдү.",
                activitySubmitError: "Ишти жөнөтүү мүмкүн болбоду.",
                homeworkSubmitError: "Тапшырманы жөнөтүү мүмкүн болбоду.",
                unsupportedAttachment: "Файл түрү колдоого алынбайт. PDF же Word колдонуңуз.",
                fileTooLarge: "Файл өтө чоң. Максималдуу көлөм 20 MB.",
                openAttachmentError: "Тиркемени ачуу мүмкүн болбоду."
            },
            review: {
                currentResult: "Учурдагы жыйынтык",
                score: "Баа: {{score}}",
                reviewedAt: "Текшерилген: {{date}}"
            },
            submission: {
                latest: "Акыркы жооп",
                submittedAt: "Тапшырылган убакыт: {{date}}"
            },
            quiz: {
                passedTitle: "Квиз ийгиликтүү тапшырылды",
                completedTitle: "Квиз аяктады",
                passedDescription: "Жыйынтык жакшы. Бул квиз жабылды.",
                retryDescription: "Жыйынтык жетишсиз. Кайра аракет кылсаңыз болот.",
                closedDescription: "Квиз жабылды. Жыйынтык ушул бойдон сакталды.",
                result: "Натыйжа",
                passed: "Өттү",
                failed: "Өткөн жок"
            },
            submitPanel: {
                retakeQuizTitle: "Квизди кайра тапшыруу",
                startQuizTitle: "Квизди баштоо",
                resubmitTitle: "Жоопту кайра жөнөтүү",
                updateTitle: "Жаңыртуу керек болсо кайра жөнөтүңүз",
                submitTitle: "Жооп жөнөтүү",
                retakeQuizDescription: "Мурунку жыйынтык жаңыланып, акыркы аракет сакталат.",
                startQuizDescription: "Суроолорго жооп берип, квизди ошол замат жөнөтүңүз.",
                resubmitDescription: "Инструктордин пикирин эске алып, жаңыртылган жоопту жибериңиз.",
                updateDescription: "Тапшырма текшерилип жатат. Зарыл болсо жоопту жаңыртып кайра жибере аласыз.",
                submitDescription: "Текст, шилтеме же файл кошуп тапшырыңыз."
            },
            actions: {
                collapse: "Жыйуу",
                reopen: "Кайра ачуу",
                start: "Баштоо",
                answer: "Жооп берүү",
                openAttachment: "Тиркемени ачуу",
                removeAttachment: "Тиркемени алып салуу",
                replaceFile: "Алмаштыруу",
                chooseFile: "Файл тандоо",
                uploadingFile: "Файл жүктөлүүдө...",
                submittingTask: "Тапшырма жөнөтүлүүдө...",
                submitting: "Жөнөтүлүүдө...",
                retake: "Кайра тапшыруу",
                startQuiz: "Квизди баштоо",
                submit: "Жөнөтүү",
                download: "Жүктөп алуу"
            },
            fields: {
                answerPlaceholder: "Жооп жазыңыз",
                linkPlaceholder: "Шилтеме кошуу",
                filePlaceholder: "PDF же Word кошуу"
            },
            draftStatus: {
                uploading: "Тиркеме жүктөлүп жатат. Баракты жаппаңыз.",
                submitting: "Жооп жөнөтүлүп жатат. Натыйжа ушул тапшырманын жанында жаңыртылат.",
                unsaved: "Сакталбаган жооп бар. Жөнөтүү баскычы басылмайынча инструкторго көрүнбөйт.",
                empty: "Жооп даярдала элек. Текст, шилтеме, файл же квиз жообун кошуңуз."
            },
            help: {
                retakeQuiz: "Жоопторду жаңыртып, квизди кайра тапшырыңыз.",
                startQuiz: "Ар бир суроого жооп берип, квизди жөнөтүңүз.",
                answerRequired: "Жооп, шилтеме же файлдын кеминде бири талап кылынат."
            },
            closedHints: {
                retakeQuiz: "Басып, квизди кайра тапшырыңыз",
                startQuiz: "Басып, квизди баштаңыз",
                resubmit: "Басып, оңдолгон жоопту кайра жөнөтүңүз",
                submit: "Басып, тапшырманы тез тапшырыңыз"
            },
            unavailable: {
                title: "Submit туташкан эмес",
                description: "Бул тапшырма үчүн API аркылуу түз жөнөтүү азырынча жеткиликтүү эмес."
            },
            empty: {
                noResultTitle: "Натыйжа табылган жок",
                noResultDescription: "Фильтрлерди өзгөртүп көрүңүз же издөө талаасын тазалаңыз."
            },
            preview: {
                attachment: "Тиркеме",
                attachmentTitle: "{{title}} — Тиркеме",
                unavailable: "Алдын ала көрүү жеткиликтүү эмес.",
                directViewUnavailable: "Бул файлды браузерде түз көрүү жеткиликтүү эмес."
            }
        },
        resources: {
            eyebrow: "Студент ресурстары",
            title: "Ресурстар",
            sessionTitle: "Сессия ресурстары",
            emptyHeroDescription: "Сессия материалдары, жазуулар жана түз эфирге кошулуу маалыматтары ушул жерге чогулат.",
            description: "Инструктор бөлүшкөн материалдарды, сабак жазууларын жана кошулуу маалыматтарын бир жерден табыңыз.",
            searchPlaceholder: "Сессия, курс же материал боюнча издөө",
            recordingTitle: "{{title}} — Жазуу",
            metrics: {
                sessions: "Сессиялар",
                materials: "Материалдар",
                recordings: "Жазуулар",
                live: "Түз эфир"
            },
            filters: {
                allTypes: "Бардык типтер"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн түз эфир"
            },
            statuses: {
                completed: "Жабылды"
            },
            fallbacks: {
                course: "Курс",
                resource: "Ресурс",
                unknownTime: "Белгисиз убакыт"
            },
            empty: {
                title: "Азырынча ресурс жок",
                description: "Материалдар же жазуулар кошулганда, алар бул жерде көрүнөт.",
                noResultTitle: "Ресурс табылган жок",
                noResultDescription: "Издөө же фильтрди өзгөртүп көрүңүз."
            },
            selectSession: {
                title: "Сессияны тандаңыз",
                description: "Бир сессияны тандап, анын материалдарын жана жазууларын көрүңүз."
            },
            quickActions: {
                title: "Тез аракеттер",
                description: "Бул сессияга тиешелүү негизги шилтемелер.",
                empty: "Азырынча түз аракет жок."
            },
            actions: {
                joinLesson: "Сабакка кошулуу",
                viewRecording: "Жазууну көрүү",
                openTasks: "Тапшырмалардан ачуу",
                download: "Жүктөп алуу"
            },
            materials: {
                title: "Материалдар",
                available: "{{count}} материал жеткиликтүү",
                emptyDescription: "Бул сессияга материал азырынча кошулган эмес",
                empty: "Бул сессия үчүн материал азырынча жок."
            },
            materialTypes: {
                video: "Видео",
                image: "Сүрөт",
                file: "Файл",
                link: "Шилтеме"
            },
            recordingContext: {
                title: "Жазуу жана контекст",
                description: "Жазуулар жана логистикалык маалымат.",
                lessonRecording: "Сабактын жазуусу",
                noRecording: "Жазуу азырынча жок.",
                offlineMeeting: "Офлайн жолугушуу",
                noLocation: "Жайгашкан жер али көрсөтүлгөн эмес."
            },
            activityTypes: {
                discussion: "Талкуу",
                exercise: "Көнүгүү",
                quiz: "Квиз",
                groupWork: "Топтук иш"
            },
            activityStatuses: {
                planned: "Пландалды",
                active: "Жүрүп жатат",
                done: "Аяктады"
            },
            activities: {
                title: "Сессиядагы иштер",
                description: "Инструктор ушул сессия үчүн белгилеген иштер. Контекст бул жерде көрүнөт, аткаруу болсо `Тапшырмалар` бөлүмүндө жүрөт.",
                notice: "Бул бөлүмдө сессия иштери көрүнөт. Аткарыла турган quiz жана башка иштер `Тапшырмалар` бөлүмүндө ачылат.",
                questionCount: "{{count}} суроо",
                answersInTasks: "Жооптор `Тапшырмалар` бөлүмүндө ачылат",
                questionLabel: "Суроо #{{number}}",
                moreQuestions: "Дагы {{count}} суроо бар. Толук аткаруу үчүн `Тапшырмалар` бөлүмүнө өтүңүз.",
                openInTasksHint: "Бул ишти аткаруу үчүн `Тапшырмалар` бөлүмүнө өтүңүз.",
                closedHint: "Бул иш жабык. Эгер жообуңуз же натыйжаңыз болсо, ал `Тапшырмалар` бөлүмүндө көрүнөт.",
                empty: "Бул сессия үчүн өзүнчө иштер азырынча кошулган эмес."
            },
            preview: {
                unavailable: "Алдын ала көрүү жеткиликтүү эмес.",
                videoUnsupported: "Сиздин браузер видеону колдобойт.",
                directViewUnavailable: "Бул файлды браузерде түз көрүү жеткиликтүү эмес."
            },
            toasts: {
                openMaterialError: "Материалды ачуу мүмкүн болбоду.",
                openRecordingError: "Жазууну ачуу мүмкүн болбоду."
            }
        }
    }
};
