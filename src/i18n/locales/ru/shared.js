export const shared = {
    common: {
        appName: "EduBot Learning",
        language: "Язык",
        openMenu: "Открыть меню",
        openSearch: "Открыть поиск",
        search: "Поиск",
        searchCourses: "Поиск курсов",
        searching: "Идет поиск...",
        loading: "Загрузка",
        loadingEllipsis: "Загрузка...",
        refresh: "Обновить",
        clearFilters: "Сбросить фильтры",
        all: "Все",
        copy: "Копировать",
        progress: "Прогресс",
        empty: "Пока нет элементов.",
        searchUnavailable: "Поиск сейчас недоступен.",
        noResults: "Ничего не найдено",
        close: "Закрыть",
        closeEsc: "Закрыть (ESC)",
        cancel: "Отмена",
        done: "Готово",
        login: "Войти",
        logout: "Выйти",
        signup: "Зарегистрироваться",
        closeMenu: "Закрыть меню",
        userMenu: "Меню пользователя",
        userFallback: "Пользователь",
        identified: "Идентифицирован",
        activeAccount: "Активный аккаунт",
        favourites: "Избранное",
        cart: "Корзина",
        enums: {
            courseTypes: {
                video: "Видеокурс",
                offline: "Офлайн",
                onlineLive: "Онлайн в прямом эфире"
            },
            deliveryModes: {
                group: "Группа",
                individual: "Индивидуально"
            },
            certificateStatuses: {
                issued: "Выдан",
                pendingApproval: "Ожидает подтверждения",
                pending: "Ожидает",
                rejected: "Отклонен",
                revoked: "Отозван",
                none: "Нет сертификата"
            },
            pageOrientations: {
                landscape: "Альбомная",
                portrait: "Портретная"
            }
        }
    },
    videoPlayer: {
        play: "Воспроизвести",
        pause: "Пауза",
        rewind15: "Назад на 15 секунд",
        forward15: "Вперед на 15 секунд",
        volume: "Громкость",
        quality: "Качество",
        autoQuality: "Авто",
        fullscreen: "Полный экран",
        exitFullscreen: "Выйти из полноэкранного режима"
    },
    cartProvider: {
        messages: {
            videoOnly: "Самостоятельная покупка через LMS доступна только для видеокурсов.",
            alreadyInCart: "Курс уже в корзине.",
            addFailed: "Не удалось добавить курс в корзину.",
            added: "Курс добавлен в корзину."
        }
    },
    confirmationModal: {
        confirm: "Подтвердить",
        cancel: "Отмена",
        defaultBody: "Если продолжить, изменение будет применено сразу."
    },
    formControls: {
        phonePlaceholder: "Номер телефона",
        clearSearch: "Очистить поиск",
        showPassword: "Показать пароль",
        hidePassword: "Скрыть пароль"
    },
    supportContact: {
        addressShort: "г. Бишкек, Ахунбаева 129B",
        addressFull: "Ахунбаева 129B, Бишкек, Кыргызстан",
        workingHours: "Понедельник - Пятница, 9:00 - 21:00"
    },
    chatWorkspace: {
        sidebarTitle: "Беседы",
        searchPlaceholder: "Поиск чатов",
        composerPlaceholder: "Напишите сообщение...",
        selectChatTitle: "Выберите чат",
        backToChats: "Назад к чатам",
        messagesLog: "Сообщения чата",
        emptyMessages: {
            title: "Начните беседу",
            subtitle: "Напишите первое сообщение в этом чате."
        },
        messageOwners: {
            me: "Ваше",
            them: "Их"
        },
        messageAria: "{{owner}} сообщение: {{content}}",
        fileFallback: "Файл",
        imageAlt: "Изображение в чате",
        addAttachment: "Добавить файл",
        attachmentFile: "Файл",
        attachmentImage: "Изображение",
        composerAria: "Поле сообщения",
        sendMessage: "Отправить сообщение",
        selectFile: "Выбрать файл",
        selectImage: "Выбрать изображение"
    },
    timeUtils: {
        minutesSecondsShort: "{{minutes}} мин {{seconds}} сек",
        hoursMinutesShort: "{{hours}} ч {{minutes}} мин",
        hoursShort: "{{count}} ч",
        minutesShort: "{{count}} мин"
    },
    quizUtils: {
        validation: {
            missingQuiz: "Данные квиза не найдены.",
            addQuestion: "Добавьте хотя бы один вопрос.",
            questionPromptRequired: "Для вопроса {{number}} нужен текст.",
            questionNeedsOptions: "У вопроса {{number}} должно быть минимум 2 варианта.",
            questionNeedsCorrectAnswer: "Отметьте правильный ответ для вопроса {{number}}.",
            questionOptionsRequired: "Заполните все варианты в вопросе {{number}}."
        }
    },
    challengeUtils: {
        defaults: {
            testTitle: "Тест {{number}}",
            starterCode: "// Напишите код здесь\n"
        },
        labels: {
            testArgs: "Аргументы теста {{number}}",
            testExpected: "Ожидаемый результат теста {{number}}"
        },
        errors: {
            invalidJson: "{{label}} должен быть валидным JSON.",
            missingChallenge: "Данные кодового задания не заполнены.",
            missingInstructions: "Напишите инструкции к кодовому заданию.",
            addTest: "Добавьте хотя бы один тест.",
            testTitleRequired: "Напишите название для теста {{number}}."
        }
    },
    lessonUtils: {
        readTime: "{{count}} мин чтения"
    },
    relativeTime: {
        now: "сейчас",
        minutesAgo: "{{count}} минут назад",
        hoursAgo: "{{count}} часов назад",
        daysAgo: "{{count}} дней назад"
    },
    stickyButton: {
        whatsappAria: "Связаться через WhatsApp: {{phone}}"
    },
    sidebarOverlay: {
        label: "Боковая панель"
    },
    nav: {
        courses: "Курсы",
        about: "О нас",
        contact: "Контакты",
        dashboard: "Панель",
        myCourses: "Мои курсы",
        attendance: "Посещаемость",
        notifications: "Уведомления",
        chat: "Чат",
        primaryNavigation: "Основная навигация",
        mobilePrimaryNavigation: "Основная мобильная навигация",
        accountMenu: "Меню аккаунта",
        guestMenu: "Меню гостя"
    },
    footer: {
        navigation: "Навигация",
        contact: "Контакты",
        address: "Наш адрес",
        openWebsite: "Открыть сайт {{brand}}",
        qrAlt: "QR-код для сайта {{brand}}",
        copyright: "© {{year}} EduBot Learning. Все права защищены."
    },
    chatRedirect: {
        title: "Раздел чата не найден",
        description: "Для этого аккаунта не настроен прямой маршрут чата. Вернитесь в панель и выберите доступный раздел сообщений или поддержки.",
        actions: {
            dashboard: "Вернуться в панель",
            support: "Поддержка"
        }
    },
    unauthorized: {
        eyebrow: "Доступ ограничен",
        title: "У вас нет прав для открытия этой страницы",
        signedInAs: "Сейчас вы вошли как {{role}}.",
        signInPrompt: "Войдите, чтобы продолжить, или выберите правильный аккаунт.",
        reasons: {
            role: "Этот раздел может быть доступен только для другой роли.",
            enrollment: "Ваш доступ к этому курсу или организации может быть еще не активен.",
            session: "Если сессия истекла, войдите снова.",
            default: "Раздел, который вы пытались открыть, закрыт для текущего аккаунта."
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
            dashboard: "Вернуться в панель",
            login: "Войти",
            courses: "Посмотреть курсы",
            back: "Назад",
            support: "Связаться с поддержкой"
        },
        guidance: {
            title: "Что можно сделать?",
            role: {
                title: "Проверьте роль",
                description: "Этот раздел может быть открыт только для одной из ролей: студент, инструктор, ассистент или админ."
            },
            account: {
                title: "Смените аккаунт",
                description: "Если вы используете другой аккаунт, выйдите и войдите снова с правильным аккаунтом."
            },
            access: {
                title: "Запросите доступ",
                description: "Если нужен доступ к курсу, компании или админ-панели, свяжитесь с администратором или поддержкой."
            }
        }
    },
    errors: {
        generic: "Произошла ошибка сервера.",
        CSRF_TOKEN_INVALID: "Защита сессии обновлена. Повторите действие.",
        AUTHENTICATION_REQUIRED: "Войдите и попробуйте снова.",
        AUTH_TOKEN_INVALID: "Срок действия сессии истек. Войдите снова.",
        AUTH_CREDENTIALS_INVALID: "Неверный email или пароль.",
        COMPANY_LOCALE_UNSUPPORTED: "Язык компании не поддерживается.",
        TENANT_CONTEXT_MISMATCH: "Это действие недоступно для выбранной организации.",
        CHAT_NOT_FOUND: "Чат не найден.",
        INSTRUCTOR_CHAT_NOT_FOUND: "Чат не найден.",
        categories: {
            ai: "Не удалось выполнить запрос к AI-ассистенту.",
            attendance: "Не удалось выполнить запрос по посещаемости.",
            auth: "Не удалось выполнить запрос авторизации.",
            cart: "Не удалось выполнить запрос по корзине.",
            certificate: "Не удалось выполнить запрос по сертификату.",
            company: "Не удалось выполнить запрос по компании.",
            course: "Не удалось выполнить запрос по курсу.",
            enrollment: "Не удалось выполнить запрос по записи.",
            favorite: "Не удалось выполнить запрос по избранному.",
            group: "Не удалось выполнить запрос по группе.",
            homework: "Не удалось выполнить запрос по домашнему заданию.",
            integration: "Не удалось выполнить интеграционный запрос.",
            leaderboard: "Не удалось выполнить запрос по рейтингу.",
            lesson: "Не удалось выполнить запрос по уроку.",
            media: "Не удалось выполнить запрос по медиа.",
            meeting: "Не удалось выполнить запрос по встрече.",
            notification: "Не удалось выполнить запрос по уведомлениям.",
            offering: "Не удалось выполнить запрос по предложению курса.",
            session: "Не удалось выполнить запрос по сессии.",
            skill: "Не удалось выполнить запрос по навыку.",
            student: "Не удалось выполнить запрос по студенту.",
            tenant: "Не удалось выполнить запрос по тенанту.",
            user: "Не удалось выполнить запрос по пользователю."
        }
    },
    notifications: {
        widget: {
            title: "Уведомления",
            description: "Новости и оповещения",
            latest: "Последние обновления"
        },
        center: {
            eyebrow: "Центр уведомлений",
            title: "Уведомления",
            description: "Последняя активность, оповещения и непрочитанные обновления собраны здесь."
        },
        metrics: {
            total: "Все уведомления",
            unread: "Непрочитанные",
            loadedPage: "Загруженная страница"
        },
        feed: {
            title: "Лента уведомлений",
            description: "Новые оповещения находятся сверху, старые сгруппированы по дням."
        },
        actions: {
            markAllRead: "Отметить все как прочитанные",
            markRead: "Прочитано",
            review: "Открыть",
            loadMore: "Загрузить еще уведомления",
            viewAll: "Смотреть все"
        },
        empty: {
            widgetTitle: "Уведомлений пока нет",
            widgetSubtitle: "Новые события появятся здесь.",
            feedTitle: "Уведомлений нет",
            feedSubtitle: "Новые события или обновления появятся здесь."
        },
        unreadBadge: "Новых: {{count}}",
        fallbackTitle: "Уведомление"
    },
    analytics: {
        common: {
            chartLoadError: "Не удалось загрузить график",
            chartDataLoadError: "Не удалось загрузить данные графика",
            dataLoadError: "Ошибка загрузки данных",
            tableLoadError: "Не удалось загрузить данные таблицы. Повторите попытку.",
            tryAgain: "Повторите попытку",
            noData: "Данных нет",
            mobileLoading: "Загрузка для мобильного...",
            datasetLabel: "Набор данных {{number}}",
            paginationSummary: "Показаны {{start}}-{{end}} из {{total}} результатов",
            previous: "Назад",
            next: "Далее",
            sectionLoadError: "Ошибка загрузки раздела",
            sectionLoadErrorDescription: "Не удалось загрузить данные. Повторите попытку.",
            retry: "Повторить",
            refresh: "Обновить",
            filter: "Фильтр",
            export: "Экспорт",
            share: "Поделиться",
            quickActions: "Быстрые действия"
        }
    },
    ratings: {
        card: {
            fallbackInstructor: "Инструктор",
            fallbackTitle: "Преподаватель",
            fallbackSpecialty: "Практические занятия",
            newRating: "Новый рейтинг",
            topInstructor: "Топ-инструктор",
            ratingAria: "Рейтинг {{rating}}",
            reviews: "Отзывы",
            students: "Студенты"
        },
        comment: {
            toasts: {
                courseMissing: "Курс не найден.",
                ratingRequired: "Сначала поставьте оценку.",
                commentTooShort: "Отзыв должен быть не короче 5 символов.",
                submitted: "Отзыв успешно отправлен.",
                submitError: "Не удалось отправить отзыв. Попробуйте еще раз."
            },
            starAria: "{{count}} звезд",
            success: {
                title: "Спасибо за отзыв!",
                description: "Ваш отзыв помогает другим студентам выбрать курс и помогает нам улучшать курсы.",
                yourRating: "Ваша оценка:"
            },
            form: {
                title: "Как прошел курс? Оставьте отзыв",
                descriptionLine1: "Ваш отзыв помогает другим студентам выбрать курс.",
                descriptionLine2: "Ваше мнение очень ценно для нас.",
                placeholder: "Напишите о своем опыте...",
                minimum: "Минимум: 5 символов. Вы написали: {{count}}.",
                rating: "Оценка: {{rating}} / 5"
            },
            actions: {
                sending: "Отправка...",
                submit: "Отправить"
            }
        }
    },
    setupAccount: {
        imageAlt: "Настройка аккаунта",
        title: "Настройка аккаунта",
        description: "Создайте одноразовый пароль. Для следующих входов используйте email и этот пароль.",
        fields: {
            newPassword: "Новый пароль",
            confirmPassword: "Повторите пароль"
        },
        passwordRules: {
            title: "Правила пароля",
            length: "Минимум 8 символов",
            match: "Повтор пароля совпадает"
        },
        missingToken: {
            title: "Ссылка для настройки аккаунта отсутствует.",
            description: "Эта страница работает с одноразовой пригласительной ссылкой. Попросите CRM-менеджера отправить новое приглашение или вернитесь на страницу входа."
        },
        actions: {
            goToLogin: "Перейти ко входу",
            askForHelp: "Запросить помощь",
            activate: "Активировать аккаунт",
            activating: "Настройка..."
        },
        errors: {
            missingToken: "Ссылка для настройки аккаунта не найдена.",
            passwordTooShort: "Пароль должен быть не короче 8 символов.",
            passwordMismatch: "Пароли не совпадают.",
            passwordMismatchLive: "Пароли пока не совпадают.",
            invalidOrExpired: "Ссылка недействительна или истекла. Запросите новую ссылку.",
            requestNewInvite: "Если срок действия ссылки истек, попросите CRM-менеджера отправить новое приглашение."
        },
        success: {
            redirecting: "Аккаунт готов. Перенаправляем в LMS.",
            ready: "Аккаунт готов. Теперь можно войти в LMS."
        },
        footer: {
            prefix: "Если ссылка перестала работать, попросите CRM-менеджера отправить новую или",
            loginLink: "перейдите на страницу входа"
        }
    },
    media: {
        video: {
            ariaLabel: "Учебное видео",
            playbackError: "При воспроизведении видео произошла ошибка.",
            playbackFailed: "К сожалению, видео не удалось воспроизвести.",
            hlsUnsupported: "Этот браузер не поддерживает HLS. Используйте MP4-версию видео.",
            notFound: "Видео не найдено",
            loadFailed: "Не удалось загрузить видео.",
            retry: "Повторить"
        }
    },
    a11y: {
        skipNavigation: {
            label: "Ссылки пропуска навигации",
            main: "Перейти к основному содержимому",
            mainWithShortcut: "Перейти к основному содержимому (Alt + M)",
            navigation: "Перейти к навигации",
            navigationWithShortcut: "Перейти к навигации (Alt + N)",
            search: "Перейти к поиску",
            searchWithShortcut: "Перейти к поиску (Alt + S)"
        }
    }
};
