export const attendance = {
    attendance: {
        page: {
            title: "Посещаемость",
            description: "Управляйте и отслеживайте посещаемость студентов по сессиям."
        },
        view: {
            table: "Табличный вид",
            session: "Вид по сессии",
            cards: "Карточки",
            virtualized: "Оптимально"
        },
        filters: {
            course: "Курс",
            group: "Группа",
            session: "Сессия",
            status: "Статус",
            all: "Все",
            allStatuses: "Все статусы",
            searchStudent: "Поиск студентов...",
            rateBelow50: "Ниже 50%",
            clearWithCount: "Очистить ({{count}})",
            advanced: "Расширенные фильтры",
            customDateRange: "Пользовательский диапазон дат",
            sessionFilter: "Фильтр сессии",
            allSessions: "Все сессии",
            quickFilters: "Быстрые фильтры",
            onlyAbsent: "Показать только отсутствующих",
            lowAttendance: "Низкая посещаемость %",
            thisWeek: "За эту неделю",
            onlyPresent: "Показать только присутствующих"
        },
        placeholders: {
            course: "Выберите курс",
            group: "Выберите группу",
            session: "Выберите сессию",
            notes: "Оставьте короткую заметку"
        },
        labels: {
            selected: "Выбрано",
            activeSession: "Активная сессия",
            joinedAt: "Вошел: {{time}}",
            leftAt: "Вышел: {{time}}"
        },
        fields: {
            notes: "Заметка"
        },
        delivery: {
            individual: "Индивидуальный курс",
            group: "Группа"
        },
        status: {
            present: "Присутствовал",
            late: "Опоздал",
            absent: "Отсутствовал",
            excused: "По уважительной причине",
            notScheduled: "Не запланировано"
        },
        metrics: {
            students: "Студенты",
            total: "Всего",
            rate: "Посещаемость %"
        },
        workspace: {
            eyebrow: "Панель посещаемости",
            title: "Посещаемость по сессии",
            description: "Посещаемость теперь управляется по точной группе и сессии, а не только по курсу или дате."
        },
        summary: {
            eyebrow: "Сводка посещаемости",
            title: "Итоги выбранной сессии",
            description: "Этот блок показывает реальное состояние посещаемости по выбранной сессии.",
            totalAttendance: "Общая посещаемость",
            trends: "Тенденции посещаемости",
            attendanceRate: "Посещаемость %:",
            studentCategories: "Категории посещаемости студентов",
            studentCategoriesShort: "Категории студентов",
            distribution: "Распределение посещаемости",
            bySession: "Посещаемость по сессиям",
            studentCount: "Студентов: {{count}}",
            currentPeriod: "Текущий период",
            previousPeriod: "Прошлый период",
            categories: {
                excellent: "Отлично (90-100%)",
                good: "Хорошо (75-89%)",
                fair: "Средне (50-74%)",
                poor: "Плохо (<50%)",
                noData: "Нет данных"
            }
        },
        actions: {
            openEditMode: "Открыть режим редактирования",
            closeEditMode: "Закрыть режим редактирования",
            saveAttendance: "Сохранить посещаемость",
            noChanges: "Нет изменений",
            saving: "Сохранение...",
            save: "Сохранить",
            clear: "Очистить"
        },
        admin: {
            overrideOpen: "Режим редактирования администратора открыт",
            readOnly: "Режим администратора только для просмотра",
            overrideOpenDescription: "Сейчас можно редактировать посещаемость. После завершения сохраните изменения и закройте режим.",
            readOnlyDescription: "Для админа этот экран по умолчанию только для просмотра. Чтобы внести изменения, сначала откройте режим редактирования."
        },
        empty: {
            selectGroupTitle: "Выберите группу",
            selectGroupForTable: "Для табличного вида сначала выберите группу.",
            selectCourseTitle: "Выберите курс",
            selectCourseDescription: "Чтобы посмотреть посещаемость, сначала выберите офлайн-курс или курс с прямыми занятиями.",
            selectGroupDescription: "Посещаемость по этому курсу ведется через группу.",
            selectSessionTitle: "Выберите сессию",
            selectSessionDescription: "Посещаемость сохраняется в одну конкретную сессию.",
            noStudentsTitle: "Студенты не найдены",
            noStudentsDescription: "Для выбранной группы список посещаемости пока пуст.",
            noRecordsTitle: "Записи не найдены",
            noRecordsDescription: "Измените сессию или фильтр статуса и попробуйте снова."
        },
        fallbacks: {
            lesson: "Урок",
            sessionWithId: "Сессия #{{id}}",
            location: "Локация не указана",
            timezone: "Timezone не указан",
            noSession: "Сессия не выбрана",
            noDate: "Нет даты",
            unknownDate: "Дата неизвестна"
        },
        loading: {
            title: "Загрузка",
            courses: "Курсы загружаются...",
            groups: "Группы загружаются...",
            sessions: "Сессии загружаются...",
            roster: "Список посещаемости загружается...",
            working: "Выполняется...",
            progressComplete: "{{current}} / {{total}} завершено"
        },
        notices: {
            coursesLoadErrorTitle: "Курсы не загружены",
            groupsLoadErrorTitle: "Группы не загружены",
            sessionsLoadErrorTitle: "Сессии не загружены",
            rosterLoadErrorTitle: "Список посещаемости не загружен",
            unsavedTitle: "Есть несохраненные изменения",
            statusChanged: "Вы изменили статус посещаемости. Изменение не попадет на сервер до сохранения.",
            notesChanged: "Заметка изменилась. Изменение не попадет на сервер до сохранения.",
            selectionRequiredTitle: "Нужно выбрать все",
            selectionRequired: "Чтобы сохранить посещаемость, выберите курс, группу и сессию.",
            editModeClosedTitle: "Режим редактирования закрыт",
            editModeClosed: "Чтобы изменить посещаемость как админ, сначала откройте режим редактирования.",
            noChangesTitle: "Нет изменений",
            noChanges: "Текущий список посещаемости совпадает с сохраненным состоянием.",
            noStudentsTitle: "Нет студентов",
            noStudentsToSave: "В этой группе нет списка посещаемости для сохранения.",
            savedTitle: "Посещаемость сохранена",
            saveErrorTitle: "Посещаемость не сохранена"
        },
        toasts: {
            coursesLoadError: "Не удалось загрузить курсы для посещаемости.",
            groupsLoadError: "Не удалось загрузить группы.",
            sessionsLoadError: "Не удалось загрузить сессии.",
            selectionRequired: "Выберите курс, группу и сессию.",
            openEditModeFirst: "Сначала откройте режим редактирования.",
            disabled: "Посещаемость отключена для этой организации.",
            noChanges: "Нет изменений.",
            noStudents: "Для этой группы студенты не найдены.",
            saved: "Посещаемость успешно сохранена.",
            updateSuccess: "Посещаемость успешно обновлена.",
            bulkUpdateSuccess: "Обновлено записей посещаемости: {{count}}.",
            updateFailed: "Не удалось обновить посещаемость."
        },
        bulk: {
            selection: {
                cellsSelected: "Выбрано ячеек: {{count}}",
                summary: "Студентов: {{students}} • сессий: {{sessions}}"
            },
            quickActions: {
                markAllPresent: "Отметить всех присутствующими",
                markAllAbsent: "Отметить всех отсутствующими",
                clearAbsent: "Очистить отсутствия"
            },
            actions: {
                markPresent: "Отметить присутствие",
                markLate: "Отметить опоздание",
                markAbsent: "Отметить отсутствие",
                markExcused: "Отметить уважительную причину",
                exportCsv: "Экспорт CSV",
                exportExcel: "Экспорт Excel",
                notifyParents: "Уведомить родителей",
                clearSelection: "Очистить выбор"
            },
            notificationMessage: "Информация о посещаемости сессии вашим ребенком",
            toasts: {
                updateSuccess: "Записей посещаемости обновлено: {{count}}. Статус: \"{{status}}\".",
                updateFailed: "Не удалось выполнить массовое обновление.",
                selectStudentsForExport: "Выберите студентов для экспорта.",
                exportSuccess: "Данные посещаемости экспортированы.",
                exportFailed: "Не удалось выполнить экспорт.",
                selectStudentsForNotification: "Выберите студентов для уведомления.",
                noStudentsToNotify: "Нет студентов, которым нужно отправить уведомление.",
                notifySuccess: "Уведомления отправлены родителям. Количество: {{count}}.",
                notifyFailed: "Не удалось отправить уведомления.",
                clearAbsentSuccess: "Очищено записей об отсутствии: {{count}}."
            }
        },
        cardView: {
            noStudentsFound: "Студенты не найдены",
            unknownStudent: "Неизвестно",
            attendanceRate: "Посещаемость %:",
            attended: "Присутствовал:"
        },
        table: {
            summary: "Итог",
            selectCellsHint: "Выберите ячейки, чтобы отметить посещаемость.",
            unsavedChanges: "Несохраненных изменений: {{count}}",
            saveEnabledHint: "Кнопка сохранения станет активной после внесения изменений.",
            clickCellHint: "Нажмите ячейку таблицы, чтобы изменить статус посещаемости.",
            selectStatusTitle: "Выберите статус посещаемости",
            actions: {
                reload: "Перезагрузить",
                discard: "Отменить"
            },
            toasts: {
                noChangesToSave: "Нет изменений для сохранения.",
                saveSuccess: "Записей посещаемости успешно сохранено: {{count}}.",
                saveFailed: "Не удалось сохранить посещаемость."
            }
        },
        loadingStates: {
            empty: {
                sessionsTitle: "Нет сессий",
                sessionsSubtitle: "Для этого курса сессии не запланированы.",
                dataTitle: "Нет данных",
                dataSubtitle: "Нет данных для отображения."
            },
            error: {
                title: "Произошла ошибка",
                unknown: "Неизвестная ошибка. Попробуйте снова.",
                retry: "Повторить"
            }
        },
        accessibility: {
            labels: {
                attendanceCell: "Изменить статус посещаемости для {{studentName}} в {{sessionTitle}}",
                statusButton: "Отметить {{studentName}} как \"{{status}}\"",
                bulkAction: "Отметить выбранных студентов как \"{{status}}\"",
                clearSelection: "Очистить весь выбор",
                saveChanges: "Сохранить изменения посещаемости"
            },
            announcements: {
                statusChanged: "Статус посещаемости изменен на \"{{status}}\"",
                selectionCleared: "Выбор очищен",
                changesSaved: "Все изменения успешно сохранены",
                error: "Ошибка: {{message}}",
                allCellsSelected: "Все ячейки выбраны"
            },
            shortcuts: {
                cycleStatus: "Изменить статус",
                selectMultiple: "Выбрать несколько",
                clearSelection: "Очистить выбор",
                saveChanges: "Сохранить изменения",
                navigation: "Навигация",
                markAbsent: "Отметить отсутствие",
                selectAll: "Выбрать все"
            }
        },
        errors: {
            sessionExpired: "Сессия истекла. Войдите снова.",
            forbidden: "У вас нет прав на это действие.",
            notFound: "Выбранная группа или сессия не найдена.",
            validation: "Ошибка проверки.",
            rateLimited: "Слишком много попыток. Попробуйте позже.",
            server: "Ошибка сервера."
        },
        legacy: {
            overview: "Обзор посещаемости",
            loadingData: "Данные посещаемости загружаются...",
            loadError: "Ошибка загрузки данных посещаемости",
            loadFailed: "Не удалось загрузить данные посещаемости",
            empty: "Данных посещаемости нет",
            noStudentsSubtitle: "Добавьте студентов в эту группу, чтобы начать учет посещаемости.",
            groupAttendance: "Посещаемость группы",
            counts: "{{students}} студентов · {{sessions}} сессий",
            searchStudents: "Поиск студентов...",
            studentName: "Имя студента",
            changeAttendanceAria: "Изменить посещаемость для {{student}} в {{session}}",
            cellsSelected: "Выбрано ячеек: {{count}}",
            markPresent: "Отметить присутствие",
            markLate: "Отметить опоздание",
            markAbsent: "Отметить отсутствие",
            clearSelection: "Очистить выбор",
            paginationSummary: "Показаны {{start}}-{{end}} из {{total}} студентов"
        }
    },
    groupSessions: {
        workspace: {
            tabs: {
                attendance: "Посещаемость",
                materials: "Ресурсы",
                homework: "Домашнее задание",
                activities: "Активности",
                notes: "Заметки",
                engagement: "Следующие действия"
            },
            errors: {
                unauthorized: "Сессия истекла. Войдите снова.",
                forbidden: "Этот курс, группа или сессия не назначены вам."
            },
            tabGroups: {
                primary: {
                    label: "Основной рабочий процесс",
                    description: "Самые частые действия во время сессии."
                },
                secondary: {
                    label: "Дополнительная рабочая область",
                    description: "Рефлексия, активности и анализ вовлеченности."
                }
            },
            page: {
                sessionModes: {
                    upcoming: "Ожидается",
                    live: "В эфире",
                    completed: "Завершена",
                    scheduled: "Запланирована"
                },
                deliveryModes: {
                    individual: "Индивидуальный курс",
                    group: "Группа"
                },
                toasts: {
                    selectSession: "Выберите сессию.",
                    notesSaved: "Заметки сохранены.",
                    notesSaveError: "Не удалось сохранить заметки."
                },
                primaryTools: {
                    attendance: {
                        label: "Отметить посещаемость",
                        description: "{{students}} студентов, {{rate}}% посещаемость"
                    },
                    materials: {
                        label: "Ресурсы занятия",
                        liveDescription: "Ссылка эфира, запись и материалы",
                        defaultDescription: "Материалы и записи"
                    },
                    homework: {
                        label: "Домашнее задание",
                        description: "{{homework}} заданий, {{review}} ответов требуют проверки"
                    }
                },
                emptyUnavailable: {
                    title: "Панель сессий пока недоступна",
                    subtitle: "Этот раздел открывается для утвержденных офлайн-курсов или онлайн-курсов в прямом эфире. Сначала создайте такой курс или дождитесь добавления утвержденного курса."
                },
                hero: {
                    eyebrow: "Рабочая панель инструктора",
                    title: "Панель сессий",
                    description: "Центр активной сессии внутри панели инструктора. После выбора курса, группы и сессии посещаемость, ресурсы и домашние задания работают в этом контексте."
                },
                metrics: {
                    today: "Сегодняшние сессии",
                    attendanceRate: "Посещаемость %",
                    homeworkPublished: "Задания опубликованы",
                    riskStudents: "Студенты в зоне риска"
                },
                activeContext: {
                    title: "Активный контекст",
                    description: "Сначала выберите точный курс, группу и сессию. Затем посещаемость, домашние задания и ресурсы будут работать в контексте этой активной сессии."
                },
                filters: {
                    course: "Курс",
                    selectCourse: "Выберите курс",
                    group: "Группа",
                    selectGroup: "Выберите группу",
                    session: "Переключить сессию",
                    selectSession: "Выберите сессию"
                },
                fallbacks: {
                    course: "Курс",
                    groupWithId: "Группа #{{id}}",
                    sessionWithId: "Сессия #{{id}}",
                    groupSession: "Групповая сессия",
                    notSelected: "Не выбрано",
                    noSession: "Сессия не выбрана"
                },
                today: {
                    title: "Сегодняшние сессии выбранной группы",
                    descriptionForGroup: "Быстро переключайте сессии для {{group}} здесь.",
                    descriptionEmpty: "Сначала выберите группу, затем здесь появятся сегодняшние сессии этой группы.",
                    empty: "У выбранной группы сегодня нет сессий."
                },
                countdown: {
                    remainingInline: " • осталось {{value}}"
                },
                livePanel: {
                    title: "Онлайн-сессия в прямом эфире",
                    startsIn: "Начнется через: {{value}}",
                    endsIn: "Закончится через: {{value}}",
                    completed: "Сессия завершена",
                    joinWindowHint: "Вход открывается за 10 минут до занятия."
                },
                actions: {
                    joinClass: "Войти на занятие",
                    createSession: "Создать новую сессию",
                    editSession: "Редактировать сессию",
                    openGroups: "Открыть панель групп"
                },
                setup: {
                    title: "Настройка сессии",
                    description: "Создание и редактирование остаются в модальном окне. Основная область сфокусирована на проведении активной сессии."
                },
                context: {
                    title: "Контекст",
                    course: "Курс",
                    group: "Группа",
                    session: "Сессия"
                },
                header: {
                    activeSession: "Активная сессия",
                    sessionStatus: "Статус сессии",
                    updating: "Обновление..."
                },
                attendanceMetrics: {
                    totalStudents: "Всего студентов"
                }
            },
            validation: {
                selectSession: "Выберите сессию."
            },
            activities: {
                toasts: {
                    created: "Активность добавлена.",
                    updated: "Активность обновлена.",
                    deleted: "Активность удалена.",
                    createError: "Не удалось сохранить активность.",
                    updateError: "Не удалось обновить активность.",
                    deleteError: "Не удалось удалить активность.",
                    loadResponsesError: "Не удалось загрузить результаты активности.",
                    responseUpdated: "Ответ по активности обновлен.",
                    responseSaveError: "Не удалось сохранить ответ по активности."
                }
            },
            attendance: {
                title: "Посещаемость",
                description: "Отмечайте посещаемость сессии и быстрее сохраняйте изменения с массовыми действиями.",
                sessionStatus: {
                    present: "Присутствовал",
                    late: "Опоздал",
                    absent: "Отсутствовал",
                    excused: "По уважительной причине"
                },
                sessionModes: {
                    upcoming: "Ожидается",
                    live: "В эфире",
                    completed: "Завершено"
                },
                fallbacks: {
                    session: "Сессия #{{value}}",
                    group: "Группа",
                    noTime: "Время не указано"
                },
                actions: {
                    importingZoom: "Импорт...",
                    importZoom: "Импорт Zoom",
                    saving: "Сохранение...",
                    save: "Сохранить посещаемость",
                    noChanges: "Изменений нет"
                },
                filters: {
                    searchPlaceholder: "Поиск студента",
                    all: "Все",
                    unmarked: "Не отмечены",
                    changed: "Измененные"
                },
                bulk: {
                    present: "Отметить всех присутствующими",
                    late: "Отметить всех опоздавшими",
                    absent: "Отметить всех отсутствующими",
                    clearVisible: "Очистить показанных"
                },
                counters: {
                    visible: "Показано: {{count}}",
                    unmarked: "Не отмечены: {{count}}",
                    unsaved: "Несохранено: {{value}}",
                    marked: "Отмечено: {{marked}}/{{total}}",
                    presentRate: "Доля посещения: {{value}}%"
                },
                values: {
                    yes: "да",
                    no: "нет"
                },
                unsavedMessage: "Изменения еще не сохранены. Кнопка сохранения запишет все отметки для текущей сессии.",
                savedMessage: "Посещаемость сохранена. Массовые действия применяются только к студентам из текущего поиска и фильтра.",
                empty: {
                    selectSession: "Сначала выберите сессию, чтобы отметить посещаемость.",
                    loadingStudents: "Студенты загружаются...",
                    noStudents: "Студенты не найдены.",
                    noFilteredStudents: "По этому фильтру студенты не найдены."
                },
                studentStatusHelper: "Выберите статус посещаемости для этой сессии.",
                notesPlaceholder: "Примечание",
                toasts: {
                    loadError: "Не удалось загрузить данные сессии.",
                    selectSession: "Выберите сессию перед сохранением посещаемости.",
                    noChanges: "Изменений нет.",
                    saved: "Посещаемость сохранена для этой сессии.",
                    saveError: "Не удалось сохранить посещаемость."
                },
                notices: {
                    noSessionTitle: "Сессия не выбрана",
                    noSessionMessage: "Выберите активную сессию перед сохранением посещаемости.",
                    unmarkedTitle: "Посещаемость заполнена не полностью",
                    unmarkedMessage: "Сначала выберите статус посещаемости для {{count}} студентов.",
                    noChangesTitle: "Изменений нет",
                    noChangesMessage: "Список посещаемости совпадает с сохраненным состоянием.",
                    savedTitle: "Посещаемость сохранена",
                    savedMessage: "Посещаемость обновлена для активной сессии.",
                    saveFailedTitle: "Посещаемость не сохранена"
                }
            },
            homework: {
                deadlineStates: {
                    noDeadline: "Без срока",
                    unknown: "Срок неизвестен",
                    overdue: "Просрочено",
                    dueSoon: "Скоро срок",
                    active: "Активно"
                },
                validation: {
                    titleRequired: "Введите название домашнего задания.",
                    selectSessionFirst: "Сначала выберите сессию."
                },
                toasts: {
                    loadError: "Не удалось загрузить домашние задания.",
                    reviewRosterLoadError: "Не удалось загрузить список проверки.",
                    published: "Домашнее задание опубликовано.",
                    unpublished: "Домашнее задание снято с публикации.",
                    publishError: "Не удалось опубликовать домашнее задание.",
                    updateError: "Не удалось обновить домашнее задание.",
                    reviewUpdated: "Статус проверки ответа обновлен.",
                    reviewError: "Не удалось проверить ответ.",
                    statusError: "Не удалось изменить статус домашнего задания."
                }
            },
            resources: {
                fallbacks: {
                    lessonVideo: "Видео урока"
                },
                toasts: {
                    courseMaterialsLoadError: "Не удалось загрузить материалы курса.",
                    materialsUpdated: "Материалы обновлены.",
                    materialsUpdateError: "Не удалось обновить материалы.",
                    fileAdded: "Файл добавлен в материалы.",
                    fileUploadError: "Не удалось загрузить файл.",
                    materialAlreadyAdded: "Этот материал уже добавлен к сессии.",
                    meetingLinkUpdated: "Ссылка на встречу обновлена.",
                    meetingLinkSaveError: "Не удалось сохранить ссылку на встречу.",
                    meetingStateUpdated: "Состояние встречи обновлено.",
                    meetingNotFound: "Встреча не найдена.",
                    meetingDeleted: "Встреча удалена.",
                    meetingDeleteError: "Не удалось удалить встречу.",
                    zoomAttendanceImported: "Посещаемость Zoom импортирована.",
                    attendanceImportError: "Не удалось импортировать посещаемость.",
                    zoomRecordingsSynced: "Записи Zoom синхронизированы.",
                    recordingsSyncError: "Не удалось синхронизировать записи.",
                    meetingLinkMissing: "Ссылка на встречу не найдена."
                }
            },
            selections: {
                toasts: {
                    coursesLoadError: "Не удалось загрузить курсы.",
                    groupsLoadError: "Не удалось загрузить группы.",
                    sessionsLoadError: "Не удалось загрузить сессии."
                },
                notices: {
                    coursesLoadTitle: "Курсы не загрузились",
                    groupsLoadTitle: "Группы не загрузились",
                    sessionsLoadTitle: "Сессии не загрузились"
                }
            }
        },
        notes: {
            title: "Заметки сессии",
            description: "Личные заметки инструктора и следующие шаги по этой сессии.",
            status: {
                unsaved: "Изменения не сохранены.",
                saved: "Заметки сохранены.",
                empty: "Для этой сессии пока нет заметки."
            },
            saveState: {
                saving: "Заметка сохраняется...",
                ready: "Изменения готовы. Сохраните их.",
                lastSaved: "Последнее сохранение: {{date}}",
                notCreated: "Отдельная заметка для этой сессии еще не создана."
            },
            actions: {
                save: "Сохранить заметку",
                saving: "Сохранение..."
            },
            field: {
                label: "Заметка по сессии",
                placeholder: "Запишите наблюдения, последующие задачи или личные заметки по этой сессии."
            },
            empty: {
                selectSession: "Сначала выберите сессию, чтобы добавить заметку."
            }
        },
        engagement: {
            title: "Следующие действия",
            loadError: "Не удалось загрузить следующие действия.",
            loadingDescription: "Надежные сигналы для этой сессии загружаются.",
            description: "Приоритетные сигналы из посещаемости, домашних заданий и активностей.",
            tabs: {
                attendance: "Посещаемость",
                homework: "Домашнее задание",
                activities: "Активности"
            },
            metrics: {
                attendanceMarked: "Посещаемость отмечена",
                unmarkedHelper: "{{count}} студентов еще не отмечены",
                needsAttention: "Нужен контроль",
                attentionLimitHelper: "Показаны топ {{count}} студентов",
                teacherQueue: "Очередь инструктора",
                teacherQueueHelper: "Ожидает проверка или отметка",
                positiveSignal: "Хороший сигнал",
                positiveLimitHelper: "Топ {{count}} позитивных студентов"
            },
            attention: {
                title: "С кем связаться",
                description: "Список отсортирован по приоритету, числу причин и серьезности.",
                moreReasons: "+{{count}} еще"
            },
            severity: {
                high: "Срочное внимание",
                medium: "Ближайший follow-up",
                low: "Напоминание"
            },
            actions: {
                openFirst: "Открыть первым"
            },
            queue: {
                title: "Очередь инструктора",
                description: "Выберите, что открыть первым.",
                attendanceTitle: "Посещаемость не заполнена",
                attendanceDescription: "Студенты, которые еще не отмечены",
                homeworkTitle: "Проверка домашнего задания",
                homeworkDescription: "Ответы в статусе submitted",
                activitiesTitle: "Проверка активностей",
                activitiesDescription: "Activity submissions еще не проверены"
            },
            signals: {
                title: "Краткая сводка сигналов",
                description: "Быстро посмотрите, из какого блока идет follow-up. \"Скоро\" = {{hours}} часов.",
                attendance: "Посещаемость",
                absentValue: "{{count}} отсутствуют",
                attendanceHelper: "{{late}} опоздали, {{excused}} уважительно",
                homework: "Сигналы по ДЗ",
                homeworkHelper: "{{revision}} на доработке, {{dueSoon}} скоро срок",
                activities: "Сигналы по активностям",
                activitiesHelper: "{{revision}} на доработке, {{missing}} без ответа, {{notStarted}} не начали",
                positive: "Хорошая динамика",
                positiveHelper: "Позитивный сигнал без риска"
            },
            positive: {
                title: "Студенты с хорошей динамикой",
                description: "Студенты без follow-up и со стабильными позитивными сигналами.",
                streak: "{{count}} раз подряд"
            },
            empty: {
                noAttentionStudents: "Для этой сессии нет студентов, которым нужен особый follow-up.",
                noPositiveStudents: "Отдельная positive momentum пока не видна."
            }
        },
        activities: {
            title: "Активности сессии",
            description: "Этот раздел синхронизируется со студентом. Каждая активность сохраняется отдельно: planned скрыта, active видна, done видна, но закрыта.",
            insightFocus: "Фокус insight",
            focusFallback: "Фокус",
            focusHelpFallback: "Сначала проверьте ответы в этом направлении.",
            loading: "Загрузка...",
            lastUpdated: "Последнее обновление: {{date}}",
            types: {
                discussion: "Обсуждение",
                exercise: "Упражнение",
                quiz: "Квиз",
                groupWork: "Групповая работа",
                vocabulary: "Словарь",
                fillBlank: "Заполни пропуск",
                wordMatch: "Сопоставление слов",
                listening: "Аудирование",
                writingCorrection: "Исправление текста"
            },
            typeHelp: {
                discussion: "Студент может отправить текст или короткий ответ",
                exercise: "Выполняется текстом, файлом или ссылкой",
                quiz: "Оценивается автоматически, результат появляется сразу",
                groupWork: "Каждый студент отправляет отдельный результат или короткий отчет",
                vocabulary: "Карточки — студенты переворачивают карточки и отмечают знание слов",
                fillBlank: "Студенты вставляют пропущенные слова в предложениях",
                wordMatch: "Студенты сопоставляют слова слева с значениями справа",
                listening: "Студенты слушают аудио и отвечают на вопрос",
                writingCorrection: "Студенты пишут ответ на основе задания"
            },
            payload: {
                vocabulary: {
                    wordLabel: "Слово",
                    definitionLabel: "Определение",
                    addWord: "Добавить слово",
                    wordPlaceholder: "Слово",
                    definitionPlaceholder: "Определение"
                },
                fillBlank: {
                    addSentence: "Добавить предложение",
                    sentencePlaceholder: "Предложение (используйте ___ для пропуска)",
                    blankPlaceholder: "Правильный ответ"
                },
                wordMatch: {
                    addPair: "Добавить пару",
                    leftPlaceholder: "Слева (слово)",
                    rightPlaceholder: "Справа (значение)"
                },
                listening: {
                    audioUrlLabel: "URL аудио",
                    audioUrlPlaceholder: "https://...",
                    promptLabel: "Вопрос / задание",
                    promptPlaceholder: "О чём говорилось в аудио…?"
                },
                writingCorrection: {
                    promptLabel: "Тема для написания",
                    promptPlaceholder: "Напишите о…",
                    rubricLabel: "Критерии оценки (необязательно)",
                    rubricPlaceholder: "Проверьте грамматику, словарный запас…"
                }
            },
            status: {
                planned: "Запланировано",
                active: "Идет сейчас",
                done: "Завершено"
            },
            statusHelp: {
                planned: "Не видно студентам",
                active: "Видно студентам",
                done: "Видно студентам, закрыто"
            },
            submissionStatus: {
                submitted: "На проверке",
                approved: "Одобрено",
                needsRevision: "Нужна доработка",
                rejected: "Отклонено"
            },
            filters: {
                all: "Все",
                pending: "Не проверено",
                reviewed: "Проверено",
                revision: "Доработка/отклонено",
                passed: "Пройденные квизы",
                failed: "Непройденные квизы",
                notStarted: "Квизы не начаты",
                missingResponse: "Нет ответа"
            },
            filterHelp: {
                all: "Общий вид",
                pending: "Обратите внимание на submitted ответы",
                reviewed: "Завершенные ответы",
                revision: "Требуют повторной проверки",
                passed: "Успешно завершенные попытки",
                failed: "Требуют follow-up",
                notStarted: "Студент еще не начинал",
                missingResponse: "Открытые активности без ответа"
            },
            metrics: {
                total: "Всего",
                visible: "Видно",
                hidden: "Скрыто",
                quiz: "Квиз"
            },
            actions: {
                addActivity: "Добавить активность",
                cancel: "Отмена",
                saving: "Сохранение...",
                save: "Сохранить",
                saveActivity: "Сохранить активность",
                saveChanges: "Сохранить изменения",
                responses: "Ответы",
                edit: "Изменить",
                delete: "Удалить",
                deleting: "Удаление...",
                toggle: "Открыть/закрыть",
                addQuestion: "Добавить вопрос",
                addOption: "Добавить вариант",
                openAttachment: "Открыть вложение",
                collapse: "Свернуть"
            },
            editor: {
                newActivity: "Новая активность",
                activityNumber: "Активность #{{number}}",
                reviewHint: "Чтобы студент получил полезный результат, при проверке оставьте хотя бы комментарий или балл."
            },
            fields: {
                title: "Название активности",
                description: "Напишите краткое объяснение или что нужно сделать."
            },
            quiz: {
                questionsTitle: "Вопросы квиза",
                questionsHelp: "{{count}} вопросов. Для каждого вопроса нужны минимум два варианта и один правильный ответ.",
                questionCount: "{{count}} вопросов",
                questionNumber: "Вопрос #{{number}}",
                questionPlaceholder: "Напишите вопрос",
                singleChoice: "Один правильный ответ",
                multipleChoice: "Несколько правильных ответов",
                correct: "Правильно",
                optionPlaceholder: "Вариант {{number}}",
                summaryTitle: "Краткий вид квиза",
                summaryDescription: "Правильные ответы здесь не показываются. Студент видит результат по статусу.",
                viewMode: "Режим просмотра"
            },
            responses: {
                student: "Студент",
                passed: "Прошли",
                failed: "Не прошли",
                studentsShown: "Показано студентов: {{count}}",
                attempt: "Попытка",
                answer: "Ответ",
                result: "Результат",
                passedShort: "Прошел",
                failedShort: "Не прошел",
                response: "Ответ",
                responsesShown: "Показано ответов: {{count}}"
            },
            review: {
                currentResult: "Текущий результат",
                score: "Балл: {{score}}",
                reviewedAt: "Проверено: {{date}}",
                editReview: "Изменить review",
                previousThread: "Предыдущий обмен",
                approve: "Одобрить",
                requestRevision: "На доработку",
                reject: "Отклонить",
                scorePlaceholder: "Балл",
                commentPlaceholder: "Комментарий",
                requireFeedback: "Для статусов approved, needs revision и rejected нужен хотя бы комментарий или балл."
            },
            empty: {
                noActivitiesYet: "Активности пока не добавлены.",
                noResponses: "Ответов пока нет.",
                noActivities: "Активностей сессии пока нет. Можно добавить обсуждение, упражнение, групповую работу или квиз."
            },
            fallbacks: {
                student: "Студент",
                instructor: "Преподаватель"
            }
        },
        resources: {
            loading: "Загрузка...",
            toasts: {
                copyFailed: "Не удалось скопировать ссылку.",
                joinLinkCopied: "Join-ссылка скопирована.",
                recordingLinkCopied: "Ссылка на запись скопирована."
            },
            validation: {
                httpUrl: "Ссылка должна начинаться с `http://` или `https://`."
            },
            notices: {
                materialAdded: "Материал \"{{title}}\" добавлен к сессии.",
                materialUpdated: "Материал \"{{title}}\" обновлен.",
                materialDeleted: "Материал \"{{title}}\" удален из материалов.",
                fileAdded: "Файл \"{{title}}\" добавлен в материалы.",
                videoAdded: "Видео \"{{title}}\" добавлено к сессии."
            },
            empty: {
                noSessionTitle: "Выберите сессию для ресурсов",
                noSessionSubtitle: "Материалы, ссылка на встречу и запись привязаны к активной сессии.",
                noMaterials: "Для этой сессии материалы не сохранены.",
                noVideoSearchResults: "По поиску видео не найдено.",
                noReusableVideos: "В этом курсе не найдено переиспользуемых видео уроков."
            },
            materials: {
                title: "Материалы урока",
                description: "Управляйте нужными для сессии ссылками, файлами и повторно используемыми видео.",
                uploadedUrlReadonly: "Ссылку нельзя изменить для загруженного файла."
            },
            actions: {
                uploadingFile: "Файл загружается...",
                uploadFile: "Загрузить файл",
                addLink: "Добавить ссылку",
                addVideoFromCourse: "Добавить видео из курса",
                saving: "Сохранение...",
                save: "Сохранить",
                cancel: "Отмена",
                play: "Воспроизвести",
                open: "Открыть",
                rename: "Переименовать",
                delete: "Удалить",
                deleting: "Удаление...",
                copyLink: "Скопировать ссылку",
                collapse: "Свернуть",
                expand: "Открыть",
                add: "Добавить"
            },
            composer: {
                title: "Добавить новую ссылку",
                description: "Добавьте внешнюю ссылку к сессии с названием."
            },
            fields: {
                materialTitle: "Название материала",
                publishNow: "Опубликовать",
                availableAt: "Дата публикации"
            },
            labels: {
                video: "Видео",
                uploadedFile: "Загруженный файл",
                externalLink: "Внешняя ссылка",
                draft: "Черновик",
                published: "Опубликовано",
                availableAt: "Будет доступно {{date}}"
            },
            meeting: {
                title: "Урок в прямом эфире",
                description: "Сохраните ссылку на встречу для этой сессии и заходите оттуда во время урока.",
                platform: "Платформа",
                statusTitle: "Статус встречи",
                joinReady: "Ссылка для подключения сохранена и готова для урока.",
                joinMissing: "Для этой сессии ссылка для подключения не сохранена.",
                update: "Обновить встречу",
                create: "Создать встречу",
                join: "Войти на урок",
                delete: "Удалить встречу",
                joinWindowHint: "Подключение доступно только за 10 минут до урока."
            },
            format: {
                title: "Формат сессии",
                description: "Эта сессия не проходит в прямом эфире, поэтому управление встречей здесь не показывается.",
                label: "Формат",
                offline: "Офлайн-сессия",
                noLiveMeeting: "Встреча в прямом эфире не требуется",
                location: "Локация"
            },
            recording: {
                title: "Запись",
                description: "Сохраненная для сессии ссылка на запись отображается здесь. При синхронизации Zoom поле сессии тоже обновляется.",
                statusTitle: "Статус записи",
                found: "Найдена запись, связанная с сессией.",
                missing: "Для этой сессии пока нет ссылки на запись.",
                syncing: "Синхронизация...",
                sync: "Синхронизировать записи Zoom",
                open: "Открыть запись"
            },
            integrations: {
                title: "Инструменты интеграции",
                description: "Эти служебные действия используются вне обычного процесса урока, обычно только для Zoom-импорта или восстановления.",
                note: "Эти действия используются вне обычного потока урока.",
                loadMeetingState: "Загрузить состояние встречи",
                importing: "Импорт...",
                importZoomAttendance: "Импортировать посещаемость Zoom"
            },
            assetLibrary: {
                title: "Добавить видео из курса",
                sourceCourse: "Исходный видеокурс",
                searchPlaceholder: "Поиск по уроку или разделу",
                attachedVideos: "Добавленные видео",
                videoCount: "Видео: {{count}}",
                loading: "Материалы курса загружаются...",
                attached: "Добавлено",
                added: "Добавлено"
            },
            deleteModal: {
                title: "Удалить материал",
                messageWithTitle: "Удалить материал \"{{title}}\"?",
                message: "Удалить материал?"
            },
            video: {
                loadingPlayer: "Видеоплеер загружается..."
            },
            fallbacks: {
                noSection: "Без раздела",
                material: "Материал",
                thisMaterial: "Этот материал",
                noLocation: "Локация не указана",
                courseWithId: "Курс #{{id}}"
            }
        },
        setup: {
            workspace: {
                createTitle: "Новая сессия",
                editTitle: "Изменить сессию",
                createDescription: "Создайте следующий урок группы, укажите время и добавьте дополнительный материал.",
                editDescription: "Обновите время, статус и ссылку на запись выбранной сессии.",
                createDisabledReason: "Сначала выберите группу, чтобы создать сессию.",
                editDisabledReason: "Выберите активную сессию для редактирования.",
                creating: "Создание...",
                createAction: "Создать сессию",
                saving: "Сохранение...",
                saveAction: "Сохранить изменения"
            },
            modal: {
                createContextHint: "Курс и группа выбираются через поле выше",
                editContextHint: "Редактирование выполняется в контексте активной сессии"
            },
            sections: {
                basic: "Основная информация",
                schedule: "Расписание",
                locationAndMaterials: "Локация и материалы",
                materialsAndRecording: "Материалы и запись",
                materials: "Материалы",
                context: "Контекст",
                makeup: "Замещающая сессия"
            },
            fields: {
                sessionIndex: "Номер сессии *",
                sessionTitle: "Название сессии *",
                groupLocation: "Локация группы",
                recordingUrl: "Ссылка на запись",
                materialTitle: "Название материала",
                materialUrl: "URL материала",
                isMakeup: "Это замещающая сессия",
                makeupForSessionId: "Номер оригинальной сессии"
            },
            help: {
                nextSessionIndex: "Следующий доступный номер: {{index}}. Меняйте только при необходимости.",
                uniqueSessionIndex: "Номер должен быть уникальным внутри этой группы.",
                editMaterialsInResources: "Чтобы изменить материалы, используйте режим редактирования сессии и обновите сохраненные ссылки во вкладке ресурсов.",
                saveChangesHere: "Сохраните все изменения здесь.",
                makeupSession: "Включите, если сессия заменяет пропущенную, и укажите номер оригинальной."
            },
            context: {
                course: "Курс",
                group: "Группа",
                format: "Формат",
                newSession: "Новая сессия",
                addedToSelectedGroup: "Будет добавлена в выбранную группу",
                session: "Сессия"
            },
            delivery: {
                offline: "Офлайн",
                onlineLive: "Онлайн в прямом эфире",
                video: "Видеокурс"
            },
            status: {
                scheduled: "Запланирована",
                completed: "Завершена",
                cancelled: "Отменена"
            },
            actions: {
                close: "Закрыть"
            },
            fallbacks: {
                noLocation: "Локация не указана",
                notSelected: "Не выбрано"
            },
            feedback: {
                noGroupTitle: "Группа не выбрана",
                noGroupMessage: "Сначала выберите группу, чтобы создать новую сессию.",
                incompleteTitle: "Информация о сессии неполная",
                createIncompleteMessage: "Номер, название, начало и конец сессии обязательны.",
                updateIncompleteMessage: "Название, начало и конец сессии обязательны.",
                createdTitle: "Сессия создана",
                createdMessage: "{{title}} открыта в активной рабочей области.",
                createFailedTitle: "Сессия не создана",
                noSessionTitle: "Сессия не выбрана",
                noSessionMessage: "Выберите активную сессию для редактирования.",
                updatedTitle: "Сессия обновлена",
                updatedMessage: "Изменения для {{title}} сохранены.",
                updateFailedTitle: "Сессия не обновлена"
            },
            toasts: {
                selectGroup: "Сначала выберите группу.",
                createIncomplete: "Номер, название, начало и конец сессии обязательны.",
                created: "Сессия создана.",
                createError: "Не удалось создать сессию.",
                selectSession: "Выберите сессию.",
                updateIncomplete: "Название, начало и конец сессии обязательны.",
                updated: "Сессия обновлена.",
                updateError: "Не удалось обновить сессию.",
                statusUpdated: "Статус сессии обновлен.",
                statusUpdateError: "Не удалось обновить статус сессии."
            }
        },
        homeworkModal: {
            header: {
                editEyebrow: "Изменить",
                createEyebrow: "Создать",
                editTitle: "Изменить домашнее задание",
                createTitle: "Новое домашнее задание",
                editDescription: "Обновите выбранное домашнее задание.",
                createDescription: "Создайте новое домашнее задание и отправьте его студентам."
            },
            sections: {
                basic: "Основная информация",
                deadline: "Срок",
                publishing: "Настройки публикации",
                context: "Контекст"
            },
            fields: {
                title: "Название задания",
                description: "Описание задания",
                deadline: "Срок сдачи (необязательно)",
                publishNow: "Опубликовать сразу",
                maxScore: "Максимальный балл (необязательно)"
            },
            placeholders: {
                title: "Введите название задания",
                description: "Опишите задание подробно...",
                maxScore: "Например, 100"
            },
            maxScoreHelp: "Максимальный балл за это задание. Оставьте пустым, если оценка не нужна.",
            validation: {
                titleRequired: "Введите название задания.",
                descriptionRequired: "Введите описание задания."
            },
            publishHelp: {
                published: "Домашнее задание сразу будет видно студентам.",
                draft: "Домашнее задание будет сохранено как черновик, его можно опубликовать позже."
            },
            context: {
                session: "Сессия"
            },
            fallbacks: {
                sessionWithId: "Session #{{id}}"
            },
            deadlineHelp: "Если срок не задан, студенты смогут отправить задание в любое время.",
            escapeHint: "Сохраните все изменения, затем нажмите Escape, чтобы закрыть.",
            actions: {
                cancel: "Отмена",
                create: "Создать",
                update: "Изменить",
                saving: "Сохранение..."
            }
        },
        homeworkTab: {
            toasts: {
                created: "Домашнее задание успешно создано.",
                updated: "Домашнее задание успешно обновлено.",
                deleted: "Домашнее задание успешно удалено.",
                saveError: "Не удалось сохранить домашнее задание.",
                deleteError: "Не удалось удалить домашнее задание.",
                previewError: "Не удалось открыть вложение."
            },
            metrics: {
                total: "Всего заданий",
                active: "Активные",
                dueSoon: "Скоро срок",
                overdue: "Просроченные"
            },
            filters: {
                all: "Все",
                active: "Активные",
                dueSoon: "Скоро срок",
                overdue: "Просроченные",
                noDeadline: "Без срока"
            },
            labels: {
                deadline: "Deadline",
                session: "Сессия"
            },
            status: {
                published: "Опубликовано",
                unpublished: "Не опубликовано"
            },
            actions: {
                publish: "Опубликовать",
                unpublish: "Снять с публикации",
                delete: "Удалить домашнее задание",
                deleteShort: "Удалить",
                edit: "Изменить",
                view: "Просмотр",
                download: "Скачать",
                approve: "Одобрить",
                requestRevision: "На доработку",
                sendForRevision: "Отправить на доработку",
                reject: "Отклонить",
                cancel: "Отмена",
                deleting: "Удаление...",
                confirmDelete: "Да, удалить"
            },
            create: {
                title: "Новое домашнее задание",
                description: "Создайте новое домашнее задание для студентов.",
                action: "Создать задание",
                assignedTo: "Назначается"
            },
            list: {
                title: "Список заданий",
                description: "Ищите, фильтруйте по сроку и выбирайте нужное задание для проверки.",
                searchPlaceholder: "Поиск задания",
                loading: "Загрузка домашних заданий..."
            },
            selected: {
                title: "Выбранное задание",
                description: "Содержание задания и основной статус.",
                assignedStudents: "Назначено студентам: {{count}}",
                needsReviewCount: "{{count}} ожидает проверки"
            },
            review: {
                title: "Проверка ответов",
                description: "В этом списке видны все студенты, которым выдано задание: кто отправил, кто ждет проверки и кто еще не отправил.",
                studentsCount: "Студентов: {{count}}",
                needsReview: "Нужно проверить",
                needsRevision: "На доработку",
                missing: "Не отправлено",
                pending: "Ожидает",
                late: "Сдано поздно",
                approved: "Одобрено",
                rejected: "Отклонено",
                loading: "Загрузка списка проверки...",
                submittedAt: "Отправлено: {{date}}",
                missingAfterDeadline: "Срок прошел, но студент не отправил это задание.",
                pendingSubmission: "Этот студент пока не отправил задание.",
                answerContent: "Содержание ответа",
                attachment: "Прикрепленный файл",
                attachmentDescription: "Файл, загруженный в LMS, или внешняя ссылка",
                feedback: "Комментарий",
                followUpNeeded: "Нужен follow-up",
                waiting: "Пока ожидаем"
            },
            reviewStates: {
                missing: "Не отправлено",
                pendingSubmission: "Пока не отправлено",
                needsReview: "Нужно проверить",
                approved: "Одобрено",
                needsRevision: "На доработку",
                needsRevisionFilter: "Нужна доработка",
                pending: "Ожидает",
                rejected: "Отклонено",
                late: "Сдано поздно",
                lateShort: "Поздно"
            },
            preview: {
                title: "Вложение",
                loadError: "Не удалось загрузить вложение.",
                unsupportedTitle: "Предпросмотр этого файла на странице не поддерживается.",
                unsupportedDescription: "Скачайте файл, чтобы открыть его."
            },
            empty: {
                noSessionTitle: "Выберите сессию для домашнего задания",
                noSessionSubtitle: "Сначала выберите сессию из активной группы, чтобы публиковать, изменять и проверять домашние задания.",
                noHomework: "Для этой сессии пока нет домашних заданий.",
                noFilteredHomework: "Поиск или фильтр не нашел заданий.",
                noStudents: "Для этого задания список студентов не найден.",
                noFilteredStudents: "По выбранному фильтру студенты не найдены.",
                selectHomeworkPanelTitle: "Выберите задание",
                selectHomeworkPanelDescription: "Выберите задание из списка, и здесь откроются его содержание и ответы студентов.",
                selectHomeworkTitle: "Задание не выбрано",
                selectHomeworkSubtitle: "Выберите задание из списка слева, чтобы сразу перейти к проверке."
            },
            reviewModal: {
                approveTitle: "Одобрить ответ",
                revisionTitle: "Вернуть на доработку",
                rejectTitle: "Отклонить ответ",
                subtitleWithName: "Оставьте комментарий для {{name}}.",
                subtitle: "Оставьте комментарий.",
                approveHelp: "При необходимости добавьте комментарий. Одобрение можно сохранить без комментария.",
                requiredHelp: "Напишите короткое объяснение, чтобы студент понял, что исправить или почему ответ отклонен.",
                scoreLabel: "Балл (необязательно)",
                scoreMax: "из {{max}}",
                scorePlaceholder: "Введите балл",
                commentLabel: "Комментарий",
                approvePlaceholder: "Например: Ответ точный и полный.",
                requiredPlaceholder: "Например: Не хватает основных мыслей. Проверьте вложение и отправьте повторно.",
                commentRequired: "Для этого действия комментарий обязателен."
            },
            deleteModal: {
                title: "Удалить домашнее задание",
                subtitle: "Вы уверены, что хотите удалить домашнее задание \"{{title}}\"? Это действие нельзя отменить.",
                warningTitle: "Предупреждение",
                warningDescription: "После удаления домашнее задание нельзя восстановить. Все ответы студентов и связанные данные будут удалены."
            },
            fallbacks: {
                noGroup: "Группа не выбрана",
                homework: "Домашнее задание",
                noDescription: "Описание пока не добавлено.",
                noDeadline: "Срок не указан",
                answerUploaded: "Ответ загружен для проверки.",
                attachment: "Вложение"
            }
        }
    },
    internalLeaderboard: {
        trackSwitcherLabel: "Направление рейтинга",
        currentView: "Текущий вид",
        tracks: {
            all: {
                label: "Все",
                helper: "Общая активность"
            },
            video: {
                label: "Видео",
                helper: "Самостоятельное обучение"
            },
            live: {
                label: "Живое",
                helper: "Обучение по сессиям"
            }
        },
        roles: {
            student: {
                eyebrow: "Student Ranking",
                title: "Мой внутренний рейтинг",
                description: "Сравните свое место, лидеров курса и активность за эту неделю.",
                courseLabel: "Мои курсы",
                courseDescription: "Сравните лидеров в курсах, где вы учитесь."
            },
            instructor: {
                eyebrow: "Instructor Ranking",
                title: "Рейтинг студентов",
                description: "Отслеживайте активных студентов, студента недели и темп внутри ваших курсов.",
                courseLabel: "Мои курсы",
                courseDescription: "Выберите курс, чтобы увидеть активных студентов внутри него."
            },
            admin: {
                eyebrow: "Админ-рейтинг",
                title: "Рейтинг платформы",
                description: "Смотрите недельную активность платформы, лидеров главной страницы и рейтинги курсов.",
                courseLabel: "Курсы платформы",
                courseDescription: "Проверьте внутренний рейтинг любого курса."
            },
            default: {
                eyebrow: "Рабочая область рейтинга",
                title: "Внутренний рейтинг",
                description: "Смотрите недельных лидеров, студента недели и места внутри курсов.",
                courseLabel: "Доски курсов",
                courseDescription: "Сравните лучших студентов внутри выбранного курса."
            }
        },
        metrics: {
            weekly: "Недельные лидеры",
            homepage: "Лучшие на главной",
            studentOfWeek: "Студент недели"
        },
        row: {
            streakDays: "🔥 {{count}} дней",
            quizCount: "{{count}} тестов"
        },
        weekly: {
            title: "Недельный рейтинг",
            description: "Самые активные студенты сейчас.",
            emptyTitle: "Лидеры не найдены",
            emptySubtitle: "Для выбранного направления пока нет данных рейтинга."
        },
        studentOfWeek: {
            title: "Студент недели",
            description: "Выделенный участник недели и лучшие студенты на главной странице.",
            emptyTitle: "Студента недели нет",
            emptySubtitle: "Для этого направления пока не определен выделенный студент."
        },
        homepage: {
            title: "Лучшие на главной",
            emptyTitle: "Нет данных главной страницы",
            emptySubtitle: "Для выбранного направления нет лидеров главной страницы."
        },
        courseBoard: {
            title: "Рейтинг курса",
            description: "Сравните лучших студентов внутри выбранного курса.",
            courseLabel: "Курс",
            selectCourse: "Выберите курс",
            noCourseTitle: "Курс не выбран",
            noCourseSubtitle: "Выберите курс выше, чтобы посмотреть внутренний рейтинг.",
            noDataTitle: "Нет данных",
            noDataSubtitle: "Для этого курса и направления рейтинг пока недоступен."
        },
        fallbacks: {
            student: "Студент",
            course: "Курс"
        },
        errors: {
            coursesLoad: "Не удалось загрузить курсы.",
            leaderboardLoad: "Не удалось загрузить данные внутреннего рейтинга.",
            courseBoardLoad: "Рейтинг курса сейчас не загружается."
        }
    }
};
