export const student = {
    studentDashboard: {
        toasts: {
            courseNotFound: "Курс не найден.",
            openCourseError: "Не удалось открыть курс."
        },
        data: {
            toasts: {
                overviewLoadError: "Не удалось загрузить сводку.",
                coursesLoadError: "Не удалось загрузить курсы.",
                scheduleLoadError: "Не удалось загрузить расписание.",
                tasksLoadError: "Не удалось загрузить задания.",
                resourcesLoadError: "Не удалось загрузить ресурсы.",
                progressLoadError: "Не удалось загрузить данные прогресса.",
                certificatesLoadError: "Не удалось загрузить сертификаты."
            },
            fallbacks: {
                student: "Студент",
                section: "Секция",
                course: "Курс",
                instructor: "Инструктор"
            },
            access: {
                unknownTitle: "Не удалось проверить доступ к обучению",
                unknownDescription: "Если курсы или уроки не отображаются, обновите страницу или обратитесь в поддержку.",
                unloadedTitle: "Проверяем доступ к обучению",
                unloadedDescription: "Доступ будет показан точно после загрузки курсов, уроков и прогресса.",
                gatedTitle: "Доступ к обучению пока не активен",
                gatedDescription: "У вас пока нет активного курса или запланированного урока. Материалы откроются после подтверждения оплаты или активации записи.",
                activeTitle: "Доступ к обучению активен",
                activeDescription: "Ваши активные курсы и учебные материалы доступны."
            }
        },
        shell: {
            subtitle: "Следите за своим творческим учебным путем",
            workspaceSection: "Раздел студента",
            actions: {
                hideMenu: "Скрыть меню",
                showMenu: "Показать меню"
            },
            workspaceGroups: {
                today: {
                    label: "Сегодня",
                    description: "Ежедневный обзор и ближайшее расписание."
                },
                learning: {
                    label: "Учебное пространство",
                    description: "Доступ к курсам, ресурсам и бесплатным материалам."
                },
                practice: {
                    label: "Практика и повторение",
                    description: "Выполняйте задания и закрепляйте лексику с помощью интервального повторения."
                },
                progress: {
                    label: "Выполнение и прогресс",
                    description: "Мониторинг прогресса, сертификатов и рейтинга."
                },
                support: {
                    label: "Связь и настройки",
                    description: "Личное пространство для чата, профиля и настроек уведомлений."
                }
            },
            nav: {
                overview: "Обзор",
                myCourses: "Мои курсы",
                schedule: "Расписание",
                resources: "Ресурсы",
                freeResources: "Бесплатное обучение",
                tasks: "Задания",
                vocabularyReviews: "Словарь",
                progress: "Прогресс",
                certificates: "Сертификаты",
                chat: "Чат",
                leaderboard: "Рейтинг",
                profile: "Профиль",
                notifications: "Уведомления"
            }
        },
        freeResources: {
            eyebrow: "Бесплатные внешние ресурсы",
            title: "Моё бесплатное обучение",
            description: "Управляйте сохранёнными ресурсами, отмечайте прогресс по неделям, ведите заметки и используйте AI — не выходя из панели.",
            empty: {
                title: "Нет сохранённых ресурсов",
                description: "Просмотрите куратированный каталог и добавьте ресурсы в план обучения.",
                cta: "Просмотреть бесплатные ресурсы"
            },
            metrics: {
                saved: "Сохранено",
                inProgress: "В учёбе",
                completed: "Завершено"
            },
            filters: {
                all: "Все",
                started: "В процессе",
                saved: "Сохранено",
                completed: "Завершено"
            },
            detail: {
                weekProgress: "{{done}} / {{total}} нед.",
                noStudyPlan: "План обучения недоступен.",
                weekDone: "Неделя {{n}} — выполнено",
                weekTodo: "Неделя {{n}}",
                notesLabel: "Мои заметки",
                notesPlaceholder: "Заметки об этом ресурсе...",
                aiSection: "AI Помощник",
                officialSite: "Официальный курс",
                edubotGuide: "Гид EduBot",
                removeFromPlan: "Убрать из списка",
                removeConfirm: "Убрать этот курс из вашего списка?",
                removeConfirmYes: "Да, убрать",
                removeConfirmCancel: "Отмена"
            }
        },
        vocabularyReviews: {
            eyebrow: "Интервальное повторение",
            title: "Словарные карточки",
            description: "Повторяйте карточки по системе Лейтнера. Карточки переходят в более высокие ящики при правильном ответе.",
            dueCount_one: "{{count}} карточка к повторению",
            dueCount_other: "{{count}} карточек к повторению",
            boxLabel: "Ящик {{box}}",
            word: "Слово",
            definition: "Определение",
            tapToFlip: "Нажмите, чтобы перевернуть",
            gotIt: "Знаю",
            notYet: "Не знаю",
            card: "Карточка {{current}} из {{total}}",
            empty: {
                title: "Всё повторено!",
                description: "Сейчас нет карточек для повторения. Возвращайтесь позже.",
                refresh: "Проверить снова"
            },
            done: {
                title: "Сессия завершена!",
                subtitle: "Отличная работа! Вот итоги.",
                known: "{{count}} известно",
                stillLearning: "{{count}} учу",
                reviewAgain: "Повторить снова"
            },
            toasts: {
                error: "Не удалось загрузить карточки. Попробуйте снова."
            }
        },
        overview: {
            eyebrow: "Обзор студента",
            title: "Добро пожаловать, {{name}}!",
            description: "Главные учебные действия на сегодня, ближайшие сессии и прогресс собраны здесь.",
            focusLabel: "Фокус на сегодня",
            nextSessionLabel: "Следующая сессия:",
            recommendedCourseLabel: "Рекомендуемый курс для продолжения:",
            sessionFallback: "Сессия",
            sessionTitleWithNumber: "Сессия {{number}}",
            progressLabel: "Прогресс: {{value}}%",
            joinOpensSoon: "Ссылка для подключения откроется за 10 минут до занятия.",
            courseTypes: {
                offline: "Офлайн",
                onlineLive: "Онлайн в прямом эфире",
                video: "Видео"
            },
            metrics: {
                activeCourses: "Активные курсы",
                completedLessons: "Завершенные уроки",
                upcomingSessions: "Ближайшие сессии",
                needsAction: "Нужны действия",
                upcomingSession: "Ближайшие сессии",
                recordings: "Записи"
            },
            hero: {
                mixed: {
                    title: "Обучение и сессии в одном месте",
                    description: "Продолжайте видеокурсы в своем темпе и следите за ближайшими занятиями в прямом эфире или офлайн."
                },
                delivery: {
                    title: "Подготовьтесь к следующей сессии",
                    description: "Ближайшее занятие, ссылка или место, а также связанные задания показаны здесь."
                },
                video: {
                    title: "Готовы продолжить обучение",
                    description: "Продолжайте с последнего места и уверенно отслеживайте прогресс видеокурсов."
                }
            },
            pills: {
                videoCourses: "Видеокурсы",
                sessionCourses: "Сессионные курсы",
                attendance: "Посещаемость",
                recordings: "Записи"
            },
            nextAction: {
                deliveryTitle: "Следующее главное действие",
                videoTitle: "Точка продолжения",
                deliveryDescription: "Ближайшее занятие или дело, требующее внимания сейчас.",
                videoDescription: "Курс для самостоятельного обучения, к которому стоит вернуться сейчас.",
                empty: "Главное действие пока не найдено."
            },
            labels: {
                format: "Формат",
                startsIn: "До начала"
            },
            actions: {
                joinLesson: "Подключиться к занятию",
                join: "Подключиться",
                continueLearning: "Продолжить обучение"
            },
            sessions: {
                eyebrow: "Прямой эфир / офлайн-обучение",
                title: "Ближайшие сессии",
                description: "Следующие учебные сессии в прямом эфире или офлайн и их контекст.",
                empty: "Ближайших занятий пока нет."
            },
            videoProgress: {
                eyebrow: "Видеообучение",
                title: "Прогресс видеокурсов",
                description: "Курсы, которые стоит продолжить в самостоятельном обучении, и текущий прогресс.",
                lessonsCompleted: "{{completed}}/{{total}} уроков завершено",
                progress: "Прогресс"
            },
            homework: {
                title: "Задания, требующие действий",
                description: "Домашние задания, которым скоро нужно уделить внимание.",
                empty: "Открытых заданий пока нет."
            },
            learningFormat: {
                title: "Формат обучения",
                description: "Основные направления по курсам, на которые вы записаны."
            },
            fallbacks: {
                unknownTime: "Неизвестное время",
                recordingTitle: "Запись занятия",
                offlineLocationLater: "Офлайн-сессия. Место будет показано позже.",
                locationMissing: "Место не указано",
                offlineCheckLocation: "Офлайн-сессия. Проверьте место заранее.",
                task: "Задание",
                courseMissing: "Курс не указан",
                pending: "Ожидает",
                notCalculated: "Не рассчитывается"
            }
        },
        profile: {
            eyebrow: "Профиль",
            title: "Профиль",
            description: "Обновляйте данные аккаунта и управляйте каналами уведомлений.",
            fields: {
                fullName: "ФИО",
                phone: "Телефон",
                phoneHelper: "Можно указать международный формат, например +996..."
            },
            account: {
                title: "Данные аккаунта",
                description: "Личные и контактные данные.",
                profilePhoto: "Фото профиля",
                avatarPreviewAlt: "Предпросмотр фото профиля",
                selectedFile: "Выбрано: {{file}}",
                visibleInfo: "Основная информация и каналы связи, видимые в аккаунте."
            },
            security: {
                title: "Безопасность",
                description: "Обновляйте пароль отдельно от личных данных.",
                newPassword: "Новый пароль",
                passwordPlaceholder: "Минимум 6 символов",
                confirmPassword: "Повторите пароль",
                confirmPasswordPlaceholder: "Введите пароль еще раз"
            },
            notificationSettings: {
                title: "Настройки уведомлений",
                description: "Уведомления пока остаются в профиле; если каналов станет больше, они будут вынесены в отдельное пространство.",
                on: "Включено",
                off: "Выключено",
                emptyTitle: "Настройки уведомлений не найдены",
                emptySubtitle: "Для этого аккаунта настройки уведомлений не загрузились."
            },
            actions: {
                edit: "Изменить",
                uploadAvatar: "Загрузить аватар",
                saving: "Сохранение...",
                saveProfile: "Сохранить профиль",
                cancel: "Отмена",
                updatePassword: "Обновить пароль",
                clear: "Очистить",
                saveNotifications: "Сохранить уведомления"
            },
            validation: {
                passwordMismatch: "Новые пароли не совпадают.",
                passwordTooShort: "Пароль должен быть не короче 6 символов.",
                phoneInternational: "Укажите телефон в международном формате. Например: +996700123456"
            },
            toasts: {
                notificationsLoadError: "Не удалось загрузить уведомления.",
                profileLoadError: "Не удалось загрузить данные профиля.",
                notificationsSaved: "Уведомления сохранены.",
                notificationsSaveError: "Не удалось сохранить уведомления.",
                profileSaved: "Профиль успешно обновлен.",
                profileSaveError: "Не удалось сохранить профиль."
            },
            notifications: {
                lessonReminders: {
                    label: "Напоминания об уроках",
                    description: "Получайте напоминание перед началом урока."
                },
                announcementEmails: {
                    label: "Новости курса",
                    description: "Новые модули и важные учебные новости приходят по email."
                },
                taskUpdates: {
                    label: "Напоминания о заданиях",
                    description: "Получайте напоминание, когда приближается срок задания."
                },
                smsAlerts: {
                    label: "SMS-уведомления",
                    description: "Получайте SMS о важных событиях."
                },
                pushNotifications: {
                    label: "Напоминания о пропущенных уроках",
                    description: "Получайте мгновенное уведомление о пропущенных уроках."
                }
            }
        },
        empty: {
            accessEyebrow: "Доступ студента",
            accessTitle: "Доступ к обучению пока не активен",
            accessDescription: "У вас пока нет активного курса. После подтверждения оплаты или активации записи здесь появятся ваши курсы, уроки и прогресс.",
            actions: {
                viewVideoCourses: "Смотреть видеокурсы",
                openProfile: "Открыть профиль"
            }
        },
        courses: {
            eyebrow: "Мои курсы",
            title: "Мои курсы",
            emptyHeroDescription: "Здесь отображаются активные курсы, ближайшие сессии и темп обучения.",
            description: "Управляйте прогрессом курса, инструктором, ближайшим уроком и записями с одного экрана.",
            searchPlaceholder: "Поиск по курсу или инструктору",
            noImage: "Нет изображения курса",
            progress: "Прогресс",
            scheduledCourseNotice: "Этот курс проходит по расписанию. Основные данные отображаются в расписании и посещаемости.",
            metrics: {
                courses: "Курсы",
                averageProgress: "Средний прогресс",
                live: "Прямой эфир",
                offline: "Офлайн"
            },
            filters: {
                allTypes: "Все типы"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн в прямом эфире"
            },
            courseModes: {
                selfPaced: "Самостоятельно",
                offlineGroup: "Офлайн-группа",
                liveGroup: "Группа с прямыми занятиями"
            },
            stats: {
                lessons: "Уроки",
                format: "Формат",
                group: "Группа",
                nextStatus: "Следующий статус",
                upcoming: "Ближайшее"
            },
            statuses: {
                continue: "Продолжить",
                completed: "Завершено",
                pending: "Ожидает"
            },
            fallbacks: {
                unknownTime: "Неизвестное время"
            },
            actions: {
                openCourse: "Открыть курс",
                openSchedule: "Открыть расписание"
            },
            nextStep: {
                title: "Следующий шаг",
                videoDescription: "Следующий видеоурок или место продолжения.",
                groupDescription: "Информация о ближайшей сессии или группе.",
                selfPacedHint: "Видеокурс проходит в вашем темпе. Откройте курс и продолжайте обучение.",
                instructor: "Инструктор: {{instructor}}",
                videoCompleted: "Похоже, все уроки этого видеокурса завершены.",
                location: "Место: {{location}}",
                noClassroom: "Класс пока не назначен",
                liveWaiting: "Ожидается онлайн-урок в прямом эфире",
                schedulePending: "Расписание уточняется",
                openCourseHint: "Откройте курс и продолжите следующий урок.",
                noUpcomingSession: "Ближайшая сессия пока не назначена."
            },
            quickAccess: {
                title: "Быстрый доступ",
                description: "Откройте курс и продолжайте обучение.",
                liveHint: "Для уроков в прямом эфире используйте расписание и записи.",
                offlineHint: "Для офлайн-уроков откройте расписание и посещаемость.",
                videoHint: "Продолжайте видеоуроки с места остановки."
            },
            empty: {
                title: "У вас нет активных курсов",
                description: "Когда появится новый курс, здесь будет ваша учебная дорожная карта.",
                noResultTitle: "Курс не найден",
                noResultDescription: "Попробуйте изменить поисковый запрос или фильтр."
            }
        },
        schedule: {
            eyebrow: "Расписание",
            title: "Расписание",
            heroTitle: "Расписание и сессии в прямом эфире",
            emptyHeroDescription: "Ближайшие уроки, окна прямого эфира и записи отображаются здесь.",
            description: "Смотрите ближайшие уроки, доступ к подключению и записи с одного экрана.",
            searchPlaceholder: "Поиск по курсу, инструктору или месту",
            offlineNotice: "Офлайн-сессия. Заранее проверьте время прихода и место.",
            metrics: {
                total: "Всего",
                upcoming: "Ближайшие",
                live: "Прямой эфир",
                offline: "Офлайн"
            },
            filters: {
                allTypes: "Все типы"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн в прямом эфире"
            },
            statuses: {
                past: "Прошло"
            },
            fallbacks: {
                session: "Сессия",
                sessionNumber: "Сессия {{number}}",
                course: "Курс",
                classroom: "Класс пока не назначен",
                unknownTime: "Неизвестное время"
            },
            actions: {
                joinLesson: "Присоединиться к уроку",
                livePanel: "Панель прямого эфира"
            },
            live: {
                startsIn: "До начала",
                joinOpensSoon: "Ссылка для подключения откроется за 10 минут до начала",
                panelTitle: "Страница урока в прямом эфире",
                sessionPill: "Сессия в прямом эфире",
                remainingTime: "Осталось времени:",
                focusTitle: "Фокус прямого эфира",
                focusDescription: "Выберите онлайн-сессию в прямом эфире, чтобы управлять подключением и записью здесь.",
                noSelection: "Сессия в прямом эфире пока не выбрана."
            },
            recordings: {
                title: "Записи",
                count: "Записей: {{count}}",
                fallback: "Запись",
                empty: "Записи пока нет."
            },
            empty: {
                title: "Ближайшие занятия не найдены",
                description: "Сессии появятся здесь после назначения.",
                noResultTitle: "Сессия не найдена",
                noResultDescription: "Попробуйте изменить поиск или фильтр."
            }
        },
        certificates: {
            eyebrow: "Сертификаты",
            title: "Сертификаты",
            description: "Выданные и ожидающие проверки сертификаты показаны в одном месте.",
            fallbackCourseTitle: "Сертификат курса",
            statuses: {
                issued: "Выдан",
                pending: "На проверке",
                revoked: "Аннулирован",
                rejected: "Отклонен",
                unknown: "Неизвестно"
            },
            metrics: {
                total: "Всего",
                issued: "Выдано",
                pending: "На проверке"
            },
            registry: {
                title: "Реестр сертификатов",
                description: "Выберите сертификат, чтобы скачать PDF или открыть публичную страницу проверки."
            },
            actions: {
                downloading: "Загрузка...",
                downloadPdf: "Скачать PDF",
                verify: "Проверить"
            },
            empty: {
                title: "Сертификатов пока нет",
                description: "После выдачи сертификата инструктором он появится здесь. Выданный сертификат можно скачать в PDF или открыть по ссылке проверки."
            }
        },
        progress: {
            eyebrow: "Прогресс студента",
            title: "Прогресс и сертификаты",
            emptyHeroDescription: "Темп обучения, достижения и следующие шаги отображаются здесь.",
            description: "Смотрите реальный прогресс курса, точку продолжения и ключевые показатели по формату обучения.",
            progress: "Прогресс",
            metrics: {
                averageProgress: "Средний прогресс",
                activeCourses: "Активные курсы",
                completedCourses: "Завершенные курсы",
                certificates: "Сертификаты"
            },
            progressLabels: {
                completed: "Завершено",
                nearFinish: "Близко к финишу",
                steady: "Стабильный прогресс",
                needsAttention: "Нужно внимание"
            },
            certificateBadges: {
                ready: "Сертификат готов",
                pending: "На проверке",
                rejected: "Отклонен",
                revoked: "Аннулирован"
            },
            lessonKinds: {
                quiz: "Квиз",
                article: "Статья",
                code: "Код",
                video: "Видео"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн в прямом эфире"
            },
            hero: {
                pill: "Прогресс обучения",
                totalProgress: "общий прогресс",
                focusTitle: "Текущий учебный фокус",
                focusDescription: "Самая большая возможность роста сейчас в курсе {{course}}. Здесь завершено {{completed}}/{{total}} уроков, общий прогресс {{progress}}%.",
                courses: "Курсы",
                completedLessons: "Завершенные уроки",
                certificates: "Сертификаты"
            },
            formats: {
                title: "Форматы обучения",
                description: "В каких типах курсов вы участвуете.",
                videoCourses: "Видеокурсы",
                sessionCourses: "Сессионные курсы",
                attendance: "Посещаемость",
                notCalculated: "Не рассчитывается"
            },
            courseCard: {
                lessonCount: "{{completed}}/{{total}} уроков",
                remaining: "Осталось: {{count}}"
            },
            nextAction: {
                title: "Следующее действие",
                resumeDescription: "Продолжайте с последнего места остановки.",
                pickLessonDescription: "Выберите следующий урок, чтобы продолжить движение по курсу.",
                noResumeLesson: "Урок для продолжения пока не найден."
            },
            actions: {
                continueLesson: "Продолжить: {{lesson}}",
                downloadPdf: "Скачать PDF",
                verify: "Проверить",
                hide: "Скрыть",
                expand: "Развернуть"
            },
            stats: {
                completed: "Завершено",
                remaining: "Осталось",
                sections: "Секции"
            },
            sections: {
                title: "Секции и детали уроков",
                completedCount: "{{completed}}/{{total}} уроков завершено"
            },
            quiz: {
                passed: "Квиз пройден",
                failed: "Квиз не пройден"
            },
            lesson: {
                lastTime: "Последнее время: {{time}}",
                completed: "Завершено",
                inProgress: "В процессе"
            },
            certificateReadiness: {
                title: "Готовность сертификата",
                description: "Отслеживайте курсы, которые приближаются к финишу.",
                percentComplete: "Завершено: {{progress}}%",
                ready: "Готов",
                pending: "На проверке",
                rejected: "Отклонен",
                notReady: "Не готов"
            },
            sessionFormats: {
                title: "Обучение в формате сессий",
                description: "Офлайн-курсы и курсы с прямыми занятиями сопровождаются дополнительной логистикой вместе с прогрессом.",
                onlineLive: "Онлайн в прямом эфире",
                onlineLiveDescription: "В этом формате вместе с прогрессом важны время подключения, сессии и записи.",
                offline: "Офлайн",
                offlineDescription: "В офлайн-обучении посещаемость, место и ресурсы сессии являются отдельной важной частью."
            },
            advanced: {
                eyebrow: "Расширенный прогресс",
                title: "История активности и тренды",
                description: "Используйте этот блок, чтобы глубже посмотреть активность по курсам и недавнее движение в обучении."
            },
            empty: {
                title: "Пока нет записанных курсов",
                description: "Когда курс будет добавлен, здесь появятся прогресс, точка продолжения и статус сертификата.",
                noLessons: "Для этого курса уроки не найдены."
            }
        },
        analytics: {
            eyebrow: "Advanced Progress",
            title: "Подробный прогресс",
            description: "Здесь видны реальный учебный прогресс, последняя активность и курс, с которого стоит продолжить.",
            toasts: {
                loadError: "Не удалось загрузить аналитику студента."
            },
            context: {
                title: "Текущий контекст",
                description: "Подробный прогресс сейчас учитывает выбранный фильтр курса.",
                courseFilterActive: "Фильтр курса активен"
            },
            filters: {
                title: "Фильтр периода",
                description: "Фильтруйте показатели по конкретному диапазону дат.",
                fromPlaceholder: "Дата начала",
                toPlaceholder: "Дата окончания"
            },
            metrics: {
                enrolledCourses: "Курсы в обучении",
                completedCourses: "Завершенные курсы",
                completedLessons: "Завершенные уроки",
                averageProgress: "Средний прогресс"
            },
            continueLearning: {
                title: "Продолжить обучение",
                subtitle: "Последний активный курс и урок"
            },
            courseProgress: {
                title: "Прогресс по курсам",
                subtitle: "Курсы, которые вы проходите, и их статус",
                enrolledAt: "Дата записи: {{date}}",
                emptyTitle: "Курсов пока нет",
                emptySubtitle: "Откройте каталог, чтобы начать первый курс"
            },
            recentActivity: {
                title: "Последняя активность",
                subtitle: "Ваши последние учебные действия",
                emptyTitle: "Активности нет",
                emptySubtitle: "Действий пока нет"
            },
            charts: {
                courseProgressTitle: "Вид прогресса по курсам",
                courseProgressSubtitle: "Реальный прогресс по курсам, где вы записаны",
                activityDistributionTitle: "Распределение активности",
                activityDistributionSubtitle: "К каким типам чаще относятся последние действия"
            },
            workspaceLink: {
                title: "Связь со студенческой рабочей областью",
                description: "Эта аналитика детализирует учебное направление внутри основной панели студента: какой курс продолжить, когда снизилась активность и из чего состоит общий прогресс.",
                coursesTitle: "Курсы",
                coursesDescription: "Здесь видно, из каких курсов состоит общий прогресс, показанный на панели.",
                timeTitle: "Время",
                timeDescription: "Последние действия и фильтр периода показывают, когда изменился темп обучения.",
                progressTitle: "Прогресс",
                progressDescription: "Помимо среднего показателя, открываются детали конкретного курса, урока и активности."
            },
            activityTypes: {
                lesson: "Урок",
                quiz: "Квиз",
                course: "Курс",
                other: "Другое"
            },
            actions: {
                continueLearning: "Продолжить обучение",
                continue: "Продолжить",
                viewCourses: "Смотреть курсы"
            },
            fallbacks: {
                courseWithId: "Курс #{{id}}",
                unknownDate: "Неизвестно",
                unknownTime: "Неизвестное время",
                activity: "Активность"
            }
        },
        chat: {
            sidebarTitle: "Диалоги",
            sidebarDescription: "Управляйте активными чатами с инструкторами здесь.",
            composerPlaceholder: "Начните разговор",
            chatAriaLabel: "Чат {{instructor}} - {{course}}",
            fileFallback: "📎 {{type}} отправлен",
            fileTypes: {
                image: "Изображение",
                file: "Файл"
            },
            actions: {
                newChat: "Новый чат",
                close: "Закрыть",
                sending: "Отправка...",
                openChat: "Открыть чат"
            },
            stats: {
                chats: "Чаты",
                messages: "Сообщения",
                unread: "Непрочитанные"
            },
            statuses: {
                active: "Активный",
                closed: "Закрыт",
                pending: "Ожидает",
                unknown: "Неизвестно"
            },
            fallbacks: {
                instructor: "Инструктор",
                course: "Курс"
            },
            empty: {
                noChatsTitle: "Чат не найден",
                noChatsSubtitle: "Откройте новый чат или измените поисковый запрос.",
                selectionTitle: "Диалог не выбран",
                selectionSubtitle: "Выберите инструктора в списке слева, и диалог откроется здесь.",
                noCourses: "Курсы не найдены."
            },
            modal: {
                title: "Открыть чат с инструктором",
                description: "Выберите курс и напишите первое сообщение.",
                messageLabel: "Сообщение",
                messagePlaceholder: "Здравствуйте! У меня есть вопрос..."
            },
            time: {
                now: "сейчас",
                minutesAgo: "{{count}} мин назад",
                hoursAgo: "{{count}} ч назад",
                daysAgo: "{{count}} дн назад"
            },
            errors: {
                unknown: "Неизвестная ошибка",
                chatMissingAfterCreate: "Чат не найден после создания"
            },
            toasts: {
                loadChatsError: "Не удалось загрузить чаты.",
                loadMessagesError: "Не удалось загрузить диалог.",
                createWithReason: "Не удалось создать чат: {{reason}}",
                sendError: "Не удалось отправить сообщение.",
                fileWithReason: "Не удалось отправить файл: {{reason}}",
                fileUploadError: "Не удалось загрузить файл.",
                loadCoursesError: "Не удалось загрузить курсы.",
                selectCourse: "Выберите курс.",
                writeMessage: "Напишите сообщение.",
                noInstructor: "Нет информации об инструкторе.",
                createError: "Не удалось создать чат."
            }
        },
        tasks: {
            eyebrow: "Задания студента",
            title: "Рабочее пространство заданий",
            description: "Следите за статусом заданий, сроками и отправляйте ответы из одного места.",
            searchPlaceholder: "Поиск по заданию или курсу",
            metrics: {
                total: "Всего",
                pending: "Ожидают",
                overdue: "Просрочены",
                needsRevision: "Нужна правка",
                submitted: "На проверке",
                approved: "Одобрены"
            },
            filters: {
                attention: "Требует действия",
                allStatuses: "Все статусы",
                allCourses: "Все курсы",
                submitted: "Отправленные",
                closed: "Закрытые"
            },
            statuses: {
                overdue: "Просрочено",
                pending: "Ожидает",
                submitted: "Отправлено",
                needsRevision: "Нужна правка",
                rejected: "Возвращено",
                completed: "Одобрено",
                unavailable: "Не подключено"
            },
            activityTypes: {
                discussion: "Обсуждение",
                exercise: "Упражнение",
                quiz: "Квиз",
                groupWork: "Групповая работа",
                vocabulary: "Словарный запас",
                fillBlank: "Заполнить пропуски",
                wordMatch: "Сопоставить слова",
                listening: "Аудирование",
                writingCorrection: "Письмо",
                work: "Работа"
            },
            interactive: {
                noContent: "Содержимое активности недоступно.",
                vocab: {
                    progress: "{{reviewed}} из {{total}} изучено",
                    card: "Карточка {{current}} / {{total}}",
                    word: "Слово",
                    definition: "Определение",
                    tapToFlip: "Нажмите, чтобы перевернуть",
                    gotIt: "Знаю",
                    notYet: "Не знаю",
                    allReviewed: "Готово! Знаю: {{known}}, учу: {{unknown}}"
                },
                fillBlank: {
                    sentence: "Предложение {{n}}"
                },
                wordMatch: {
                    instructions: "Выберите слово слева, затем соответствие справа.",
                    allMatched: "Все пары сопоставлены!"
                },
                listening: {
                    audioTitle: "Аудио",
                    noAudio: "Ваш браузер не поддерживает аудио.",
                    noAudioFile: "Аудиофайл не предоставлен.",
                    answerPlaceholder: "Ваш ответ…"
                },
                writing: {
                    prompt: "Задание",
                    rubric: "Критерии оценки",
                    placeholder: "Напишите ваш ответ здесь…"
                }
            },
            reviewStatuses: {
                submitted: "На проверке",
                approved: "Одобрено",
                needsRevision: "Нужна правка",
                rejected: "Возвращено"
            },
            fallbacks: {
                noDueDate: "Срок не указан",
                course: "Неизвестный курс",
                taskTitle: "Задание",
                description: "Описание задания пока не добавлено."
            },
            submissionTypes: {
                attachment: "Прикреплен файл или ссылка",
                text: "Текстовый ответ",
                answer: "Ответ отправлен"
            },
            thread: {
                student: "Вы",
                teacher: "Преподаватель",
                answer: "Ответ",
                previousExchanges: "Предыдущие сообщения"
            },
            validation: {
                activityFileType: "Выберите PDF или Word-файл для активности.",
                homeworkFileType: "Выберите PDF или Word-файл для задания.",
                fileTooLarge: "Файл слишком большой. Максимальный размер {{size}}."
            },
            toasts: {
                activitySubmitUnavailable: "Отправка недоступна для этой активности.",
                homeworkSubmitUnavailable: "Отправка недоступна для этого задания.",
                addAnswerLinkOrFile: "Добавьте ответ, ссылку или файл.",
                completeInteractiveActivity: "Выполните задание перед отправкой.",
                activitySubmitted: "Активность отправлена.",
                homeworkSubmitted: "Задание отправлено.",
                activitySubmitError: "Не удалось отправить активность.",
                homeworkSubmitError: "Не удалось отправить задание.",
                unsupportedAttachment: "Тип файла не поддерживается. Используйте PDF или Word.",
                fileTooLarge: "Файл слишком большой. Максимальный размер 20 MB.",
                openAttachmentError: "Не удалось открыть вложение."
            },
            review: {
                currentResult: "Текущий результат",
                score: "Оценка: {{score}}",
                scoreWithMax: "Оценка: {{score}} / {{max}}",
                reviewedAt: "Проверено: {{date}}"
            },
            submission: {
                latest: "Последний ответ",
                submittedAt: "Время отправки: {{date}}"
            },
            quiz: {
                passedTitle: "Квиз успешно отправлен",
                completedTitle: "Квиз завершен",
                passedDescription: "Результат хороший. Этот квиз закрыт.",
                retryDescription: "Результат недостаточный. Можно попробовать еще раз.",
                closedDescription: "Квиз закрыт. Этот результат сохранен.",
                result: "Результат",
                passed: "Пройден",
                failed: "Не пройден"
            },
            submitPanel: {
                retakeQuizTitle: "Пересдать квиз",
                startQuizTitle: "Начать квиз",
                resubmitTitle: "Отправить ответ повторно",
                updateTitle: "Отправьте повторно, если нужно обновить",
                submitTitle: "Отправить ответ",
                retakeQuizDescription: "Предыдущий результат обновится, будет сохранена последняя попытка.",
                startQuizDescription: "Ответьте на вопросы и сразу отправьте квиз.",
                resubmitDescription: "Учтите комментарий инструктора и отправьте обновленный ответ.",
                updateDescription: "Задание на проверке. При необходимости можно обновить и отправить его повторно.",
                submitDescription: "Добавьте текст, ссылку или файл для отправки."
            },
            actions: {
                collapse: "Свернуть",
                reopen: "Открыть снова",
                start: "Начать",
                answer: "Ответить",
                openAttachment: "Открыть вложение",
                removeAttachment: "Удалить вложение",
                replaceFile: "Заменить",
                chooseFile: "Выбрать файл",
                uploadingFile: "Файл загружается...",
                submittingTask: "Задание отправляется...",
                submitting: "Отправка...",
                retake: "Пересдать",
                startQuiz: "Начать квиз",
                submit: "Отправить",
                download: "Скачать"
            },
            fields: {
                answerPlaceholder: "Напишите ответ",
                linkPlaceholder: "Добавить ссылку",
                filePlaceholder: "Добавить PDF или Word",
                fileTypeHint: "PDF, DOC, DOCX · макс. 20 МБ"
            },
            draftStatus: {
                uploading: "Вложение загружается. Не закрывайте страницу.",
                submitting: "Ответ отправляется. Результат обновится рядом с этим заданием.",
                unsaved: "Есть несохраненный ответ. Преподаватель увидит его только после отправки.",
                empty: "Ответ еще не подготовлен. Добавьте текст, ссылку, файл или ответы квиза."
            },
            help: {
                retakeQuiz: "Обновите ответы и пересдайте квиз.",
                startQuiz: "Ответьте на каждый вопрос и отправьте квиз.",
                answerRequired: "Нужен хотя бы ответ, ссылка или файл."
            },
            closedHints: {
                retakeQuiz: "Нажмите, чтобы пересдать квиз",
                startQuiz: "Нажмите, чтобы начать квиз",
                resubmit: "Нажмите, чтобы повторно отправить исправленный ответ",
                submit: "Нажмите, чтобы быстро отправить задание"
            },
            unavailable: {
                title: "Submit не подключен",
                description: "Прямая отправка через API пока недоступна для этого задания."
            },
            empty: {
                noResultTitle: "Ничего не найдено",
                noResultDescription: "Попробуйте изменить фильтры или очистить поиск."
            },
            preview: {
                attachment: "Вложение",
                attachmentTitle: "{{title}} — вложение",
                unavailable: "Предпросмотр недоступен.",
                directViewUnavailable: "Этот файл нельзя открыть прямо в браузере."
            }
        },
        resources: {
            eyebrow: "Ресурсы студента",
            title: "Ресурсы",
            sessionTitle: "Ресурсы сессии",
            emptyHeroDescription: "Материалы сессий, записи и данные для подключения собираются здесь.",
            description: "Материалы инструктора, записи уроков и данные для подключения находятся в одном месте.",
            searchPlaceholder: "Поиск по сессии, курсу или материалу",
            recordingTitle: "{{title}} — запись",
            metrics: {
                sessions: "Сессии",
                materials: "Материалы",
                recordings: "Записи",
                live: "Прямой эфир"
            },
            filters: {
                allTypes: "Все типы"
            },
            courseTypes: {
                video: "Видео",
                offline: "Офлайн",
                onlineLive: "Онлайн в прямом эфире"
            },
            statuses: {
                completed: "Закрыто"
            },
            fallbacks: {
                course: "Курс",
                resource: "Ресурс",
                unknownTime: "Неизвестное время"
            },
            empty: {
                title: "Ресурсов пока нет",
                description: "Материалы или записи появятся здесь после добавления.",
                noResultTitle: "Ресурс не найден",
                noResultDescription: "Попробуйте изменить поиск или фильтр."
            },
            selectSession: {
                title: "Выберите сессию",
                description: "Выберите сессию, чтобы посмотреть материалы и записи."
            },
            quickActions: {
                title: "Быстрые действия",
                description: "Основные ссылки для этой сессии.",
                empty: "Пока нет прямого действия."
            },
            actions: {
                joinLesson: "Присоединиться к уроку",
                viewRecording: "Смотреть запись",
                openTasks: "Открыть в заданиях",
                download: "Скачать"
            },
            materials: {
                title: "Материалы",
                available: "Доступно материалов: {{count}}",
                emptyDescription: "К этой сессии пока не добавлены материалы",
                empty: "Для этой сессии пока нет материалов."
            },
            materialTypes: {
                video: "Видео",
                image: "Изображение",
                file: "Файл",
                link: "Ссылка"
            },
            recordingContext: {
                title: "Запись и контекст",
                description: "Записи и логистика.",
                lessonRecording: "Запись урока",
                noRecording: "Записи пока нет.",
                offlineMeeting: "Офлайн-встреча",
                noLocation: "Место пока не указано."
            },
            activityTypes: {
                discussion: "Обсуждение",
                exercise: "Упражнение",
                quiz: "Квиз",
                groupWork: "Групповая работа"
            },
            activityStatuses: {
                planned: "Запланировано",
                active: "Идет",
                done: "Завершено"
            },
            activities: {
                title: "Активности сессии",
                description: "Назначенные инструктором активности для этой сессии. Контекст виден здесь, выполнение происходит в «Заданиях».",
                notice: "Здесь отображаются активности сессии. Квизы и другие активности открываются в «Заданиях».",
                questionCount: "Вопросов: {{count}}",
                answersInTasks: "Ответы открываются в «Заданиях»",
                questionLabel: "Вопрос #{{number}}",
                moreQuestions: "Еще вопросов: {{count}}. Перейдите в «Задания», чтобы выполнить все.",
                openInTasksHint: "Перейдите в «Задания», чтобы выполнить эту активность.",
                closedHint: "Эта активность закрыта. Если у вас есть ответ или результат, он отображается в «Заданиях».",
                empty: "Для этой сессии пока не добавлены отдельные активности."
            },
            preview: {
                unavailable: "Предпросмотр недоступен.",
                videoUnsupported: "Ваш браузер не поддерживает видео.",
                directViewUnavailable: "Этот файл нельзя открыть прямо в браузере."
            },
            toasts: {
                openMaterialError: "Не удалось открыть материал.",
                openRecordingError: "Не удалось открыть запись."
            }
        }
    }
};
