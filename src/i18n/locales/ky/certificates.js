export const certificates = {
    certificates: {
        download: {
            eyebrow: "Сертификат PDF",
            title: "Сертификат жүктөлүүдө",
            description: "PDF файлын даярдап жатабыз. Эгер браузер жүктөөнү бөгөттөсө, бул беттен кайра аракет кылсаңыз болот.",
            status: {
                failed: "Жүктөө ишке ашкан жок",
                ready: "Жүктөө башталды",
                preparing: "PDF даярдалып жатат"
            },
            messages: {
                failedTitle: "Сертификатты азыр жүктөй алган жокпуз",
                readyTitle: "Файл браузер аркылуу жүктөлүшү керек",
                preparingTitle: "Сертификат файлы даярдалууда",
                readyDescription: "Эгер файл көрүнбөсө, браузердин жүктөөлөр тизмесин текшериңиз же кайра жүктөп көрүңүз.",
                preparingDescription: "Бул адатта бир нече секунд гана алат. Бетти жаппай туруңуз."
            },
            errors: {
                missingId: "Сертификат идентификатору табылган жок.",
                downloadFailed: "PDF жүктөлгөн жок. Браузер жүктөөнү бөгөттөгөн болушу мүмкүн же сертификат азыр жеткиликсиз."
            },
            actions: {
                preparing: "Даярдалып жатат",
                retry: "Кайра жүктөө",
                openVerification: "Текшерүү барагын ачуу",
                home: "Башкы бетке кайтуу"
            },
            labels: {
                certificateId: "Сертификат ID"
            }
        },
        verification: {
            hero: {
                eyebrow: "EduBot Learning реестри",
                title: "Сертификатты текшерүү",
                description: "Бул бет сертификаттын EduBot Learning реестриндеги учурдагы абалын тышкы текшерүүчүгө түшүндүрөт."
            },
            loading: "Текшерүү маалыматы жүктөлүүдө...",
            status: {
                issued: {
                    label: "Тастыкталды",
                    description: "Бул сертификат EduBot Learning реестринде активдүү жана жарактуу болуп турат.",
                    guidance: "Үчүнчү тарап бул жазууну студенттин курсту ийгиликтүү аяктаганын ырастоо үчүн колдоно алат."
                },
                pending: {
                    label: "Кароодо",
                    description: "Сертификат жазуусу бар, бирок акыркы тастыктоо бүтө элек.",
                    guidance: "Бул абалда сертификатты акыркы расмий далил катары колдонбоңуз. Кийин кайра текшериңиз же EduBot колдоосуна кайрылыңыз."
                },
                revoked: {
                    label: "Жокко чыгарылды",
                    description: "Бул сертификат мурда берилген, бирок азыр жарактуу эмес.",
                    guidance: "Жокко чыгарылган сертификатты окууну аяктаганын ырастаган документ катары кабыл албоо керек."
                },
                rejected: {
                    label: "Четке кагылды",
                    description: "Бул сертификат сурамы четке кагылган жана жарактуу сертификат катары берилген эмес.",
                    guidance: "Бул жазуу расмий сертификат катары колдонулбайт. Маалымат туура эмес көрүнсө, EduBot колдоосуна кайрылыңыз."
                }
            },
            error: {
                title: "Сертификатты тастыктоо мүмкүн болгон жок",
                description: "Шилтемени кайра текшериңиз. Эгер бул расмий сертификат болушу керек болсо, EduBot Learning колдоосуна кайрылыңыз."
            },
            errors: {
                missingId: "Сертификат идентификатору табылган жок.",
                notFound: "Сертификат табылган жок же бул шилтеме аркылуу тастыктоо мүмкүн эмес."
            },
            labels: {
                certificateId: "Сертификат ID",
                partner: "Өнөктөш тарап",
                student: "Студент",
                course: "Курс",
                issuedAt: "Берилген күнү",
                signer: "Кол коюучу",
                verificationLink: "Текшерүү шилтемеси",
                registryOwner: "Реестр ээси",
                registryOwnerHelper: "Бул сертификатты берген жана текшерген негизги тарап."
            },
            official: {
                title: "Расмий текшерүү",
                registry: "EduBot Learning реестри",
                description: "Бул жазуу QR же үчүнчү тарап кызматына эмес, EduBot Learning текшерүү реестрине таянат."
            },
            actions: {
                contactSupport: "Колдоо менен байланышуу",
                home: "Башкы бетке кайтуу",
                copyLink: "Шилтемени көчүрүү",
                copied: "Көчүрүлдү",
                open: "Ачуу"
            },
            copy: {
                missing: "Текшерүү шилтемеси азыр көрсөтүлгөн эмес.",
                unsupported: "Бул браузер автоматтык көчүрүүнү колдобойт. Шилтемени төмөндөн кол менен көчүрүңүз.",
                failed: "Шилтемени көчүрүү мүмкүн болгон жок. Төмөндөгү текстти кол менен көчүрүңүз."
            },
            fallbacks: {
                notSpecified: "Көрсөтүлгөн эмес",
                certificate: "Сертификат",
                noLink: "Шилтеме көрсөтүлгөн эмес"
            },
            revokedAt: "{{date}} күнү жокко чыгарылган."
        }
    },
    adminCertificates: {
        errors: {
            courseNotAssigned: "Бул курс сизге бекитилген эмес.",
            loadStudentCourses: "Студенттердин курс тизмесин жүктөө мүмкүн болбоду.",
            loadStudents: "Курс студенттерин жүктөө мүмкүн болбоду.",
            exactPreviewLoad: "Так алдын ала көрүү жүктөлгөн жок."
        },
        previewCanvas: {
            mainTitle: "АЯКТАГАНДЫГЫ ЖӨНҮНДӨ СЕРТИФИКАТ",
            supportingText: "төмөнкү курсту ийгиликтүү аяктаганын тастыктайт",
            issuedLabel: "Берилген күнү",
            verificationLabel: "Текшерүү ID алдын ала көрүү",
            fallbackTitle: "Жетишкендик сертификаты",
            partnershipLabel: "Өнөктөштүктө",
            certifiesLabel: "Бул сертификат",
            secondaryBrandLogoAlt: "Экинчи бренд логотибинин алдын ала көрүнүшү",
            signatureAlt: "Кол коюунун алдын ала көрүнүшү",
            adminIssuerTitle: "Админ",
            instructorIssuerTitle: "Инструктор",
            sampleStudentName: "Айгерим Садыкова",
            sampleCourseTitle: "Тандалган курс",
            sampleIssuerName: "Инструктордун аты-жөнү"
        },
        page: {
            hero: {
                eyebrow: "Сертификат иш аймагы",
                title: "Сертификаттар",
                adminDescription: "Курс тандап, сертификат эрежесин, бренд көрүнүшүн, кол коюучуну жана студенттерге бериле турган сертификаттарды ушул жерден башкарыңыз.",
                instructorDescription: "Курс тандап, сертификат тилин, өз колуңуздун сүрөтүн жана студенттерге бериле турган сертификаттарды ушул жерден башкарыңыз."
            },
            actions: {
                refresh: "Жаңыртуу",
                createCourse: "Курс түзүү",
                backToCourses: "Курстарга кайтуу",
                saveRequirements: "Талаптарды сактоо"
            },
            metrics: {
                totalStudents: "Жалпы студенттер",
                courses: "Курстар",
                courseCertificates: "Бул курстагы сертификаттар",
                averageProgress: "Орточо прогресс",
                courseStudents: "Бул курстагы студенттер",
                lessons: "Сабактар",
                completed: "Бүтүргөн",
                registryCertificates: "Реестрдеги сертификаттар"
            },
            selection: {
                title: "Тандоо",
                description: "Сертификаттарды башкаруу үчүн курс тандаңыз. Кааласаңыз, ошол курстун ичинен белгилүү студентти да тандап иштеңиз.",
                loadingCourses: "Курстар жүктөлүүдө...",
                courseLabel: "Курс",
                selectCourse: "Курсту тандаңыз",
                studentLabel: "Студент",
                allStudents: "Бардык студенттер",
                visibilityLabel: "Көрүнүш",
                specificStudentSelected: "Белгилүү студент тандалды",
                studentsVisible: "{{count}} студент көрсөтүлөт",
                studentsVisible_plural: "{{count}} студент көрсөтүлөт",
                noCourseSelected: "Алгач курс тандаңыз",
                noCoursesTitle: "Курстар азырынча жок",
                noCoursesSubtitle: "Алгач курс түзүп баштаңыз, андан кийин сертификаттар ушул жерде башкарылат.",
                noCoursePanelTitle: "Курс тандалган эмес",
                noCoursePanelDescription: "Бул таб сертификат иштерине арналган. Улантуу үчүн жогорудагы селектордон бир курс тандаңыз.",
                noCoursePanelBody: "Курс тандалгандан кийин ушул жерде шаблон, реестр жана студентке сертификат берүү аракеттери ачылат."
            },
            courseWorkspace: {
                fallbackTitle: "Сертификаттар",
                description: "Курс тандалгандан кийин шаблон, реестр жана сертификат берүү аракеттери ушул блокто иштейт."
            },
            filters: {
                title: "Тандоо жана фильтр",
                description: "Белгилүү студентти табуу же прогресси жеткендерди тез бөлүп алуу үчүн курс студенттерин чыпкалаңыз.",
                studentSearch: "Студент издөө",
                searchPlaceholder: "Ат, email же телефон",
                studentSelector: "Студент селектору",
                progressMin: "Прогресс кеминде",
                progressMax: "Прогресс жогору эмес",
                pageSize: "Барактагы студенттер",
                pageSizeOption: "{{count}} / барак",
                clear: "Фильтрлерди тазалоо",
                selectedStudentOffPage: "Тандалган студент бул баракта жок",
                summaryRange: "{{total}} студенттин ичинен {{start}}-{{end}} көрсөтүлдү",
                summarySingle: "Тандалган студент көрсөтүлдү",
                summaryPage: "{{page}} / {{total}} барак"
            },
            rule: {
                title: "Сертификат эрежеси",
                description: "Курс бүткөндө сертификат дароо берилерин же инструктор бекитерин тандаңыз.",
                current: "Учурда:",
                approvalModeInstructor: "Инструктор бекитет",
                approvalModeAutomatic: "Дароо берилет",
                switchToAutomatic: "Дароо берүүгө өткөрүү",
                switchToInstructorApproval: "Бекитүү режимин күйгүзүү"
            },
            requirements: {
                title: "Аяктоо талаптары",
                description: "Видео курстар сабак прогресси менен эсептелет. Офлайн жана түз эфир курстарда авто-сертификат ушул талаптар аткарылганда түзүлөт.",
                attendance: {
                    title: "Катышуу",
                    description: "Сессиялар бүтүп, катышуу пайызы талапка жетиши керек."
                },
                homework: {
                    title: "Үй тапшырма",
                    description: "Жарыяланган жана студентке дайындалган тапшырмалар бекитилиши керек."
                },
                activities: {
                    title: "Класс иштери",
                    description: "Өткөн квиздер жана бекитилген көнүгүү же группа иштери бул талапка эсептелет."
                },
                minimumPercent: "Минимум %"
            },
            template: {
                title: "Сертификат шаблону",
                adminDescription: "EduBot Learning негизги бренд бойдон калат. Бул жерде курс үчүн сакталуучу шаблон эрежелерин жөндөйсүз.",
                instructorDescription: "Курс сертификатынын көрүнүшүн жана берилген сертификаттарды ушул жерден көрөсүз.",
                editMode: "Түзөтүү режими",
                viewMode: "Көрүү режими",
                editModeDescription: "Курс үчүн сакталуучу шаблон эрежелерин өзгөртүп, сактаңыз.",
                viewModeDescription: "Шаблон эрежелери көрүү режиминде. Өзгөртүү үчүн түзөтүү режимин күйгүзүңүз.",
                saving: "Сакталууда...",
                saveRules: "Эрежелерди сактоо",
                replace: "Алмаштыруу",
                upload: "Жүктөө",
                notProvided: "Көрсөтүлгөн эмес",
                languageOptions: {
                    en: "English",
                    ru: "Русский",
                    ky: "Кыргызча"
                },
                orientationOptions: {
                    landscape: "Горизонталдуу",
                    portrait: "Вертикалдуу"
                },
                branding: {
                    title: "Брендинг",
                    description: "Сертификат аталышын, өнөктөш брендди жана логотипти ушул жерден жаңыртыңыз.",
                    primaryBrandBadge: "EduBot негизги бренд",
                    certificateTitle: "Сертификат аталышы",
                    secondaryBrand: "Экинчи бренд",
                    secondaryBrandPlaceholder: "Компания же өнөктөш аты",
                    secondaryLogo: "Экинчи бренд логотиби",
                    logoFormats: "PNG, JPG же WEBP",
                    secondaryLogoAlt: "Экинчи бренд логотибинин алдын ала көрүнүшү",
                    logoEmpty: "Логотип жүктөлгөндөн кийин ушул жерде көрсөтүлөт.",
                    logoUploading: "Логотип жүктөлүүдө...",
                    logoReady: "Логотип даяр. Кааласаңыз кайра алмаштыра аласыз.",
                    logoOptional: "Өнөктөш логотиби керек болбосо бул талааны бош калтырсаңыз болот."
                },
                signer: {
                    title: "Кол коюучу",
                    description: "Бул маалымат сертификат берүү учурунда колдонулат. Аты-жөнү, роль жана кол сүрөтү курс эрежеси катары сакталбайт.",
                    certificateLanguage: "Сертификат тили",
                    signerName: "Кол коюучу",
                    signerNamePlaceholder: "Инструктордун аты-жөнү",
                    signerRole: "Кол коюучунун ролу",
                    signerRolePlaceholder: "Инструктор",
                    certificateFormat: "Сертификат форматы",
                    signature: "Кол коюу",
                    signatureDescription: "Кол коюуну өзүнчө терезеде тартып сактайсыз.",
                    updateSignature: "Кол коюуну жаңыртуу",
                    drawSignature: "Кол коюуну тартуу",
                    signatureAlt: "Кол коюунун алдын ала көрүнүшү",
                    signatureEmpty: "Кол сүрөтү жүктөлгөндөн кийин ушул жерде көрүнөт.",
                    signatureSaving: "Кол коюу сакталууда...",
                    signatureReady: "Кол коюу даяр. Сертификаттагы сапты автоматтык түрдө жаңыртат.",
                    signatureHelp: "Кол коюуну тартып сактагандан кийин ушул жерде көрүнөт."
                },
                appearance: {
                    title: "Көрүнүш",
                    description: "Барак ориентациясын, негизги түстү жана акцент түстү тандаңыз.",
                    resetDefaults: "Демейкиге кайтаруу",
                    pageOrientation: "Барак ориентациясы",
                    primaryColor: "Негизги түс",
                    accentColor: "Акцент түс",
                    presets: "Даяр темалар",
                    presetsDescription: "Бир чыкылдатуу менен түс жуптарын алмаштыруу"
                },
                preview: {
                    livePreview: "Жандуу алдын ала көрүү",
                    fullPreview: "Толук алдын ала көрүү",
                    exactLoading: "Так алдын ала көрүү жүктөлүүдө...",
                    exactFrameTitle: "Сертификаттын так алдын ала көрүнүшү",
                    unsavedChanges: "Өзгөртүүлөр сактала элек",
                    templateSaved: "Шаблон сакталган",
                    unavailable: "Алдын ала көрүү жеткиликсиз."
                },
                footer: {
                    primaryBrand: "Негизги бренд:",
                    secondaryBrandSummary: " · Экинчи: {{brand}}",
                    unsavedChanges: "Сакталбаган өзгөртүүлөр бар",
                    allChangesSaved: "Бардык өзгөртүүлөр сакталган абалда",
                    regenerating: "Жаңыртылып жатат...",
                    regeneratePdf: "PDF жаңыртуу",
                    regenerateHelp: "Мурун түзүлгөн сертификат файлдарын кайра чыгарат",
                    saveTemplate: "Шаблонду сактоо",
                    saveTemplateHelp: "Шаблон жөндөөлөрүн сактайт, PDF файлдарын өзүнчө жаңыртасыз",
                    regenerateNote: "`PDF жаңыртуу` мурун түзүлгөн сертификат файлдарын кайра чыгарат.",
                    saveTemplateNote: "`Шаблонду сактоо` жөндөөлөрдү сактайт, бирок PDF файлдарын автоматтык түрдө кайра жаратпайт."
                }
            },
            registry: {
                title: "Сертификат реестри",
                description: "Бул курс боюнча түзүлгөн сертификаттардын акыркы абалы.",
                metrics: {
                    issued: "Берилди",
                    pending: "Кароодо",
                    revoked: "Жокко чыгарылды",
                    rejected: "Четке кагылды"
                },
                studentFallback: "Студент #{{id}}",
                empty: "Азырынча бул курс боюнча сертификаттар түзүлгөн жок."
            },
            students: {
                title: "Студенттер",
                loadingDescription: "Тизме жүктөлүүдө.",
                issueTitle: "Студенттерге сертификат берүү",
                issueDescription: "Курс жана студент тандоосу ушул жерде бириктирилген: студентти таап, сертификат абалына жараша берүү же бекитүү аракетин жасаңыз.",
                selectedNotFoundDescription: "Тандалган студент бул фильтр менен табылган жок.",
                emptyDescription: "Бул курс боюнча тизмек азырынча бош.",
                selectedNotFoundTitle: "Бул студент азыркы фильтрге туура келбейт",
                emptyTitle: "Бул курста азырынча студент жок",
                selectedNotFoundSubtitle: "Башка студентти тандаңыз же селекторду тазалаңыз.",
                emptySubtitle: "Башка курсту тандап көрүңүз же катталууларды күтүңүз.",
                eligibility: {
                    attendance: "Катышуу:",
                    homework: "Үй тапшырма:",
                    activities: "Иштер:"
                }
            },
            pagination: {
                previous: "Алдыңкы",
                next: "Кийинки",
                page: "Барак {{page}} / {{total}}"
            },
            signatureModal: {
                title: "Кол коюуну тартуу",
                description: "Тартып бүткөндөн кийин сактаңыз. Жаңыртылган кол коюу сертификатка дароо колдонулат."
            }
        },
        signaturePad: {
            title: "Же ушул жерге кол коюңуз",
            description: "Чийилген кол коюу тунук PNG катары сакталат.",
            clear: "Тазалоо",
            save: "Кол коюуну сактоо"
        },
        status: {
            issued: "Сертификат берилди",
            pending_approval: "Сертификат кароодо",
            rejected: "Сертификат четке кагылган",
            revoked: "Сертификат жокко чыгарылган",
            none: "Сертификат жок"
        },
        actions: {
            issue: "Берүү",
            issuing: "Берилүүдө...",
            reissue: "Кайра берүү",
            approve: "Бекитүү",
            approving: "Бекитилүүдө...",
            reject: "Четке кагуу",
            sending: "Жөнөтүлүүдө...",
            revoke: "Жокко чыгаруу",
            revoking: "Жокко чыгарылууда...",
            downloadPdf: "PDF жүктөө",
            pdf: "PDF",
            verify: "Текшерүү"
        },
        eligibilityReasons: {
            sessionsMissing: "сессиялар түзүлө элек",
            sessionsIncomplete: "сессиялар бүтө элек",
            attendanceBelowThreshold: "катышуу жетишсиз",
            homeworkBelowThreshold: "үй тапшырма жетишсиз",
            activitiesBelowThreshold: "класс иштери жетишсиз",
            lessonProgressIncomplete: "сабак прогресси толук эмес"
        },
        state: {
            issued: {
                button: "Берилген",
                helper: "Сертификат активдүү. PDF же текшерүү шилтемесин колдонсоңуз болот."
            },
            pending: {
                button: "Кароодо",
                helper: "Сураныч буга чейин түзүлгөн. Эми бекитүү же четке кагуу гана керек."
            },
            incomplete: {
                requirementsButton: "Талаптар бүтө элек",
                manualWithMissing: "Авто-берүү үчүн талаптар бүтө элек: {{missing}}. Кол менен сертификат берсеңиз болот.",
                manualWithProgress: "Курс толук бүтө элек. Азыркы прогресс: {{progress}}%. Кааласаңыз сертификатты азыр да бере аласыз.",
                blockedWithMissing: "Сертификат үчүн талаптар бүтө элек: {{missing}}.",
                blockedWithProgress: "Курс толук бүтө элек. Азыркы прогресс: {{progress}}%."
            },
            rejected: {
                manualHelper: "Мурдагы сертификат четке кагылган. Толук бүткөндүктөн кайра берсе болот.",
                helper: "Мурдагы сертификат четке кагылган."
            },
            revoked: {
                manualHelper: "Мурдагы сертификат жокко чыгарылган. Кааласаңыз жаңысын кайра чыгара аласыз.",
                helper: "Мурдагы сертификат жокко чыгарылган."
            },
            ready: {
                button: "Даяр",
                manualHelper: "Студент курсту толук бүтүргөн. Сертификатты азыр чыгарса болот.",
                helper: "Студент курсту толук бүтүргөн. Сертификат автоматтык же админ эрежеси боюнча берилет."
            }
        },
        studentCard: {
            enrolledAt: "Катталды",
            completion: "Аяктоо"
        },
        toasts: {
            featureDisabled: "Бул тенант үчүн сертификаттар өчүрүлгөн.",
            ruleUpdated: "Сертификат эрежеси жаңыртылды.",
            ruleUpdateError: "Сертификат эрежесин жаңыртуу мүмкүн болбоду.",
            templateSaved: "Сертификат шаблону сакталды.",
            templateSaveError: "Сертификат шаблонун сактоо мүмкүн болбоду.",
            regenerated: "{{count}} сертификат жаңыртылды.",
            noneRegenerated: "Жаңыртууга сертификат табылган жок.",
            regenerateError: "Сертификат PDF файлдарын жаңыртуу мүмкүн болбоду.",
            signatureSaved: "Кол коюу сакталды.",
            secondaryLogoUploaded: "Экинчи бренд логотиби жүктөлдү.",
            signatureSaveError: "Кол коюуну сактоо мүмкүн болбоду.",
            assetUploadError: "Сертификат активин жүктөө мүмкүн болбоду.",
            certificateUpdated: "Сертификат жаңыртылды.",
            certificateActionError: "Сертификат аракетин аткаруу мүмкүн болбоду."
        }
    }
};
