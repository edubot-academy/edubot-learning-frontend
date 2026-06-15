export const instructor = {
    instructorChat: {
        courseLoading: "Course information is still loading...",
        instructorFallback: "Instructor",
        onlineStatus: "Online",
        empty: {
            title: "Start the conversation",
            subtitle: "Send your first message to the instructor."
        },
        imageAlt: "Image",
        fileFallback: "File",
        attachFile: "Attach file",
        attachImage: "Attach image",
        toggleAttachments: "Show attachment actions",
        composerPlaceholder: "Write a message...",
        composerAria: "Message input",
        send: "Send"
    },
    instructorHomework: {
        hero: {
            eyebrow: "Homework Queue",
            title: "Homework queue",
            description: "Find which course, group, and session need action. The full review workflow opens inside the related session homework tab."
        },
        metrics: {
            total: "Total",
            actionRequired: "Needs action",
            missing: "Not submitted",
            needsRevision: "Needs revision"
        },
        filters: {
            title: "Filters",
            description: "Narrow the queue by course, group, status, and search. Click metric cards to select the related status automatically.",
            status: "Status",
            results: "Results",
            allCourses: "All courses",
            allGroups: "All groups",
            searchPlaceholder: "Search",
            limitPlaceholder: "Limit"
        },
        filterOptions: {
            all: "All",
            needsReview: "Needs review",
            missing: "Not submitted",
            needsRevision: "Needs revision",
            late: "Late",
            draft: "Draft",
            active: "Active",
            dueSoon: "Due soon",
            overdue: "Overdue",
            checked: "Checked",
            noDeadline: "No deadline"
        },
        states: {
            draft: "Draft",
            needsReview: "Needs review",
            missing: "Not submitted",
            needsRevision: "Needs revision",
            late: "Late",
            checked: "Checked",
            noDeadline: "No deadline",
            unknown: "Unknown",
            overdue: "Overdue",
            dueSoon: "Due soon",
            active: "Active"
        },
        nextActions: {
            title: "Next actions",
            description: "The queue is sorted by urgency: review, missing submissions, revisions, and late answers appear first.",
            priorityCount: "{{count}} priority"
        },
        queueActions: {
            needsReview: {
                label: "Review first",
                description: "{{count}} answers are waiting for instructor review."
            },
            missing: {
                label: "Follow up on missing submissions",
                description: "{{count}} students have not submitted the task."
            },
            needsRevision: {
                label: "Review revisions again",
                description: "{{count}} answers are waiting after revision."
            },
            late: {
                label: "Check late submissions",
                description: "{{count}} answers arrived after the deadline."
            },
            default: {
                label: "Monitor",
                description: "There is no urgent action for this task right now."
            }
        },
        tasks: {
            title: "Tasks",
            description: "Results for the selected filters appear here."
        },
        empty: {
            title: "No homework found",
            subtitle: "Try changing the course or group filters, or clear the search query."
        },
        queue: {
            title: "Queued homework",
            description: "Each card links to the related session and opens the full review workflow.",
            recordCount: "{{count}} records"
        },
        card: {
            actionRequired: "Needs action",
            needsReview: "Needs review",
            missing: "Not submitted",
            needsRevision: "Needs revision",
            late: "Late"
        },
        actions: {
            openSession: "Open in session"
        },
        fallbacks: {
            homework: "Homework",
            noSession: "No session specified",
            noDeadline: "No deadline set"
        },
        errors: {
            unauthorized: "Your session expired. Sign in again.",
            forbidden: "This course or group is not assigned to you.",
            coursesLoad: "Could not load courses.",
            groupsLoad: "Could not load groups.",
            homeworkLoad: "Could not load homework.",
            queueLoadTitle: "Queue did not load"
        }
    },
    instructorDashboard: {
        nav: {
            overview: "Overview",
            courses: "My courses",
            students: "Students",
            certificates: "Certificates",
            groups: "Groups",
            offerings: "Offerings",
            sessions: "Sessions",
            homework: "Homework",
            chat: "Chat",
            analytics: "Analytics",
            leaderboard: "Leaderboard",
            profile: "Profile",
            ai: "AI assistant",
            attendance: "Attendance",
            notifications: "Notifications"
        },
        workspaceGroups: {
            overview: {
                label: "Overview and analytics",
                description: "Quickly review overall status, trends, and leaderboard signals."
            },
            courseManagement: {
                label: "Course management",
                description: "Manage courses, students, groups, offerings, and certificates."
            },
            deliveryWorkbench: {
                label: "Lesson delivery",
                description: "Daily session, attendance, homework, and chat workflows."
            },
            settings: {
                label: "Profile and settings",
                description: "Profile, AI assistant, and notification settings."
            }
        },
        shell: {
            headerSubtitle: "Keep full control of your courses and students",
            certificatesDisabledReason: "Certificates are disabled for some tenant courses.",
            workspaceSection: "Instructor section",
            sectionFallback: "Section",
            tabOpened: "{{tab}} opened",
            status: {
                profileLoading: "Profile is loading",
                coursesLoading: "Courses are loading",
                workspaceUpdating: "Workspace is updating"
            },
            actions: {
                analytics: "Analytics",
                hideMenu: "Hide menu",
                showMenu: "Show menu"
            },
            toasts: {
                categoriesLoadError: "Could not load categories.",
                requiredFields: "Please fill in the title, description, and category.",
                deliveryCourseCreated: "Course created. You can now create a group and sessions.",
                deliveryCourseCreateError: "Could not create the course.",
                deliveryCourseUpdated: "Delivery course updated.",
                deliveryCourseUpdatedForReview: "Delivery course updated and sent for review.",
                deliveryCourseUpdateError: "Could not update the delivery course.",
                courseSubmittedForApproval: "Course was sent for approval.",
                courseSubmitError: "Could not send the course for approval."
            }
        },
        coursesSection: {
            hero: {
                eyebrow: "Courses panel",
                title: "My courses",
                description: "Track published and in-review courses, and manage new video, offline, or live courses here."
            },
            actions: {
                createDeliveryCourse: "Offline / live course",
                newCourse: "New course",
                createCourse: "Create course",
                manage: "Manage",
                view: "View",
                edit: "Edit",
                submitting: "Sending...",
                submitForApproval: "Send for approval"
            },
            metrics: {
                totalCourses: "All courses",
                published: "Published",
                pending: "In review",
                students: "Students"
            },
            list: {
                title: "Course list",
                description: "View each course status, category, and latest update time here."
            },
            status: {
                approved: "Approved",
                pending: "In review",
                rejected: "Rejected",
                draft: "Draft"
            },
            courseTypes: {
                video: "Video",
                offline: "Offline",
                onlineLive: "Online live"
            },
            card: {
                noDescription: "No description",
                uncategorized: "Uncategorized",
                price: "{{price}} KGS",
                free: "Free",
                students: "Students",
                updated: "Updated",
                noData: "No data"
            },
            empty: {
                title: "No courses yet",
                subtitle: "Create your first course to get started."
            }
        },
        studentsSection: {
            hero: {
                eyebrow: "Student panel",
                title: "Students",
                description: "Review students by course, progress, and latest activity in one place."
            },
            metrics: {
                totalStudents: "Total students",
                courses: "Courses",
                selectedCourseStudents: "Students in selected course",
                averageProgress: "Average progress",
                courseStudents: "Students in this course",
                lessons: "Lessons",
                completed: "Completed"
            },
            courseSelection: {
                title: "Select a course",
                description: "After selecting a course, the full student list and progress details open for that stream.",
                courseImageAlt: "Course image",
                noCourseImage: "No course image",
                created: "Created",
                emptyTitle: "No courses yet",
                emptySubtitle: "Create a course first, then student streams will appear here."
            },
            courseStatus: {
                published: "Published",
                approved: "Approved",
                pending: "In review",
                rejected: "Rejected",
                draft: "Draft"
            },
            courseWorkspace: {
                description: "After selecting a course, search, progress filters, and student activity details work in this block.",
                backToCourses: "Back to courses"
            },
            filters: {
                title: "Filters",
                description: "Filter students by name, contact information, and progress range.",
                search: "Search",
                searchPlaceholder: "Name, email, or phone",
                progressMin: "Progress at least",
                progressMax: "Progress up to"
            },
            list: {
                fallbackTitle: "Student list",
                title: "Student list",
                description: "Each student card shows contact information, progress, and the last viewed lesson.",
                loadingDescription: "The list is loading."
            },
            studentCard: {
                students: "Students",
                completed: "Completed",
                inProgress: "In progress",
                enrolled: "Enrolled",
                lastViewed: "Last viewed",
                lessonNumber: "Lesson #{{id}}{{time}}",
                tests: "Tests",
                testPassed: "Passed",
                testFailed: "Failed",
                noTests: "No test submissions."
            },
            empty: {
                description: "This course list is empty for now.",
                title: "This course has no students yet",
                subtitle: "Try another course or wait for enrollments."
            },
            pagination: {
                previous: "Previous",
                next: "Next",
                page: "Page {{page}} / {{total}}"
            }
        },
        profileSection: {
            hero: {
                eyebrow: "Profile panel",
                title: "Profile",
                description: "Your basic information, expertise topics, and public links appear here."
            },
            metrics: {
                title: "Title",
                experience: "Experience",
                years: "{{count}} year",
                years_plural: "{{count}} years",
                enrollments: "Enrollments"
            },
            actions: {
                edit: "Edit",
                close: "Close",
                save: "Save",
                saving: "Saving..."
            },
            fields: {
                title: "Title",
                experience: "Work experience",
                bio: "Bio / About me",
                expertise: "Expertise",
                expertisePlaceholder: "Frontend, UI/UX, Product Design"
            },
            bio: {
                title: "Bio / About me",
                description: "A short introduction shown to students and the team.",
                empty: "No information added yet"
            },
            expertise: {
                title: "Expertise",
                description: "Main specialization topics shown on the profile.",
                emptyTitle: "No expertise added yet",
                emptySubtitle: "Add your main topics while editing the profile, and they will appear here."
            },
            social: {
                title: "Social links",
                description: "External profiles and public contact channels.",
                urlPlaceholder: "https://...",
                emptyTitle: "No social links",
                emptySubtitle: "Portfolio or public profile links will appear here after you add them.",
                fields: {
                    website: "Website / Portfolio",
                    linkedin: "LinkedIn",
                    instagram: "Instagram",
                    youtube: "YouTube",
                    facebook: "Facebook",
                    twitter: "Twitter / X"
                }
            }
        },
        chat: {
            sidebarTitle: "Conversations",
            sidebarDescription: "Select active chats by course and student here.",
            chatAriaLabel: "{{student}} - {{course}} chat",
            fileFallback: "{{type}} sent",
            fileTypes: {
                image: "Image",
                file: "File"
            },
            stats: {
                chats: "Chats",
                messages: "Messages",
                unread: "Unread"
            },
            statuses: {
                active: "Active",
                closed: "Closed",
                pending: "Pending",
                unknown: "Unknown"
            },
            fallbacks: {
                student: "Student",
                course: "Course"
            },
            empty: {
                noChatsTitle: "No chat found",
                noChatsSubtitle: "Change the search query or wait for a new conversation with a student.",
                selectionTitle: "No conversation selected",
                selectionSubtitle: "Select a student from the list on the left to open the conversation here."
            },
            time: {
                now: "now",
                minutesAgo: "{{count}} min ago",
                hoursAgo: "{{count}} hr ago",
                daysAgo: "{{count}} day ago"
            },
            errors: {
                unknown: "Unknown error",
                chatMissingAfterCreate: "Chat was not found after it was created"
            },
            toasts: {
                loadChatsError: "Could not load chats.",
                loadMessagesError: "Could not load the conversation.",
                createWithReason: "Could not create chat: {{reason}}",
                sendError: "Could not send the message.",
                fileWithReason: "Could not send the file: {{reason}}",
                fileUploadError: "Could not upload the file."
            }
        },
        deliveryCourseModal: {
            header: {
                createTitle: "Create new course",
                createSubtitle: "Form for creating an offline or online live course.",
                editTitle: "Edit delivery course",
                editSubtitle: "Update the core information for an offline or online live course."
            },
            fields: {
                courseType: "Course type",
                language: "Lesson language",
                title: "Course title",
                description: "Course description",
                category: "Category",
                price: "Price (KGS)"
            },
            courseTypes: {
                offline: {
                    label: "Offline",
                    description: "Offline training. Provide the location."
                },
                onlineLive: {
                    label: "Online live",
                    description: "Live lessons through Zoom or Google Meet."
                }
            },
            placeholders: {
                title: "Enter the course title",
                description: "Describe what the course is about",
                select: "Select"
            },
            validation: {
                titleRequired: "Enter the course title.",
                descriptionRequired: "Enter the course description.",
                categoryRequired: "Select a category.",
                requiredFields: "Please fill in the title, description, and category."
            },
            actions: {
                cancel: "Cancel",
                create: "Create course",
                save: "Save"
            },
            toasts: {
                categoriesLoadError: "Could not load categories.",
                created: "Course created. You can now create a group and sessions.",
                createError: "Could not create the course."
            },
            currency: "KGS",
            priceHelp: "Leave empty for a free course.",
            characterCount: "{{count}}/{{max}} characters"
        },
        profile: {
            toasts: {
                loadError: "Could not load instructor information.",
                saveSuccess: "Instructor profile saved.",
                saveError: "Could not save instructor profile."
            }
        },
        createCoursePage: {
            title: "Create new course",
            description: "Create a course in three steps: information, content, and final review.",
            steps: {
                info: "1. Complete the information carefully",
                lessons: "2. Save the lessons",
                submit: "3. Send for review"
            },
            draft: {
                title: "Draft is saved automatically in this browser.",
                description: "Information and the current step are saved; use the \"Save all\" button to save content to the server.",
                restored: "Restored draft: {{time}}.",
                lastSaved: "Last autosave: {{time}}."
            },
            actions: {
                clearDraft: "Clear draft"
            },
            toasts: {
                savedForReview: "Course was saved for review.",
                saveBeforeApproval: "Save changes before sending for approval.",
                submittedForApproval: "Course was sent for approval.",
                submitError: "Could not submit the course.",
                localDraftClearedServerPreserved: "Local draft was cleared. The server course draft was preserved.",
                localDraftCleared: "Local draft was cleared.",
                invalidLesson: "Review before submitting: {{issue}} (Section {{section}}, Lesson {{lesson}})"
            }
        },
        editCoursePage: {
            title: "Edit course",
            description: "Edit the course in three steps: information, content, and final review.",
            notice: {
                title: "Review the impact before publishing changes.",
                description: "Unsaved changes block preview and approval submission actions. Submitted changes should become visible to students only after the review process.",
                unsaved: "There are unsaved changes right now."
            },
            toasts: {
                saveBeforeApproval: "Save changes before sending for approval.",
                submittedForApproval: "Course was sent for approval.",
                submitError: "Could not submit the course.",
                invalidLesson: "Review before submitting: {{issue}} (Section {{section}}, Lesson {{lesson}})"
            }
        },
        courseBuilder: {
            stepLabels: {
                info: "Course information",
                curriculum: "Learning content",
                media: "Media and management"
            },
            actions: {
                addLesson: "+ Add lesson",
                addSection: "+ Add section",
                back: "Back",
                collapseAll: "Collapse all",
                delete: "Delete",
                down: "Down",
                expandAll: "Expand all",
                findNextIssue: "Find next issue",
                refresh: "Refresh",
                saveAll: "Save all",
                saveAndContinue: "Save and continue",
                saving: "Saving...",
                singleSectionOff: "Single-section mode: off",
                singleSectionOn: "Single-section mode: on",
                toggle: "Open/close",
                up: "Up"
            },
            aria: {
                steps: "Course builder steps",
                currentStep: "current step",
                completedStep: "completed",
                incompleteStep: "not completed",
                dragLesson: "Move lesson",
                dragSection: "Move section",
                moveLessonDown: "Move {{title}} lesson down",
                moveLessonUp: "Move {{title}} lesson up",
                moveSectionDown: "Move {{title}} section down",
                moveSectionUp: "Move {{title}} section up"
            },
            assets: {
                title: "Files and materials",
                videoUpload: "Upload video",
                videoExists: "Video file exists",
                resourceUpload: "Upload material (PDF, ZIP)",
                resourceExists: "Material file exists",
                resourceName: "Material title",
                resourceNameHelp: "This title is shown to students.",
                previewVideo: "Mark as preview video",
                uploadedPercent: "{{percent}}% uploaded"
            },
            challenge: {
                instructions: "Instructions",
                instructionsTooltip: "Example: 'The solution function should return the sum of even numbers.' Explain the task to the student.",
                instructionsPlaceholder: "Detailed task instructions",
                instructionsHelp: "Explain what students need to do and what will be checked. Any JS code is allowed.",
                timeLimit: "Time limit (milliseconds)",
                timeLimitTooltip: "How long the code may run. Example: 5000 = 5 seconds. Default is 5000.",
                starterCode: "Starter code",
                starterCodeTooltip: "Initial template shown to students. You can leave it empty.",
                starterCodeHelp: "Leave this empty if students should write the full solution themselves.",
                tests: "Tests",
                addTest: "+ Add test",
                testTitle: "Test title",
                testTitleTooltip: "Example: 'Sample test', 'Hidden test'. Only the instructor sees this.",
                testPlaceholder: "Test {{number}}",
                hidden: "Hidden",
                args: "Arguments (JSON)",
                argsTooltip: "Function parameters. One array parameter: [[1,2,3]]. Two parameters: [5,3]. Object: [{\"name\":\"Aida\"}].",
                expected: "Expected result (JSON)",
                expectedTooltip: "The value that solution(...) should return. Example: 6, \"Hello\", {\"ok\":true}"
            },
            confirmDelete: {
                sectionTitle: "Delete section",
                lessonTitle: "Delete lesson",
                sectionMessage: "Delete \"{{title}}\" and all lessons inside it? This action cannot be undone.",
                lessonMessage: "Delete \"{{title}}\" lesson? This action cannot be undone.",
                confirm: "Yes, delete"
            },
            curriculum: {
                workspaceMode: "Build mode",
                stats: {
                    sectionsLessons: "Sections: {{sections}} • Lessons: {{lessons}}",
                    readiness: "Readiness: {{ready}}/{{total}} ({{percent}}%)"
                },
                saveHint: "Complete sections and lessons first, then check issues and save all.",
                title: "Learning content",
                validationTitle: "Lessons to fix before moving to preview",
                issueChip: "S{{section}} / L{{lesson}}: {{issue}}",
                sectionSummary: "{{lessons}} lessons · {{ready}}/{{total}} ready",
                issueCount: "{{count}} issues",
                skillHelper: "Select a skill. Progress and rating for this section will be tied to it.",
                lessonOrder: "Lesson order",
                articleText: "Article text",
                readingTime: "Reading time (minutes)",
                sectionFooter: "Ready lessons: {{ready}}/{{total}}. Save changes before continuing."
            },
            fallbacks: {
                section: "Section {{number}}",
                lesson: "Lesson {{number}}",
                lessonWithHash: "Lesson #{{number}}"
            },
            info: {
                editMode: {
                    title: "Edit mode",
                    description: "Save after changing course information. Fields that affect the course flow, such as category, stay locked on this screen."
                },
                sections: {
                    basic: "Basic information",
                    settings: "Settings",
                    cover: "Course image"
                },
                fields: {
                    title: "Course title",
                    subtitle: "Short title",
                    description: "Course description",
                    category: "Category",
                    price: "Course price (KGS)",
                    isPaid: "This is a paid course",
                    aiAssistantEnabled: "Allow EDU AI assistant to work in this course",
                    language: "Lesson language",
                    learningOutcomes: "What will students learn in this course? (one item per line)",
                    coverFile: "Course image file"
                },
                languageOptions: {
                    ky: "Kyrgyz",
                    ru: "Russian",
                    en: "English"
                },
                placeholders: {
                    title: "Course title",
                    subtitle: "Short description",
                    description: "Course description",
                    category: "Select category",
                    price: "Course price",
                    learningOutcomes: "Example:\n- UX basics\n- Working with Figma\n- Creating a UI library"
                },
                helpers: {
                    categoryLocked: "Category affects the published course flow, so it cannot be changed here.",
                    pendingCover: "The selected image is not persisted in the browser: {{file}}. Please choose the file again.",
                    coverFormat: "PNG/JPG, maximum 5MB"
                },
                footer: {
                    fixErrors: "Fix the highlighted information fields to continue.",
                    ready: "Basic information is ready. Save it to continue to content."
                },
                coverAlt: "Course image"
            },
            lessonFields: {
                title: "Lesson title",
                type: "Lesson type"
            },
            lessonIssues: {
                missingTitle: "Missing title",
                missingVideo: "Video is not uploaded.",
                incompleteArticle: "Article is incomplete",
                incompleteQuiz: "Quiz is incomplete",
                incompleteCode: "Code challenge is incomplete",
                missingContent: "Content is missing",
                ready: "Ready"
            },
            lessonKinds: {
                video: "Video",
                article: "Article (text)",
                quiz: "Quiz",
                code: "Code challenge"
            },
            duration: {
                seconds: "{{count}}s",
                minutes: "{{count}}m",
                minutesSeconds: "{{minutes}}m {{seconds}}s"
            },
            fileValidation: {
                noFile: "No file selected.",
                invalidVideo: "Choose a video file (MP4, WebM, AVI, MOV, MKV).",
                fileTooLarge: "File size must not exceed {{size}}MB.",
                noImage: "Choose an image file.",
                invalidImage: "Please choose an image file.",
                imageTooLarge: "Image size must not exceed 5MB."
            },
            placeholders: {
                articleText: "Main lesson text",
                lessonTitle: "Lesson title",
                minutesExample: "example: 5",
                optionalSkill: "Select skill (optional)",
                resourceName: "example: Practice tasks.pdf",
                sectionTitle: "Section title"
            },
            quiz: {
                passingScore: "Passing score (%)",
                timeLimit: "Time limit (minutes, empty means unlimited)",
                fillMode: {
                    manual: "Manual editor",
                    paste: "Paste quiz data"
                },
                formattingHelp: "Text formatting:",
                boldSample: "bold",
                boldInsertSample: "bold text",
                codeSample: "code",
                codeInsertSample: "code",
                and: "and",
                question: "Question {{number}}",
                questionPlaceholder: "Question text",
                preview: "Preview",
                option: "Option {{number}}",
                addOption: "+ Add option",
                addQuestion: "+ Add new question",
                paste: {
                    title: "Paste quiz data",
                    help: "Paste JSON, fenced JSON, or plain quiz text to fill the current quiz editor.",
                    placeholder: "{\n  \"passingScore\": 70,\n  \"questions\": [\n    {\n      \"prompt\": \"Question\",\n      \"options\": [\n        { \"text\": \"Option 1\", \"isCorrect\": true },\n        { \"text\": \"Option 2\", \"isCorrect\": false }\n      ]\n    }\n  ]\n}",
                    fill: "Fill from paste",
                    supportedFormats: "Supports JSON, markdown code fences, smart quotes, trailing commas, and plain question/option text.",
                    success: "Quiz filled from pasted content.",
                    errorInvalidInput: "The pasted content does not contain a valid quiz structure."
                },
                richTextHint: "Select text to format as bold, italic, or code",
                explanation: {
                    label: "Explanation",
                    hint: "(shown after student answers)",
                    placeholder: "Explain why the correct answer is right…",
                },
            },
            articleEditor: {
                placeholder: "Write the article text here...",
                linkUrlPrompt: "Enter the link (https://...)",
                linkTextPrompt: "Link text",
                keyboardHint: "Tip: Ctrl/Cmd + B for bold, Ctrl/Cmd + I for italic. Paste from Google Docs, Word, or web pages — formatting is preserved automatically.",
                toolbar: {
                    bold: "Bold",
                    italic: "Italic",
                    underline: "Underline",
                    bulletedList: "Bulleted list",
                    numberedList: "Numbered list",
                    quote: "Quote",
                    inlineCode: "Inline code",
                    insertLink: "Insert link",
                    removeLink: "Remove link",
                    undo: "Undo",
                    redo: "Redo",
                    clearFormat: "Clear format"
                }
            },
            previewStep: {
                createTitle: "Course review",
                editTitle: "Edit review",
                createDescription: "The local draft is stored only in this browser. Use the actions below to save it to the server and send it for review.",
                editDescription: "Make sure changes are saved before sending for approval. Updated content should affect students only after the review is complete.",
                unsavedWarning: "There are unsaved changes, so sending for approval is disabled for now.",
                actions: {
                    saveDraft: "Save draft",
                    submitForApproval: "Send for approval",
                    saveFirst: "Save changes first"
                },
                checks: {
                    infoComplete: "Course information is complete",
                    noBlockingErrors: "Lessons have no blocking errors",
                    noUnsavedChanges: "No unsaved changes remain"
                }
            },
            preview: {
                eyebrow: "Final preview",
                practice: "Practice",
                mixLabel: "{{video}} video · {{article}} article · {{quiz}} quiz · {{code}} code",
                price: "Price: {{price}} KGS",
                freeCourse: "Free course",
                level: "Level: {{level}}",
                language: "Language: {{language}}",
                warningTitle: "Review before submitting: {{count}}",
                moreWarnings: "{{count}} more issues. Go back to content and fix them.",
                structure: "Course structure",
                lessonCount: "{{count}} lessons",
                previewBadge: "Preview",
                emptySection: "This section has no lessons yet.",
                emptyCourse: "No sections have been added yet.",
                learningOutcomes: "What you will learn in this course",
                fixWarningsTitle: "Fix preview issues first",
                stats: {
                    sections: "Sections",
                    lessons: "Lessons",
                    totalTime: "Total time",
                    previewLessons: "Preview lessons"
                },
                fallbacks: {
                    courseTitle: "Course title is missing",
                    description: "Description has not been added yet.",
                    cover: "Cover image has not been added"
                },
                warnings: {
                    missingCourseTitle: "Course title is missing.",
                    missingDescription: "Course description is not filled in.",
                    missingCover: "Cover image has not been added.",
                    noSections: "The course has no sections.",
                    noPreviewLessons: "No preview lesson is marked (recommended for videos).",
                    sectionMissingTitle: "Section {{section}}: missing title.",
                    sectionNoLessons: "Section {{section}}: no lessons.",
                    lessonMissingTitle: "Section {{section}}, Lesson {{lesson}}: missing title.",
                    lessonMissingVideo: "Section {{section}}, Lesson {{lesson}}: video is not uploaded.",
                    lessonMissingDuration: "Section {{section}}, Lesson {{lesson}}: duration/reading time is not set.",
                    lessonMissingArticleText: "Section {{section}}, Lesson {{lesson}}: article text is missing.",
                    lessonMissingQuizQuestions: "Section {{section}}, Lesson {{lesson}}: quiz questions are not added.",
                    lessonMissingCodeTests: "Section {{section}}, Lesson {{lesson}}: code challenge tests are incomplete."
                }
            },
            status: {
                ready: "Ready"
            },
            toasts: {
                changesSaveError: "Could not save changes.",
                changesSaved: "All changes saved!",
                contentSaveError: "Could not save content.",
                contentSaved: "Content saved!",
                courseCreateError: "Could not create the course.",
                courseCreated: "Course created successfully!",
                courseSaveError: "Could not save the course.",
                courseSaved: "Course saved successfully!",
                dataLoadError: "Could not load data",
                fileUploadError: "Could not upload file.",
                fixInfoErrors: "Fix the errors in the information tab.",
                lessonExtraWarnings: "{{count}} lesson extra materials could not be loaded. The course opened, but review those lessons.",
                noValidationIssues: "No issues to review.",
                sectionAutoSaveError: "Could not create the section. Save manually first.",
                sectionAutoSaved: "Section saved automatically",
                skillsLoadError: "Could not load skills.",
                someLessonsIncomplete: "Some lessons are incomplete.",
                validationIssue: "Review needed: {{issue}}"
            },
            validation: {
                categoryRequired: "Select a category",
                descriptionRequired: "Description is required",
                languageRequired: "Select a language",
                lessonIssue: "Section {{section}}, Lesson {{lesson}}: {{issue}}",
                lessonRequired: "At least one lesson is required.",
                maxChars: "Maximum {{max}} characters",
                pricePositive: "Paid courses must have a price greater than 0",
                sectionMissingTitle: "Section {{section}}: missing title",
                sectionRequired: "At least one section is required.",
                titleRequired: "Course title is required"
            }
        },
        coursesPage: {
            title: "My courses",
            workflowSummaryLabel: "Course workflow status",
            filtersLabel: "Course management filters",
            workflows: {
                video: "Self-paced video",
                delivery: "Delivery / group"
            },
            workflowCards: {
                videoDescription: "Managed through content, preview, and approval.",
                deliveryDescription: "Works with group, schedule, and attendance workflows.",
                lastUpdated: "Last updated"
            },
            filters: {
                all: "All",
                allWorkflows: "All workflows",
                search: "Search course",
                searchPlaceholder: "By title, instructor, or type",
                status: "Status",
                workflow: "Workflow"
            },
            lifecycle: {
                draft: "Draft",
                pending: "In review",
                published: "Published",
                rejected: "Needs changes",
                aria: "Course status: {{status}}"
            },
            courseTypes: {
                video: "Video",
                offline: "Offline",
                onlineLive: "Online live"
            },
            price: {
                label: "Price",
                value: "{{value}} KGS",
                missing: "Price is not specified"
            },
            actions: {
                refresh: "Refresh",
                reload: "Reload",
                manage: "Manage",
                review: "Review",
                fix: "Fix",
                edit: "Edit",
                unavailable: "Editing unavailable",
                createFirst: "Create first course"
            },
            errors: {
                load: "Could not load courses."
            },
            loading: "Courses are loading...",
            empty: {
                noCourses: "You do not have courses yet.",
                noFilteredCourses: "No courses found for these filters."
            },
            fallbacks: {
                courseWithId: "Course {{id}}",
                untitledCourse: "Untitled course",
                noInstructor: "Instructor is not specified",
                noImage: "No course image"
            }
        },
        overview: {
            header: {
                eyebrow: "Instructor overview",
                description: "Complete your profile, update courses, and keep student workflows moving."
            },
            focus: {
                eyebrow: "Today's focus",
                title: "Instructor panel ready",
                description: "Use these core shortcuts to manage courses, enrollments, and analytics from one place."
            },
            stats: {
                publishedCourses: "Published courses",
                pendingCourses: "Courses in review",
                aiEnabled: "AI assistant enabled",
                enrollments: "Enrollments"
            },
            actions: {
                createCourse: "Create new course",
                openAnalytics: "Open analytics"
            },
            quickActionsPanel: {
                title: "Quick actions",
                description: "Jump directly into daily instructor workflows."
            },
            quickActions: {
                manageCourses: {
                    title: "Manage courses",
                    description: "Review your existing courses and update content or status.",
                    button: "Courses"
                },
                createCourse: {
                    title: "Create new course",
                    description: "Prepare a new course with lessons, sections, and assignments.",
                    button: "Create course"
                },
                enrollments: {
                    title: "Enrollments",
                    description: "Monitor student enrollments, groups, and attendance workflows.",
                    button: "Enrolled students"
                },
                analytics: {
                    title: "Analytics",
                    description: "See attendance, homework, and risk metrics in one place.",
                    button: "Analytics"
                }
            }
        },
        analytics: {
            eyebrow: "Analytics workspace",
            title: "Instructor analytics",
            description: "Review course performance, at-risk students, and achievement trends here.",
            toasts: {
                loadError: "Could not load instructor analytics."
            },
            filters: {
                title: "Period filter",
                description: "Choose a specific date range to recalculate analytics for that window.",
                fromPlaceholder: "Start date",
                toPlaceholder: "End date"
            },
            metrics: {
                totalCourses: "Total courses",
                students: "Students",
                averageCompletion: "Average completion",
                atRiskStudents: "At-risk students"
            },
            columns: {
                course: "Course",
                enrollments: "Enrollments",
                averageProgress: "Average progress",
                completionRate: "Completion rate",
                student: "Student",
                riskReason: "Risk reason",
                lastActivity: "Last activity",
                lesson: "Lesson"
            },
            coursePerformance: {
                title: "Course performance",
                subtitle: "How your courses are performing"
            },
            atRisk: {
                title: "At-risk students",
                subtitle: "Students who may need additional support"
            },
            weakLessons: {
                title: "Weak lessons",
                subtitle: "Lessons that need improvement"
            },
            charts: {
                performanceTrendTitle: "Learning outcome trend",
                performanceTrendSubtitle: "Overall performance score for the selected period",
                courseCompletionTitle: "Course completion share",
                courseCompletionSubtitle: "Compare completion rate across courses"
            },
            teachingInsights: {
                title: "Teaching recommendations",
                subtitle: "Next actions based on metrics"
            },
            insights: {
                completion: {
                    title: "Completion rate needs improvement",
                    message: "Completion is below 60%. Split long lessons into shorter parts and add a check question after each part."
                },
                risk: {
                    title: "Early intervention needed",
                    message: "{{count}} students are at risk. Send a personal task or message to students with low progress or no recent activity."
                },
                audience: {
                    title: "Audience growth opportunity",
                    message: "For courses with few students, refine the intro lesson, course description, and first assignment."
                },
                stable: {
                    title: "Courses are moving at a steady pace",
                    message: "Completion and risk metrics are normal. Review the weakest lessons next and improve content in small increments."
                }
            },
            fallbacks: {
                courseWithId: "Course #{{id}}",
                studentWithId: "Student #{{id}}",
                lessonWithId: "Lesson #{{id}}",
                unknown: "Unknown",
                never: "Never"
            }
        },
        mobileOverview: {
            welcome: "Welcome, {{name}}!",
            profileLine: "{{title}} • {{count}} courses",
            stats: {
                published: "Published",
                pending: "Pending",
                aiCourses: "AI courses",
                students: "Students"
            },
            actions: {
                newCourse: "New course",
                analytics: "Analytics",
                students: "Students",
                profile: "Profile"
            },
            recentCourses: {
                title: "Recent courses",
                viewAll: "View all",
                meta: "{{students}} students • {{lessons}} lessons"
            },
            fallbacks: {
                instructor: "Instructor",
                instructorInitial: "I",
                courseInitial: "C"
            }
        },
        ai: {
            eyebrow: "AI workspace",
            title: "EDU AI assistant",
            description: "See which courses use the AI assistant, how many courses are ready, and the next setup steps.",
            actions: {
                settings: "AI settings",
                edit: "Edit",
                createCourse: "Create course"
            },
            metrics: {
                activeCourses: "AI active courses",
                totalCourses: "Total courses",
                notReady: "AI not ready"
            },
            enabledCourses: {
                title: "AI-enabled courses",
                description: "Open active courses from this list to edit or improve the AI assistant setup.",
                updatedAt: "Updated: {{date}}",
                noUpdateInfo: "No update information"
            },
            empty: {
                title: "No AI-enabled courses",
                subtitle: "Courses appear here after you enable the AI assistant in the course editor."
            },
            stepsPanel: {
                title: "Setup steps",
                description: "The main flow for configuring the AI assistant."
            },
            steps: {
                activate: "Enable the AI assistant in the course editor.",
                reviewPrompts: "Review assistant scenarios and prompts.",
                verifyStudentChat: "Check AI assistant availability in student chat."
            }
        },
        createOfferingModal: {
            header: {
                title: "{{title}} - Step {{step}}/{{total}}",
                createTitle: "New offering",
                editTitle: "Edit offering"
            },
            steps: {
                basic: "Basic information",
                schedule: "Schedule",
                review: "Review"
            },
            fields: {
                course: "Course",
                modality: "Delivery format",
                price: "Price (KGS)",
                schedule: "Schedule"
            },
            modalities: {
                online: {
                    label: "Online",
                    description: "Live lesson through Zoom or Google Meet."
                },
                offline: {
                    label: "Offline",
                    description: "Offline training. Provide the location."
                },
                hybrid: {
                    label: "Hybrid",
                    description: "Mixed online and offline format."
                }
            },
            placeholders: {
                course: "Select a course",
                select: "Select"
            },
            validation: {
                courseRequired: "Select a course.",
                modalityRequired: "Select a delivery format.",
                priceRequired: "Enter a price.",
                scheduleRequired: "Add a schedule block.",
                dayRequired: "Select a day.",
                startTimeRequired: "Start time is required.",
                endTimeRequired: "End time is required.",
                timeInvalid: "Time range is invalid."
            },
            schedule: {
                blockNumber: "Block #{{number}}",
                deleteAria: "Delete block {{number}}",
                day: "Day",
                startTime: "Start time",
                endTime: "End time"
            },
            weekdays: {
                mon: "Monday",
                tue: "Tuesday",
                wed: "Wednesday",
                thu: "Thursday",
                fri: "Friday",
                sat: "Saturday",
                sun: "Sunday"
            },
            review: {
                title: "Review offering",
                course: "Course: {{course}}",
                modality: "Format: {{modality}}",
                price: "Price: {{price}}",
                priceValue: "{{price}} KGS",
                free: "Free",
                scheduleCount: "Schedule blocks: {{count}}",
                confirm: "Review all information. If everything is correct, click \"{{action}}\"."
            },
            actions: {
                cancel: "Cancel",
                next: "Next step",
                back: "Back",
                review: "Review",
                create: "Create",
                update: "Update",
                addSchedule: "Add schedule block"
            },
            fallbacks: {
                notSelected: "Not selected"
            },
            currency: "KGS",
            priceHelp: "Leave empty for a free course."
        },
        offerings: {
            hero: {
                eyebrow: "Offering management",
                title: "Course offerings",
                description: "Track corporate, public, and custom offering streams for your courses in one place."
            },
            metrics: {
                total: "All offerings",
                upcoming: "Upcoming offerings",
                company: "For companies",
                public: "Public offerings",
                active: "Active",
                draft: "Draft",
                closed: "Closed"
            },
            filters: {
                title: "Filters and search",
                description: "Narrow results by course, time, and offering title.",
                allCourses: "All courses",
                upcoming: "Upcoming",
                past: "Past",
                all: "All",
                searchPlaceholder: "Search offerings..."
            },
            list: {
                title: "Offering list",
                description: "{{count}} offerings found"
            },
            empty: {
                title: "No offerings yet",
                subtitle: "Create the first offering to start the enrollment flow."
            },
            actions: {
                create: "Create offering"
            },
            card: {
                fallbackTitle: "{{course}} Offering",
                course: "Course: {{course}}",
                capacity: "{{count}} seats",
                unlimitedCapacity: "Unlimited seats",
                featured: "Featured",
                enrolled: "Enrolled: {{count}}",
                seatsRemaining: "Seats remaining: {{count}}",
                schedule: "Schedule:",
                note: "Note: {{note}}",
                editCourse: "Edit course",
                editOffering: "Edit offering",
                addStudent: "Add student",
                copyLink: "Copy link"
            },
            modalities: {
                online: "Online",
                offline: "Offline",
                hybrid: "Hybrid"
            },
            visibility: {
                public: "Public",
                private: "Private"
            },
            statuses: {
                active: "Active",
                draft: "Draft",
                completed: "Completed",
                archived: "Archived"
            },
            fallbacks: {
                course: "Course",
                student: "Student",
                unknown: "Unknown"
            },
            toasts: {
                courseRequired: "Select a course.",
                created: "Offering created successfully.",
                updated: "Offering updated.",
                saveError: "Could not save the offering.",
                studentsLoadError: "Could not load the student list.",
                studentSearchError: "Could not search students.",
                invalidUser: "User ID is invalid.",
                studentAdded: "Student added to the offering.",
                studentAddError: "Could not add the student to the offering."
            }
        },
        data: {
            errors: {
                courseForbidden: "This course is not assigned to you."
            },
            toasts: {
                coursesLoadError: "Could not load instructor courses.",
                studentCoursesLoadError: "Could not load the student list.",
                courseStudentsLoadError: "Could not load course students."
            }
        },
        groupsSection: {
            header: {
                eyebrow: "Groups dashboard",
                title: "Groups",
                description: "Groups, rosters, and next-session context for offline and online live courses are managed here.",
                activeDescription: "For offline and online live courses, the group is the academic container: enrollments attach to the group, and sessions read from that group."
            },
            noDelivery: {
                title: "No delivery courses found",
                description: "Create an offline or online live course before creating groups or adding students to groups.",
                emptyTitle: "No group-ready course",
                emptySubtitle: "Create a delivery-format course first. Video courses do not require groups.",
                pendingCount: "{{count}} delivery course is not ready for groups yet. A course must be approved and published before groups can be created."
            },
            actions: {
                createCourse: "Create course",
                openSessions: "Session dashboard",
                createGroup: "Create group",
                manageSessions: "Manage sessions",
                generateSessions: "Create sessions",
                addIndividualStudent: "Add individual student",
                addStudent: "Add student",
                edit: "Edit"
            },
            metrics: {
                groups: "Groups",
                active: "Active",
                planned: "Planned",
                seats: "Seats"
            },
            courseGroups: {
                title: "Groups by course",
                description: "Select a delivery course and review the groups under it. Enrollment should attach to one of these groups.",
                courseLabel: "Delivery course",
                selectCourse: "Select course",
                pendingHidden: "{{count}} delivery course is hidden until it is approved and published.",
                anchorLabel: "Enrollment anchor:",
                anchorValue: "group"
            },
            deliveryModes: {
                group: "Group",
                individual: "Individual course"
            },
            fallbacks: {
                groupWithId: "Group #{{id}}",
                student: "Student"
            },
            card: {
                code: "Code: {{code}}",
                individualStudent: "Individual student: {{student}}",
                individualStudentNotFound: "Individual student was not found",
                individualStudentLoading: "Individual student is loading...",
                format: "Format",
                period: "Period",
                seats: "Seats",
                unlimited: "Unlimited",
                noLocation: "No location",
                noTimezone: "No timezone",
                defaultSchedule: "Default schedule",
                noSchedule: "Not set yet",
                individualLimitTitle: "An individual course is limited to one active student"
            },
            empty: {
                noGroupsTitle: "This course has no groups",
                selectCourseTitle: "Select a course",
                noGroupsSubtitle: "After a group is created, student enrollment, sessions, and attendance start from this container.",
                selectCourseSubtitle: "Select a delivery course to see its groups here."
            },
            sessionProcess: {
                title: "Session process",
                description: "Group information is managed through the modal. Session creation, editing, and daily work stay in the session dashboard.",
                body: "This section manages group enrollment and group information. Attendance, homework, meetings, and session information stay in the separate session process."
            },
            toasts: {
                selectCourse: "Select a course first.",
                groupNameAndCodeRequired: "Group name and code are required.",
                individualNameRequired: "Individual course name is required.",
                studentRequired: "Select a student for the individual course.",
                firstSessionScheduleRequired: "Add a start date and a complete schedule block for the first session.",
                liveMeetingRequired: "Add a meeting provider or meeting URL before creating an online live individual course.",
                enrollmentNotReady: "Enrollment is locked until this group is open and live sessions are scheduled with meeting details.",
                individualCreated: "Individual course created.",
                groupCreated: "Group created.",
                selectGroupForEdit: "Select a group to edit.",
                groupUpdated: "Group updated.",
                defaultScheduleRequired: "Save a default schedule for the group first.",
                sessionsCreated: "{{count}} sessions created.",
                noNewSessions: "No new sessions; existing sessions were skipped.",
                invalidUserId: "User ID is invalid.",
                studentAdded: "Student added to the group."
            }
        },
        groupForm: {
            header: {
                editEyebrow: "Edit Group",
                createEyebrow: "Create Group",
                editTitle: "Edit group",
                createTitle: "New group",
                description: "Manage academic group metadata for {{course}}."
            },
            sections: {
                basic: "Basic information",
                period: "Period and seats",
                student: "Select student",
                delivery: "Delivery"
            },
            deliveryModes: {
                group: {
                    label: "Group",
                    description: "Cohort for multiple students."
                },
                individual: {
                    label: "Individual course",
                    description: "Individual stream for one student."
                }
            },
            delivery: {
                offlineGroup: "Offline group",
                onlineLiveGroup: "Online live group",
                deliveryGroup: "Delivery group",
                courseFormat: "Course format:",
                learningFormat: "Learning format:",
                noExtraFields: "No extra delivery fields are required for this course."
            },
            fields: {
                individualName: "Individual course name *",
                groupName: "Group name *",
                groupCode: "Group code *",
                instructorId: "Instructor ID",
                seatLimit: "Seat limit",
                timezone: "Timezone",
                location: "Location",
                meetingProvider: "Meeting provider",
                meetingUrl: "Meeting URL"
            },
            help: {
                groupCode: "Code is a unique identifier for the cohort."
            },
            statuses: {
                planned: "Planned",
                active: "Active",
                completed: "Completed",
                cancelled: "Cancelled"
            },
            student: {
                description: "An individual course is linked to one student.",
                searchPlaceholder: "Name or email (at least 2 letters)",
                notFound: "Student not found.",
                selectedId: "Selected student ID: {{id}}",
                pickHint: "Type at least two letters and select a student from the list."
            },
            firstSession: {
                title: "Create first session too",
                description: "If a schedule block is filled, the first session is prepared for the individual course."
            },
            notice: {
                title: "Notice",
                offline: "This group studies offline. Keep the location accurate; it appears on session pages.",
                onlineLive: "This group studies online live. Meeting provider and URL become the default session details.",
                delivery: "The group holds enrollments. Sessions, attendance, homework, and meeting details stay on session pages."
            },
            schedule: {
                eyebrow: "Planning block",
                title: "Default weekly schedule",
                description: "This does not create sessions automatically. It stores the usual weekly schedule for the group and makes future session planning easier.",
                noteLabel: "Short note",
                notePlaceholder: "Example: Monday, Wednesday · 19:00-21:00",
                day: "Day",
                start: "Start",
                end: "End",
                blockNumber: "Block #{{number}}",
                dayAria: "Block {{number}} day",
                startAria: "Block {{number}} start",
                endAria: "Block {{number}} end",
                primaryBlock: "Primary block"
            },
            weekdays: {
                mon: "Monday",
                tue: "Tuesday",
                wed: "Wednesday",
                thu: "Thursday",
                fri: "Friday",
                sat: "Saturday",
                sun: "Sunday"
            },
            actions: {
                regenerate: "Regenerate",
                addBlock: "Add block",
                delete: "Delete",
                close: "Close",
                saving: "Saving...",
                updateGroup: "Update group",
                createIndividual: "Create individual course",
                createGroup: "Create group"
            },
            fallbacks: {
                deliveryCourse: "Delivery course",
                unknownStudent: "Unknown student",
                studentWithId: "Student #{{id}}"
            },
            toasts: {
                loadFailed: "Could not load groups.",
                createFailed: "Could not create the group.",
                updateFailed: "Could not update the group."
            }
        },
        enrollStudentModal: {
            eyebrow: "Offering Enrollment",
            description: "Add a student to {{offering}}.",
            seats: "Seats",
            unlimited: "Unlimited",
            search: {
                title: "Search student",
                description: "Search by name or email and select the student to add to the offering.",
                placeholder: "Name or email (at least 2 letters)",
                notFound: "Student not found.",
                selectedId: "Selected student ID: {{id}}",
                pickHint: "Enrollment is ready after you select a student from the list."
            },
            discount: {
                title: "Discount",
                label: "Discount %",
                placeholder: "Example: 10"
            },
            currentStudents: {
                title: "Current students",
                description: "Review the current offering roster before adding someone.",
                empty: "This offering has no students yet."
            },
            actions: {
                close: "Close",
                enrolling: "Adding...",
                enroll: "Add student"
            },
            fallbacks: {
                offering: "Offering",
                unknownStudent: "Unknown student",
                studentWithId: "Student #{{id}}",
                noEmail: "No email"
            }
        },
        enrollGroupStudentModal: {
            eyebrow: "Group Enrollment",
            description: "Add a student from {{course}} to this group.",
            course: "Course",
            groupCode: "Group code",
            seats: "Seats",
            unlimited: "Unlimited",
            search: {
                title: "Search and select student",
                description: "Search by name, email, or account details and select the exact student from the list.",
                placeholder: "Name or email (at least 2 letters)",
                notFound: "Student not found.",
                selectedId: "Selected student ID: {{id}}",
                pickHint: "Type at least two letters and select a student from the list."
            },
            discount: {
                title: "Pricing condition",
                description: "Set a manual discount when needed. If left empty, the standard price is used.",
                label: "Discount %",
                placeholder: "Example: 10"
            },
            snapshot: {
                title: "Group Snapshot",
                groupId: "Group ID",
                fill: "Fill"
            },
            currentStudents: {
                title: "Current students",
                description: "Quickly review the current group roster before adding a student.",
                empty: "This group has no students yet."
            },
            actions: {
                close: "Close",
                enrolling: "Adding...",
                enroll: "Add student"
            },
            fallbacks: {
                deliveryCourse: "Delivery course",
                groupWithId: "Group #{{id}}",
                unknownStudent: "Unknown student",
                studentWithId: "Student #{{id}}",
                noEmail: "No email"
            },
            toasts: {
                studentsLoadFailed: "Could not load group students.",
                studentSearchFailed: "Could not search students.",
                enrollFailed: "Could not add the student to the group."
            }
        },
        generateSessions: {
            eyebrow: "Session generation",
            title: "Generate sessions",
            description: "Preview and then create real sessions from the default schedule for {{group}}.",
            range: {
                title: "Range",
                description: "This preview skips existing sessions. Only new sessions are created.",
                from: "Start",
                to: "End"
            },
            metrics: {
                blocks: "Blocks",
                newSessions: "New sessions",
                existing: "Existing"
            },
            steps: {
                preview: "1. Preview",
                generate: "2. Generate sessions"
            },
            actions: {
                preview: "Preview",
                generate: "Generate sessions",
                generating: "Generating..."
            },
            preview: {
                title: "Preview",
                description: "Sessions in the selected range will be created this way.",
                recordCount: "{{count}} record",
                emptyBeforePreview: "Select a range and click preview.",
                loading: "Preparing preview...",
                empty: "No sessions found in this range.",
                new: "New",
                existing: "Already exists"
            },
            fallbacks: {
                selectedGroup: "Selected group"
            },
            toasts: {
                previewFailed: "Could not load the preview.",
                generateFailed: "Could not create sessions."
            }
        }
    }
};
