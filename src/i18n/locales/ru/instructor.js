export const instructor = {
    instructorChat: {
        courseLoading: "Информация о курсе еще загружается...",
        instructorFallback: "Инструктор",
        onlineStatus: "Онлайн",
        empty: {
            title: "Начните беседу",
            subtitle: "Отправьте первое сообщение инструктору."
        },
        imageAlt: "Изображение",
        fileFallback: "Файл",
        attachFile: "Прикрепить файл",
        attachImage: "Прикрепить изображение",
        toggleAttachments: "Показать действия с вложениями",
        composerPlaceholder: "Напишите сообщение...",
        composerAria: "Поле сообщения",
        send: "Отправить"
    },
    instructorHomework: {
        hero: {
            eyebrow: "Homework Queue",
            title: "Очередь домашних заданий",
            description: "Найдите, по какому курсу, группе и сессии нужны действия. Полный поток проверки открывается в разделе домашнего задания связанной сессии."
        },
        metrics: {
            total: "Всего",
            actionRequired: "Нужны действия",
            missing: "Не сдали",
            needsRevision: "На доработке"
        },
        filters: {
            title: "Фильтры",
            description: "Сужайте очередь по курсу, группе, статусу и поиску. Нажмите на карточку метрики, чтобы автоматически выбрать связанный статус.",
            status: "Статус",
            results: "Результат",
            allCourses: "Все курсы",
            allGroups: "Все группы",
            searchPlaceholder: "Поиск",
            limitPlaceholder: "Лимит"
        },
        filterOptions: {
            all: "Все",
            needsReview: "Нужна проверка",
            missing: "Не сдали",
            needsRevision: "На доработке",
            late: "Сдали поздно",
            draft: "Черновик",
            active: "Активно",
            dueSoon: "Скоро срок",
            overdue: "Просрочено",
            checked: "Проверено",
            noDeadline: "Без срока"
        },
        states: {
            draft: "Черновик",
            needsReview: "Нужна проверка",
            missing: "Не сдали",
            needsRevision: "На доработке",
            late: "Сдали поздно",
            checked: "Проверено",
            noDeadline: "Без срока",
            unknown: "Неизвестно",
            overdue: "Просрочено",
            dueSoon: "Скоро срок",
            active: "Активно"
        },
        nextActions: {
            title: "Следующие действия",
            description: "Очередь отсортирована по срочности: проверка, несданные работы, доработки и поздние ответы идут первыми.",
            priorityCount: "{{count}} приоритет"
        },
        queueActions: {
            needsReview: {
                label: "Сначала проверить",
                description: "{{count}} ответов ждут проверки инструктора."
            },
            missing: {
                label: "Проверить несданные работы",
                description: "{{count}} студентов не сдали задание."
            },
            needsRevision: {
                label: "Повторно проверить доработки",
                description: "{{count}} ответов ждут после доработки."
            },
            late: {
                label: "Проверить поздние сдачи",
                description: "{{count}} ответов пришли после срока."
            },
            default: {
                label: "Наблюдать",
                description: "Сейчас по этому заданию нет срочных действий."
            }
        },
        tasks: {
            title: "Задания",
            description: "Результаты по выбранным фильтрам появятся здесь."
        },
        empty: {
            title: "Домашние задания не найдены",
            subtitle: "Попробуйте изменить фильтры курса или группы либо очистить поисковый запрос."
        },
        queue: {
            title: "Задания в очереди",
            description: "Каждая карточка ведет в связанную сессию и открывает полный поток проверки.",
            recordCount: "{{count}} записей"
        },
        card: {
            actionRequired: "Нужны действия",
            needsReview: "Нужна проверка",
            missing: "Не сдали",
            needsRevision: "На доработке",
            late: "Сдали поздно"
        },
        actions: {
            openSession: "Открыть в сессии"
        },
        fallbacks: {
            homework: "Домашнее задание",
            noSession: "Сессия не указана",
            noDeadline: "Срок не указан"
        },
        errors: {
            unauthorized: "Сессия истекла. Войдите снова.",
            forbidden: "Этот курс или группа не назначены вам.",
            coursesLoad: "Не удалось загрузить курсы.",
            groupsLoad: "Не удалось загрузить группы.",
            homeworkLoad: "Не удалось загрузить домашние задания.",
            queueLoadTitle: "Очередь не загрузилась"
        }
    },
    instructorDashboard: {
        nav: {
            overview: "Обзор",
            courses: "Мои курсы",
            students: "Студенты",
            certificates: "Сертификаты",
            groups: "Группы",
            offerings: "Потоки",
            sessions: "Сессии",
            homework: "Домашняя работа",
            chat: "Чат",
            analytics: "Аналитика",
            leaderboard: "Рейтинг",
            profile: "Профиль",
            ai: "AI ассистент",
            attendance: "Посещаемость",
            notifications: "Уведомления"
        },
        workspaceGroups: {
            overview: {
                label: "Обзор и аналитика",
                description: "Быстро проверяйте общий статус, тренды и сигналы рейтинга."
            },
            courseManagement: {
                label: "Управление курсами",
                description: "Управляйте курсами, студентами, группами, потоками и сертификатами."
            },
            deliveryWorkbench: {
                label: "Проведение занятий",
                description: "Ежедневные процессы по сессиям, посещаемости, домашней работе и чату."
            },
            settings: {
                label: "Профиль и настройки",
                description: "Профиль, AI ассистент и настройки уведомлений."
            }
        },
        shell: {
            headerSubtitle: "Полный контроль курсов и студентов",
            certificatesDisabledReason: "Сертификаты отключены для некоторых курсов.",
            workspaceSection: "Раздел инструктора",
            sectionFallback: "Раздел",
            tabOpened: "{{tab}} открыт",
            status: {
                profileLoading: "Профиль загружается",
                coursesLoading: "Курсы загружаются",
                workspaceUpdating: "Рабочая область обновляется"
            },
            actions: {
                analytics: "Аналитика",
                hideMenu: "Скрыть меню",
                showMenu: "Показать меню"
            },
            toasts: {
                categoriesLoadError: "Не удалось загрузить категории.",
                requiredFields: "Заполните название, описание и категорию.",
                deliveryCourseCreated: "Курс создан. Теперь можно создать группу и сессии.",
                deliveryCourseCreateError: "Не удалось создать курс.",
                deliveryCourseUpdated: "Офлайн-курс или курс с прямыми занятиями обновлен.",
                deliveryCourseUpdatedForReview: "Офлайн-курс или курс с прямыми занятиями обновлен и отправлен на повторную проверку.",
                deliveryCourseUpdateError: "Не удалось обновить офлайн-курс или курс с прямыми занятиями.",
                courseSubmittedForApproval: "Курс отправлен на проверку.",
                courseSubmitError: "Не удалось отправить курс на проверку."
            }
        },
        coursesSection: {
            hero: {
                eyebrow: "Панель курсов",
                title: "Мои курсы",
                description: "Отслеживайте опубликованные курсы и курсы на рассмотрении, а также управляйте новыми видео, офлайн-курсами и курсами с прямыми занятиями здесь."
            },
            actions: {
                createDeliveryCourse: "Офлайн / прямые занятия",
                newCourse: "Новый курс",
                createCourse: "Создать курс",
                manage: "Управлять",
                view: "Просмотр",
                edit: "Изменить",
                submitting: "Отправка...",
                submitForApproval: "Отправить на проверку"
            },
            metrics: {
                totalCourses: "Все курсы",
                published: "Опубликовано",
                pending: "На рассмотрении",
                students: "Студенты"
            },
            list: {
                title: "Список курсов",
                description: "Здесь отображаются статус, категория и время последнего обновления каждого курса."
            },
            status: {
                approved: "Одобрен",
                pending: "На рассмотрении",
                rejected: "Отклонен",
                draft: "Черновик"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн в прямом эфире"
            },
            card: {
                noDescription: "Описание отсутствует",
                uncategorized: "Без категории",
                price: "{{price}} сом",
                free: "Бесплатно",
                students: "Студенты",
                updated: "Обновлено",
                noData: "Нет данных"
            },
            empty: {
                title: "Курсов пока нет",
                subtitle: "Создайте первый курс, чтобы начать."
            }
        },
        studentsSection: {
            hero: {
                eyebrow: "Панель студентов",
                title: "Студенты",
                description: "Просматривайте студентов по курсам, прогрессу и последней активности в одном месте."
            },
            metrics: {
                totalStudents: "Всего студентов",
                courses: "Курсы",
                selectedCourseStudents: "Студенты выбранного курса",
                averageProgress: "Средний прогресс",
                courseStudents: "Студенты этого курса",
                lessons: "Уроки",
                completed: "Завершили"
            },
            courseSelection: {
                title: "Выберите курс",
                description: "После выбора курса откроется полный список студентов этого потока и детали прогресса.",
                courseImageAlt: "Изображение курса",
                noCourseImage: "Изображения курса нет",
                created: "Создан",
                emptyTitle: "Курсов пока нет",
                emptySubtitle: "Сначала создайте курс, затем здесь появятся потоки студентов."
            },
            courseStatus: {
                published: "Опубликован",
                approved: "Одобрен",
                pending: "На рассмотрении",
                rejected: "Отклонен",
                draft: "Черновик"
            },
            courseWorkspace: {
                description: "После выбора курса поиск, фильтр прогресса и детали активности студентов работают в этом блоке.",
                backToCourses: "Вернуться к курсам"
            },
            filters: {
                title: "Фильтры",
                description: "Фильтруйте студентов по имени, контактным данным и диапазону прогресса.",
                search: "Поиск",
                searchPlaceholder: "Имя, email или телефон",
                progressMin: "Прогресс не ниже",
                progressMax: "Прогресс не выше"
            },
            list: {
                fallbackTitle: "Список студентов",
                title: "Список студентов",
                description: "В каждой карточке студента показаны контакты, прогресс и последний просмотренный урок.",
                loadingDescription: "Список загружается."
            },
            studentCard: {
                students: "Студенты",
                completed: "Завершил",
                inProgress: "Продолжает",
                enrolled: "Записан",
                lastViewed: "Последний просмотр",
                lessonNumber: "Урок #{{id}}{{time}}",
                tests: "Тесты",
                testPassed: "Пройден",
                testFailed: "Не пройден",
                noTests: "Нет отправленных тестов."
            },
            empty: {
                description: "Список по этому курсу пока пуст.",
                title: "В этом курсе пока нет студентов",
                subtitle: "Попробуйте выбрать другой курс или дождитесь записей."
            },
            pagination: {
                previous: "Назад",
                next: "Далее",
                page: "Страница {{page}} / {{total}}"
            }
        },
        profileSection: {
            hero: {
                eyebrow: "Панель профиля",
                title: "Профиль",
                description: "Здесь отображаются основная информация о вас, экспертные темы и публичные ссылки."
            },
            metrics: {
                title: "Звание",
                experience: "Опыт",
                years: "{{count}} год",
                years_plural: "{{count}} лет",
                enrollments: "Записи"
            },
            actions: {
                edit: "Изменить",
                close: "Закрыть",
                save: "Сохранить",
                saving: "Сохранение..."
            },
            fields: {
                title: "Звание",
                experience: "Опыт работы",
                bio: "Био / О себе",
                expertise: "Экспертные темы",
                expertisePlaceholder: "Frontend, UI/UX, Product Design"
            },
            bio: {
                title: "Био / О себе",
                description: "Краткое представление, которое видят студенты и команда.",
                empty: "Информация пока не добавлена"
            },
            expertise: {
                title: "Экспертные темы",
                description: "Основные темы специализации, видимые в профиле.",
                emptyTitle: "Экспертные темы пока не добавлены",
                emptySubtitle: "Добавьте основные темы при редактировании профиля, и они появятся здесь."
            },
            social: {
                title: "Социальные ссылки",
                description: "Внешние профили и публичные каналы связи.",
                urlPlaceholder: "https://...",
                emptyTitle: "Социальных ссылок нет",
                emptySubtitle: "Ссылки на портфолио или публичные профили появятся здесь после добавления.",
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
            sidebarTitle: "Разговоры",
            sidebarDescription: "Выбирайте здесь активные чаты по курсу и студенту.",
            chatAriaLabel: "{{student}} - чат по курсу {{course}}",
            fileFallback: "{{type}} отправлен",
            fileTypes: {
                image: "Изображение",
                file: "Файл"
            },
            stats: {
                chats: "Чаты",
                messages: "Сообщения",
                unread: "Непрочитанные"
            },
            statuses: {
                active: "Активен",
                closed: "Закрыт",
                pending: "Ожидает",
                unknown: "Неизвестно"
            },
            fallbacks: {
                student: "Студент",
                course: "Курс"
            },
            empty: {
                noChatsTitle: "Чат не найден",
                noChatsSubtitle: "Измените поисковый запрос или дождитесь нового разговора со студентом.",
                selectionTitle: "Разговор не выбран",
                selectionSubtitle: "Выберите студента из списка слева, чтобы открыть разговор здесь."
            },
            time: {
                now: "сейчас",
                minutesAgo: "{{count}} мин назад",
                hoursAgo: "{{count}} ч назад",
                daysAgo: "{{count}} дн. назад"
            },
            errors: {
                unknown: "Неизвестная ошибка",
                chatMissingAfterCreate: "Чат не найден после создания"
            },
            toasts: {
                loadChatsError: "Не удалось загрузить чаты.",
                loadMessagesError: "Не удалось загрузить разговор.",
                createWithReason: "Не удалось создать чат: {{reason}}",
                sendError: "Не удалось отправить сообщение.",
                fileWithReason: "Не удалось отправить файл: {{reason}}",
                fileUploadError: "Не удалось загрузить файл."
            }
        },
        deliveryCourseModal: {
            header: {
                createTitle: "Создать новый курс",
                createSubtitle: "Форма для создания офлайн-курса или курса с прямыми занятиями.",
                editTitle: "Изменить курс с группами",
                editSubtitle: "Обновите основную информацию офлайн-курса или курса с прямыми занятиями."
            },
            fields: {
                courseType: "Тип курса",
                language: "Язык занятия",
                title: "Название курса",
                description: "Описание курса",
                category: "Категория",
                price: "Цена (сом)"
            },
            courseTypes: {
                offline: {
                    label: "Офлайн",
                    description: "Офлайн-тренинг. Укажите локацию."
                },
                onlineLive: {
                    label: "Онлайн в прямом эфире",
                    description: "Живые занятия через Zoom или Google Meet."
                }
            },
            placeholders: {
                title: "Введите название курса",
                description: "Опишите, о чем этот курс",
                select: "Выберите"
            },
            validation: {
                titleRequired: "Введите название курса.",
                descriptionRequired: "Введите описание курса.",
                categoryRequired: "Выберите категорию.",
                requiredFields: "Пожалуйста, заполните название, описание и категорию."
            },
            actions: {
                cancel: "Отмена",
                create: "Создать курс",
                save: "Сохранить"
            },
            toasts: {
                categoriesLoadError: "Не удалось загрузить категории.",
                created: "Курс создан. Теперь можно создать группу и сессии.",
                createError: "Не удалось создать курс."
            },
            currency: "сом",
            priceHelp: "Оставьте пустым для бесплатного курса.",
            characterCount: "{{count}}/{{max}} символов"
        },
        profile: {
            toasts: {
                loadError: "Не удалось загрузить информацию инструктора.",
                saveSuccess: "Профиль инструктора сохранен.",
                saveError: "Не удалось сохранить профиль инструктора."
            }
        },
        createCoursePage: {
            title: "Создать новый курс",
            description: "Создайте курс в три шага: информация, содержание и финальная проверка.",
            steps: {
                info: "1. Точно заполните информацию",
                lessons: "2. Сохраните уроки",
                submit: "3. Отправьте на проверку"
            },
            draft: {
                title: "Черновик автоматически сохраняется в этом браузере.",
                description: "Информация и текущий шаг сохраняются; используйте кнопку \"Сохранить все\", чтобы сохранить содержание на сервер.",
                restored: "Восстановлен черновик: {{time}}.",
                lastSaved: "Последнее автосохранение: {{time}}."
            },
            actions: {
                clearDraft: "Очистить черновик"
            },
            toasts: {
                savedForReview: "Курс сохранен для проверки.",
                saveBeforeApproval: "Сохраните изменения перед отправкой на одобрение.",
                submittedForApproval: "Курс отправлен на одобрение.",
                submitError: "Не удалось отправить курс.",
                localDraftClearedServerPreserved: "Локальный черновик очищен. Черновик курса на сервере сохранен.",
                localDraftCleared: "Локальный черновик очищен.",
                invalidLesson: "Проверьте перед отправкой: {{issue}} (Раздел {{section}}, Урок {{lesson}})"
            }
        },
        editCoursePage: {
            title: "Редактировать курс",
            description: "Измените курс в три шага: информация, содержание и финальная проверка.",
            notice: {
                title: "Проверьте влияние изменений перед публикацией.",
                description: "Несохраненные изменения блокируют предпросмотр и отправку на одобрение. Отправленные изменения должны стать видны студентам только после процесса проверки.",
                unsaved: "Сейчас есть несохраненные изменения."
            },
            toasts: {
                saveBeforeApproval: "Сохраните изменения перед отправкой на одобрение.",
                submittedForApproval: "Курс отправлен на одобрение.",
                submitError: "Не удалось отправить курс.",
                invalidLesson: "Проверьте перед отправкой: {{issue}} (Раздел {{section}}, Урок {{lesson}})"
            }
        },
        courseBuilder: {
            stepLabels: {
                info: "Информация о курсе",
                curriculum: "Учебный контент",
                media: "Медиа и управление"
            },
            actions: {
                addLesson: "+ Добавить урок",
                addSection: "+ Добавить раздел",
                back: "Назад",
                collapseAll: "Свернуть все",
                delete: "Удалить",
                down: "Вниз",
                expandAll: "Открыть все",
                findNextIssue: "Найти следующую ошибку",
                refresh: "Обновить",
                saveAll: "Сохранить все",
                saveAndContinue: "Сохранить и продолжить",
                saving: "Сохранение...",
                singleSectionOff: "Режим одного раздела: выкл.",
                singleSectionOn: "Режим одного раздела: вкл.",
                toggle: "Открыть/закрыть",
                up: "Вверх"
            },
            aria: {
                steps: "Шаги конструктора курса",
                currentStep: "текущий шаг",
                completedStep: "завершен",
                incompleteStep: "не завершен",
                dragLesson: "Переместить урок",
                dragSection: "Переместить раздел",
                moveLessonDown: "Переместить урок {{title}} вниз",
                moveLessonUp: "Переместить урок {{title}} вверх",
                moveSectionDown: "Переместить раздел {{title}} вниз",
                moveSectionUp: "Переместить раздел {{title}} вверх"
            },
            assets: {
                title: "Файлы и материалы",
                videoUpload: "Загрузить видео",
                videoExists: "Видео файл есть",
                resourceUpload: "Загрузить материал (PDF, ZIP)",
                resourceExists: "Файл материала есть",
                resourceName: "Название материала",
                resourceNameHelp: "Это название увидят студенты.",
                previewVideo: "Отметить как видео для предпросмотра",
                uploadedPercent: "Загружено {{percent}}%"
            },
            challenge: {
                instructions: "Инструкции",
                instructionsTooltip: "Например: 'функция solution должна вернуть сумму четных чисел'. Объясните студенту задачу.",
                instructionsPlaceholder: "Подробная инструкция к задаче",
                instructionsHelp: "Объясните студентам, что нужно сделать и что будет проверяться. Разрешен любой JS код.",
                timeLimit: "Лимит времени (миллисекунды)",
                timeLimitTooltip: "Сколько времени может выполняться код. Например 5000 = 5 секунд. Значение по умолчанию 5000.",
                starterCode: "Стартовый код",
                starterCodeTooltip: "Начальный шаблон для студентов. Можно оставить пустым.",
                starterCodeHelp: "Оставьте пустым, если студенты должны написать решение полностью сами.",
                tests: "Тесты",
                addTest: "+ Добавить тест",
                testTitle: "Название теста",
                testTitleTooltip: "Например: 'Пример', 'Скрытый тест'. Видит только инструктор.",
                testPlaceholder: "Тест {{number}}",
                hidden: "Скрытый",
                args: "Аргументы (JSON)",
                argsTooltip: "Параметры функции. Один массив: [[1,2,3]]. Два параметра: [5,3]. Объект: [{\"name\":\"Aida\"}].",
                expected: "Ожидаемый результат (JSON)",
                expectedTooltip: "Значение, которое должен вернуть solution(...). Например: 6, \"Hello\", {\"ok\":true}"
            },
            confirmDelete: {
                sectionTitle: "Удалить раздел",
                lessonTitle: "Удалить урок",
                sectionMessage: "Удалить раздел \"{{title}}\" и все уроки внутри него? Это действие нельзя отменить.",
                lessonMessage: "Удалить урок \"{{title}}\"? Это действие нельзя отменить.",
                confirm: "Да, удалить"
            },
            curriculum: {
                workspaceMode: "Режим сборки",
                stats: {
                    sectionsLessons: "Разделы: {{sections}} • Уроки: {{lessons}}",
                    readiness: "Готовность: {{ready}}/{{total}} ({{percent}}%)"
                },
                saveHint: "Сначала заполните разделы и уроки, затем проверьте ошибки и сохраните все.",
                title: "Учебное содержание",
                validationTitle: "Уроки, которые нужно исправить перед переходом к предпросмотру",
                issueChip: "Р{{section}} / У{{lesson}}: {{issue}}",
                sectionSummary: "{{lessons}} уроков · {{ready}}/{{total}} готово",
                issueCount: "{{count}} ошибок",
                skillHelper: "Выберите навык. Прогресс и рейтинг этого раздела будут связаны с ним.",
                lessonOrder: "Порядок урока",
                articleText: "Текст статьи",
                readingTime: "Время чтения (минуты)",
                sectionFooter: "Готовые уроки: {{ready}}/{{total}}. Сохраните изменения перед продолжением."
            },
            fallbacks: {
                section: "Раздел {{number}}",
                lesson: "Урок {{number}}",
                lessonWithHash: "Урок #{{number}}"
            },
            info: {
                editMode: {
                    title: "Режим редактирования",
                    description: "После изменения информации о курсе ее нужно сохранить. Поля, влияющие на поток курса, например категория, остаются заблокированными на этом экране."
                },
                sections: {
                    basic: "Основная информация",
                    settings: "Настройки",
                    cover: "Изображение курса"
                },
                fields: {
                    title: "Название курса",
                    subtitle: "Краткое название",
                    description: "Описание курса",
                    category: "Категория",
                    price: "Цена курса (сом)",
                    isPaid: "Это платный курс",
                    aiAssistantEnabled: "Разрешить EDU AI ассистенту работать в этом курсе",
                    language: "Язык уроков",
                    learningOutcomes: "Что студенты изучат в этом курсе? (по одному пункту в строке)",
                    coverFile: "Файл изображения курса"
                },
                languageOptions: {
                    ky: "Кыргызский",
                    ru: "Русский",
                    en: "Английский"
                },
                placeholders: {
                    title: "Название курса",
                    subtitle: "Краткое описание",
                    description: "Описание курса",
                    category: "Выберите категорию",
                    price: "Цена курса",
                    learningOutcomes: "Например:\n- Основы UX\n- Работа с Figma\n- Создание UI библиотеки"
                },
                helpers: {
                    categoryLocked: "Категория влияет на опубликованный поток курса, поэтому здесь ее нельзя изменить.",
                    pendingCover: "Выбранное изображение не сохраняется в браузере: {{file}}. Пожалуйста, выберите файл снова.",
                    coverFormat: "PNG/JPG, максимум 5MB"
                },
                footer: {
                    fixErrors: "Исправьте отмеченные информационные поля, чтобы продолжить.",
                    ready: "Основная информация готова. Сохраните ее, чтобы перейти к содержанию."
                },
                coverAlt: "Изображение курса"
            },
            lessonFields: {
                title: "Название урока",
                type: "Тип урока"
            },
            lessonIssues: {
                missingTitle: "Нет названия",
                missingVideo: "Видео не загружено.",
                incompleteArticle: "Статья заполнена не полностью",
                incompleteQuiz: "Квиз заполнен не полностью",
                incompleteCode: "Кодовое задание заполнено не полностью",
                missingContent: "Контент отсутствует",
                ready: "Готово"
            },
            lessonKinds: {
                video: "Видео",
                article: "Статья (текст)",
                quiz: "Квиз",
                code: "Кодовое задание"
            },
            duration: {
                seconds: "{{count}}с",
                minutes: "{{count}}м",
                minutesSeconds: "{{minutes}}м {{seconds}}с"
            },
            fileValidation: {
                noFile: "Файл не выбран.",
                invalidVideo: "Выберите видеофайл (MP4, WebM, AVI, MOV, MKV).",
                fileTooLarge: "Размер файла не должен превышать {{size}}MB.",
                noImage: "Выберите файл изображения.",
                invalidImage: "Пожалуйста, выберите файл изображения.",
                imageTooLarge: "Размер изображения не должен превышать 5MB."
            },
            placeholders: {
                articleText: "Основной текст урока",
                lessonTitle: "Название урока",
                minutesExample: "например: 5",
                optionalSkill: "Выберите skill (опционально)",
                resourceName: "например: Практические задания.pdf",
                sectionTitle: "Название раздела"
            },
            quiz: {
                passingScore: "Проходной балл (%)",
                timeLimit: "Лимит времени (минуты, пусто = без лимита)",
                fillMode: {
                    manual: "Ручной редактор",
                    paste: "Вставить данные квиза"
                },
                formattingHelp: "Форматирование текста:",
                boldSample: "жирный",
                boldInsertSample: "жирный текст",
                codeSample: "код",
                codeInsertSample: "код",
                and: "и",
                question: "Вопрос {{number}}",
                questionPlaceholder: "Текст вопроса",
                preview: "Предпросмотр",
                option: "Вариант {{number}}",
                addOption: "+ Добавить вариант",
                addQuestion: "+ Добавить новый вопрос",
                paste: {
                    title: "Вставить данные квиза",
                    help: "Вставьте JSON, JSON в code fence или обычный текст квиза, чтобы заполнить текущий редактор.",
                    placeholder: "{\n  \"passingScore\": 70,\n  \"questions\": [\n    {\n      \"prompt\": \"Вопрос\",\n      \"options\": [\n        { \"text\": \"Вариант 1\", \"isCorrect\": true },\n        { \"text\": \"Вариант 2\", \"isCorrect\": false }\n      ]\n    }\n  ]\n}",
                    fill: "Заполнить из вставки",
                    supportedFormats: "Поддерживаются JSON, markdown code fence, умные кавычки, лишние запятые и обычный текст с вопросами и вариантами.",
                    success: "Квиз заполнен из вставленного содержимого.",
                    errorInvalidInput: "Во вставленном содержимом нет корректной структуры квиза."
                }
            },
            articleEditor: {
                placeholder: "Введите текст статьи здесь...",
                linkUrlPrompt: "Введите ссылку (https://...)",
                linkTextPrompt: "Текст ссылки",
                keyboardHint: "Совет: Ctrl/Cmd + B для жирного, Ctrl/Cmd + I для курсива. Для кода используйте кнопку </> или клавишу `.",
                toolbar: {
                    bold: "Жирный",
                    italic: "Курсив",
                    underline: "Подчеркнутый",
                    bulletedList: "Маркированный список",
                    numberedList: "Нумерованный список",
                    quote: "Цитата",
                    inlineCode: "Inline-код",
                    insertLink: "Вставить ссылку",
                    removeLink: "Удалить ссылку",
                    undo: "Отменить",
                    redo: "Повторить",
                    clearFormat: "Очистить формат"
                }
            },
            previewStep: {
                createTitle: "Проверка курса",
                editTitle: "Проверка изменений",
                createDescription: "Локальный draft сохраняется только в этом браузере. Используйте действия ниже, чтобы сохранить его на сервере и отправить на проверку.",
                editDescription: "Перед отправкой на подтверждение убедитесь, что изменения сохранены. Обновленный контент должен повлиять на студентов только после завершения проверки.",
                unsavedWarning: "Есть несохраненные изменения, поэтому отправка на подтверждение пока отключена.",
                actions: {
                    saveDraft: "Сохранить draft",
                    submitForApproval: "Отправить на подтверждение",
                    saveFirst: "Сначала сохраните изменения"
                },
                checks: {
                    infoComplete: "Информация о курсе заполнена",
                    noBlockingErrors: "В уроках нет блокирующих ошибок",
                    noUnsavedChanges: "Несохраненных изменений нет"
                }
            },
            preview: {
                eyebrow: "Финальный предпросмотр",
                practice: "Практика",
                mixLabel: "{{video}} видео · {{article}} статья · {{quiz}} квиз · {{code}} код",
                price: "Цена: {{price}} сом",
                freeCourse: "Бесплатный курс",
                level: "Уровень: {{level}}",
                language: "Язык: {{language}}",
                warningTitle: "Проверьте перед отправкой: {{count}}",
                moreWarnings: "Еще {{count}} ошибок. Вернитесь к содержанию и исправьте их.",
                structure: "Структура курса",
                lessonCount: "{{count}} уроков",
                previewBadge: "Предпросмотр",
                emptySection: "В этом разделе пока нет уроков.",
                emptyCourse: "Разделы пока не добавлены.",
                learningOutcomes: "Что вы изучите в этом курсе",
                fixWarningsTitle: "Сначала исправьте ошибки предпросмотра",
                stats: {
                    sections: "Разделы",
                    lessons: "Уроки",
                    totalTime: "Общее время",
                    previewLessons: "Уроки предпросмотра"
                },
                fallbacks: {
                    courseTitle: "Название курса отсутствует",
                    description: "Описание еще не добавлено.",
                    cover: "Cover изображение не добавлено"
                },
                warnings: {
                    missingCourseTitle: "Название курса отсутствует.",
                    missingDescription: "Описание курса не заполнено.",
                    missingCover: "Cover изображение не добавлено.",
                    noSections: "В курсе нет разделов.",
                    noPreviewLessons: "Ни один урок предпросмотра не отмечен (рекомендуется для видео).",
                    sectionMissingTitle: "Раздел {{section}}: нет названия.",
                    sectionNoLessons: "Раздел {{section}}: нет уроков.",
                    lessonMissingTitle: "Раздел {{section}}, Урок {{lesson}}: нет названия.",
                    lessonMissingVideo: "Раздел {{section}}, Урок {{lesson}}: видео не загружено.",
                    lessonMissingDuration: "Раздел {{section}}, Урок {{lesson}}: длительность/время чтения не указаны.",
                    lessonMissingArticleText: "Раздел {{section}}, Урок {{lesson}}: нет текста статьи.",
                    lessonMissingQuizQuestions: "Раздел {{section}}, Урок {{lesson}}: вопросы квиза не добавлены.",
                    lessonMissingCodeTests: "Раздел {{section}}, Урок {{lesson}}: тесты кодового задания заполнены не полностью."
                }
            },
            status: {
                ready: "Готово"
            },
            toasts: {
                changesSaveError: "Не удалось сохранить изменения.",
                changesSaved: "Все изменения сохранены!",
                contentSaveError: "Не удалось сохранить содержание.",
                contentSaved: "Содержание сохранено!",
                courseCreateError: "Не удалось создать курс.",
                courseCreated: "Курс успешно создан!",
                courseSaveError: "Не удалось сохранить курс.",
                courseSaved: "Курс успешно сохранен!",
                dataLoadError: "Не удалось загрузить данные",
                fileUploadError: "Не удалось загрузить файл.",
                fixInfoErrors: "Исправьте ошибки на вкладке информации.",
                lessonExtraWarnings: "Не удалось загрузить дополнительные материалы для {{count}} уроков. Курс открыт, но проверьте эти уроки.",
                noValidationIssues: "Нет ошибок для проверки.",
                sectionAutoSaveError: "Не удалось создать раздел. Сначала сохраните вручную.",
                sectionAutoSaved: "Раздел сохранен автоматически",
                skillsLoadError: "Не удалось загрузить skills.",
                someLessonsIncomplete: "Некоторые уроки заполнены не полностью.",
                validationIssue: "Нужно проверить: {{issue}}"
            },
            validation: {
                categoryRequired: "Выберите категорию",
                descriptionRequired: "Описание обязательно",
                languageRequired: "Выберите язык",
                lessonIssue: "Раздел {{section}}, Урок {{lesson}}: {{issue}}",
                lessonRequired: "Нужен как минимум один урок.",
                maxChars: "Максимум {{max}} символов",
                pricePositive: "Для платного курса цена должна быть больше 0",
                sectionMissingTitle: "Раздел {{section}}: нет названия",
                sectionRequired: "Нужен как минимум один раздел.",
                titleRequired: "Название курса обязательно"
            }
        },
        coursesPage: {
            title: "Мои курсы",
            workflowSummaryLabel: "Статус процессов курсов",
            filtersLabel: "Фильтры управления курсами",
            workflows: {
                video: "Видеокурс в своем темпе",
                delivery: "Курс с группами"
            },
            workflowCards: {
                videoDescription: "Управляется через контент, предпросмотр и одобрение.",
                deliveryDescription: "Работает с группой, расписанием и процессом посещаемости.",
                lastUpdated: "Последнее обновление"
            },
            filters: {
                all: "Все",
                allWorkflows: "Все процессы",
                search: "Поиск курса",
                searchPlaceholder: "По названию, инструктору или типу",
                status: "Статус",
                workflow: "Процесс"
            },
            lifecycle: {
                draft: "Черновик",
                pending: "На проверке",
                published: "Опубликован",
                rejected: "Нужны правки",
                aria: "Статус курса: {{status}}"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн в прямом эфире"
            },
            price: {
                label: "Цена",
                value: "{{value}} сом",
                missing: "Цена не указана"
            },
            actions: {
                refresh: "Обновить",
                reload: "Загрузить снова",
                manage: "Управление",
                review: "Проверить",
                fix: "Исправить",
                edit: "Изменить",
                unavailable: "Изменение недоступно",
                createFirst: "Создать первый курс"
            },
            errors: {
                load: "Не удалось загрузить курсы."
            },
            loading: "Курсы загружаются...",
            empty: {
                noCourses: "У вас пока нет курсов.",
                noFilteredCourses: "По этим фильтрам курсы не найдены."
            },
            fallbacks: {
                courseWithId: "Курс {{id}}",
                untitledCourse: "Курс без названия",
                noInstructor: "Инструктор не указан",
                noImage: "Нет изображения курса"
            }
        },
        overview: {
            header: {
                eyebrow: "Instructor overview",
                description: "Заполните профиль, обновляйте курсы и поддерживайте учебные процессы студентов."
            },
            focus: {
                eyebrow: "Фокус на сегодня",
                title: "Панель инструктора готова",
                description: "Используйте эти основные быстрые действия, чтобы управлять курсами, записями и аналитикой из одного места."
            },
            stats: {
                publishedCourses: "Опубликованные курсы",
                pendingCourses: "Курсы на проверке",
                aiEnabled: "AI ассистент включен",
                enrollments: "Записи"
            },
            actions: {
                createCourse: "Создать новый курс",
                openAnalytics: "Открыть аналитику"
            },
            quickActionsPanel: {
                title: "Быстрые действия",
                description: "Переходите прямо к ежедневным рабочим процессам инструктора."
            },
            quickActions: {
                manageCourses: {
                    title: "Управление курсами",
                    description: "Просмотрите существующие курсы и обновите контент или статус.",
                    button: "Курсы"
                },
                createCourse: {
                    title: "Создать новый курс",
                    description: "Подготовьте новый курс с уроками, разделами и заданиями.",
                    button: "Создать курс"
                },
                enrollments: {
                    title: "Записи",
                    description: "Отслеживайте записи студентов, группы и процесс посещаемости.",
                    button: "Записанные"
                },
                analytics: {
                    title: "Аналитика",
                    description: "Смотрите метрики посещаемости, домашних заданий и риска в одном месте.",
                    button: "Аналитика"
                }
            }
        },
        analytics: {
            eyebrow: "Рабочая область аналитики",
            title: "Аналитика инструктора",
            description: "Просматривайте выполнение курсов, студентов в группе риска и тренды успеваемости.",
            toasts: {
                loadError: "Не удалось загрузить аналитику инструктора."
            },
            filters: {
                title: "Фильтр периода",
                description: "Выберите конкретный диапазон дат, чтобы пересчитать аналитику для этого окна.",
                fromPlaceholder: "Дата начала",
                toPlaceholder: "Дата окончания"
            },
            metrics: {
                totalCourses: "Всего курсов",
                students: "Студенты",
                averageCompletion: "Среднее завершение",
                atRiskStudents: "Студенты в риске"
            },
            columns: {
                course: "Курс",
                enrollments: "Записи",
                averageProgress: "Средний прогресс",
                completionRate: "Уровень завершения",
                student: "Студент",
                riskReason: "Причина риска",
                lastActivity: "Последняя активность",
                lesson: "Урок"
            },
            coursePerformance: {
                title: "Результаты курсов",
                subtitle: "Как продвигаются ваши курсы"
            },
            atRisk: {
                title: "Студенты в группе риска",
                subtitle: "Студенты, которым может понадобиться дополнительная помощь"
            },
            weakLessons: {
                title: "Слабые уроки",
                subtitle: "Уроки, которые нужно улучшить"
            },
            charts: {
                performanceTrendTitle: "Тренд учебных результатов",
                performanceTrendSubtitle: "Общий балл выполнения за выбранный период",
                courseCompletionTitle: "Доля завершения по курсам",
                courseCompletionSubtitle: "Сравнение уровня завершения между курсами"
            },
            teachingInsights: {
                title: "Рекомендации по обучению",
                subtitle: "Следующие действия на основе метрик"
            },
            insights: {
                completion: {
                    title: "Нужно повысить уровень завершения",
                    message: "Завершение ниже 60%. Разделите длинные уроки на короткие части и добавьте контрольный вопрос после каждой части."
                },
                risk: {
                    title: "Нужно раннее вмешательство",
                    message: "{{count}} студентов в группе риска. Отправьте личное задание или сообщение студентам с низким прогрессом или без недавней активности."
                },
                audience: {
                    title: "Есть возможность расширить аудиторию",
                    message: "Для курсов с небольшим числом студентов уточните вводный урок, описание курса и первое задание."
                },
                stable: {
                    title: "Курсы идут в стабильном темпе",
                    message: "Показатели завершения и риска в норме. Далее просмотрите самые слабые уроки и улучшайте контент небольшими шагами."
                }
            },
            fallbacks: {
                courseWithId: "Курс #{{id}}",
                studentWithId: "Студент #{{id}}",
                lessonWithId: "Урок #{{id}}",
                unknown: "Неизвестно",
                never: "Никогда"
            }
        },
        mobileOverview: {
            welcome: "Добро пожаловать, {{name}}!",
            profileLine: "{{title}} • {{count}} курсов",
            stats: {
                published: "Опубликовано",
                pending: "Ожидают",
                aiCourses: "AI курсы",
                students: "Студенты"
            },
            actions: {
                newCourse: "Новый курс",
                analytics: "Аналитика",
                students: "Студенты",
                profile: "Профиль"
            },
            recentCourses: {
                title: "Последние курсы",
                viewAll: "Все",
                meta: "{{students}} студентов • {{lessons}} уроков"
            },
            fallbacks: {
                instructor: "Инструктор",
                instructorInitial: "И",
                courseInitial: "К"
            }
        },
        ai: {
            eyebrow: "Рабочая область AI",
            title: "EDU AI ассистент",
            description: "Смотрите, в каких курсах работает AI помощник, сколько курсов готово и какие шаги настройки следующие.",
            actions: {
                settings: "Настройки AI",
                edit: "Изменить",
                createCourse: "Создать курс"
            },
            metrics: {
                activeCourses: "Курсы с активным AI",
                totalCourses: "Всего курсов",
                notReady: "AI не готов"
            },
            enabledCourses: {
                title: "Курсы с AI",
                description: "Откройте активные курсы из этого списка, чтобы изменить или дополнить настройку AI ассистента.",
                updatedAt: "Обновлено: {{date}}",
                noUpdateInfo: "Нет информации об обновлении"
            },
            empty: {
                title: "Нет курсов с включенным AI ассистентом",
                subtitle: "Курсы появятся здесь после включения AI помощника в редакторе курса."
            },
            stepsPanel: {
                title: "Шаги настройки",
                description: "Основной поток настройки AI ассистента."
            },
            steps: {
                activate: "Включите AI ассистента в редакторе курса.",
                reviewPrompts: "Проверьте сценарии и промпты ассистента.",
                verifyStudentChat: "Проверьте доступность AI помощника в студенческом чате."
            }
        },
        createOfferingModal: {
            header: {
                title: "{{title}} - Шаг {{step}}/{{total}}",
                createTitle: "Новое предложение курса",
                editTitle: "Изменить предложение курса"
            },
            steps: {
                basic: "Основная информация",
                schedule: "Расписание",
                review: "Проверка"
            },
            fields: {
                course: "Курс",
                modality: "Формат проведения",
                price: "Цена (сом)",
                schedule: "Расписание"
            },
            modalities: {
                online: {
                    label: "Онлайн",
                    description: "Живое занятие через Zoom или Google Meet."
                },
                offline: {
                    label: "Офлайн",
                    description: "Офлайн-тренинг. Укажите локацию."
                },
                hybrid: {
                    label: "Гибрид",
                    description: "Смешанный онлайн и офлайн формат."
                }
            },
            placeholders: {
                course: "Выберите курс",
                select: "Выберите"
            },
            validation: {
                courseRequired: "Выберите курс.",
                modalityRequired: "Выберите формат проведения.",
                priceRequired: "Введите цену.",
                scheduleRequired: "Добавьте блок расписания.",
                dayRequired: "Выберите день.",
                startTimeRequired: "Укажите время начала.",
                endTimeRequired: "Укажите время окончания.",
                timeInvalid: "Неверный диапазон времени."
            },
            schedule: {
                blockNumber: "Блок #{{number}}",
                deleteAria: "Удалить блок {{number}}",
                day: "День",
                startTime: "Время начала",
                endTime: "Время окончания"
            },
            weekdays: {
                mon: "Понедельник",
                tue: "Вторник",
                wed: "Среда",
                thu: "Четверг",
                fri: "Пятница",
                sat: "Суббота",
                sun: "Воскресенье"
            },
            review: {
                title: "Проверка предложения курса",
                course: "Курс: {{course}}",
                modality: "Формат: {{modality}}",
                price: "Цена: {{price}}",
                priceValue: "{{price}} сом",
                free: "Бесплатно",
                scheduleCount: "Блоков расписания: {{count}}",
                confirm: "Проверьте всю информацию. Если все верно, нажмите \"{{action}}\"."
            },
            actions: {
                cancel: "Отмена",
                next: "Следующий шаг",
                back: "Назад",
                review: "Проверка",
                create: "Создать",
                update: "Изменить",
                addSchedule: "Добавить блок расписания"
            },
            fallbacks: {
                notSelected: "Не выбрано"
            },
            currency: "сом",
            priceHelp: "Оставьте пустым для бесплатного курса."
        },
        offerings: {
            hero: {
                eyebrow: "Управление предложениями курсов",
                title: "Предложения курсов",
                description: "Отслеживайте корпоративные, публичные и специальные предложения для своих курсов в одном месте."
            },
            metrics: {
                total: "Все предложения курсов",
                upcoming: "Ближайшие предложения курсов",
                company: "Для компаний",
                public: "Публичные предложения",
                active: "Активные",
                draft: "Черновики",
                closed: "Закрытые"
            },
            filters: {
                title: "Фильтры и поиск",
                description: "Сужайте результаты по курсу, времени и названию предложения.",
                allCourses: "Все курсы",
                upcoming: "Ближайшие",
                past: "Прошедшие",
                all: "Все",
                searchPlaceholder: "Поиск по предложению курса..."
            },
            list: {
                title: "Список предложений курсов",
                description: "Найдено предложений: {{count}}"
            },
            empty: {
                title: "Предложений курсов пока нет",
                subtitle: "Создайте первое предложение курса, чтобы запустить процесс записи."
            },
            actions: {
                create: "Создать предложение курса"
            },
            card: {
                fallbackTitle: "Предложение {{course}}",
                course: "Курс: {{course}}",
                capacity: "{{count}} мест",
                unlimitedCapacity: "Места не ограничены",
                featured: "Избранное",
                enrolled: "Записано: {{count}}",
                seatsRemaining: "Осталось мест: {{count}}",
                schedule: "Расписание:",
                note: "Примечание: {{note}}",
                editCourse: "Изменить курс",
                editOffering: "Изменить предложение",
                addStudent: "Добавить студента",
                copyLink: "Копировать ссылку"
            },
            modalities: {
                online: "Онлайн",
                offline: "Офлайн",
                hybrid: "Гибрид"
            },
            visibility: {
                public: "Публичный",
                private: "Закрытый"
            },
            statuses: {
                active: "Активный",
                draft: "Черновик",
                completed: "Завершен",
                archived: "Архив"
            },
            fallbacks: {
                course: "Курс",
                student: "Студент",
                unknown: "Неизвестно"
            },
            toasts: {
                courseRequired: "Выберите курс.",
                created: "Предложение курса создано.",
                updated: "Предложение курса обновлено.",
                saveError: "Не удалось сохранить предложение курса.",
                studentsLoadError: "Не удалось загрузить список студентов.",
                studentSearchError: "Не удалось найти студентов.",
                invalidUser: "Некорректный ID пользователя.",
                studentAdded: "Студент добавлен в предложение курса.",
                studentAddError: "Не удалось добавить студента в предложение курса."
            }
        },
        data: {
            errors: {
                courseForbidden: "Этот курс не закреплен за вами."
            },
            toasts: {
                coursesLoadError: "Не удалось загрузить курсы инструктора.",
                studentCoursesLoadError: "Не удалось загрузить список студентов.",
                courseStudentsLoadError: "Не удалось загрузить студентов курса."
            }
        },
        groupsSection: {
            header: {
                eyebrow: "Панель групп",
                title: "Группы",
                description: "Группы, список студентов и контекст следующей сессии для офлайн-курсов и курсов с прямыми занятиями управляются здесь.",
                activeDescription: "Для офлайн-курсов и курсов с прямыми занятиями группа является академическим контейнером: записи привязаны к группе, а сессии читают данные из нее."
            },
            noDelivery: {
                title: "Курсы для групп не найдены",
                description: "Чтобы создать группу и добавить студента в группу, сначала нужен офлайн-курс или курс с прямыми занятиями.",
                emptyTitle: "Нет курса, готового для групп",
                emptySubtitle: "Сначала создайте курс с групповым форматом. Видеокурсы не требуют групп.",
                pendingCount: "{{count}} курс пока не готов для групп. Чтобы создать группу, курс должен быть подтвержден и опубликован."
            },
            actions: {
                createCourse: "Создать курс",
                openSessions: "Панель сессий",
                createGroup: "Создать группу",
                manageSessions: "Управлять сессиями",
                generateSessions: "Создать сессии",
                addIndividualStudent: "Добавить индивидуального студента",
                addStudent: "Добавить студента",
                edit: "Изменить"
            },
            metrics: {
                groups: "Группы",
                active: "Активные",
                planned: "Запланированные",
                seats: "Места"
            },
            courseGroups: {
                title: "Группы по курсу",
                description: "Выберите курс с групповым форматом и просмотрите группы под ним. Запись должна быть привязана к одной из этих групп.",
                courseLabel: "Курс для групп",
                selectCourse: "Выберите курс",
                pendingHidden: "{{count}} курс не будет показан здесь, пока он не подтвержден и не опубликован.",
                anchorLabel: "Привязка записи:",
                anchorValue: "группа"
            },
            deliveryModes: {
                group: "Группа",
                individual: "Индивидуальный курс"
            },
            fallbacks: {
                groupWithId: "Группа #{{id}}",
                student: "Студент"
            },
            card: {
                code: "Код: {{code}}",
                individualStudent: "Индивидуальный студент: {{student}}",
                individualStudentNotFound: "Индивидуальный студент не найден",
                individualStudentLoading: "Индивидуальный студент загружается...",
                format: "Формат",
                period: "Период",
                seats: "Места",
                unlimited: "Без ограничений",
                noLocation: "Локация не указана",
                noTimezone: "Часовой пояс не указан",
                defaultSchedule: "Расписание по умолчанию",
                noSchedule: "Пока не задано",
                individualLimitTitle: "Индивидуальный курс рассчитан только на одного активного студента"
            },
            empty: {
                noGroupsTitle: "У этого курса нет групп",
                selectCourseTitle: "Выберите курс",
                noGroupsSubtitle: "После создания группы запись студента, сессии и посещаемость начинаются из этого контейнера.",
                selectCourseSubtitle: "Выберите курс с групповым форматом, чтобы увидеть его группы здесь."
            },
            sessionProcess: {
                title: "Процесс сессий",
                description: "Информация группы управляется через модальное окно. Создание, редактирование и ежедневная работа с сессиями остаются в панели сессий.",
                body: "Этот раздел управляет записью в группу и информацией группы. Посещаемость, домашние задания, встречи и данные сессий остаются в отдельном процессе сессий."
            },
            toasts: {
                selectCourse: "Сначала выберите курс.",
                groupNameAndCodeRequired: "Для группы обязательны название и код.",
                individualNameRequired: "Для индивидуального курса обязательно название.",
                studentRequired: "Выберите студента для индивидуального курса.",
                firstSessionScheduleRequired: "Добавьте дату начала и полный блок расписания для первой сессии.",
                liveMeetingRequired: "Добавьте платформу или ссылку встречи перед созданием индивидуального онлайн-курса.",
                enrollmentNotReady: "Зачисление закрыто, пока группа не открыта и живые сессии не запланированы с данными встречи.",
                individualCreated: "Индивидуальный курс создан.",
                groupCreated: "Группа создана.",
                selectGroupForEdit: "Выберите группу для изменения.",
                groupUpdated: "Группа обновлена.",
                defaultScheduleRequired: "Сначала сохраните расписание по умолчанию для группы.",
                sessionsCreated: "Создано сессий: {{count}}.",
                noNewSessions: "Новых сессий нет, существующие были пропущены.",
                invalidUserId: "Некорректный ID пользователя.",
                studentAdded: "Студент добавлен в группу."
            }
        },
        groupForm: {
            header: {
                editEyebrow: "Изменить группу",
                createEyebrow: "Создать группу",
                editTitle: "Редактировать группу",
                createTitle: "Новая группа",
                description: "Управляйте академическими метаданными группы для {{course}}."
            },
            sections: {
                basic: "Основная информация",
                period: "Период и места",
                student: "Выбор студента",
                delivery: "Формат проведения"
            },
            deliveryModes: {
                group: {
                    label: "Группа",
                    description: "Учебная группа для нескольких студентов."
                },
                individual: {
                    label: "Индивидуальный курс",
                    description: "Индивидуальный поток для одного студента."
                }
            },
            delivery: {
                offlineGroup: "Офлайн-группа",
                onlineLiveGroup: "Группа с онлайн-занятиями в прямом эфире",
                deliveryGroup: "Учебная группа",
                courseFormat: "Формат курса:",
                learningFormat: "Формат обучения:",
                noExtraFields: "Для этого курса не требуются дополнительные поля формата проведения."
            },
            fields: {
                individualName: "Название индивидуального курса *",
                groupName: "Название группы *",
                groupCode: "Код группы *",
                instructorId: "ID инструктора",
                seatLimit: "Лимит мест",
                timezone: "Часовой пояс",
                location: "Локация",
                meetingProvider: "Платформа встречи",
                meetingUrl: "URL встречи"
            },
            help: {
                groupCode: "Код является уникальным идентификатором группы."
            },
            statuses: {
                planned: "Запланирована",
                active: "Активна",
                completed: "Завершена",
                cancelled: "Отменена"
            },
            student: {
                description: "Индивидуальный курс связывается с одним студентом.",
                searchPlaceholder: "Имя или email (минимум 2 буквы)",
                notFound: "Студент не найден.",
                selectedId: "ID выбранного студента: {{id}}",
                pickHint: "Введите минимум две буквы и выберите студента из списка."
            },
            firstSession: {
                title: "Создать первую сессию тоже",
                description: "Если блок расписания заполнен, для индивидуального курса будет подготовлен начальный процесс сессии."
            },
            notice: {
                title: "Примечание",
                offline: "Эта группа учится офлайн. Держите локацию точной; она показывается в рабочей области сессии.",
                onlineLive: "Эта группа учится онлайн в прямом эфире. Платформа и URL встречи станут основными значениями для процесса сессии.",
                delivery: "Группа является контейнером записи. Сессии, посещаемость, домашние задания и встречи остаются в отдельной рабочей области сессии."
            },
            schedule: {
                eyebrow: "Блок планирования",
                title: "Недельное расписание по умолчанию",
                description: "Это не создает сессии автоматически. Но сохраняет обычное недельное расписание группы и упрощает планирование будущих сессий.",
                noteLabel: "Краткое примечание",
                notePlaceholder: "Например: Понедельник, Среда · 19:00-21:00",
                day: "День",
                start: "Начало",
                end: "Конец",
                blockNumber: "Блок #{{number}}",
                dayAria: "День блока {{number}}",
                startAria: "Начало блока {{number}}",
                endAria: "Конец блока {{number}}",
                primaryBlock: "Основной блок"
            },
            weekdays: {
                mon: "Понедельник",
                tue: "Вторник",
                wed: "Среда",
                thu: "Четверг",
                fri: "Пятница",
                sat: "Суббота",
                sun: "Воскресенье"
            },
            actions: {
                regenerate: "Пересоздать",
                addBlock: "Добавить блок",
                delete: "Удалить",
                close: "Закрыть",
                saving: "Сохранение...",
                updateGroup: "Обновить группу",
                createIndividual: "Создать индивидуальный курс",
                createGroup: "Создать группу"
            },
            fallbacks: {
                deliveryCourse: "Курс с группами",
                unknownStudent: "Неизвестный студент",
                studentWithId: "Студент #{{id}}"
            },
            toasts: {
                loadFailed: "Не удалось загрузить группы.",
                createFailed: "Не удалось создать группу.",
                updateFailed: "Не удалось обновить группу."
            }
        },
        enrollStudentModal: {
            eyebrow: "Запись на предложение курса",
            description: "Добавьте студента в {{offering}}.",
            seats: "Места",
            unlimited: "Без ограничений",
            search: {
                title: "Поиск студента",
                description: "Найдите по имени или email студента, которого нужно добавить в предложение курса.",
                placeholder: "Имя или email (минимум 2 буквы)",
                notFound: "Студент не найден.",
                selectedId: "ID выбранного студента: {{id}}",
                pickHint: "Запись будет готова после выбора студента из списка."
            },
            discount: {
                title: "Скидка",
                label: "Скидка %",
                placeholder: "Например: 10"
            },
            currentStudents: {
                title: "Текущие студенты",
                description: "Проверьте текущий состав предложения курса перед добавлением.",
                empty: "В этом предложении курса пока нет студентов."
            },
            actions: {
                close: "Закрыть",
                enrolling: "Добавление...",
                enroll: "Добавить студента"
            },
            fallbacks: {
                offering: "Предложение курса",
                unknownStudent: "Неизвестный студент",
                studentWithId: "Студент #{{id}}",
                noEmail: "Нет email"
            }
        },
        enrollGroupStudentModal: {
            eyebrow: "Запись в группу",
            description: "Добавьте студента из курса {{course}} в эту группу.",
            course: "Курс",
            groupCode: "Код группы",
            seats: "Места",
            unlimited: "Без ограничений",
            search: {
                title: "Поиск и выбор студента",
                description: "Найдите по имени, email или данным аккаунта и выберите точного студента из списка.",
                placeholder: "Имя или email (минимум 2 буквы)",
                notFound: "Студент не найден.",
                selectedId: "ID выбранного студента: {{id}}",
                pickHint: "Введите минимум две буквы и выберите студента из списка."
            },
            discount: {
                title: "Условие цены",
                description: "При необходимости укажите ручную скидку. Если оставить пустым, применяется стандартная цена.",
                label: "Скидка %",
                placeholder: "Например: 10"
            },
            snapshot: {
                title: "Сводка группы",
                groupId: "ID группы",
                fill: "Заполнение"
            },
            currentStudents: {
                title: "Текущие студенты",
                description: "Быстро проверьте текущий состав группы перед добавлением студента.",
                empty: "В этой группе пока нет студентов."
            },
            actions: {
                close: "Закрыть",
                enrolling: "Добавление...",
                enroll: "Добавить студента"
            },
            fallbacks: {
                deliveryCourse: "Курс с группами",
                groupWithId: "Группа #{{id}}",
                unknownStudent: "Неизвестный студент",
                studentWithId: "Студент #{{id}}",
                noEmail: "Нет email"
            },
            toasts: {
                studentsLoadFailed: "Не удалось загрузить студентов группы.",
                studentSearchFailed: "Не удалось найти студентов.",
                enrollFailed: "Не удалось добавить студента в группу."
            }
        },
        generateSessions: {
            eyebrow: "Создание сессий",
            title: "Создать сессии",
            description: "Предпросмотрите и затем создайте реальные сессии из расписания по умолчанию для {{group}}.",
            range: {
                title: "Диапазон",
                description: "Этот предпросмотр пропускает уже существующие сессии. Будут созданы только новые.",
                from: "Начало",
                to: "Конец"
            },
            metrics: {
                blocks: "Блоки",
                newSessions: "Новые сессии",
                existing: "Существующие"
            },
            steps: {
                preview: "1. Предпросмотр",
                generate: "2. Создать сессии"
            },
            actions: {
                preview: "Предпросмотр",
                generate: "Создать сессии",
                generating: "Создание..."
            },
            preview: {
                title: "Предпросмотр",
                description: "Сессии в выбранном диапазоне будут созданы так.",
                recordCount: "Записей: {{count}}",
                emptyBeforePreview: "Выберите диапазон и нажмите предпросмотр.",
                loading: "Предпросмотр готовится...",
                empty: "В этом диапазоне сессии не найдены.",
                new: "Новая",
                existing: "Уже есть"
            },
            fallbacks: {
                selectedGroup: "Выбранная группа"
            },
            toasts: {
                previewFailed: "Не удалось загрузить предпросмотр.",
                generateFailed: "Не удалось создать сессии."
            }
        }
    }
};
