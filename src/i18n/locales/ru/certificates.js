export const certificates = {
    certificates: {
        download: {
            eyebrow: "PDF сертификата",
            title: "Сертификат загружается",
            description: "Мы готовим PDF-файл. Если браузер заблокирует загрузку, вы сможете повторить попытку на этой странице.",
            status: {
                failed: "Загрузка не удалась",
                ready: "Загрузка началась",
                preparing: "PDF готовится"
            },
            messages: {
                failedTitle: "Сейчас не удалось загрузить сертификат",
                readyTitle: "Файл должен загрузиться через браузер",
                preparingTitle: "Файл сертификата готовится",
                readyDescription: "Если файл не виден, проверьте список загрузок браузера или попробуйте загрузить снова.",
                preparingDescription: "Обычно это занимает несколько секунд. Не закрывайте страницу."
            },
            errors: {
                missingId: "Идентификатор сертификата не найден.",
                downloadFailed: "PDF не загрузился. Браузер мог заблокировать загрузку или сертификат сейчас недоступен."
            },
            actions: {
                preparing: "Готовится",
                retry: "Загрузить снова",
                openVerification: "Открыть страницу проверки",
                home: "Вернуться на главную"
            },
            labels: {
                certificateId: "ID сертификата"
            }
        },
        verification: {
            hero: {
                eyebrow: "Реестр EduBot Learning",
                title: "Проверка сертификата",
                description: "Эта страница объясняет текущий статус сертификата в реестре EduBot Learning для внешней проверки."
            },
            loading: "Информация проверки загружается...",
            status: {
                issued: {
                    label: "Подтвержден",
                    description: "Этот сертификат активен и действителен в реестре EduBot Learning.",
                    guidance: "Третья сторона может использовать эту запись для подтверждения успешного завершения курса студентом."
                },
                pending: {
                    label: "На проверке",
                    description: "Запись сертификата существует, но финальное подтверждение еще не завершено.",
                    guidance: "Не используйте этот статус как окончательное официальное подтверждение. Проверьте позже или обратитесь в поддержку EduBot."
                },
                revoked: {
                    label: "Отозван",
                    description: "Этот сертификат был выдан ранее, но сейчас он недействителен.",
                    guidance: "Отозванный сертификат не следует принимать как подтверждение завершения обучения."
                },
                rejected: {
                    label: "Отклонен",
                    description: "Запрос сертификата был отклонен и не был выдан как действительный сертификат.",
                    guidance: "Эта запись не является официальным сертификатом. Обратитесь в поддержку EduBot, если данные выглядят неверно."
                }
            },
            error: {
                title: "Не удалось подтвердить сертификат",
                description: "Проверьте ссылку еще раз. Если это должен быть официальный сертификат, обратитесь в поддержку EduBot Learning."
            },
            errors: {
                missingId: "Идентификатор сертификата не найден.",
                notFound: "Сертификат не найден или не может быть проверен по этой ссылке."
            },
            labels: {
                certificateId: "ID сертификата",
                partner: "Партнер",
                student: "Студент",
                course: "Курс",
                issuedAt: "Дата выдачи",
                signer: "Подписант",
                verificationLink: "Ссылка проверки",
                registryOwner: "Владелец реестра",
                registryOwnerHelper: "Основная сторона, которая выдала и проверяет этот сертификат."
            },
            official: {
                title: "Официальная проверка",
                registry: "Реестр EduBot Learning",
                description: "Эта запись опирается на реестр проверки EduBot Learning, а не на QR-код или сторонний сервис."
            },
            actions: {
                contactSupport: "Связаться с поддержкой",
                home: "Вернуться на главную",
                copyLink: "Скопировать ссылку",
                copied: "Скопировано",
                open: "Открыть"
            },
            copy: {
                missing: "Ссылка проверки сейчас не показана.",
                unsupported: "Этот браузер не поддерживает автоматическое копирование. Скопируйте ссылку вручную ниже.",
                failed: "Не удалось скопировать ссылку. Скопируйте текст ниже вручную."
            },
            fallbacks: {
                notSpecified: "Не указано",
                certificate: "Сертификат",
                noLink: "Ссылка не показана"
            },
            revokedAt: "Отозвано {{date}}."
        }
    },
    adminCertificates: {
        errors: {
            courseNotAssigned: "Этот курс не назначен вам.",
            loadStudentCourses: "Не удалось загрузить список курсов студентов.",
            loadStudents: "Не удалось загрузить студентов курса.",
            exactPreviewLoad: "Точный предпросмотр не загрузился."
        },
        previewCanvas: {
            mainTitle: "СЕРТИФИКАТ О ЗАВЕРШЕНИИ",
            supportingText: "успешно завершил(а) курс",
            issuedLabel: "Выдан",
            verificationLabel: "Предпросмотр ID проверки",
            fallbackTitle: "Сертификат достижения",
            partnershipLabel: "В партнерстве с",
            certifiesLabel: "Настоящим подтверждается, что",
            secondaryBrandLogoAlt: "Предпросмотр логотипа второго бренда",
            signatureAlt: "Предпросмотр подписи",
            adminIssuerTitle: "Админ",
            instructorIssuerTitle: "Инструктор",
            sampleStudentName: "Айгерим Садыкова",
            sampleCourseTitle: "Выбранный курс",
            sampleIssuerName: "Имя инструктора"
        },
        page: {
            hero: {
                eyebrow: "Рабочая область сертификатов",
                title: "Сертификаты",
                adminDescription: "Выберите курс и управляйте здесь правилами сертификатов, брендингом, подписантом и сертификатами, выдаваемыми студентам.",
                instructorDescription: "Выберите курс и управляйте здесь языком сертификата, изображением своей подписи и сертификатами, выдаваемыми студентам."
            },
            actions: {
                refresh: "Обновить",
                createCourse: "Создать курс",
                backToCourses: "Вернуться к курсам",
                saveRequirements: "Сохранить требования"
            },
            metrics: {
                totalStudents: "Всего студентов",
                courses: "Курсы",
                courseCertificates: "Сертификаты в этом курсе",
                averageProgress: "Средний прогресс",
                courseStudents: "Студенты этого курса",
                lessons: "Уроки",
                completed: "Завершили",
                registryCertificates: "Сертификаты в реестре"
            },
            selection: {
                title: "Выбор",
                description: "Выберите курс для управления сертификатами. Также можно выбрать конкретного студента внутри этого курса.",
                loadingCourses: "Курсы загружаются...",
                courseLabel: "Курс",
                selectCourse: "Выберите курс",
                studentLabel: "Студент",
                allStudents: "Все студенты",
                visibilityLabel: "Вид",
                specificStudentSelected: "Выбран конкретный студент",
                studentsVisible: "Показано студентов: {{count}}",
                studentsVisible_plural: "Показано студентов: {{count}}",
                noCourseSelected: "Сначала выберите курс",
                noCoursesTitle: "Курсов пока нет",
                noCoursesSubtitle: "Сначала создайте курс, затем сертификаты будут управляться здесь.",
                noCoursePanelTitle: "Курс не выбран",
                noCoursePanelDescription: "Эта вкладка предназначена для работы с сертификатами. Чтобы продолжить, выберите курс выше.",
                noCoursePanelBody: "После выбора курса здесь откроются шаблон, реестр и действия выдачи сертификата студенту."
            },
            courseWorkspace: {
                fallbackTitle: "Сертификаты",
                description: "После выбора курса шаблон, реестр и действия выдачи сертификатов выполняются в этом блоке."
            },
            filters: {
                title: "Выбор и фильтры",
                description: "Фильтруйте студентов курса, чтобы найти конкретного студента или быстро выделить студентов с достаточным прогрессом.",
                studentSearch: "Поиск студента",
                searchPlaceholder: "Имя, email или телефон",
                studentSelector: "Селектор студента",
                progressMin: "Прогресс не ниже",
                progressMax: "Прогресс не выше"
            },
            rule: {
                title: "Правило сертификата",
                description: "Выберите, будет ли сертификат выдаваться сразу после завершения курса или после подтверждения инструктором.",
                current: "Сейчас:",
                approvalModeInstructor: "Подтверждает инструктор",
                approvalModeAutomatic: "Выдается сразу",
                switchToAutomatic: "Переключить на мгновенную выдачу",
                switchToInstructorApproval: "Включить режим подтверждения"
            },
            requirements: {
                title: "Требования завершения",
                description: "Видеокурсы считаются по прогрессу уроков. Для офлайн-курсов и курсов с прямыми занятиями авто-сертификат создается, когда выполнены эти требования.",
                attendance: {
                    title: "Посещаемость",
                    description: "Сессии должны быть завершены, а процент посещаемости должен достигать порога."
                },
                homework: {
                    title: "Домашняя работа",
                    description: "Опубликованные задания, назначенные студенту, должны быть одобрены."
                },
                activities: {
                    title: "Классные активности",
                    description: "Пройденные квизы и одобренные упражнения или групповые работы засчитываются в это требование."
                },
                minimumPercent: "Минимум %"
            },
            template: {
                title: "Шаблон сертификата",
                adminDescription: "EduBot Learning остается основным брендом. Здесь настраиваются правила шаблона для курса.",
                instructorDescription: "Здесь можно посмотреть внешний вид сертификата курса и выданные сертификаты.",
                editMode: "Режим редактирования",
                viewMode: "Режим просмотра",
                editModeDescription: "Измените и сохраните правила шаблона для этого курса.",
                viewModeDescription: "Правила шаблона открыты в режиме просмотра. Включите редактирование, чтобы внести изменения.",
                saving: "Сохранение...",
                saveRules: "Сохранить правила",
                replace: "Заменить",
                upload: "Загрузить",
                notProvided: "Не указано",
                languageOptions: {
                    en: "English",
                    ru: "Русский",
                    ky: "Кыргызча"
                },
                orientationOptions: {
                    landscape: "Горизонтальная",
                    portrait: "Вертикальная"
                },
                branding: {
                    title: "Брендинг",
                    description: "Обновите здесь название сертификата, партнерский бренд и логотип.",
                    primaryBrandBadge: "EduBot основной бренд",
                    certificateTitle: "Название сертификата",
                    secondaryBrand: "Второй бренд",
                    secondaryBrandPlaceholder: "Название компании или партнера",
                    secondaryLogo: "Логотип второго бренда",
                    logoFormats: "PNG, JPG или WEBP",
                    secondaryLogoAlt: "Предпросмотр логотипа второго бренда",
                    logoEmpty: "Логотип появится здесь после загрузки.",
                    logoUploading: "Логотип загружается...",
                    logoReady: "Логотип готов. При необходимости его можно заменить.",
                    logoOptional: "Оставьте это поле пустым, если партнерский логотип не нужен."
                },
                signer: {
                    title: "Подписант",
                    description: "Эта информация используется при выдаче сертификата. Имя, роль и изображение подписи не сохраняются как правила курса.",
                    certificateLanguage: "Язык сертификата",
                    signerName: "Подписант",
                    signerNamePlaceholder: "Имя инструктора",
                    signerRole: "Роль подписанта",
                    signerRolePlaceholder: "Инструктор",
                    certificateFormat: "Формат сертификата",
                    signature: "Подпись",
                    signatureDescription: "Подпись рисуется и сохраняется в отдельном окне.",
                    updateSignature: "Обновить подпись",
                    drawSignature: "Нарисовать подпись",
                    signatureAlt: "Предпросмотр подписи",
                    signatureEmpty: "Изображение подписи появится здесь после загрузки.",
                    signatureSaving: "Подпись сохраняется...",
                    signatureReady: "Подпись готова. Она автоматически обновит строку на сертификате.",
                    signatureHelp: "После рисования и сохранения подпись появится здесь."
                },
                appearance: {
                    title: "Внешний вид",
                    description: "Выберите ориентацию страницы, основной цвет и акцентный цвет.",
                    resetDefaults: "Вернуть значения по умолчанию",
                    pageOrientation: "Ориентация страницы",
                    primaryColor: "Основной цвет",
                    accentColor: "Акцентный цвет",
                    presets: "Готовые темы",
                    presetsDescription: "Переключайте цветовые пары одним нажатием"
                },
                preview: {
                    livePreview: "Живой предпросмотр",
                    fullPreview: "Полный предпросмотр",
                    exactLoading: "Точный предпросмотр загружается...",
                    exactFrameTitle: "Точный предпросмотр сертификата",
                    unsavedChanges: "Изменения еще не сохранены",
                    templateSaved: "Шаблон сохранен",
                    unavailable: "Предпросмотр недоступен."
                },
                footer: {
                    primaryBrand: "Основной бренд:",
                    secondaryBrandSummary: " · Второй: {{brand}}",
                    unsavedChanges: "Есть несохраненные изменения",
                    allChangesSaved: "Все изменения сохранены",
                    regenerating: "Обновление...",
                    regeneratePdf: "Обновить PDF",
                    regenerateHelp: "Повторно создает ранее сгенерированные файлы сертификатов",
                    saveTemplate: "Сохранить шаблон",
                    saveTemplateHelp: "Сохраняет настройки шаблона. PDF-файлы обновляются отдельно",
                    regenerateNote: "`Обновить PDF` повторно создает ранее сгенерированные файлы сертификатов.",
                    saveTemplateNote: "`Сохранить шаблон` сохраняет настройки, но не пересоздает PDF-файлы автоматически."
                }
            },
            registry: {
                title: "Реестр сертификатов",
                description: "Последний статус сертификатов, созданных для этого курса.",
                metrics: {
                    issued: "Выдано",
                    pending: "На рассмотрении",
                    revoked: "Отозвано",
                    rejected: "Отклонено"
                },
                studentFallback: "Студент #{{id}}",
                empty: "Для этого курса сертификаты пока не созданы."
            },
            students: {
                title: "Студенты",
                loadingDescription: "Список загружается.",
                issueTitle: "Выдача сертификатов студентам",
                issueDescription: "Выбор курса и студента объединен здесь: найдите студента и выполните выдачу или подтверждение по статусу сертификата.",
                selectedNotFoundDescription: "Выбранный студент не найден с этим фильтром.",
                emptyDescription: "Список по этому курсу пока пуст.",
                selectedNotFoundTitle: "Этот студент не соответствует текущему фильтру",
                emptyTitle: "В этом курсе пока нет студентов",
                selectedNotFoundSubtitle: "Выберите другого студента или очистите селектор.",
                emptySubtitle: "Попробуйте выбрать другой курс или дождитесь записей.",
                eligibility: {
                    attendance: "Посещаемость:",
                    homework: "Домашняя работа:",
                    activities: "Активности:"
                }
            },
            pagination: {
                previous: "Назад",
                next: "Далее",
                page: "Страница {{page}} / {{total}}"
            },
            signatureModal: {
                title: "Нарисовать подпись",
                description: "Сохраните после рисования. Обновленная подпись сразу применится к сертификату."
            }
        },
        signaturePad: {
            title: "Или подпишите здесь",
            description: "Нарисованная подпись сохранится как прозрачный PNG.",
            clear: "Очистить",
            save: "Сохранить подпись"
        },
        status: {
            issued: "Сертификат выдан",
            pending_approval: "Сертификат на рассмотрении",
            rejected: "Сертификат отклонен",
            revoked: "Сертификат отозван",
            none: "Сертификата нет"
        },
        actions: {
            issue: "Выдать",
            issuing: "Выдача...",
            reissue: "Выдать повторно",
            approve: "Одобрить",
            approving: "Одобрение...",
            reject: "Отклонить",
            sending: "Отправка...",
            revoke: "Отозвать",
            revoking: "Отзыв...",
            downloadPdf: "Скачать PDF",
            pdf: "PDF",
            verify: "Проверить"
        },
        eligibilityReasons: {
            sessionsMissing: "сессии не созданы",
            sessionsIncomplete: "сессии не завершены",
            attendanceBelowThreshold: "посещаемость ниже порога",
            homeworkBelowThreshold: "домашние задания ниже порога",
            activitiesBelowThreshold: "классные активности ниже порога",
            lessonProgressIncomplete: "прогресс уроков не завершен"
        },
        state: {
            issued: {
                button: "Выдан",
                helper: "Сертификат активен. Можно использовать PDF или ссылку проверки."
            },
            pending: {
                button: "На рассмотрении",
                helper: "Запрос уже создан. Теперь его нужно одобрить или отклонить."
            },
            incomplete: {
                requirementsButton: "Требования не выполнены",
                manualWithMissing: "Требования для автоматической выдачи не выполнены: {{missing}}. Сертификат все еще можно выдать вручную.",
                manualWithProgress: "Курс завершен не полностью. Текущий прогресс: {{progress}}%. Сертификат все еще можно выдать сейчас.",
                blockedWithMissing: "Требования для сертификата не выполнены: {{missing}}.",
                blockedWithProgress: "Курс завершен не полностью. Текущий прогресс: {{progress}}%."
            },
            rejected: {
                manualHelper: "Предыдущий сертификат был отклонен. Курс завершен, поэтому сертификат можно выдать повторно.",
                helper: "Предыдущий сертификат был отклонен."
            },
            revoked: {
                manualHelper: "Предыдущий сертификат был отозван. При необходимости можно выпустить новый.",
                helper: "Предыдущий сертификат был отозван."
            },
            ready: {
                button: "Готов",
                manualHelper: "Студент завершил курс. Сертификат можно выдать сейчас.",
                helper: "Студент завершил курс. Сертификат выдается автоматически или по правилам администратора."
            }
        },
        studentCard: {
            enrolledAt: "Записан",
            completion: "Завершение"
        },
        toasts: {
            featureDisabled: "Сертификаты отключены для этого тенанта.",
            ruleUpdated: "Правило сертификата обновлено.",
            ruleUpdateError: "Не удалось обновить правило сертификата.",
            templateSaved: "Шаблон сертификата сохранен.",
            templateSaveError: "Не удалось сохранить шаблон сертификата.",
            regenerated: "Сертификатов обновлено: {{count}}.",
            noneRegenerated: "Сертификатов для обновления не найдено.",
            regenerateError: "Не удалось обновить PDF-файлы сертификатов.",
            signatureSaved: "Подпись сохранена.",
            secondaryLogoUploaded: "Второй логотип бренда загружен.",
            signatureSaveError: "Не удалось сохранить подпись.",
            assetUploadError: "Не удалось загрузить актив сертификата.",
            certificateUpdated: "Сертификат обновлен.",
            certificateActionError: "Не удалось выполнить действие с сертификатом."
        }
    }
};
