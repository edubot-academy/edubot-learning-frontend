export const integrations = {
    integrationTab: {
        toasts: {
            loadFailed: "Интеграция маалыматы жүктөлгөн жок.",
            detailLoadFailed: "Окуянын толук маалыматын жүктөө мүмкүн болгон жок.",
            copied: "{{label}} көчүрүлдү.",
            copyFailed: "{{label}} көчүрүү мүмкүн болгон жок."
        },
        hero: {
            eyebrow: "CRM жана LMS синхрондоштуруу",
            title: "CRM-LMS интеграциясы",
            description: "Webhook абалы, тобокелдик жыйынтыгы жана каттоо статус окуялары."
        },
        filters: {
            severity: "Деңгээл",
            issueType: "Тобокелдик түрү",
            enrollmentStatus: "Каттоо статусу",
            from: "Күндөн",
            to: "Күнгө чейин"
        },
        metrics: {
            riskToday: "Бүгүнкү тобокелдик эскертмеси",
            criticalAlerts: "Критикалык эскертме",
            enrollmentEvents: "Каттоо окуялары",
            pendingWebhook: "Күтүүдөгү webhook",
            failedWebhook: "Ишке ашпаган webhook",
            lastSent: "Акыркы жөнөтүү",
            pendingCrmEnrollments: "Күтүүдөгү CRM каттоолор",
            dispatchErrors: "Каттоо жөнөтүү каталары",
            lastPendingEnrollment: "Акыркы күтүүдөгү каттоо"
        },
        quickViews: {
            pending: "Күтүүдө",
            active: "Активдүү",
            failedDispatch: "Жөнөтүү катасы"
        },
        sections: {
            pending: {
                title: "Күтүүдөгү CRM каттоолору",
                description: "LMS ичинде күтүүдөгү абалда турган жана CRMге жөнөтүлгөн каттоо окуялары."
            },
            risk: {
                title: "Акыркы критикалык тобокелдик эскертмелери",
                description: "LMS жана CRM ортосундагы олуттуу синхрондоштуруу көйгөйлөрү."
            },
            events: {
                title: "Каттоо статус окуялары",
                description: "Webhook аркылуу келген каттоо абалынын тарыхы."
            }
        },
        table: {
            time: "Убакыт",
            enrollment: "Каттоо",
            student: "Студент",
            crmLead: "CRM лид",
            access: "Жеткиликтүүлүк",
            dispatch: "Жөнөтүү",
            note: "Эскертүү",
            severity: "Деңгээл",
            lmsStudent: "LMS студент",
            summary: "Кыскача",
            eventId: "Окуя ID",
            enrollmentStatus: "Каттоо статусу",
            error: "Ката"
        },
        empty: {
            pending: {
                title: "Күтүүдөгү CRM каттоолору табылган жок",
                subtitle: "Учурда CRMден келген күтүүдөгү каттоо көрүнбөйт."
            },
            risk: {
                title: "Критикалык тобокелдик эскертмеси табылган жок",
                subtitle: "Фильтрлерге туура келген олуттуу эскертмелер жок."
            },
            events: {
                title: "Каттоо окуясы табылган жок",
                subtitle: "Фильтрлерге туура келген каттоо окуялары жок."
            }
        },
        detail: {
            title: "Каттоо окуясынын толук маалыматы",
            eventTime: "Окуя убактысы",
            lmsEnrollment: "LMS каттоо",
            lmsEnrollmentId: "LMS каттоо ID",
            studentName: "Студенттин аты",
            lmsStudentId: "LMS студент ID",
            crmLeadId: "CRM лид ID",
            dispatchStatus: "Жөнөтүү статусу",
            loadingPayload: "Толук payload жүктөлүүдө...",
            webhookPayload: "Webhook payload"
        },
        actions: {
            viewDetails: "Толук көрүү",
            openUserCard: "Колдонуучу картасын ачуу",
            openWithFilter: "Туура фильтр менен ачуу"
        },
        fallbacks: {
            unknownName: "Аты белгисиз"
        },
        riskSeverity: {
            critical: "Критикалык",
            high: "Жогорку",
            medium: "Орточо",
            low: "Төмөн"
        },
        riskIssueType: {
            low_attendance: "Катышуу төмөн",
            inactive_student: "Активдүү эмес студент",
            low_homework_completion: "Үй тапшырма аткаруу төмөн",
            low_quiz_participation: "Квизге катышуу төмөн",
            payment_risk: "Төлөм тобокелдиги",
            missing_attendance: "Катышуу жок",
            attendance_drop: "Катышуу төмөндөдү",
            missing_homework: "Үй тапшырма жок",
            payment_overdue: "Төлөм мөөнөтү өттү",
            no_access: "Жеткиликтүүлүк жок"
        },
        enrollmentStatus: {
            pending: "Күтүүдө",
            active: "Активдүү",
            cancelled: "Жокко чыгарылган",
            completed: "Аяктаган"
        },
        accessStatus: {
            active: "Активдүү",
            locked: "Кулпуланган",
            pending: "Күтүүдө",
            revoked: "Жокко чыгарылган"
        },
        dispatchStatus: {
            sent: "Жөнөтүлдү",
            failed: "Ишке ашпады",
            pending: "Күтүүдө"
        }
    },
    company: {
        fields: {
            name: "Компаниянын аталышы",
            about: "Сүрөттөмө",
            logo: "Логотип",
            website: "Веб-сайт",
            email: "Email",
            phone: "Телефон",
            contactName: "Байланыш адамы",
            contactEmail: "Байланыш email",
            contactPhone: "Байланыш телефону",
            address: "Дарек",
            city: "Шаар",
            country: "Өлкө",
            telegram: "Telegram",
            whatsapp: "WhatsApp",
            instagram: "Instagram",
            taxId: "Салык ID",
            notes: "Ички белгилер"
        },
        list: {
            title: "Тенант компаниялар",
            subtitle: "Тенант иш аймактарын башкарып, компания операцияларын ачып, жоопкерчилиги так жаңы тенант түзүңүз.",
            results: "Натыйжалар",
            searchLabel: "Компанияларды издөө",
            searchPlaceholder: "Компаниянын аталышы боюнча издөө",
            clear: "Тазалоо",
            searchHint: "Издөө URLде сакталат, ошондуктан бул чыпкаланган көрүнүштү кайра ачса болот.",
            createTitle: "Тенант түзүү",
            createHint: "Адегенде компанияны түзүңүз, андан кийин иш аймагы ичинде байланыштарды, мүчөлөрдү, курстарды жана CRM шилтемелерин жөндөңүз.",
            creating: "Түзүлүүдө...",
            createAction: "Компания түзүү",
            directoryTitle: "Компаниялар каталогу",
            filteredBy: "\"{{query}}\" боюнча чыпкаланды.",
            directorySubtitle: "Ролуңузга жеткиликтүү бардык тенант иш аймактары.",
            pageOf: "{{page}} / {{totalPages}} бет",
            loadErrorTitle: "Компаниялар жүктөлгөн жок",
            loadErrorSubtitle: "Тенант каталогу жеткиликсиз. Тенант түзүүдөн же ачуудан мурун сурамды кайталаңыз.",
            retry: "Кайра аракет кылуу",
            noDescription: "Азырынча сүрөттөмө жок.",
            openWorkspace: "Иш аймагын ачуу",
            emptySearchTitle: "Бул издөө боюнча компания табылган жок",
            emptyTitle: "Азырынча компания жок",
            emptySearchSubtitle: "Издөөнү тазалаңыз же башка компания аталышын колдонуп көрүңүз.",
            emptySubtitle: "Мүчөлөрдү жана курстарды бекитүүнү баштоо үчүн биринчи тенант компанияны түзүңүз.",
            clearSearch: "Издөөнү тазалоо",
            paginationLabel: "Компания беттери",
            previous: "Мурунку",
            next: "Кийинки",
            toasts: {
                loadError: "Компанияларды жүктөө мүмкүн болбоду.",
                nameRequired: "Компаниянын аталышы милдеттүү.",
                created: "Компания түзүлдү.",
                createError: "Компания түзүү мүмкүн болбоду."
            }
        },
        detail: {
            subtitle: "Бул тенант профилин, колдонуучуларын жана курс жеткиликтүүлүгүн бир иш аймагынан башкарыңыз.",
            notSet: "Коюлган эмес",
            loadErrorTitle: "Компания жүктөлгөн жок",
            loadErrorSubtitle: "Тенант жеткиликсиз болушу мүмкүн же сизде кирүү укугу жок. Кайра жүктөп көрүңүз.",
            retry: "Кайра аракет кылуу",
            backToCompanies: "Компанияларга кайтуу",
            managementAccess: "Башкаруу укугу",
            readOnlyAccess: "Окуу гана укугу",
            tabsLabel: "Компания иш аймагынын бөлүмдөрү",
            summary: {
                role: "Роль",
                email: "Email",
                phone: "Телефон",
                city: "Шаар"
            },
            tabs: {
                settings: {
                    label: "Компания профили",
                    description: "Бренд, байланыштар, дарек жана юридикалык маалымат"
                },
                members: {
                    label: "Мүчөлөр",
                    description: "Ролдор, чакыруулар жана иш аймагына жеткиликтүүлүк"
                },
                courses: {
                    label: "Курстар",
                    description: "Бул тенант үчүн курс бекитүүлөрү"
                }
            },
            toasts: {
                loadError: "Компания маалыматын жүктөө мүмкүн болбоду."
            }
        },
        platformTenant: {
            adminFallback: "Админ",
            tenant: "Тенант",
            logoAlt: "{{name}} логотиби",
            uploadingLogo: "Жүктөлүүдө...",
            headerSubtitle: "Платформа тенантынын профилин, доменин, планын жана интеграцияларын башкарыңыз.",
            hideMenu: "Менюну жашыруу",
            showMenu: "Менюну көрсөтүү",
            tenantRegistry: "Тенанттар реестри",
            notFoundTitle: "Тенант табылган жок",
            notFoundSubtitle: "Платформа тенанттарынын реестрине кайтыңыз.",
            eyebrow: "Платформа тенанты",
            tenants: "Тенанттар",
            confirmAction: "Аракетти тастыктоо",
            confirm: "Тастыктоо",
            notConfigured: "Жөндөлгөн эмес",
            notLinked: "Байланган эмес",
            values: {
                enabled: "Күйгүзүлгөн",
                disabled: "Өчүрүлгөн"
            },
            fields: {
                subdomain: "Субдомен",
                customDomain: "Өз домени",
                effectiveDomain: "Натыйжалуу домен",
                timezone: "Убакыт алкагы",
                locale: "Локаль",
                status: "Статус",
                plan: "План",
                billingStatus: "Биллинг статусу",
                crmTenantId: "CRM тенант ID",
                crmSlug: "CRM slug",
                crmPrimaryDomain: "Негизги CRM домени"
            },
            tabs: {
                overview: "Жалпы көрүнүш",
                profile: "Профиль",
                domain: "Домен",
                billing: "План жана биллинг",
                crm: "CRM байланышы",
                members: "Ээлер жана админдер",
                courses: "Курстар",
                branding: "Брендинг",
                settings: "Жөндөөлөр",
                flags: "Функция флагдары",
                activity: "Активдүүлүк"
            },
            status: {
                trial: "Сыноо",
                active: "Активдүү",
                inactive: "Активдүү эмес",
                suspended: "Токтотулган",
                archived: "Архивделген"
            },
            metrics: {
                status: "Статус",
                plan: "План",
                owners: "Ээлер",
                admins: "Админдер",
                courses: "Курстар",
                students: "Студенттер",
                flags: "Флагдар",
                crm: "CRM"
            },
            courseVisibility: {
                PUBLIC: "Ачык",
                PRIVATE: "Жеке",
                TENANT_ONLY: "Тенант үчүн гана"
            },
            snapshot: {
                title: "Тенант кыскача маалыматы",
                name: "Аталышы",
                locale: "Локаль",
                timezone: "Убакыт алкагы",
                billing: "Биллинг",
                subdomain: "Субдомен",
                customDomain: "Өз домени",
                crmTenantId: "CRM тенант ID",
                crmPrimaryDomain: "Негизги CRM домени",
                domain: "Домен",
                ownerAdminRows: "Ээ/админ саптары"
            },
            lifecycle: {
                title: "Жашоо цикли",
                description: "Кооптуу тазалоодон мурун тенант жеткиликтүүлүгүн статус өзгөртүүлөрү аркылуу башкарыңыз.",
                current: "Учурдагы: {{status}}",
                activate: "Активдештирүү",
                suspend: "Токтотуу",
                archive: "Архивдөө",
                changeTitle: "Тенант статусун өзгөртүү",
                changeMessage: "Тенант статусун {{status}} кылып өзгөртөсүзбү?",
                changeConfirm: "Статусту өзгөртүү"
            },
            branding: {
                displayName: "Көрсөтүлүүчү аталыш",
                certificateLogoUrl: "Сертификат логотибинин URL дареги",
                primaryColor: "Негизги түс",
                secondaryColor: "Кошумча түс",
                accentColor: "Акцент түсү"
            },
            settings: {
                supportEmail: "Колдоо email",
                defaultCourseVisibility: "Демейки курс көрүнүмдүүлүгү",
                allowSelfEnrollment: "Өз алдынча катталууга уруксат берүү",
                requireEnrollmentApproval: "Катталууну бекитүүнү талап кылуу"
            },
            featureFlags: {
                customFlags: "Өз флагдары",
                addCustomFlag: "Өз флагын кошуу",
                flagKey: "Флаг ачкычы",
                value: "Маани",
                customFeatureFlag: "Өз функция флагы",
                removeFeatureFlag: "Функция флагын алып салуу",
                noCustomFlags: "Өз флагдары жөндөлгөн эмес.",
                video: {
                    label: "Видео курс түзүү",
                    description: "Бул тенант үчүн жеке видео курстарды түзүүгө уруксат берүү."
                },
                offline: {
                    label: "Офлайн курстар",
                    description: "Бул тенант үчүн бетме-бет курстарды өткөрүүгө уруксат берүү."
                },
                onlineLive: {
                    label: "Жандуу онлайн курстар",
                    description: "Бул тенант үчүн график боюнча жандуу онлайн окууну жүргүзүүгө уруксат берүү."
                },
                certificates: {
                    label: "Сертификаттар",
                    description: "Сертификат берүү жана жөндөө мүмкүнчүлүгүн күйгүзүү."
                },
                attendance: {
                    label: "Катышуу",
                    description: "Жандуу же офлайн сессиялар үчүн катышуу процесстерин күйгүзүү."
                },
                homework: {
                    label: "Үй тапшырмалар",
                    description: "Үй тапшырма жана тапшыруу процесстерин күйгүзүү."
                },
                crmSync: {
                    label: "CRM синхрондоо",
                    description: "Байланган CRM тенант менен LMS тенант синхрондоону күйгүзүү."
                },
                aiAssistant: {
                    label: "AI ассистент",
                    description: "AI чат жана курс ассистентинин мүмкүнчүлүктөрүн күйгүзүү."
                }
            },
            activity: {
                description: "Сервер жазып койгон акыркы тенант өзгөрүүлөрү.",
                loading: "Активдүүлүк жүктөлүүдө...",
                empty: "Тенант активдүүлүгү азырынча жазыла элек.",
                roleSummary: "Роль: {{role}}",
                userNumber: "Колдонуучу #{{id}}",
                target: "объект",
                targetNumber: "{{type}} #{{id}}",
                noDetails: "Детал жок",
                system: "Система",
                table: {
                    action: "Аракет",
                    details: "Деталдар",
                    actor: "Аткаруучу",
                    time: "Убакыт"
                },
                actions: {
                    tenantCreated: "Тенант түзүлдү",
                    tenantUpdated: "Тенант жаңыртылды",
                    logoUpdated: "Логотип жаңыртылды",
                    roleAdded: "Роль кошулду",
                    roleRemoved: "Роль алынды",
                    memberRemoved: "Мүчө өчүрүлдү",
                    roleChanged: "Роль өзгөрдү",
                    courseAttached: "Курс бекитилди",
                    courseRemoved: "Курс алынды"
                }
            },
            toasts: {
                loadError: "Тенант жүктөө мүмкүн болбоду.",
                activityLoadError: "Тенант активдүүлүгүн жүктөө мүмкүн болбоду.",
                saved: "Тенант жаңыртылды.",
                saveError: "Тенант жаңыртуу мүмкүн болбоду."
            }
        },
        members: {
            title: "Тенант мүчөлөрү",
            description: "Тенант ролдорун башкарыңыз. Ээ ролу платформа аркылуу башкарылат жана платформанын админдерине гана көрүнөт.",
            platformTitle: "Ээлер жана админдер",
            platformDescription: "Платформа тенантынын деталында тенант ээси жана админ укуктарын гана башкарыңыз.",
            searchHelp: "Учурдагы колдонуучуну издеп, бул тенант ичинде кармай турган ролун дайындаңыз.",
            inviteAction: "Мүчө чакыруу же түзүү",
            searchExistingUsers: "Учурдагы колдонуучуларды издөө",
            searchPlaceholder: "Аты же email боюнча издөө...",
            searchResultsLabel: "Колдонуучу издөө натыйжалары",
            noMatchingUsers: "Туура келген колдонуучу жок.",
            tenantRole: "Тенант ролу",
            adding: "Кошулууда...",
            addMember: "Мүчө кошуу",
            sending: "Жөнөтүлүүдө...",
            resendInvite: "Чакырууну кайра жөнөтүү",
            removing: "Өчүрүлүүдө...",
            remove: "Өчүрүү",
            empty: "Тенант мүчөлөрү табылган жок.",
            table: {
                user: "Колдонуучу",
                email: "Email",
                role: "Роль",
                actions: "Аракеттер"
            },
            roles: {
                fallbackDescription: "Тенант иш аймагына жеткиликтүүлүк.",
                owner: {
                    label: "Ээ",
                    description: "Платформа аркылуу башкарылган, толук ээлик көрүнүшү бар тенант ээси."
                },
                company_admin: {
                    label: "Тенант админи",
                    description: "Тенант колдонуучуларын, курстарын жана иш аймагынын жөндөөлөрүн башкарат."
                },
                instructor: {
                    label: "Инструктор",
                    description: "Курстарды, сессияларды, үй тапшырмаларын, сертификаттарды жана студенттердин окуу иштерин жүргүзөт."
                },
                assistant: {
                    label: "Ассистент",
                    description: "Катышуу, каттоо жана күнүмдүк тенант операцияларын колдойт."
                },
                student: {
                    label: "Студент",
                    description: "Бекитилген курстарда окуйт жана аккаунт жөндөө шилтемелерин алат."
                }
            },
            inviteModal: {
                title: "Мүчө чакыруу же түзүү",
                subtitle: "Керек болсо платформа колдонуучусун түзүп, андан кийин тенант ролун бекитиңиз.",
                fullName: "Толук аты-жөнү",
                email: "Email",
                sendSetupEmail: "Жөндөө emailин жөнөтүү",
                setupLink: "Жөндөө шилтемеси",
                copyLink: "Шилтемени көчүрүү",
                close: "Жабуу",
                saving: "Сакталууда...",
                createInvite: "Түзүү же чакыруу"
            },
            inviteLinkModal: {
                title: "Чакыруу жөндөө шилтемеси",
                subtitle: "Колдонуучу жөндөө emailин алган жок болсо, бул шилтемени көчүрүп бөлүшүңүз.",
                emailSent: "Email жөнөтүлдү. ",
                expires: "Мөөнөтү: {{value}}.",
                soon: "жакында",
                noSetupLink: "Бул мүчө үчүн жөндөө шилтемеси жеткиликсиз. Аккаунт мурунтан активдүү болушу мүмкүн."
            },
            removeModal: {
                title: "Мүчөнү өчүрүү",
                message: "{{name}} бул тенант ичинен өчүрүлсүнбү?",
                thisMember: "бул мүчө"
            },
            toasts: {
                loadError: "Тенант мүчөлөрүн жүктөө мүмкүн болбоду.",
                selectUser: "Адегенде колдонуучу тандаңыз.",
                added: "Мүчө кошулду.",
                addError: "Мүчө кошуу мүмкүн болбоду.",
                removed: "Мүчө өчүрүлдү.",
                removeError: "Мүчөнү өчүрүү мүмкүн болбоду.",
                roleUpdated: "Роль жаңыртылды.",
                roleUpdateError: "Ролду жаңыртуу мүмкүн болбоду.",
                userCreated: "Колдонуучу түзүлүп кошулду.",
                userAdded: "Колдонуучу тенант ичине кошулду.",
                inviteError: "Чакыруу же түзүү ишке ашкан жок.",
                linkCopied: "Жөндөө шилтемеси көчүрүлдү.",
                copyError: "Жөндөө шилтемесин көчүрүү мүмкүн болбоду.",
                inviteResent: "Чакыруу кайра жөнөтүлдү.",
                linkRegenerated: "Чакыруу шилтемеси кайра түзүлдү.",
                resendError: "Чакырууну кайра жөнөтүү мүмкүн болбоду."
            }
        },
        courses: {
            title: "Тенант курстары",
            description: "Адегенде бекитилген курстарды караңыз. Бул тенант үчүн башка курс бекитүү керек болгондо гана кошуу режимин ачыңыз.",
            assignedCount: "Бекитилген курстар: {{count}}",
            filterHelp: "Төмөнкү издөө бул тенант ичине мурунтан бекитилген курстарды чыпкалайт.",
            filterLabel: "Бекитилген курстарды чыпкалоо",
            filterPlaceholder: "Бекитилген курстарды чыпкалоо",
            closeAddMode: "Кошуу панелин жабуу",
            addCourse: "Курс кошуу",
            attachTitle: "Жаңы курс бекитүү",
            attachSubtitle: "Бул издөө бул тенант ичине мурунтан бекитилбеген курстарды табат.",
            attachSearchLabel: "Бекитиле турган курсту издөө",
            attachSearchPlaceholder: "Бекитиле турган курстун аталышын издөө",
            showingLimit: "{{count}} дал келген курска чейин көрсөтүлүүдө. Так бекитүү үчүн издөөнү тарылтыңыз.",
            resultCount: "{{count}} натыйжа",
            searchFailedTitle: "Курс издөө ишке ашкан жок",
            searchFailedSubtitle: "Издөөнү кайра аракет кылыңыз же тенант курс тизмесин жаңыртыңыз.",
            retrySearch: "Издөөнү кайталоо",
            noCoursesFoundTitle: "Курс табылган жок",
            noCoursesFoundSubtitle: "Башка издөө сөзүн колдонуп көрүңүз.",
            searchToAttach: "Бул тенант ичине бекитүү үчүн курстун аталышын издеңиз.",
            loadErrorTitle: "Тенант курстары жүктөлгөн жок",
            loadErrorSubtitle: "Бекитүүлөр тизмеси жеткиликсиз. Курс байланыштарын өзгөртүүдөн мурун кайра аракет кылыңыз.",
            retry: "Кайра аракет кылуу",
            attach: "Бекитүү",
            view: "Көрүү",
            detaching: "Ажыратылууда...",
            detach: "Ажыратуу",
            emptyTitle: "Байланган курс жок",
            emptyManageSubtitle: "Бул тенант үчүн жеткиликтүү кылуу үчүн курс бекитиңиз.",
            emptyReadOnlySubtitle: "Бул тенант үчүн азырынча курс байланган жок.",
            paginationLabel: "Тенант курс беттери",
            table: {
                course: "Курс",
                instructor: "Инструктор",
                type: "Түрү",
                status: "Статус",
                action: "Аракет",
                actions: "Аракеттер"
            },
            types: {
                video: "Видео",
                online_live: "Жандуу онлайн",
                offline: "Офлайн",
                course: "Курс"
            },
            status: {
                published: "Жарыяланган",
                draft: "Черновик",
                approved: "Бекитилген",
                pending_approval: "Бекитүүнү күтүп жатат",
                in_review: "Каралууда",
                rejected: "Четке кагылган",
                archived: "Архивделген",
                unknown: "Статус белгисиз"
            },
            price: {
                free: "Акысыз",
                notSet: "Баасы коюлган эмес",
                kgs: "{{amount}} KGS"
            },
            disabled: {
                badge: "Тенант үчүн өчүрүлгөн",
                action: "Өчүрүлгөн",
                offline: "Офлайн курстар бул тенант үчүн өчүрүлгөн.",
                onlineLive: "Жандуу онлайн курстар бул тенант үчүн өчүрүлгөн.",
                generic: "Бул курс түрү бул тенант үчүн өчүрүлгөн."
            },
            detachModal: {
                title: "Курсту ажыратуу",
                message: "Бул курсту тенант ичинен ажыратасызбы? Учурдагы студенттер сервер саясатына жараша тенант деңгээлиндеги жеткиликтүүлүктү жоготушу мүмкүн."
            },
            platform: {
                title: "Курстар",
                description: "Бар болгон курстарды бул тенант ичине бекитиңиз жана керек болгондо тенант байланыштарын алып салыңыз.",
                searchTenantCourses: "Тенант курстарын издөө",
                attachPlaceholder: "Бар болгон курсту издөө",
                attaching: "Бекитилүүдө...",
                courseNumber: "Курс #{{id}}",
                noInstructor: "Инструктор жок",
                disabledByFeatureFlags: "функция флагдары аркылуу өчүрүлгөн",
                noMatchingCourses: "Дал келген курс табылган жок.",
                loadingCourses: "Курстар жүктөлүүдө...",
                remove: "Алып салуу",
                empty: "Бул тенант ичине курс бекитилген эмес."
            },
            toasts: {
                loadError: "Тенант курстарын жүктөө мүмкүн болбоду.",
                detached: "Курс тенант ичинен ажыратылды.",
                detachError: "Курсту ажыратуу мүмкүн болбоду.",
                attached: "Курс тенант ичине бекитилди.",
                attachError: "Курсту бекитүү мүмкүн болбоду."
            }
        },
        adminCompanies: {
            headerEyebrow: "Тенант иш аймагы",
            title: "Платформа тенанттары",
            description: "LMS тенанттарын, домендерди, план абалын жана CRM байланыштарын бир платформа-админ бетинен башкарыңыз.",
            createTenant: "Тенант түзүү",
            billingStatuses: {
                trial: "Сыноо",
                active: "Активдүү",
                pastDue: "Мөөнөтү өттү",
                cancelled: "Жокко чыгарылган"
            },
            metrics: {
                tenants: "Тенанттар",
                active: "Активдүү",
                domains: "Домендер",
                crmLinked: "CRM байланган"
            },
            registry: {
                title: "Тенант реестри",
                description: "Реестрди тез башкаруу өзгөрүүлөрү үчүн колдонуңуз. Терең профиль, CRM, мүчө жана курс башкаруу үчүн тенант деталын ачыңыз.",
                searchPlaceholder: "Тенанттарды издөө",
                coursesLinked: "Байланган курстар: {{count}}",
                tenantWorkspace: "Тенант иш аймагы",
                emptyTitle: "Тенант табылган жок",
                emptySubtitle: "Тенант түзүңүз же издөө фильтрин өзгөртүңүз."
            },
            courseLinks: {
                title: "Курс байланыштары",
                description: "Бар болгон курстарды тенанттарга байлаңыз; runtime тенант багыттоосу өзгөрбөйт.",
                searchPlaceholder: "Курстарды же тенант аттарын издөө",
                showing: "{{total}} курстун {{visible}} көрсөтүлүүдө",
                currentTenant: "Учурдагы тенант",
                notSelected: "Тандалган эмес",
                selectTenant: "Тенант тандаңыз",
                noMatchingTitle: "Дал келген курс жок",
                noMatchingSubtitle: "Башка курс же тенант издөөсүн колдонуп көрүңүз.",
                showMore: "Көбүрөөк курс көрсөтүү",
                emptyTitle: "Курс табылган жок",
                emptySubtitle: "Тенантка байлоо үчүн азырынча жеткиликтүү курс жок."
            },
            createModal: {
                title: "Тенант түзүү",
                subtitle: "Адегенде LMS тенант негизин түзүңүз. Ээ жана мүчө тазалоосу тенант деталынан башкарылат.",
                ownerSearchPlaceholder: "Учурдагы колдонуучуну аты же email боюнча издөө",
                noMatchingOwners: "Дал келген колдонуучу табылган жок.",
                clearOwner: "Ээсин тазалоо"
            },
            confirm: {
                clearCourseTitle: "Компания байланыштарын тазалоо",
                clearCourseMessage: "Бул курстун бардык компания таандоолору тазалансынбы?",
                clearCourseConfirm: "Байланыштарды тазалоо"
            },
            toasts: {
                created: "Тенант түзүлдү.",
                updated: "Тенант жаңыртылды.",
                courseLinksCleared: "Курстун компания таандоолору тазаланды.",
                courseLinksClearError: "Компания таандоолорун тазалоо мүмкүн болбоду.",
                selectFile: "Файл тандаңыз."
            }
        },
        settings: {
            title: "Компания профили",
            subtitle: "Тенант идентификациясын, байланыш, дарек жана юридикалык маалыматтарды максаты боюнча топтоңуз.",
            cancel: "Жокко чыгаруу",
            saving: "Сакталууда...",
            saveChanges: "Өзгөрүүлөрдү сактоо",
            editProfile: "Профилди түзөтүү",
            logoAlt: "Логотип",
            logoPreviewAlt: "Компания логотипинин алдын ала көрүнүшү",
            noLogo: "Логотип жок",
            uploadLogoFile: "Логотип файлын жүктөө",
            pasteLogoUrl: "Же логотип URL киргизүү",
            dangerTitle: "Кооптуу зона",
            dangerSubtitle: "Компанияны тенант платформадан толугу менен алынышы керек болгондо гана өчүрүңүз. Бул аракет тастыктоону талап кылат.",
            deleting: "Өчүрүлүүдө...",
            deleteCompany: "Компанияны өчүрүү",
            deleteTitle: "Компанияны өчүрүү",
            deleteMessage: "\"{{name}}\" компаниясын өчүрөсүзбү? Бул компания иш аймагын платформадан алып салат.",
            validation: {
                nameRequired: "Компаниянын аталышы милдеттүү.",
                email: "Туура email дарегин киргизиңиз.",
                website: "Туура веб-сайт URL киргизиңиз."
            },
            toasts: {
                reviewFields: "Белгиленген талааларды текшериңиз.",
                saved: "Компания профили сакталды.",
                saveError: "Компания профилин сактоо мүмкүн болбоду.",
                deleted: "Компания өчүрүлдү.",
                deleteError: "Компанияны өчүрүү мүмкүн болбоду.",
                logoUploaded: "Логотип жүктөлдү.",
                logoUploadFailed: "Логотип жүктөлгөн жок.",
                logoUploadError: "Логотипти жүктөө мүмкүн болбоду.",
                logoUploadMissingUrl: "Логотип жүктөлдү, бирок логотип URL кайтарылган жок."
            },
            sections: {
                brand: {
                    title: "Бренд профили",
                    description: "Башкаруу экрандарында көрсөтүлгөн негизги тенант идентификациясы."
                },
                contact: {
                    title: "Байланыш",
                    description: "Негизги колдоо жана жооптуу байланыш маалыматтары."
                },
                location: {
                    title: "Жайгашкан жер",
                    description: "Тенант жазуулары жана байланыш үчүн колдонулган дарек маалыматы."
                },
                channels: {
                    title: "Каналдар",
                    description: "Ачык социалдык жана билдирүү каналдары."
                },
                legal: {
                    title: "Юридикалык маалымат жана белгилер",
                    description: "Ички юридикалык идентификаторлор жана операциялык белгилер."
                }
            }
        }
    }
};
