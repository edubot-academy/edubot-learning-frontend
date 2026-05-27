export const admin = {
    adminPanel: {
        subtitle: "Управление и мониторинг платформы",
        hideMenu: "Скрыть меню",
        showMenu: "Показать меню",
        workspaceSection: "Раздел администратора",
        workspaceGroups: {
            governance: "Управление платформой",
            contentOperations: "Контентные операции",
            technicalOperations: "Технические операции"
        },
        tabs: {
            stats: "Статистика",
            courses: "Курсы и категории",
            pending: "Одобрение новых курсов",
            certificates: "Сертификаты",
            users: "Пользователи",
            companies: "Компании",
            contacts: "Контакты",
            analytics: "Аналитика",
            aiPrompts: "AI-промпты",
            aiLms: "Настройки AI LMS",
            skills: "Навыки",
            notifications: "Уведомления",
            integration: "Интеграции",
            attendance: "Посещаемость"
        },
        status: {
            statsUpdating: "Статистика обновляется",
            aiPromptsLoading: "AI-промпты загружаются",
            transcodeRunning: "Идет транскодирование",
            sectionOpened: "Открыт раздел {{section}}",
            sectionFallback: "Раздел"
        },
        notifications: {
            markReadSuccess: "Уведомление отмечено как прочитанное.",
            markReadError: "Не удалось отметить уведомление как прочитанное.",
            deleteTitle: "Удалить уведомление",
            deleteMessage: "Удалить это уведомление?",
            deleteConfirm: "Удалить",
            deleteSuccess: "Уведомление удалено.",
            deleteError: "Не удалось удалить уведомление."
        }
    },
    adminAnalytics: {
        hero: {
            eyebrow: "Обзор аналитики",
            title: "Административная аналитика",
            description: "Обзор платформы: метрики пользователей, эффективность курсов и данные по выручке."
        },
        actions: {
            refresh: "Обновить",
            loading: "Загрузка..."
        },
        toasts: {
            loadError: "Не удалось загрузить аналитику."
        },
        metrics: {
            totalUsers: "Все пользователи",
            students: "Студенты",
            courses: "Курсы",
            enrollments: "Записи"
        },
        filters: {
            from: "С даты",
            to: "По дату",
            status: "Состояние фильтра",
            rangeSelected: "Выбран диапазон дат",
            allTime: "Все время"
        },
        courseAnalytics: {
            title: "Аналитика курсов",
            description: "Сравните самые сильные курсы и курсы, требующие внимания, в одном компактном блоке.",
            metrics: {
                topCourses: "Лучшие курсы",
                riskCourses: "Рискованные курсы"
            },
            topCourses: {
                title: "Лучшие курсы",
                subtitle: "Курсы с самым высоким участием студентов"
            },
            lowPerforming: {
                title: "Курсы, требующие внимания",
                subtitle: "Курсы с низким завершением и средним прогрессом"
            }
        },
        trends: {
            title: "Отчет по трендам",
            description: "Просматривайте динамику записей и выручки во времени.",
            metrics: {
                enrollmentPoints: "Точки записей",
                revenuePoints: "Точки выручки"
            },
            enrollments: {
                title: "Тренды записей",
                subtitle: "Записи студентов во времени"
            },
            revenue: {
                title: "Тренды выручки",
                subtitle: "Выручка платформы во времени"
            }
        },
        columns: {
            course: "Курс",
            enrollments: "Записи",
            completionRate: "Уровень завершения",
            averageProgress: "Средний прогресс"
        },
        fallbacks: {
            courseWithId: "Курс #{{id}}"
        }
    },
    adminContacts: {
        eyebrow: "Входящие",
        title: "Контакты",
        description: "Просматривайте обращения пользователей и отмечайте обработанные.",
        metrics: {
            total: "Все сообщения",
            unread: "Непрочитанные",
            withMessage: "С полным сообщением"
        },
        inbox: {
            title: "Входящие сообщения",
            description: "Вопросы, полученные через формы и каналы связи."
        },
        status: {
            read: "Прочитано",
            new: "Новое"
        },
        actions: {
            markRead: "Отметить как прочитанное",
            delete: "Удалить"
        },
        empty: {
            title: "Контакты не найдены",
            subtitle: "Сообщений от контактов пока нет."
        },
        toasts: {
            loadError: "Не удалось загрузить контактные сообщения."
        }
    },
    adminStats: {
        currency: {
            kgs: "{{amount}} сом"
        },
        hero: {
            eyebrow: "Последние 7 дней",
            title: "Статистика платформы",
            description: "Общие показатели, активность, выручка и тренды роста."
        },
        actions: {
            refresh: "Обновить"
        },
        metrics: {
            students: "Студенты",
            courses: "Курсы",
            publishedCourses: "Опубликованные курсы",
            totalEnrollments: "Всего записей",
            activeEnrollments: "Активные записи",
            totalRevenue: "Общая выручка",
            last30Days: "Последние 30 дней",
            last7Days: "Последние 7 дней",
            courseCompletion: "Завершение курсов",
            activeStudents: "Активные студенты"
        },
        trends: {
            eyebrow: "Срез трендов",
            title: "Тренды",
            description: "Краткосрочные изменения роста и вовлеченности.",
            dailySignups: "Ежедневные регистрации (студенты)",
            dailyEnrollments: "Ежедневные записи",
            period7d: "7 дней"
        },
        topCourses: {
            eyebrow: "Рейтинг курсов",
            title: "Самые активные и прибыльные курсы",
            table: {
                course: "Курс",
                enrollments: "Записи",
                active7d: "Активные (7д)",
                completion: "Завершение",
                revenue: "Выручка"
            },
            empty: "Популярных курсов пока нет."
        },
        toasts: {
            loadError: "Не удалось загрузить статистику."
        }
    },
    adminSkills: {
        eyebrow: "Каталог навыков",
        title: "Навыки",
        description: "Управляйте навыками, используемыми в данных курсов и талантов.",
        metrics: {
            total: "Все навыки",
            initials: "Сгруппированные первые буквы",
            editMode: "В режиме редактирования"
        },
        create: {
            title: "Новый навык",
            description: "Используйте короткое стандартизированное название.",
            placeholder: "Название нового навыка"
        },
        list: {
            title: "Список навыков",
            description: "Все активные навыки."
        },
        actions: {
            add: "Добавить",
            delete: "Удалить"
        },
        empty: {
            title: "Навыков нет",
            subtitle: "Каталог навыков пока пуст."
        },
        confirm: {
            deleteTitle: "Удалить навык",
            deleteMessage: "Удалить этот навык?"
        },
        toasts: {
            loadError: "Не удалось загрузить навыки.",
            created: "Навык создан.",
            createError: "Не удалось создать навык.",
            updated: "Навык обновлен.",
            updateError: "Не удалось обновить навык.",
            deleted: "Навык удален.",
            deleteError: "Не удалось удалить навык."
        }
    },
    adminPendingCourses: {
        eyebrow: "Очередь одобрения",
        title: "Курсы на проверке",
        description: "Проверяйте новые курсы, отправленные инструкторами, и одобряйте или отклоняйте их.",
        metrics: {
            pending: "Курсы в ожидании",
            instructors: "Инструкторы",
            paid: "Платные",
            newest: "Последний: {{date}}"
        },
        queue: {
            title: "Список одобрения",
            description: "Проверьте тип, цену, инструктора и ссылку предпросмотра для каждого курса."
        },
        courseTypes: {
            offline: "Офлайн",
            onlineLive: "Онлайн вживую",
            video: "Видео"
        },
        status: {
            pending: "На проверке",
            pendingApproval: "Ожидает одобрения"
        },
        actions: {
            details: "Детали",
            preview: "Предпросмотр",
            approve: "Одобрить",
            reject: "Отклонить"
        },
        fields: {
            price: "Цена",
            createdAt: "Создан",
            status: "Статус"
        },
        empty: {
            title: "Нет курсов на проверке",
            subtitle: "Сейчас нет курсов, ожидающих одобрения."
        },
        confirm: {
            approveTitle: "Одобрить курс",
            approveMessage: "Одобрить \"{{title}}\"? После одобрения курс может стать доступен студентам и каталогам.",
            rejectTitle: "Отклонить курс",
            rejectMessage: "Отклонить \"{{title}}\"? Инструктору нужно будет исправить курс и отправить его снова."
        },
        toasts: {
            loadError: "Не удалось загрузить курсы на проверке.",
            approved: "Курс одобрен.",
            approveError: "Не удалось одобрить курс.",
            rejected: "Курс перемещен в отклоненные.",
            rejectError: "Не удалось отклонить курс."
        },
        courseFallback: "Курс #{{id}}",
        uncategorized: "Без категории",
        instructor: "Инструктор",
        currency: {
            kgs: "{{amount}} сом"
        },
        free: "Бесплатно"
    },
    adminDeliveryCourseDetails: {
        title: "Детали курса с группами",
        subtitle: "Этот курс относится к внутренним потокам управления, а не к публичной видео-странице.",
        close: "Закрыть",
        fields: {
            category: "Категория",
            note: "Примечание"
        },
        note: "Детальное управление курсами с группами выполняется через вкладки групп, сессий и записей."
    },
    adminAiLms: {
        eyebrow: "AI LMS",
        title: "Настройки AI LMS",
        description: "Включайте структурированные AI LMS черновики и лимиты для тенантов или независимых инструкторов.",
        metrics: {
            scope: "Область",
            enabledFeatures: "Включенные функции",
            limits: "Лимиты"
        },
        scope: {
            title: "Область rollout",
            description: "Выберите тенанта или независимого инструктора, которому должны быть видны AI LMS элементы.",
            tenant: "Тенант",
            independentInstructor: "Независимый инструктор",
            userId: "User ID инструктора",
            selectInstructor: "Выберите инструктора",
            loadingInstructors: "Загрузка инструкторов..."
        },
        settings: {
            title: "Настройки функций",
            description: "Фронтенд показывает AI элементы только когда эта область и функция включены.",
            enabled: "Включить AI LMS для этой области"
        },
        limits: {
            title: "Лимиты функций",
            description: "Задайте консервативные лимиты перед включением функции в production.",
            enabled: "Включено",
            daily: "Дневной",
            monthly: "Месячный"
        },
        features: {
            feedback_draft: "Черновик обратной связи",
            lesson_quiz_draft: "Черновик теста",
            homework_draft: "Черновик домашнего задания",
            lesson_kit: "Комплект урока",
            worksheet_draft: "Черновик рабочего листа",
            course_draft: "Черновик курса",
            message_draft: "Черновик сообщения студенту"
        },
        actions: {
            reload: "Обновить",
            loading: "Загрузка...",
            saving: "Сохранение...",
            saved: "Сохранено",
            saveSettings: "Сохранить настройки",
            saveLimit: "Сохранить лимит"
        },
        toasts: {
            loadError: "Не удалось загрузить настройки AI LMS.",
            settingsSaved: "Настройки AI LMS сохранены.",
            settingsSaveError: "Не удалось сохранить настройки AI LMS.",
            limitSaved: "Лимит AI LMS функции сохранен.",
            limitSaveError: "Не удалось сохранить лимит AI LMS функции.",
            instructorsLoadError: "Не удалось загрузить инструкторов."
        }
    },
    adminAiPrompts: {
        eyebrow: "AI-промпты",
        title: "AI-промпты",
        description: "Управляйте системными промптами для помощника курса.",
        metrics: {
            total: "Все промпты",
            active: "Активные",
            selectedCourse: "Выбранный курс"
        },
        create: {
            title: "Курс и новый промпт",
            description: "Сначала выберите курс, затем добавьте новый промпт.",
            selectCourse: "Выберите курс",
            promptPlaceholder: "Введите текст промпта",
            editPlaceholder: "Текст промпта"
        },
        list: {
            title: "Список промптов",
            description: "Текущие промпты для выбранного курса."
        },
        languages: {
            ky: "Кыргызча",
            ru: "Русский",
            en: "English"
        },
        order: {
            "0": "Верх",
            "1": "Середина",
            "2": "Конец"
        },
        status: {
            active: "Активный",
            inactive: "Отключен"
        },
        actions: {
            add: "Добавить промпт",
            save: "Сохранить",
            cancel: "Отмена",
            edit: "Изменить",
            delete: "Удалить"
        },
        promptMeta: "Язык: {{language}} · Порядок: {{order}} · {{status}}",
        empty: {
            title: "AI-промпты не найдены",
            subtitle: "Для этого курса промпты пока не добавлены."
        },
        confirm: {
            deleteTitle: "Удалить AI-промпт",
            deleteMessage: "Вы уверены, что хотите удалить этот AI-промпт?"
        },
        toasts: {
            loadError: "Не удалось загрузить AI-промпты.",
            selectCourse: "Выберите курс, чтобы добавить AI-промпт.",
            created: "AI-промпт создан.",
            createError: "Не удалось создать AI-промпт.",
            updated: "AI-промпт обновлен.",
            updateError: "Не удалось обновить AI-промпт.",
            deleted: "AI-промпт удален.",
            deleteError: "Не удалось удалить AI-промпт."
        }
    },
    adminUsers: {
        eyebrow: "Люди и доступ",
        title: "Пользователи",
        description: "Ищите пользователей, меняйте роли и управляйте аккаунтами.",
        metrics: {
            currentPage: "На этой странице",
            total: "Всего пользователей",
            instructors: "Инструкторы",
            admins: "Администраторы"
        },
        roles: {
            student: "Студент",
            instructor: "Инструктор",
            assistant: "Ассистент",
            admin: "Admin",
            superadmin: "Super Admin",
            unknown: "неизвестно"
        },
        filters: {
            title: "Фильтры",
            description: "Уточните список по поиску и роли.",
            searchPlaceholder: "Поиск по имени или email",
            allRoles: "Все роли"
        },
        list: {
            title: "Список пользователей"
        },
        fallbacks: {
            noName: "Без имени",
            noEmail: "нет email"
        },
        actions: {
            delete: "Удалить",
            changeRole: "Изменить роль",
            changeRoleAria: "Изменить роль для {{user}}",
            deleteSelfTitle: "Нельзя удалить собственный аккаунт"
        },
        empty: {
            title: "Пользователи не найдены",
            subtitle: "Измените фильтры или дождитесь новых пользователей."
        },
        pagination: {
            summary: "Страница {{page}} / {{totalPages}} · Всего: {{total}}",
            previous: "Предыдущая",
            next: "Следующая"
        },
        confirm: {
            deleteTitle: "Удалить пользователя",
            deleteMessage: "Вы уверены, что хотите удалить {{user}}? Это действие остановит доступ к аккаунту.",
            roleTitle: "Изменить роль",
            roleMessage: "Изменить роль {{user}} с \"{{currentRole}}\" на \"{{newRole}}\"? Это сразу повлияет на права доступа."
        },
        toasts: {
            loadError: "Не удалось загрузить пользователей.",
            loadStudentsError: "Не удалось загрузить студентов.",
            deleted: "Пользователь удален.",
            deleteError: "Не удалось удалить пользователя.",
            roleChanged: "Роль изменена.",
            roleError: "Не удалось изменить роль.",
            selectGroup: "Для курса с группами сначала выберите группу.",
            enrolled: "Студент записан на курс.",
            enrollError: "Не удалось записать студента."
        }
    },
    adminCourses: {
        eyebrow: "Операции каталога",
        title: "Курсы и категории",
        description: "Управляйте курсами, категориями и техническими операциями курса.",
        operations: "Операции курса",
        metrics: {
            courses: "Курсы",
            published: "Опубликованные",
            categories: "Категории",
            delivery: "Курсы с группами"
        },
        workflows: {
            catalog: {
                label: "Каталог",
                description: "Управление курсами и категориями."
            },
            enrollment: {
                label: "Запись",
                description: "Добавляйте пользователей в видеокурсы или офлайн-группы и группы с прямыми занятиями."
            },
            media: {
                label: "Медиа операции",
                description: "HLS-транскодирование и технические действия с видео."
            }
        },
        catalog: {
            title: "Курсы",
            description: "Проверяйте карточки курсов, предпросмотр и очищайте каталог."
        },
        enrollment: {
            title: "Запись на курс",
            description: "Добавляйте студентов в правильный курс или группу.",
            selectGroup: "Выберите группу",
            enrollInGroup: "Записать пользователя в группу",
            enrollInCourse: "Записать пользователя на курс",
            selectGroupFirst: "Сначала выберите группу",
            selectUser: "Выберите пользователя"
        },
        categories: {
            title: "Категории",
            description: "Добавляйте, переименовывайте и очищайте категории.",
            placeholder: "Название новой категории"
        },
        status: {
            published: "Опубликован",
            draft: "Черновик"
        },
        deliveryModes: {
            individual: "Индивидуально",
            group: "Группа"
        },
        actions: {
            add: "Добавить",
            view: "Смотреть",
            edit: "Изменить",
            save: "Сохранить",
            cancel: "Отмена",
            delete: "Удалить"
        },
        empty: {
            title: "В системе нет курсов",
            subtitle: "На платформе еще нет курсов."
        },
        fallback: {
            course: "Курс #{{id}}",
            category: "Категория #{{id}}",
            group: "Группа #{{id}}",
            section: "Секция #{{id}}",
            lesson: "Урок #{{id}}",
            courseGeneric: "Курс",
            sectionGeneric: "Секция",
            unknownError: "Неизвестная ошибка"
        },
        confirm: {
            deleteCourseTitle: "Удалить курс",
            deleteCourseMessage: "Вы уверены, что хотите удалить \"{{title}}\"? Это может убрать курс из каталога и учебных потоков студентов.",
            deleteCategoryTitle: "Удалить категорию",
            deleteCategoryMessage: "Вы уверены, что хотите удалить \"{{name}}\"? Курсы, связанные с этой категорией, может потребоваться проверить."
        },
        toasts: {
            loadError: "Не удалось загрузить курсы и категории.",
            courseDeleted: "Курс удален.",
            courseDeleteError: "Не удалось удалить курс.",
            categoryCreated: "Категория создана.",
            categoryCreateError: "Не удалось создать категорию.",
            categoryUpdated: "Категория обновлена.",
            categoryUpdateError: "Не удалось обновить категорию.",
            categoryDeleted: "Категория удалена.",
            categoryDeleteError: "Не удалось удалить категорию."
        },
        transcode: {
            title: "HLS-транскодирование",
            description: "Видео сейчас автоматически транскодируются в HLS. Используйте это только для ошибочных или старых видео.",
            autoNotice: "Авто-транскодирование включено: новые видео автоматически конвертируются в HLS.",
            labels: {
                course: "Курс",
                section: "Секция",
                lesson: "Урок"
            },
            selectCourse: "Выберите курс",
            selectSection: "Выберите секцию",
            selectLesson: "Выберите урок (или оставьте пустым для всех)",
            allVideoLessons: "Все видео уроки",
            processingSuffix: "(транскодируется)",
            lessonIdsLabel: "Или введите ID уроков (разделитель: 61,62,63)",
            lessonIdsPlaceholder: "ID уроков (для массового запуска)",
            alreadySingle: "\"{{title}}\" уже транскодирован в HLS.",
            alreadyBulk: "Все видео уроки уже транскодированы в HLS.",
            help: "Курс и секция обязательны. Готовые HLS-видео пропускаются; транскодирование может занять несколько минут.",
            statusLabel: "Статус транскодирования",
            bulkStatusLabel: "Статус массового транскодирования",
            statusAria: "Статус транскодирования видео: {{status}}",
            statusAriaWithError: "Статус транскодирования видео: {{status}}. {{error}}",
            status: {
                missing: "Видео нет",
                uploaded: "Готово к транскодированию",
                stuck: "Зависло: нужен принудительный повтор",
                starting: "Транскодирование запускается...",
                processing: "Транскодирование выполняется",
                ready: "Готово к воспроизведению",
                failed: "Транскодирование завершилось ошибкой"
            },
            errorTitle: "Ошибка транскодирования",
            errors: {
                statusFetchFailed: "Не удалось обновить статус транскодирования.",
                playbackFailed: "Транскодирование видео не удалось. Попробуйте запустить транскодирование повторно."
            },
            readyMessage: "Транскодирование успешно завершено. Видео готово к воспроизведению.",
            processingMessage: "Ожидается конвертация видео в HLS...",
            bulkProcessingMessage: "Все видео в этой секции конвертируются в HLS. Это может занять несколько минут. Перезагрузите секцию, чтобы увидеть статус.",
            actions: {
                retry: "Транскодировать заново",
                bulk: "Массовое транскодирование",
                refreshStatus: "Проверить статус транскодирования"
            },
            retry: {
                title: "Повторить транскодирование видео",
                button: "Повторить транскодирование",
                loading: "Повторный запуск...",
                aria: "Повторить транскодирование видео",
                shortTitle: "Повторить транскодирование",
                shortButton: "Повторить",
                forceAria: "Принудительно повторить зависшее транскодирование",
                forceTitle: "Принудительно перезапустить зависшее транскодирование",
                forceButton: "Принудительно повторить",
                errors: {
                    missingIds: "Для повтора нужны ID курса, секции и урока.",
                    missingHandler: "Функция повторного запуска недоступна.",
                    failed: "Не удалось повторить транскодирование. Попробуйте еще раз."
                }
            },
            history: {
                title: "Последние действия транскодирования",
                singleStartFailed: "Транскодирование одного урока не запустилось",
                bulkStartFailed: "Массовое транскодирование не запустилось",
                completed: "Транскодирование завершено",
                skipped: "Транскодирование пропущено",
                bulkSkipped: "Массовое транскодирование пропущено",
                allReady: "Все видео в этой секции готовы.",
                bulkStarted: "Массовое транскодирование запущено",
                videoLessonCount: "Видео уроков: {{count}}"
            },
            toasts: {
                fillAllIds: "Заполните все ID.",
                started: "Транскодирование запущено.",
                startError: "Не удалось запустить транскодирование.",
                fillCourseSection: "Заполните Course и Section ID.",
                bulkStarted: "Массовое транскодирование запущено: {{started}}/{{total}}",
                bulkError: "Не удалось запустить массовое транскодирование.",
                lessonComplete: "Транскодирование урока {{id}} завершено",
                lessonFailed: "Транскодирование урока {{id}} завершилось ошибкой"
            }
        }
    }
};
