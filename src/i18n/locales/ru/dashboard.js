export const dashboard = {
    dashboardSidebar: {
        collapse: "Свернуть меню",
        expand: "Меню",
        navigationMenu: "Навигационное меню панели",
        sections: "Разделы панели",
        categories: {
            primary: "Основные функции",
            secondary: "Управление обучением",
            progress: "Прогресс обучения",
            personal: "Личное управление",
            content: "Управление контентом",
            users: "Управление пользователями",
            analytics: "Аналитика и статистика",
            admin: "Управление системой",
            other: "Другое"
        }
    },
    dashboardLayout: {
        contentAria: "Содержимое панели {{role}}"
    },
    dashboardTabs: {
        sections: "Разделы панели",
        more: "Еще",
        moreOptions: "Дополнительные разделы",
        labels: {
            overview: "Главная",
            courses: "Курсы",
            "my-courses": "Мои",
            resources: "Файлы",
            students: "Студенты",
            enrollments: "Запись",
            analytics: "Аналитика",
            ai: "AI",
            attendance: "Посещаемость",
            homework: "Задания",
            profile: "Профиль",
            schedule: "График",
            tasks: "Задания",
            progress: "Прогресс",
            notifications: "Увед.",
            chat: "Чат",
            leaderboard: "Рейтинг",
            sessions: "Сессии",
            offerings: "Потоки",
            certificates: "Сертификаты",
            groups: "Группы",
            stats: "Статистика",
            users: "Пользователи",
            companies: "Компании",
            contacts: "Контакты",
            "ai-prompts": "AI",
            integration: "Интеграция",
            domain: "Домен",
            billing: "Биллинг",
            crm: "CRM",
            members: "Участ.",
            branding: "Бренд",
            settings: "Настройки",
            flags: "Флаги",
            activity: "Активность"
        }
    },
    dashboardErrorStates: {
        actions: {
            retry: "Повторить",
            home: "На главную",
            back: "Назад",
            contactAdmin: "Связаться с администратором",
            report: "Отправить ошибку",
            refreshPage: "Обновить страницу"
        },
        general: {
            title: "Произошла ошибка",
            message: "При загрузке данных произошла ошибка. Повторите попытку.",
            unknown: "Произошла неизвестная ошибка"
        },
        network: {
            title: "Ошибка соединения",
            message: "Нет интернет-соединения или сервер недоступен. Проверьте подключение и повторите попытку."
        },
        permission: {
            title: "Доступ запрещен",
            message: "У вас недостаточно прав для доступа к этому разделу.",
            roleRequired: "Для доступа к этому разделу требуется роль \"{{role}}\".",
            contactAdmin: "Свяжитесь с администратором."
        },
        notFound: {
            resource: "Данные",
            title: "{{resource}} не найдены",
            message: "{{resource}} не существуют в системе или были удалены. Проверьте критерии поиска или перейдите в другой раздел."
        },
        server: {
            title: "Ошибка сервера",
            message: "На сервере произошла неожиданная ошибка. Мы знаем о проблеме и работаем над ее решением. Повторите попытку позже."
        },
        boundary: {
            title: "Ошибка приложения",
            message: "В приложении произошла неожиданная ошибка. Попробуйте обновить страницу.",
            details: "Детали ошибки (только в режиме разработки)"
        }
    },
    dashboardLoaders: {
        imageLoading: "Изображение загружается",
        progress: "Прогресс загрузки"
    },
    dashboardHeader: {
        roles: {
            instructor: "Панель инструктора",
            student: "Панель студента",
            admin: "Панель администратора",
            assistant: "Панель ассистента",
            default: "Панель"
        },
        descriptions: {
            instructor: "Управляйте курсами, сессиями и активностью студентов в одном месте.",
            student: "Отслеживайте прогресс обучения и быстро возвращайтесь к важным заданиям.",
            admin: "Контролируйте операционное состояние платформы и ключевые процессы управления.",
            assistant: "Поддерживайте инструкторов и ускоряйте ежедневные операции.",
            default: "Функции панели"
        },
        chips: {
            workspace: "Панель EduBot",
            liveShell: "Живая панель"
        }
    },
    floatingActionButton: {
        menu: "Меню быстрых действий",
        quickActions: "Быстрые действия",
        toggle: "Открыть или закрыть меню быстрых действий",
        actions: {
            createCourse: "Новый курс",
            addStudent: "Добавить студента",
            createSession: "Сессия в прямом эфире",
            joinCourse: "Присоединиться к курсу",
            askQuestion: "Задать вопрос",
            addUser: "Добавить пользователя",
            createCompany: "Создать компанию",
            viewAnalytics: "Аналитика"
        }
    },
    studentAccessFallback: {
        title: "Доступ к обучению не активен",
        description: "У вас пока нет активной записи. Свяжитесь с менеджером или администратором.",
        latestEnrollment: "Последняя запись: {{course}} · {{status}}",
        courseFallback: "Курс",
        actions: {
            viewCourses: "Посмотреть курсы",
            loginOther: "Войти с другим аккаунтом"
        }
    },
    assistantDashboard: {
        nav: {
            overview: "Обзор",
            enrollments: "Студенты",
            courses: "Курсы",
            attendance: "Посещаемость"
        },
        workspaceGroups: {
            dailyActions: "Ежедневные действия",
            referenceViews: "Справочные разделы"
        },
        header: {
            userFallback: "Ассистент",
            hideMenu: "Скрыть меню",
            showMenu: "Показать меню",
            defaultSubtitle: "Помогайте инструкторам с ежедневной работой по студентам и курсам."
        },
        metrics: {
            totalStudents: "Всего студентов",
            enrolledStudents: "Записанные студенты",
            publishedCourses: "Опубликованные курсы",
            courses: "Курсы"
        },
        toasts: {
            loadFailed: "Не удалось загрузить данные панели."
        },
        pagination: {
            previous: "Предыдущая",
            next: "Следующая"
        },
        overview: {
            eyebrow: "Обзор ассистента",
            title: "Обзор ассистента",
            description: "Сигналы для ежедневных решений по записи студентов и нагрузке курсов.",
            metrics: {
                studentsWithoutCourse: "Нужен курс",
                emptyCourses: "Пустые курсы",
                highLoadCourses: "Курсы с высокой нагрузкой"
            },
            workflow: {
                title: "Очередь работы",
                description: "Задачи студентов и курсов в основном приложении."
            },
            scope: {
                label: "Область",
                title: "Рабочая область основного приложения",
                description: "Приватные курсы тенантов и данные компаний обрабатываются в панелях тенантов, а не здесь."
            },
            signal: {
                label: "Сигнал решения",
                studentsNeedCourse: "{{count}} студенту нужен курс",
                highLoadCourses: "В {{count}} курсе высокая нагрузка",
                emptyCourses: "{{count}} пустой курс",
                description: "Этот сигнал рассчитывается по открытому списку студентов и нагрузке курсов на этой странице."
            },
            nextSteps: {
                title: "Следующий шаг",
                description: "Быстрая навигация для ежедневной работы.",
                students: {
                    title: "1. Проверьте студентов",
                    text: "Посмотрите студентов, ожидающих записи, во вкладке Студенты."
                },
                courses: {
                    title: "2. Сравните курсы",
                    text: "Во вкладке Курсы проверьте нагрузку по каждому курсу."
                },
                attendance: {
                    title: "3. Обновите посещаемость",
                    text: "В день занятия используйте вкладку Посещаемость для ежедневных отметок."
                }
            }
        },
        attendance: {
            title: "Раздел посещаемости",
            description: "Посещаемость остается в общем домене посещаемости; эта вкладка дает ассистенту нужный контекст.",
            decisionReason: "Посещаемость ассистента остается в общем разделе посещаемости и отделяется только если ассистентам нужен отдельный процесс посещаемости."
        },
        courses: {
            eyebrow: "Курсы ассистента",
            title: "Информация о курсах",
            description: "Опубликованные курсы компании и нагрузка студентов."
        },
        courseStats: {
            title: "Нагрузка курсов",
            description: "Распределение студентов по курсам компании.",
            fallbackDescription: "Активный курс компании",
            studentCount: "{{count}} студент",
            empty: {
                title: "Курс не найден",
                subtitle: "Опубликованные курсы, доступные компании, появятся здесь."
            },
            signals: {
                empty: {
                    label: "Ожидает записи",
                    hint: "Этот курс пока пустой. Начните запись во вкладке Студенты."
                },
                highLoad: {
                    label: "Высокая нагрузка",
                    hint: "Записано много студентов. Внимательно следите за группами и посещаемостью."
                },
                active: {
                    label: "Активный",
                    hint: "На курс записаны студенты."
                }
            },
            courseTypes: {
                offline: "Офлайн",
                onlineLive: "Онлайн в прямом эфире",
                video: "Видеокурс"
            }
        },
        students: {
            hero: {
                eyebrow: "Раздел ассистента",
                title: "Процесс записи студентов",
                description: "Просматривайте студентов компании и быстро записывайте или удаляйте их из доступных курсов."
            },
            searchPlaceholder: "Искать студента по имени или email...",
            searchTooShortHelp: "Введите минимум 3 символа для поиска.",
            list: {
                title: "Список студентов",
                description: "Проверяйте активные курсы каждого студента, выбирайте новый курс и запускайте действия записи."
            },
            empty: {
                searchTooShort: {
                    title: "Недостаточно данных для поиска",
                    subtitle: "Введите минимум 3 символа, чтобы показать результаты."
                },
                noSearchResults: {
                    title: "Подходящий студент не найден",
                    subtitle: "Попробуйте изменить имя, email или контекст фильтра."
                },
                noCourses: {
                    title: "Нет опубликованного курса для записи",
                    subtitle: "Когда курсы будут опубликованы, ассистент сможет записывать студентов здесь."
                },
                noStudents: {
                    title: "Нет назначенных студентов",
                    subtitle: "Студенты, назначенные компании, появятся здесь."
                }
            },
            unenrollAria: "Удалить студента {{student}} из курса {{course}}",
            unenrollTitle: "Удалить из курса",
            unenrolling: "Удаление...",
            unenroll: "Удалить",
            noEnrolledCourse: "Нет записанного курса",
            courseSelectLabel: "Курс для записи",
            courseSelectPlaceholder: "-- Выбрать --",
            selectedCourse: "Выбран: {{course}}",
            allCoursesEnrolled: "Записан на все курсы",
            enrolling: "Запись...",
            enroll: "Записать"
        },
        enrollment: {
            confirmAction: "Да",
            courseFallback: "курс",
            confirmEnroll: "Записать <strong>{{student}}</strong> на курс <strong>{{course}}</strong>?",
            enrollPending: "Идет запись {{student}} на курс \"{{course}}\".",
            enrollSuccessToast: "<strong>{{student}}</strong> успешно записан на курс.",
            enrollSuccessFeedback: "{{student}} записан на курс \"{{course}}\".",
            enrollErrorToast: "Не удалось записать на курс.",
            enrollErrorFeedback: "Не удалось записать {{student}} на курс \"{{course}}\".",
            confirmUnenroll: "Удалить <strong>{{student}}</strong> из курса <strong>{{course}}</strong>?",
            unenrollPending: "Идет удаление {{student}} из курса \"{{course}}\".",
            unenrollSuccessToast: "<strong>{{student}}</strong> удален из курса.",
            unenrollSuccessFeedback: "{{student}} удален из курса \"{{course}}\".",
            unenrollErrorToast: "Не удалось удалить из курса.",
            unenrollErrorFeedback: "Не удалось удалить {{student}} из курса \"{{course}}\"."
        }
    },
    assistantPanel: {
        empty: {
            noQuestions: "В этом чате пока нет вопросов. Напишите первый вопрос."
        },
        toasts: {
            messagesLoadFailed: "Не удалось загрузить сообщения.",
            chatCreated: "Новый чат создан.",
            chatCreateFailed: "Не удалось создать чат.",
            chatsLoadFailed: "Не удалось загрузить чаты.",
            chatDeleted: "Чат удален.",
            chatDeleteFailed: "Не удалось удалить чат.",
            sendFailed: "Не удалось отправить вопрос."
        },
        actions: {
            openMenu: "Открыть меню чата",
            newChat: "Новый чат",
            deleteChat: "Удалить чат"
        },
        hero: {
            eyebrow: "EDU",
            brand: "EDU",
            titleSuffix: "AI ассистент",
            description: "Наш AI ассистент помогает быстрее находить ответы, учиться эффективнее и расти каждый день."
        },
        chat: {
            label: "Чат: {{title}}",
            untitled: "Без названия",
            greeting: "Здравствуйте. Чем помочь?"
        },
        prompts: {
            title: "Быстрые подсказки"
        },
        input: {
            placeholder: "Напишите вопрос здесь...",
            attachFile: "Прикрепить файл",
            voiceInputSoon: "Голосовой ввод (скоро)",
            sending: "Отправка...",
            send: "Отправить"
        },
        deleteModal: {
            title: "Удалить чат",
            message: "Вы уверены, что хотите удалить текущий чат?",
            confirm: "Удалить"
        }
    }
};
