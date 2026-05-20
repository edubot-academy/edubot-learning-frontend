export const integrations = {
    integrationTab: {
        toasts: {
            loadFailed: "Не удалось загрузить данные интеграции.",
            detailLoadFailed: "Не удалось загрузить подробности события.",
            copied: "{{label}} скопирован.",
            copyFailed: "Не удалось скопировать {{label}}."
        },
        hero: {
            eyebrow: "Синхронизация CRM и LMS",
            title: "Интеграция CRM-LMS",
            description: "Состояние webhook, сводка рисков и события статусов записей."
        },
        filters: {
            severity: "Уровень",
            issueType: "Тип риска",
            enrollmentStatus: "Статус записи",
            from: "С даты",
            to: "До даты"
        },
        metrics: {
            riskToday: "Рисковые предупреждения сегодня",
            criticalAlerts: "Критические предупреждения",
            enrollmentEvents: "События записей",
            pendingWebhook: "Webhook в ожидании",
            failedWebhook: "Ошибки webhook",
            lastSent: "Последняя отправка",
            pendingCrmEnrollments: "Ожидающие CRM-записи",
            dispatchErrors: "Ошибки отправки записей",
            lastPendingEnrollment: "Последняя ожидающая запись"
        },
        quickViews: {
            pending: "Ожидает",
            active: "Активна",
            failedDispatch: "Ошибка отправки"
        },
        sections: {
            pending: {
                title: "Ожидающие CRM-записи",
                description: "События записей, которые находятся в ожидании в LMS и отправлены в CRM."
            },
            risk: {
                title: "Последние критические рисковые предупреждения",
                description: "Серьезные проблемы синхронизации между LMS и CRM."
            },
            events: {
                title: "События статусов записей",
                description: "История статусов записей, полученная через webhook."
            }
        },
        table: {
            time: "Время",
            enrollment: "Запись",
            student: "Студент",
            crmLead: "CRM-лид",
            access: "Доступ",
            dispatch: "Отправка",
            note: "Примечание",
            severity: "Уровень",
            lmsStudent: "LMS-студент",
            summary: "Кратко",
            eventId: "ID события",
            enrollmentStatus: "Статус записи",
            error: "Ошибка"
        },
        empty: {
            pending: {
                title: "Ожидающие CRM-записи не найдены",
                subtitle: "Сейчас не видно ожидающих записей, пришедших из CRM."
            },
            risk: {
                title: "Критические рисковые предупреждения не найдены",
                subtitle: "Нет серьезных предупреждений, подходящих под фильтры."
            },
            events: {
                title: "События записей не найдены",
                subtitle: "Нет событий записей, подходящих под фильтры."
            }
        },
        detail: {
            title: "Подробности события записи",
            eventTime: "Время события",
            lmsEnrollment: "LMS-запись",
            lmsEnrollmentId: "ID LMS-записи",
            studentName: "Имя студента",
            lmsStudentId: "ID LMS-студента",
            crmLeadId: "ID CRM-лида",
            dispatchStatus: "Статус отправки",
            loadingPayload: "Загрузка полного payload...",
            webhookPayload: "Webhook payload"
        },
        actions: {
            viewDetails: "Подробнее",
            openUserCard: "Открыть карточку пользователя",
            openWithFilter: "Открыть с подходящим фильтром"
        },
        fallbacks: {
            unknownName: "Имя неизвестно"
        },
        riskSeverity: {
            critical: "Критический",
            high: "Высокий",
            medium: "Средний",
            low: "Низкий"
        },
        riskIssueType: {
            low_attendance: "Низкая посещаемость",
            inactive_student: "Неактивный студент",
            low_homework_completion: "Низкое выполнение домашних заданий",
            low_quiz_participation: "Низкое участие в квизах",
            payment_risk: "Риск по оплате",
            missing_attendance: "Нет посещаемости",
            attendance_drop: "Падение посещаемости",
            missing_homework: "Нет домашнего задания",
            payment_overdue: "Просроченная оплата",
            no_access: "Нет доступа"
        },
        enrollmentStatus: {
            pending: "Ожидает",
            active: "Активна",
            cancelled: "Отменена",
            completed: "Завершена"
        },
        accessStatus: {
            active: "Активен",
            locked: "Заблокирован",
            pending: "Ожидает",
            revoked: "Отозван"
        },
        dispatchStatus: {
            sent: "Отправлено",
            failed: "Ошибка",
            pending: "Ожидает"
        }
    },
    company: {
        fields: {
            name: "Название компании",
            about: "Описание",
            logo: "Логотип",
            website: "Веб-сайт",
            email: "Email",
            phone: "Телефон",
            contactName: "Контактное лицо",
            contactEmail: "Контактный email",
            contactPhone: "Контактный телефон",
            address: "Адрес",
            city: "Город",
            country: "Страна",
            telegram: "Telegram",
            whatsapp: "WhatsApp",
            instagram: "Instagram",
            taxId: "Налоговый ID",
            notes: "Внутренние заметки"
        },
        list: {
            title: "Тенант-компании",
            subtitle: "Управляйте рабочими областями тенантов, открывайте операции компаний и создавайте новые тенанты с понятной ответственностью.",
            results: "Результаты",
            searchLabel: "Поиск компаний",
            searchPlaceholder: "Поиск по названию компании",
            clear: "Очистить",
            searchHint: "Поиск сохраняется в URL, поэтому этот отфильтрованный вид можно открыть снова.",
            createTitle: "Создать тенант",
            createHint: "Сначала создайте компанию, затем настройте контакты, участников, курсы и CRM-ссылки внутри рабочей области.",
            creating: "Создание...",
            createAction: "Создать компанию",
            directoryTitle: "Каталог компаний",
            filteredBy: "Фильтр: \"{{query}}\".",
            directorySubtitle: "Все рабочие области тенантов, доступные вашей роли.",
            pageOf: "Страница {{page}} из {{totalPages}}",
            loadErrorTitle: "Не удалось загрузить компании",
            loadErrorSubtitle: "Каталог тенантов недоступен. Повторите запрос перед созданием или открытием тенанта.",
            retry: "Повторить",
            noDescription: "Описания пока нет.",
            openWorkspace: "Открыть рабочую область",
            emptySearchTitle: "По этому запросу компаний нет",
            emptyTitle: "Компаний пока нет",
            emptySearchSubtitle: "Очистите поиск или попробуйте другое название компании.",
            emptySubtitle: "Создайте первую тенант-компанию, чтобы начать назначать участников и курсы.",
            clearSearch: "Очистить поиск",
            paginationLabel: "Страницы компаний",
            previous: "Назад",
            next: "Далее",
            toasts: {
                loadError: "Не удалось загрузить компании.",
                nameRequired: "Название компании обязательно.",
                created: "Компания создана.",
                createError: "Не удалось создать компанию."
            }
        },
        detail: {
            subtitle: "Управляйте профилем тенанта, пользователями и доступностью курсов из одной рабочей области.",
            notSet: "Не указано",
            loadErrorTitle: "Не удалось загрузить компанию",
            loadErrorSubtitle: "Тенант может быть недоступен или у вас нет доступа. Попробуйте загрузить снова.",
            retry: "Повторить",
            backToCompanies: "Назад к компаниям",
            managementAccess: "Доступ к управлению",
            readOnlyAccess: "Доступ только для чтения",
            tabsLabel: "Разделы рабочей области компании",
            summary: {
                role: "Роль",
                email: "Email",
                phone: "Телефон",
                city: "Город"
            },
            tabs: {
                settings: {
                    label: "Профиль компании",
                    description: "Бренд, контакты, адрес и юридическая информация"
                },
                members: {
                    label: "Участники",
                    description: "Роли, приглашения и доступ к рабочей области"
                },
                courses: {
                    label: "Курсы",
                    description: "Назначения курсов для этого тенанта"
                }
            },
            toasts: {
                loadError: "Не удалось загрузить данные компании."
            }
        },
        platformTenant: {
            adminFallback: "Админ",
            tenant: "Тенант",
            logoAlt: "Логотип {{name}}",
            uploadingLogo: "Загрузка...",
            headerSubtitle: "Управляйте профилем тенанта платформы, доменом, планом и интеграциями.",
            hideMenu: "Скрыть меню",
            showMenu: "Показать меню",
            tenantRegistry: "Реестр тенантов",
            notFoundTitle: "Тенант не найден",
            notFoundSubtitle: "Вернитесь в реестр тенантов платформы.",
            eyebrow: "Тенант платформы",
            tenants: "Тенанты",
            confirmAction: "Подтвердить действие",
            confirm: "Подтвердить",
            notConfigured: "Не настроено",
            notLinked: "Не привязан",
            values: {
                enabled: "Включено",
                disabled: "Отключено"
            },
            fields: {
                subdomain: "Поддомен",
                customDomain: "Кастомный домен",
                effectiveDomain: "Эффективный домен",
                timezone: "Часовой пояс",
                locale: "Локаль",
                status: "Статус",
                plan: "План",
                billingStatus: "Статус биллинга",
                crmTenantId: "CRM tenant ID",
                crmSlug: "CRM slug",
                crmPrimaryDomain: "Основной CRM-домен"
            },
            tabs: {
                overview: "Обзор",
                profile: "Профиль",
                domain: "Домен",
                billing: "План и биллинг",
                crm: "CRM-связь",
                members: "Владельцы и админы",
                courses: "Курсы",
                branding: "Брендинг",
                settings: "Настройки",
                flags: "Функциональные флаги",
                activity: "Активность"
            },
            status: {
                trial: "Пробный",
                active: "Активен",
                inactive: "Неактивен",
                suspended: "Приостановлен",
                archived: "Архивирован"
            },
            metrics: {
                status: "Статус",
                plan: "План",
                owners: "Владельцы",
                admins: "Админы",
                courses: "Курсы",
                students: "Студенты",
                flags: "Флаги",
                crm: "CRM"
            },
            courseVisibility: {
                PUBLIC: "Публичный",
                PRIVATE: "Приватный",
                TENANT_ONLY: "Только для тенанта"
            },
            snapshot: {
                title: "Сводка тенанта",
                name: "Название",
                locale: "Локаль",
                timezone: "Часовой пояс",
                billing: "Биллинг",
                subdomain: "Поддомен",
                customDomain: "Кастомный домен",
                crmTenantId: "CRM tenant ID",
                crmPrimaryDomain: "Основной CRM-домен",
                domain: "Домен",
                ownerAdminRows: "Строки владельцев/админов"
            },
            lifecycle: {
                title: "Жизненный цикл",
                description: "Используйте изменения статуса для контроля доступа тенанта перед разрушительной очисткой.",
                current: "Текущий: {{status}}",
                activate: "Активировать",
                suspend: "Приостановить",
                archive: "Архивировать",
                changeTitle: "Изменить статус тенанта",
                changeMessage: "Изменить статус тенанта на {{status}}?",
                changeConfirm: "Изменить статус"
            },
            branding: {
                displayName: "Отображаемое имя",
                certificateLogoUrl: "URL логотипа сертификата",
                primaryColor: "Основной цвет",
                secondaryColor: "Вторичный цвет",
                accentColor: "Акцентный цвет"
            },
            settings: {
                supportEmail: "Email поддержки",
                defaultCourseVisibility: "Видимость курсов по умолчанию",
                allowSelfEnrollment: "Разрешить самостоятельную запись на курс",
                requireEnrollmentApproval: "Требовать одобрение записи"
            },
            featureFlags: {
                customFlags: "Кастомные флаги",
                addCustomFlag: "Добавить кастомный флаг",
                flagKey: "Ключ флага",
                value: "Значение",
                customFeatureFlag: "Кастомный функциональный флаг",
                removeFeatureFlag: "Удалить функциональный флаг",
                noCustomFlags: "Кастомные флаги не настроены.",
                video: {
                    label: "Создание видеокурсов",
                    description: "Разрешить этому тенанту создавать приватные видеокурсы."
                },
                offline: {
                    label: "Офлайн-курсы",
                    description: "Разрешить этому тенанту проводить очные курсы."
                },
                onlineLive: {
                    label: "Живые онлайн-курсы",
                    description: "Разрешить этому тенанту проводить живое онлайн-обучение по расписанию."
                },
                certificates: {
                    label: "Сертификаты",
                    description: "Включить выдачу и настройку сертификатов."
                },
                attendance: {
                    label: "Посещаемость",
                    description: "Включить процессы посещаемости для живых или очных сессий."
                },
                homework: {
                    label: "Домашние задания",
                    description: "Включить задания и процессы сдачи работ."
                },
                crmSync: {
                    label: "CRM-синхронизация",
                    description: "Включить синхронизацию LMS-тенанта со связанным CRM-тенантом."
                },
                aiAssistant: {
                    label: "AI-ассистент",
                    description: "Включить AI-чат и возможности ассистента курса."
                }
            },
            activity: {
                description: "Последние изменения тенанта, записанные сервером.",
                loading: "Активность загружается...",
                empty: "Активность тенанта пока не записана.",
                roleSummary: "Роль: {{role}}",
                userNumber: "Пользователь #{{id}}",
                target: "объект",
                targetNumber: "{{type}} #{{id}}",
                noDetails: "Деталей нет",
                system: "Система",
                table: {
                    action: "Действие",
                    details: "Детали",
                    actor: "Автор",
                    time: "Время"
                },
                actions: {
                    tenantCreated: "Тенант создан",
                    tenantUpdated: "Тенант обновлен",
                    logoUpdated: "Логотип обновлен",
                    roleAdded: "Роль добавлена",
                    roleRemoved: "Роль удалена",
                    memberRemoved: "Участник удален",
                    roleChanged: "Роль изменена",
                    courseAttached: "Курс прикреплен",
                    courseRemoved: "Курс удален"
                }
            },
            toasts: {
                loadError: "Не удалось загрузить тенант.",
                activityLoadError: "Не удалось загрузить активность тенанта.",
                saved: "Тенант обновлен.",
                saveError: "Не удалось обновить тенант."
            }
        },
        members: {
            title: "Участники тенанта",
            description: "Управляйте ролями тенанта. Роль владельца управляется на уровне платформы и видна только администраторам платформы.",
            platformTitle: "Владельцы и админы",
            platformDescription: "Управляйте только правами владельца и админа тенанта из детальной страницы тенанта платформы.",
            searchHelp: "Найдите существующего пользователя и назначьте роль, которую он должен иметь в этом тенанте.",
            inviteAction: "Пригласить или создать участника",
            searchExistingUsers: "Поиск существующих пользователей",
            searchPlaceholder: "Поиск по имени или email...",
            searchResultsLabel: "Результаты поиска пользователей",
            noMatchingUsers: "Подходящих пользователей нет.",
            tenantRole: "Роль тенанта",
            adding: "Добавление...",
            addMember: "Добавить участника",
            sending: "Отправка...",
            resendInvite: "Отправить приглашение снова",
            removing: "Удаление...",
            remove: "Удалить",
            empty: "Участники тенанта не найдены.",
            table: {
                user: "Пользователь",
                email: "Email",
                role: "Роль",
                actions: "Действия"
            },
            roles: {
                fallbackDescription: "Доступ к рабочей области тенанта.",
                owner: {
                    label: "Владелец",
                    description: "Владелец тенанта, управляемый платформой, с полной видимостью владения."
                },
                company_admin: {
                    label: "Админ тенанта",
                    description: "Управляет пользователями, курсами и настройками рабочей области тенанта."
                },
                instructor: {
                    label: "Инструктор",
                    description: "Ведет курсы, сессии, домашние задания, сертификаты и учебную работу студентов."
                },
                assistant: {
                    label: "Ассистент",
                    description: "Поддерживает посещаемость, зачисление и ежедневные операции тенанта."
                },
                student: {
                    label: "Студент",
                    description: "Учится в назначенных курсах и получает ссылки настройки аккаунта."
                }
            },
            inviteModal: {
                title: "Пригласить или создать участника",
                subtitle: "Создайте пользователя платформы при необходимости, затем назначьте роль тенанта.",
                fullName: "Полное имя",
                email: "Email",
                sendSetupEmail: "Отправить email настройки",
                setupLink: "Ссылка настройки",
                copyLink: "Скопировать ссылку",
                close: "Закрыть",
                saving: "Сохранение...",
                createInvite: "Создать или пригласить"
            },
            inviteLinkModal: {
                title: "Ссылка настройки приглашения",
                subtitle: "Скопируйте и отправьте эту ссылку, если пользователь не получил email настройки.",
                emailSent: "Email отправлен. ",
                expires: "Истекает: {{value}}.",
                soon: "скоро",
                noSetupLink: "Ссылка настройки недоступна для этого участника. Аккаунт уже может быть активен."
            },
            removeModal: {
                title: "Удалить участника",
                message: "Удалить {{name}} из этого тенанта?",
                thisMember: "этого участника"
            },
            toasts: {
                loadError: "Не удалось загрузить участников тенанта.",
                selectUser: "Сначала выберите пользователя.",
                added: "Участник добавлен.",
                addError: "Не удалось добавить участника.",
                removed: "Участник удален.",
                removeError: "Не удалось удалить участника.",
                roleUpdated: "Роль обновлена.",
                roleUpdateError: "Не удалось обновить роль.",
                userCreated: "Пользователь создан и добавлен.",
                userAdded: "Пользователь добавлен в тенант.",
                inviteError: "Не удалось пригласить или создать.",
                linkCopied: "Ссылка настройки скопирована.",
                copyError: "Не удалось скопировать ссылку настройки.",
                inviteResent: "Приглашение отправлено снова.",
                linkRegenerated: "Ссылка приглашения создана заново.",
                resendError: "Не удалось отправить приглашение снова."
            }
        },
        courses: {
            title: "Курсы тенанта",
            description: "Сначала просмотрите назначенные курсы. Открывайте режим добавления только когда нужно прикрепить к этому тенанту еще один курс.",
            assignedCount: "Назначенные курсы: {{count}}",
            filterHelp: "Поиск ниже фильтрует курсы, уже прикрепленные к этому тенанту.",
            filterLabel: "Фильтр назначенных курсов",
            filterPlaceholder: "Фильтр назначенных курсов",
            closeAddMode: "Закрыть панель добавления",
            addCourse: "Добавить курс",
            attachTitle: "Прикрепить новый курс",
            attachSubtitle: "Этот поиск находит курсы, которые еще не прикреплены к этому тенанту.",
            attachSearchLabel: "Поиск курса для прикрепления",
            attachSearchPlaceholder: "Поиск названия курса для прикрепления",
            showingLimit: "Показано до {{count}} подходящих курсов. Уточните поиск для более точного назначения.",
            resultCount: "{{count}} результатов",
            searchFailedTitle: "Поиск курсов не удался",
            searchFailedSubtitle: "Повторите поиск или обновите список курсов тенанта.",
            retrySearch: "Повторить поиск",
            noCoursesFoundTitle: "Курсы не найдены",
            noCoursesFoundSubtitle: "Попробуйте другой поисковый запрос.",
            searchToAttach: "Найдите курс по названию, чтобы прикрепить его к этому тенанту.",
            loadErrorTitle: "Не удалось загрузить курсы тенанта",
            loadErrorSubtitle: "Список назначений недоступен. Повторите перед изменением связей курсов.",
            retry: "Повторить",
            attach: "Прикрепить",
            view: "Открыть",
            detaching: "Открепление...",
            detach: "Открепить",
            emptyTitle: "Связанных курсов нет",
            emptyManageSubtitle: "Прикрепите курс, чтобы сделать его доступным для этого тенанта.",
            emptyReadOnlySubtitle: "К этому тенанту пока не привязаны курсы.",
            paginationLabel: "Страницы курсов тенанта",
            table: {
                course: "Курс",
                instructor: "Инструктор",
                type: "Тип",
                status: "Статус",
                action: "Действие",
                actions: "Действия"
            },
            types: {
                video: "Видео",
                online_live: "Живой онлайн",
                offline: "Офлайн",
                course: "Курс"
            },
            status: {
                published: "Опубликован",
                draft: "Черновик",
                approved: "Одобрен",
                pending_approval: "Ожидает одобрения",
                in_review: "На проверке",
                rejected: "Отклонен",
                archived: "Архивирован",
                unknown: "Статус неизвестен"
            },
            price: {
                free: "Бесплатно",
                notSet: "Цена не указана",
                kgs: "{{amount}} KGS"
            },
            disabled: {
                badge: "Отключено для тенанта",
                action: "Отключено",
                offline: "Офлайн-курсы отключены для этого тенанта.",
                onlineLive: "Живые онлайн-курсы отключены для этого тенанта.",
                generic: "Этот тип курса отключен для этого тенанта."
            },
            detachModal: {
                title: "Открепить курс",
                message: "Открепить этот курс от тенанта? Текущие студенты могут потерять доступ на уровне тенанта в зависимости от политики сервера."
            },
            platform: {
                title: "Курсы",
                description: "Прикрепляйте существующие курсы к этому тенанту и удаляйте связи тенанта при необходимости.",
                searchTenantCourses: "Поиск курсов тенанта",
                attachPlaceholder: "Поиск существующего курса",
                attaching: "Прикрепление...",
                courseNumber: "Курс #{{id}}",
                noInstructor: "Инструктор не указан",
                disabledByFeatureFlags: "отключено функциональными флагами",
                noMatchingCourses: "Подходящие курсы не найдены.",
                loadingCourses: "Курсы загружаются...",
                remove: "Удалить",
                empty: "К этому тенанту не прикреплены курсы."
            },
            toasts: {
                loadError: "Не удалось загрузить курсы тенанта.",
                detached: "Курс откреплен от тенанта.",
                detachError: "Не удалось открепить курс.",
                attached: "Курс прикреплен к тенанту.",
                attachError: "Не удалось прикрепить курс."
            }
        },
        adminCompanies: {
            headerEyebrow: "Рабочая область тенанта",
            title: "Тенанты платформы",
            description: "Управляйте LMS-тенантами, доменами, состоянием плана и CRM-связями из одного экрана администратора платформы.",
            createTenant: "Создать тенант",
            billingStatuses: {
                trial: "Пробный период",
                active: "Активен",
                pastDue: "Просрочен",
                cancelled: "Отменен"
            },
            metrics: {
                tenants: "Тенанты",
                active: "Активные",
                domains: "Домены",
                crmLinked: "CRM связаны"
            },
            registry: {
                title: "Реестр тенантов",
                description: "Используйте реестр для быстрых управленческих изменений. Для глубокого управления профилем, CRM, участниками и курсами откройте детальную страницу тенанта.",
                searchPlaceholder: "Поиск тенантов",
                coursesLinked: "Связанные курсы: {{count}}",
                tenantWorkspace: "Рабочая область тенанта",
                emptyTitle: "Тенанты не найдены",
                emptySubtitle: "Создайте тенант или измените фильтр поиска."
            },
            courseLinks: {
                title: "Связи курсов",
                description: "Прикрепляйте существующие курсы к тенантам, не меняя runtime-маршрутизацию тенантов.",
                searchPlaceholder: "Поиск курсов или названий тенантов",
                showing: "Показано {{visible}} из {{total}} курсов",
                currentTenant: "Текущий тенант",
                notSelected: "Не выбран",
                selectTenant: "Выберите тенант",
                noMatchingTitle: "Подходящие курсы не найдены",
                noMatchingSubtitle: "Попробуйте другой поиск курса или тенанта.",
                showMore: "Показать больше курсов",
                emptyTitle: "Курсы не найдены",
                emptySubtitle: "Пока нет курсов, доступных для привязки к тенанту."
            },
            createModal: {
                title: "Создать тенант",
                subtitle: "Сначала создайте основу LMS-тенанта. Очистка владельца и участников выполняется на детальной странице тенанта.",
                ownerSearchPlaceholder: "Поиск существующего пользователя по имени или email",
                noMatchingOwners: "Подходящие пользователи не найдены.",
                clearOwner: "Очистить владельца"
            },
            confirm: {
                clearCourseTitle: "Очистить связи компаний",
                clearCourseMessage: "Очистить все назначения компаний для этого курса?",
                clearCourseConfirm: "Очистить связи"
            },
            toasts: {
                created: "Тенант создан.",
                updated: "Тенант обновлен.",
                courseLinksCleared: "Назначения компаний для курса очищены.",
                courseLinksClearError: "Не удалось очистить назначения компаний.",
                selectFile: "Выберите файл."
            }
        },
        settings: {
            title: "Профиль компании",
            subtitle: "Держите идентичность тенанта, контакты, адрес и юридические данные сгруппированными по назначению.",
            cancel: "Отмена",
            saving: "Сохранение...",
            saveChanges: "Сохранить изменения",
            editProfile: "Редактировать профиль",
            logoAlt: "Логотип",
            logoPreviewAlt: "Предпросмотр логотипа компании",
            noLogo: "Логотипа нет",
            uploadLogoFile: "Загрузить файл логотипа",
            pasteLogoUrl: "Или вставить URL логотипа",
            dangerTitle: "Опасная зона",
            dangerSubtitle: "Удаляйте компанию только если тенант нужно убрать с платформы. Это действие требует подтверждения.",
            deleting: "Удаление...",
            deleteCompany: "Удалить компанию",
            deleteTitle: "Удалить компанию",
            deleteMessage: "Удалить \"{{name}}\"? Рабочая область компании будет удалена с платформы.",
            validation: {
                nameRequired: "Название компании обязательно.",
                email: "Введите корректный email.",
                website: "Введите корректный URL веб-сайта."
            },
            toasts: {
                reviewFields: "Проверьте выделенные поля.",
                saved: "Профиль компании сохранен.",
                saveError: "Не удалось сохранить профиль компании.",
                deleted: "Компания удалена.",
                deleteError: "Не удалось удалить компанию.",
                logoUploaded: "Логотип загружен.",
                logoUploadFailed: "Не удалось загрузить логотип.",
                logoUploadError: "Не удалось загрузить логотип.",
                logoUploadMissingUrl: "Логотип загружен, но URL логотипа не был возвращен."
            },
            sections: {
                brand: {
                    title: "Профиль бренда",
                    description: "Основная идентичность тенанта для экранов управления."
                },
                contact: {
                    title: "Контакты",
                    description: "Основные данные поддержки и ответственного контакта."
                },
                location: {
                    title: "Местоположение",
                    description: "Адресные данные для записей тенанта и коммуникации."
                },
                channels: {
                    title: "Каналы",
                    description: "Публичные социальные сети и каналы сообщений."
                },
                legal: {
                    title: "Юридические данные и заметки",
                    description: "Внутренние юридические идентификаторы и рабочие заметки."
                }
            }
        }
    }
};
