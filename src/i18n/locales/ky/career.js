export const career = {
    career: {
        nav: {
            title: 'Карьера',
        },
        public: {
            hero: {
                title: 'Чет өлкөлүк компанияларга иш таап бериңиз',
                subtitle:
                    'Көндүмдөрүңүздү киргизиңиз. EduBot сизге англисче резюме түзүп, АКШ жана Европадагы remote жумуштарды көрсөтүп, тапшырууга даярданууга жардам берет.',
                cta: 'Резюмени баштоо — 2 мүнөт',
            },
            steps: {
                form: 'Маалыматыңызды толтуруңуз',
                preview: 'Резюмеңизди көрүңүз',
                jobs: 'Жумуштарды таап, тапшырыңыз',
                formDescription: 'Аты, максат ролу жана жөндөмдүк',
                previewDescription: 'AI англисче резюме түзөт',
                jobsDescription: 'АКШ/Европадагы remote жумуштар, USD эмгек акысы менен',
            },
            pasteToFill: {
                label: 'Мурунку резюмеңиз барбы? Аны бул жерге чаптаңыз, форманы автоматтык толтуралы.',
                button: 'Резюмени чапта',
            },
            limit: {
                reached: 'Бир резюме алдын ала көрүүгө жетүүгө мүмкүнчүлүк чектелген.',
                signupToSave: 'Аккаунт түзүп, дагы резюмелер жасаңыз',
            },
        },
        dashboard: {
            title: 'Карьера борбору',
            welcome: {
                title: 'EduBot Career\'ге кош келиңиз!',
                subtitle:
                    'Бул жерден англисче резюме түзүп, АКШ жана Европадагы remote жумуштарды таап, коштомо кат жазып жана тапшырууларыңызды көзөмөлдөй аласыз.',
            },
            cards: {
                resumeReadiness: 'Резюме даярдыгы',
                savedResumes: 'Сакталган резюмелер',
                bestMatch: 'Эң ылайыктуу жумуш',
                applications: 'Тапшырылган арыздар',
                aiCredits: 'AI кредиттери',
                nextStep: 'Кийинки кадам',
            },
            nextSteps: {
                noResume: 'Резюмеңизди түзүңүз — 2 мүнөт жетет',
                noMatches: 'Remote жумуштарды табыңыз',
                noApplications: 'Тапшырууга даярсызбы? Эң ылайыктуу жумушуңуз сизди күтөт',
                hasApplications: '{{count}} арыз иштелип жатат',
            },
            emptyState: {
                resumes: 'Азырынча резюме жок',
                resumesSubtitle: 'Жумуш табуу үчүн алгач резюмеңизди түзүңүз.',
                jobs: 'Азырынча жумуштар жок',
                jobsSubtitle: 'Резюмеңизди түзгөндөн кийин ылайыктуу жумуштарды табабыз.',
                applications: 'Азырынча арыздар жок',
                applicationsSubtitle: 'Кызыктырган жумушту тапканда бул жерден баарын көзөмөлдөйсүз.',
            },
        },
        resume: {
            builder: {
                title: 'Резюме даярлоо',
                nameLabel: 'Аты-жөнү',
                roleLabel: 'Максат ролу',
                skillsLabel: 'Жөндөмдөр',
                namePlaceholder: 'Толук атыңызды жазыңыз',
                rolePlaceholder: 'Мис. Frontend Developer',
                skillsPlaceholder: 'Мис. React, JavaScript, CSS',
                generateButton: 'Резюме түзүү',
                generating: 'Түзүлүүдө...',
                retry: 'Кайра аракет кылуу',
            },
            preview: {
                title: 'Резюмеңиз даяр',
                score: 'Даярдык: {{score}}/100',
                save: 'Сактоо',
                download: 'PDF жүктөө',
                improve: 'Жакшыртуу',
                lockedSave: 'Сактоо үчүн катталуу',
                lockedDownload: 'PDF жүктөө үчүн катталуу',
            },
            score: {
                strongPoints: 'Күчтүү жактары',
                missing: 'Жетишпеген маалымат',
                atsImprovements: 'ATS жакшыртуулары',
                recommendations: 'Жумушка даярдык сунуштары',
            },
            templates: {
                title: 'Форматты тандаңыз',
                subtitle: 'Бардык форматтар АТС-ылайыктуу жана англисче',
                classic: 'Классикалык',
                classicDescription: 'Бир тилке. Бардык платформалар үчүн эн коопсуз.',
                classicBestFor: 'Баардыгы үчүн',
                modern: 'Заманбап',
                modernDescription: 'Эки тилке. Дизайн жөнүндө кам көргөн компаниялар үчүн.',
                modernBestFor: '1+ жыл тажрыйбасы барлар',
                projectsFirst: 'Долбоорлор алда',
                projectsFirstDescription: 'Жөндөмдөр жана долбоорлор алдыда.',
                projectsFirstBestFor: 'Башталгычтар, bootcamp бүтүрүүчүлөр',
                minimal: 'Минималдуу',
                minimalDescription: 'Мазмун биринчи. Зайым болбогон стиль.',
                minimalBestFor: '3+ жыл тажрыйбасы барлар',
                tech: 'Техникалык',
                techDescription: 'GitHub жана долбоорлор айкын. Иштеп чыгуучулар үчүн.',
                techBestFor: 'GitHub долбоорлору барлар',
            },
        },
        jobs: {
            title: 'Remote жумуштар',
            subtitle: 'АКШ жана Европадан',
            salary: '${{min}}–${{max}} / ай',
            remote: 'Remote',
            hiresInternationally: 'Эл аралык адистерди алат',
            matchScore: '{{score}}% дал келет',
            matchedSkills: 'Дал келген жөндөмдөр',
            missingSkills: 'Жетишпеген жөндөмдөр',
            actions: {
                view: 'Кеңири',
                tailor: 'Резюмени ылайыкташтыруу',
                coverLetter: 'Коштомо кат түзүү',
                apply: 'Тапшыруу',
                save: 'Сактоо',
                interviewPrep: 'Интервьюга даярдануу',
                signupToApply: 'Тапшыруу үчүн катталуу',
                signupToDownload: 'Жүктөө үчүн катталуу',
                signupForCoverLetter: 'Коштомо кат үчүн катталуу',
            },
            coverLetter: {
                optional: 'Каалагандай коштомо кат түзүү',
            },
            interviewPrep: {
                prompt: 'Бул жумушка даярдануу керекпи?',
                description:
                    'EduBot бул вакансия жана резюмеңиз негизинде 7 күндүк интервью даярлануу планын түзүп берет.',
                signupCta: 'Интервью планы үчүн катталуу',
                generateCta: 'Интервью планын түзүү',
            },
        },
        signup: {
            prompt: {
                title: 'Резюмеңиз даяр!',
                subtitle:
                    'Аны сактоо, PDF жүктөө жана жумуштарга тапшыруу үчүн аккаунт түзүңүз. 30 секундада катталыңыз — резюмеңиз сизди күтөт.',
                features: {
                    save: 'Резюмени сактоо',
                    download: 'PDF жүктөө',
                    tailor: 'Жумушка ылайыкташтыруу',
                    coverLetter: 'Коштомо кат түзүү',
                    track: 'Тапшырууларды көзөмөлдөө',
                },
                cta: 'Аккаунт түзүү',
            },
        },
        usage: {
            title: 'AI колдонуу',
            plan: {
                visitor: 'Мейман',
                free: 'Акысыз',
                careerPlus: 'Career Plus',
            },
            limitReached: {
                title: 'Бул айдагы акысыз AI резюме лимитиңиз бүттү.',
                subtitle: 'Career Plusка өтсөңүз:',
                features: {
                    moreResumes: 'Көбүрөөк резюме түзөсүз',
                    coverLetters: 'Коштомо кат жазасыз',
                    tailored: 'Жумушка ылайык резюме даярдайсыз',
                    tracking: 'Тапшырууларды көзөмөлдөйсүз',
                },
                upgradeCta: 'Career Plus\'ка өтүү',
            },
            credits: {
                remaining: '{{used}}/{{total}} колдонулду',
                unlimited: 'Чексиз',
            },
        },
        errors: {
            generationFailed: 'Резюме түзүү мүмкүн болбоду. Кайра аракет кылыңыз.',
            matchFailed: 'Жумуштарды жүктөө мүмкүн болбоду. Кайра аракет кылыңыз.',
            draftExpired: 'Резюме долбоорунун мөөнөтү бүттү. Кайра толтуруңуз.',
            saveFailed: 'Сактоо мүмкүн болбоду. Кайра аракет кылыңыз.',
        },
    },
};
