export const courses = {
    catalogPage: {
        title: "Каталог",
        description: "Ищите по названию курса, направлению или инструктору.",
        search: {
            label: "Поиск курсов",
            placeholder: "Искать курсы...",
            helper: "Поиск обновляется после короткой паузы."
        },
        status: {
            loading: "Каталог загружается...",
            loadError: "Каталог не загружен.",
            results: "Показано курсов: {{value}}",
            resultsForQuery: "По запросу \"{{query}}\" найдено курсов: {{value}}",
            noResults: "Курсы не найдены"
        },
        price: {
            free: "Бесплатно",
            amount: "{{amount}} сом",
            notSpecified: "Цена не указана"
        },
        courseTypes: {
            offline: "Офлайн",
            onlineLive: "Онлайн с прямыми занятиями",
            video: "Видеокурс"
        },
        duration: {
            hours: "{{value}} ч",
            lessons: "Уроков: {{value}}",
            notSpecified: "Длительность не указана"
        },
        error: {
            title: "Каталог не загружен.",
            description: "Попробуйте еще раз."
        },
        actions: {
            retry: "Загрузить снова"
        },
        empty: {
            search: "По этому запросу курсы не найдены.",
            default: "В каталоге пока нет курсов."
        },
        pagination: {
            label: "Страницы каталога",
            previous: "Назад",
            next: "Далее",
            page: "Страница {{page}}"
        }
    },
    videoUpload: {
        label: "Загрузить видео",
        uploading: "Загрузка: {{progress}}%",
        errors: {
            invalidType: "Неверный тип файла. Загрузите MP4, WebM, AVI, MOV, MKV или WMV.",
            tooLarge: "Размер файла должен быть меньше 1 GB.",
            uploadFailed: "Не удалось загрузить видео."
        }
    },
    courseApi: {
        toasts: {
            certificatePdfDownloadFailed: "Не удалось скачать PDF сертификата.",
            courseDeleted: "Курс удален.",
            courseDeleteFailed: "Не удалось удалить курс."
        },
        errors: {
            uploadUrlFailed: "Не удалось подготовить загрузку файла.",
            fileTooLarge: "Выбранный файл слишком большой.",
            fileUploadFailed: "Не удалось загрузить файл."
        }
    },
    courseLearning: {
        actions: {
            back: "Назад",
            home: "Вернуться на главную"
        },
        quiz: {
            notFound: "Квиз не найден.",
            startTitle: "Начинаем тест! Готовы?",
            startAction: "Начать тест",
            scoreSummary: "{{score}}% ({{correct}}/{{total}}) правильно",
            gradeAlt: {
                passed: "Оценка за успешно пройденный квиз",
                nearlyPassed: "Оценка за почти пройденный квиз",
                failed: "Оценка за непройденный квиз"
            },
            passedMessage: "Вы показали хорошие знания!",
            failedMessage: "Вы не прошли. Попробуйте еще раз.",
            retake: "Пройти заново",
            viewAnswers: "Посмотреть ответы",
            yourAnswer: "Ваш ответ",
            skipped: "Пропущено",
            correctAnswer: "Правильный ответ",
            skip: "Пропустить",
            submit: "Завершить",
            next: "Далее",
            skippedCount: "Пропущенные вопросы: {{skipped}} / {{total}}",
            noQuestions: "Вопросы не найдены.",
            toasts: {
                allQuestionsRequired: "Все вопросы должны быть обработаны"
            }
        },
        challenge: {
            notFound: "Кодовое задание не найдено.",
            task: "Задание",
            noInstructions: "Инструкция не предоставлена.",
            visibleTests: "Открытые тесты",
            args: "args",
            code: "Код",
            timeLimitMinutes: "{{value}} мин",
            codePlaceholder: "// Напишите любой JavaScript код",
            checking: "Проверка...",
            submit: "Отправить",
            resultsTitle: "Результаты тестов",
            allPassed: "Все тесты успешно пройдены!",
            someFailed: "Некоторые тесты не прошли.",
            testFallback: "Тест {{number}}",
            hiddenSuffix: "(скрытый)",
            actualResult: "Фактический результат",
            expectedResult: "Ожидаемый результат"
        }
    }
};
