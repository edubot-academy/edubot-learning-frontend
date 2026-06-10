export const student = {
    studentDashboard: {
        toasts: {
            courseNotFound: "Course not found.",
            openCourseError: "Could not open the course."
        },
        data: {
            toasts: {
                overviewLoadError: "Could not load the overview.",
                coursesLoadError: "Could not load courses.",
                scheduleLoadError: "Could not load the schedule.",
                tasksLoadError: "Could not load tasks.",
                resourcesLoadError: "Could not load resources.",
                progressLoadError: "Could not load progress data.",
                certificatesLoadError: "Could not load certificates."
            },
            fallbacks: {
                student: "Student",
                section: "Section",
                course: "Course",
                instructor: "Instructor"
            },
            access: {
                unknownTitle: "Could not check learning access",
                unknownDescription: "If courses or lessons are missing, refresh the page or contact support.",
                unloadedTitle: "Checking learning access",
                unloadedDescription: "Access will be shown accurately after courses, lessons, and progress load.",
                gatedTitle: "Learning access is not active yet",
                gatedDescription: "You do not have an active course or scheduled lesson yet. Learning materials open after payment is confirmed or enrollment is activated.",
                activeTitle: "Learning access is active",
                activeDescription: "Your active courses and learning materials are available."
            }
        },
        shell: {
            subtitle: "Track your creative learning path",
            workspaceSection: "Student section",
            actions: {
                hideMenu: "Hide menu",
                showMenu: "Show menu"
            },
            workspaceGroups: {
                learning: {
                    label: "Learning workspace",
                    description: "Core actions for courses, schedule, and learning materials."
                },
                progress: {
                    label: "Performance and progress",
                    description: "Tasks, progress, certificates, and ranking monitoring."
                },
                support: {
                    label: "Communication and settings",
                    description: "Personal workspace for chat, profile, and notification settings."
                }
            },
            nav: {
                overview: "Overview",
                myCourses: "My courses",
                schedule: "Schedule",
                resources: "Resources",
                freeResources: "Free Learning",
                tasks: "Tasks",
                progress: "Progress",
                certificates: "Certificates",
                chat: "Chat",
                leaderboard: "Leaderboard",
                profile: "Profile",
                notifications: "Notifications"
            }
        },
        freeResources: {
            eyebrow: "Free external resources",
            title: "My Free Learning",
            description: "Manage all your saved free resources, track weekly progress, take notes, and use AI tools — all without leaving the dashboard.",
            empty: {
                title: "No free resources saved yet",
                description: "Browse the curated catalog and add resources to your learning plan.",
                cta: "Browse free resources"
            },
            metrics: {
                saved: "Saved",
                inProgress: "In progress",
                completed: "Completed"
            },
            filters: {
                all: "All",
                started: "In progress",
                saved: "Saved",
                completed: "Completed"
            },
            detail: {
                weekProgress: "{{done}} / {{total}} weeks",
                noStudyPlan: "No study plan available.",
                weekDone: "Week {{n}} — done",
                weekTodo: "Week {{n}}",
                notesLabel: "My notes",
                notesPlaceholder: "Write notes about this resource...",
                aiSection: "AI Learning Companion",
                officialSite: "Official course",
                edubotGuide: "EduBot guide",
                removeFromPlan: "Remove from plan"
            }
        },
        overview: {
            eyebrow: "Student overview",
            title: "Welcome, {{name}}!",
            description: "Today’s main learning actions, upcoming sessions, and progress are gathered here.",
            focusLabel: "Today’s focus",
            nextSessionLabel: "Next session:",
            recommendedCourseLabel: "Recommended course to continue:",
            sessionFallback: "Session",
            sessionTitleWithNumber: "Session {{number}}",
            progressLabel: "Progress: {{value}}%",
            joinOpensSoon: "The join link opens 10 minutes before the lesson.",
            courseTypes: {
                offline: "Offline",
                onlineLive: "Online live",
                video: "Video"
            },
            metrics: {
                activeCourses: "Active courses",
                completedLessons: "Completed lessons",
                upcomingSessions: "Upcoming sessions",
                needsAction: "Needs action",
                upcomingSession: "Upcoming sessions",
                recordings: "Recordings"
            },
            hero: {
                mixed: {
                    title: "Learning and sessions in one place",
                    description: "Continue self-paced video courses and track upcoming live or offline lessons without missing them."
                },
                delivery: {
                    title: "Prepare for your next session",
                    description: "Upcoming lesson details, join link or location, and related tasks are shown here."
                },
                video: {
                    title: "Ready to continue learning",
                    description: "Resume where you stopped and follow your video-course progress with confidence."
                }
            },
            pills: {
                videoCourses: "Video courses",
                sessionCourses: "Session courses",
                attendance: "Attendance",
                recordings: "Recordings"
            },
            nextAction: {
                deliveryTitle: "Next main action",
                videoTitle: "Continue point",
                deliveryDescription: "The nearest lesson or the item that needs attention now.",
                videoDescription: "The self-paced course to return to now.",
                empty: "No main action found yet."
            },
            labels: {
                format: "Format",
                startsIn: "Starts in"
            },
            actions: {
                joinLesson: "Join lesson",
                join: "Join",
                continueLearning: "Continue learning"
            },
            sessions: {
                eyebrow: "Live / Offline learning",
                title: "Upcoming sessions",
                description: "Next live or offline learning sessions and their context.",
                empty: "No upcoming lessons yet."
            },
            videoProgress: {
                eyebrow: "Video learning",
                title: "Video course progress",
                description: "Courses worth continuing in self-paced learning and current progress.",
                lessonsCompleted: "{{completed}}/{{total}} lessons completed",
                progress: "Progress"
            },
            homework: {
                title: "Tasks needing action",
                description: "Homework that needs attention soon.",
                empty: "No open task yet."
            },
            learningFormat: {
                title: "Learning format",
                description: "Main directions across your enrolled courses."
            },
            fallbacks: {
                unknownTime: "Unknown time",
                recordingTitle: "Lesson recording",
                offlineLocationLater: "Offline session. Location will be shown later.",
                locationMissing: "Location is not specified",
                offlineCheckLocation: "Offline session. Check the location in advance.",
                task: "Task",
                courseMissing: "Course is not specified",
                pending: "Pending",
                notCalculated: "Not calculated"
            }
        },
        profile: {
            eyebrow: "Profile workspace",
            title: "Profile",
            description: "Update your account information and control which channels send notifications.",
            fields: {
                fullName: "Full name",
                phone: "Phone",
                phoneHelper: "You can use international format, for example +996..."
            },
            account: {
                title: "Account information",
                description: "Personal and contact information.",
                profilePhoto: "Profile photo",
                avatarPreviewAlt: "Profile photo preview",
                selectedFile: "Selected: {{file}}",
                visibleInfo: "Main information and contact channels shown on the account."
            },
            security: {
                title: "Security",
                description: "Update your password separately from personal information.",
                newPassword: "New password",
                passwordPlaceholder: "At least 6 characters",
                confirmPassword: "Repeat password",
                confirmPasswordPlaceholder: "Enter the password again"
            },
            notificationSettings: {
                title: "Notification settings",
                description: "Notifications stay in the profile for now; if channels expand, they will move into a separate workspace.",
                on: "On",
                off: "Off",
                emptyTitle: "No notification settings found",
                emptySubtitle: "Notification settings were not loaded for this account."
            },
            actions: {
                edit: "Edit",
                uploadAvatar: "Upload avatar",
                saving: "Saving...",
                saveProfile: "Save profile",
                cancel: "Cancel",
                updatePassword: "Update password",
                clear: "Clear",
                saveNotifications: "Save notifications"
            },
            validation: {
                passwordMismatch: "New passwords do not match.",
                passwordTooShort: "Password must be at least 6 characters.",
                phoneInternational: "Use international phone format. Example: +996700123456"
            },
            toasts: {
                notificationsLoadError: "Could not load notifications.",
                profileLoadError: "Could not load profile information.",
                notificationsSaved: "Notifications saved.",
                notificationsSaveError: "Could not save notifications.",
                profileSaved: "Profile updated successfully.",
                profileSaveError: "Could not save profile."
            },
            notifications: {
                lessonReminders: {
                    label: "Lesson reminders",
                    description: "Get a reminder before a lesson starts."
                },
                announcementEmails: {
                    label: "Course updates",
                    description: "New modules and important learning updates arrive by email."
                },
                taskUpdates: {
                    label: "Task reminders",
                    description: "Get a reminder when task deadlines are approaching."
                },
                smsAlerts: {
                    label: "SMS alerts",
                    description: "Receive SMS for important events."
                },
                pushNotifications: {
                    label: "Missed lesson reminders",
                    description: "Get an immediate notification about missed lessons."
                }
            }
        },
        empty: {
            accessEyebrow: "Student access",
            accessTitle: "Learning access is not active yet",
            accessDescription: "You do not have an active course yet. After payment is confirmed or enrollment is activated, your courses, lessons, and progress will appear here.",
            actions: {
                viewVideoCourses: "View video courses",
                openProfile: "Open profile"
            }
        },
        courses: {
            eyebrow: "My Courses",
            title: "My courses",
            emptyHeroDescription: "Active courses, upcoming sessions, and study pace appear here.",
            description: "Manage course progress, instructors, upcoming lessons, and recordings from one screen.",
            searchPlaceholder: "Search by course or instructor",
            noImage: "No course image",
            progress: "Progress",
            scheduledCourseNotice: "This course runs on a schedule. Main details are shown in schedule and attendance sections.",
            metrics: {
                courses: "Courses",
                averageProgress: "Average progress",
                live: "Live",
                offline: "Offline"
            },
            filters: {
                allTypes: "All types"
            },
            courseTypes: {
                video: "Video",
                offline: "Offline",
                onlineLive: "Online live"
            },
            courseModes: {
                selfPaced: "Self-paced",
                offlineGroup: "Offline group",
                liveGroup: "Live group"
            },
            stats: {
                lessons: "Lessons",
                format: "Format",
                group: "Group",
                nextStatus: "Next status",
                upcoming: "Upcoming"
            },
            statuses: {
                continue: "Continue",
                completed: "Completed",
                pending: "Pending"
            },
            fallbacks: {
                unknownTime: "Unknown time"
            },
            actions: {
                openCourse: "Open course",
                openSchedule: "Open schedule"
            },
            nextStep: {
                title: "Next step",
                videoDescription: "Your next video lesson or resume point.",
                groupDescription: "Upcoming session or group information.",
                selfPacedHint: "This video course is self-paced. Open the course and continue learning.",
                instructor: "Instructor: {{instructor}}",
                videoCompleted: "It looks like all lessons in this video course are complete.",
                location: "Location: {{location}}",
                noClassroom: "Classroom has not been assigned yet",
                liveWaiting: "An online live lesson is waiting.",
                schedulePending: "Schedule is being finalized",
                openCourseHint: "Open the course and continue the next lesson.",
                noUpcomingSession: "No upcoming session has been assigned yet."
            },
            quickAccess: {
                title: "Quick access",
                description: "Open the course and continue learning.",
                liveHint: "Use Schedule and Recordings for live lessons.",
                offlineHint: "Open Schedule and Attendance for offline lessons.",
                videoHint: "Continue video lessons from where you stopped."
            },
            empty: {
                title: "You have no active courses",
                description: "When a new course is added, your learning roadmap will appear here.",
                noResultTitle: "Course not found",
                noResultDescription: "Try changing the search term or filter."
            }
        },
        schedule: {
            eyebrow: "Schedule",
            title: "Schedule",
            heroTitle: "Schedule and live sessions",
            emptyHeroDescription: "Upcoming lessons, live windows, and recordings are shown here.",
            description: "View upcoming lessons, join access, and recordings from one screen.",
            searchPlaceholder: "Search by course, instructor, or location",
            offlineNotice: "Offline session. Check arrival time and location in advance.",
            metrics: {
                total: "Total",
                upcoming: "Upcoming",
                live: "Live",
                offline: "Offline"
            },
            filters: {
                allTypes: "All types"
            },
            courseTypes: {
                video: "Video",
                offline: "Offline",
                onlineLive: "Online live"
            },
            statuses: {
                past: "Past"
            },
            fallbacks: {
                session: "Session",
                sessionNumber: "Session {{number}}",
                course: "Course",
                classroom: "Classroom has not been assigned yet",
                unknownTime: "Unknown time"
            },
            actions: {
                joinLesson: "Join lesson",
                livePanel: "Live panel"
            },
            live: {
                startsIn: "Starts in",
                joinOpensSoon: "Join link opens 10 minutes before start",
                panelTitle: "Live lesson page",
                sessionPill: "Live Session",
                remainingTime: "Time remaining:",
                focusTitle: "Live focus",
                focusDescription: "Select an online live session to manage join and recording here.",
                noSelection: "No live session is selected yet."
            },
            recordings: {
                title: "Recordings",
                count: "Recordings: {{count}}",
                fallback: "Recording",
                empty: "No recording yet."
            },
            empty: {
                title: "No upcoming classes found",
                description: "Sessions will appear here when they are scheduled.",
                noResultTitle: "No session found",
                noResultDescription: "Try changing the search or filter."
            }
        },
        certificates: {
            eyebrow: "Certificates",
            title: "Certificates",
            description: "Issued and pending certificates are shown in one place.",
            fallbackCourseTitle: "Course certificate",
            statuses: {
                issued: "Issued",
                pending: "Pending",
                revoked: "Revoked",
                rejected: "Rejected",
                unknown: "Unknown"
            },
            metrics: {
                total: "Total",
                issued: "Issued",
                pending: "Pending"
            },
            registry: {
                title: "Certificate registry",
                description: "Select a certificate to download the PDF or open the public verification page."
            },
            actions: {
                downloading: "Downloading...",
                downloadPdf: "Download PDF",
                verify: "Verify"
            },
            empty: {
                title: "No certificates yet",
                description: "After an instructor issues a certificate, it will appear here. Issued certificates can be downloaded as PDFs or opened through the verification link."
            }
        },
        progress: {
            eyebrow: "Student Progress",
            title: "Progress and certificates",
            emptyHeroDescription: "Study pace, achievements, and next steps are shown here.",
            description: "View real course progress, resume points, and key metrics based on learning format.",
            progress: "Progress",
            metrics: {
                averageProgress: "Average progress",
                activeCourses: "Active courses",
                completedCourses: "Completed courses",
                certificates: "Certificates"
            },
            progressLabels: {
                completed: "Completed",
                nearFinish: "Near the finish",
                steady: "Steady progress",
                needsAttention: "Needs attention"
            },
            certificateBadges: {
                ready: "Certificate ready",
                pending: "Pending",
                rejected: "Rejected",
                revoked: "Revoked"
            },
            lessonKinds: {
                quiz: "Quiz",
                article: "Article",
                code: "Code",
                video: "Video"
            },
            courseTypes: {
                video: "Video",
                offline: "Offline",
                onlineLive: "Online live"
            },
            hero: {
                pill: "Learning Progress",
                totalProgress: "total progress",
                focusTitle: "Current learning focus",
                focusDescription: "The biggest growth opportunity is in {{course}}. Here, {{completed}}/{{total}} lessons are complete and total progress is {{progress}}%.",
                courses: "Courses",
                completedLessons: "Completed lessons",
                certificates: "Certificates"
            },
            formats: {
                title: "Learning formats",
                description: "Which course types you are taking.",
                videoCourses: "Video courses",
                sessionCourses: "Session courses",
                attendance: "Attendance",
                notCalculated: "Not calculated"
            },
            courseCard: {
                lessonCount: "{{completed}}/{{total}} lessons",
                remaining: "{{count}} remaining"
            },
            nextAction: {
                title: "Next action",
                resumeDescription: "Continue from where you stopped.",
                pickLessonDescription: "Select the next lesson to keep the course moving.",
                noResumeLesson: "No resume lesson found yet."
            },
            actions: {
                continueLesson: "Continue: {{lesson}}",
                downloadPdf: "Download PDF",
                verify: "Verify",
                hide: "Hide",
                expand: "Expand"
            },
            stats: {
                completed: "Completed",
                remaining: "Remaining",
                sections: "Sections"
            },
            sections: {
                title: "Sections and lesson details",
                completedCount: "{{completed}}/{{total}} lessons completed"
            },
            quiz: {
                passed: "Quiz passed",
                failed: "Quiz failed"
            },
            lesson: {
                lastTime: "Last time: {{time}}",
                completed: "Completed",
                inProgress: "In progress"
            },
            certificateReadiness: {
                title: "Certificate readiness",
                description: "See which courses are close to the finish.",
                percentComplete: "{{progress}}% complete",
                ready: "Ready",
                pending: "Pending",
                rejected: "Rejected",
                notReady: "Not ready"
            },
            sessionFormats: {
                title: "Session-format learning",
                description: "Offline and live courses include extra logistics alongside progress.",
                onlineLive: "Online live",
                onlineLiveDescription: "For this format, join time, sessions, and recordings matter alongside progress.",
                offline: "Offline",
                offlineDescription: "For offline learning, attendance, location, and session resources are important separate parts."
            },
            advanced: {
                eyebrow: "Advanced Progress",
                title: "Activity history and trends",
                description: "Use this block to inspect course activity and recent learning movement in more depth."
            },
            empty: {
                title: "No enrolled courses yet",
                description: "When a course is added, you will see progress, resume points, and certificate status here.",
                noLessons: "No lessons found for this course."
            }
        },
        analytics: {
            eyebrow: "Advanced Progress",
            title: "Deeper progress",
            description: "View your real learning progress, recent activity, and which course to continue from here.",
            toasts: {
                loadError: "Could not load student analytics."
            },
            context: {
                title: "Current context",
                description: "Deeper progress currently follows the selected course filter.",
                courseFilterActive: "Course filter active"
            },
            filters: {
                title: "Period filter",
                description: "Filter metrics by a specific date range.",
                fromPlaceholder: "Start date",
                toPlaceholder: "End date"
            },
            metrics: {
                enrolledCourses: "Enrolled courses",
                completedCourses: "Completed courses",
                completedLessons: "Completed lessons",
                averageProgress: "Average progress"
            },
            continueLearning: {
                title: "Continue learning",
                subtitle: "Latest active course and lesson"
            },
            courseProgress: {
                title: "Course progress",
                subtitle: "Courses you are taking and their status",
                enrolledAt: "Enrolled: {{date}}",
                emptyTitle: "No courses yet",
                emptySubtitle: "Browse the catalog to start your first course"
            },
            recentActivity: {
                title: "Recent activity",
                subtitle: "Your latest learning actions",
                emptyTitle: "No activity",
                emptySubtitle: "You do not have any actions yet"
            },
            charts: {
                courseProgressTitle: "Course progress view",
                courseProgressSubtitle: "Your real progress across enrolled courses",
                activityDistributionTitle: "Activity distribution",
                activityDistributionSubtitle: "Which type your recent actions match most"
            },
            workspaceLink: {
                title: "Student workspace connection",
                description: "This analytics view details the learning direction inside the main student dashboard: which course to continue, when activity dropped, and what overall progress consists of.",
                coursesTitle: "Courses",
                coursesDescription: "See which courses make up the total progress shown by the dashboard.",
                timeTitle: "Time",
                timeDescription: "Recent actions and the period filter show when study pace changed.",
                progressTitle: "Progress",
                progressDescription: "Beyond the average metric, concrete course, lesson, and activity details are shown."
            },
            activityTypes: {
                lesson: "Lesson",
                quiz: "Quiz",
                course: "Course",
                other: "Other"
            },
            actions: {
                continueLearning: "Continue learning",
                continue: "Continue",
                viewCourses: "View courses"
            },
            fallbacks: {
                courseWithId: "Course #{{id}}",
                unknownDate: "Unknown",
                unknownTime: "Unknown time",
                activity: "Activity"
            }
        },
        chat: {
            sidebarTitle: "Conversations",
            sidebarDescription: "Manage your active chats with instructors here.",
            composerPlaceholder: "Start the conversation",
            chatAriaLabel: "{{instructor}} - {{course}} chat",
            fileFallback: "{{type}} sent",
            fileTypes: {
                image: "Image",
                file: "File"
            },
            actions: {
                newChat: "New chat",
                close: "Close",
                sending: "Sending...",
                openChat: "Open chat"
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
                instructor: "Instructor",
                course: "Course"
            },
            empty: {
                noChatsTitle: "No chat found",
                noChatsSubtitle: "Open a new chat or change your search query.",
                selectionTitle: "No conversation selected",
                selectionSubtitle: "Select an instructor from the list on the left to open the conversation here.",
                noCourses: "No courses found."
            },
            modal: {
                title: "Open a chat with an instructor",
                description: "Select a course and write the first message.",
                messageLabel: "Message",
                messagePlaceholder: "Hello! I have a question..."
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
                fileUploadError: "Could not upload the file.",
                loadCoursesError: "Could not load courses.",
                selectCourse: "Select a course.",
                writeMessage: "Write a message.",
                noInstructor: "Instructor information is missing.",
                createError: "Could not create chat."
            }
        },
        tasks: {
            eyebrow: "Student Tasks",
            title: "Task workspace",
            description: "Review task status, track deadlines, and submit answers from one place.",
            searchPlaceholder: "Search by task or course",
            metrics: {
                total: "Total",
                pending: "Pending",
                overdue: "Overdue",
                needsRevision: "Needs revision",
                submitted: "In review",
                approved: "Approved"
            },
            filters: {
                attention: "Needs action",
                allStatuses: "All statuses",
                allCourses: "All courses",
                submitted: "Submitted",
                closed: "Closed"
            },
            statuses: {
                overdue: "Overdue",
                pending: "Pending",
                submitted: "Submitted",
                needsRevision: "Needs revision",
                rejected: "Returned",
                completed: "Approved",
                unavailable: "Not connected"
            },
            activityTypes: {
                discussion: "Discussion",
                exercise: "Exercise",
                quiz: "Quiz",
                groupWork: "Group work",
                work: "Work"
            },
            reviewStatuses: {
                submitted: "In review",
                approved: "Approved",
                needsRevision: "Needs revision",
                rejected: "Returned"
            },
            fallbacks: {
                noDueDate: "No due date provided",
                course: "Unknown course",
                taskTitle: "Task",
                description: "No task description has been provided yet."
            },
            submissionTypes: {
                attachment: "File or link attached",
                text: "Text answer",
                answer: "Answer submitted"
            },
            thread: {
                student: "You",
                teacher: "Teacher",
                answer: "Answer",
                previousExchanges: "Previous exchanges"
            },
            validation: {
                activityFileType: "Select a PDF or Word file for the activity.",
                homeworkFileType: "Select a PDF or Word file for the task.",
                fileTooLarge: "File is too large. Maximum size is {{size}}."
            },
            toasts: {
                activitySubmitUnavailable: "Submission is not available for this activity.",
                homeworkSubmitUnavailable: "Submission is not available for this task.",
                addAnswerLinkOrFile: "Add an answer, link, or file.",
                activitySubmitted: "Activity submitted.",
                homeworkSubmitted: "Task submitted.",
                activitySubmitError: "Could not submit the activity.",
                homeworkSubmitError: "Could not submit the task.",
                unsupportedAttachment: "File type is not supported. Use PDF or Word.",
                fileTooLarge: "File is too large. Maximum size is 20 MB.",
                openAttachmentError: "Could not open the attachment."
            },
            review: {
                currentResult: "Current result",
                score: "Score: {{score}}",
                reviewedAt: "Reviewed: {{date}}"
            },
            submission: {
                latest: "Latest answer",
                submittedAt: "Submitted at: {{date}}"
            },
            quiz: {
                passedTitle: "Quiz submitted successfully",
                completedTitle: "Quiz completed",
                passedDescription: "The result is good. This quiz is closed.",
                retryDescription: "The result is not enough. You can try again.",
                closedDescription: "The quiz is closed. This result was saved.",
                result: "Result",
                passed: "Passed",
                failed: "Not passed"
            },
            submitPanel: {
                retakeQuizTitle: "Retake quiz",
                startQuizTitle: "Start quiz",
                resubmitTitle: "Resubmit answer",
                updateTitle: "Resubmit if you need to update",
                submitTitle: "Submit answer",
                retakeQuizDescription: "The previous result will be updated and the latest attempt will be saved.",
                startQuizDescription: "Answer the questions and submit the quiz immediately.",
                resubmitDescription: "Use the teacher feedback and send an updated answer.",
                updateDescription: "The task is in review. You can update and resend it if needed.",
                submitDescription: "Add text, a link, or a file to submit."
            },
            actions: {
                collapse: "Collapse",
                reopen: "Reopen",
                start: "Start",
                answer: "Answer",
                openAttachment: "Open attachment",
                removeAttachment: "Remove attachment",
                replaceFile: "Replace",
                chooseFile: "Choose file",
                uploadingFile: "Uploading file...",
                submittingTask: "Submitting task...",
                submitting: "Submitting...",
                retake: "Retake",
                startQuiz: "Start quiz",
                submit: "Submit",
                download: "Download"
            },
            fields: {
                answerPlaceholder: "Write an answer",
                linkPlaceholder: "Add a link",
                filePlaceholder: "Add PDF or Word"
            },
            draftStatus: {
                uploading: "Attachment is uploading. Do not close the page.",
                submitting: "Answer is being submitted. The result will update next to this task.",
                unsaved: "There is an unsaved answer. It will not be visible to the teacher until you submit it.",
                empty: "No answer prepared yet. Add text, a link, a file, or quiz answers."
            },
            help: {
                retakeQuiz: "Update the answers and retake the quiz.",
                startQuiz: "Answer every question and submit the quiz.",
                answerRequired: "At least one answer, link, or file is required."
            },
            closedHints: {
                retakeQuiz: "Click to retake the quiz",
                startQuiz: "Click to start the quiz",
                resubmit: "Click to resend the revised answer",
                submit: "Click to submit the task quickly"
            },
            unavailable: {
                title: "Submit is not connected",
                description: "Direct API submission is not available for this task yet."
            },
            empty: {
                noResultTitle: "No results found",
                noResultDescription: "Try changing the filters or clearing the search field."
            },
            preview: {
                attachment: "Attachment",
                attachmentTitle: "{{title}} - Attachment",
                unavailable: "Preview is unavailable.",
                directViewUnavailable: "This file cannot be viewed directly in the browser."
            }
        },
        resources: {
            eyebrow: "Student Resources",
            title: "Resources",
            sessionTitle: "Session resources",
            emptyHeroDescription: "Session materials, recordings, and live join details are collected here.",
            description: "Find teacher-shared materials, lesson recordings, and join details in one place.",
            searchPlaceholder: "Search by session, course, or material",
            recordingTitle: "{{title}} - Recording",
            metrics: {
                sessions: "Sessions",
                materials: "Materials",
                recordings: "Recordings",
                live: "Live"
            },
            filters: {
                allTypes: "All types"
            },
            courseTypes: {
                video: "Video",
                offline: "Offline",
                onlineLive: "Online live"
            },
            statuses: {
                completed: "Closed"
            },
            fallbacks: {
                course: "Course",
                resource: "Resource",
                unknownTime: "Unknown time"
            },
            empty: {
                title: "No resources yet",
                description: "Materials or recordings will appear here when they are added.",
                noResultTitle: "No resource found",
                noResultDescription: "Try changing the search or filter."
            },
            selectSession: {
                title: "Select a session",
                description: "Choose a session to view its materials and recordings."
            },
            quickActions: {
                title: "Quick actions",
                description: "Key links for this session.",
                empty: "No direct action yet."
            },
            actions: {
                joinLesson: "Join lesson",
                viewRecording: "View recording",
                openTasks: "Open in tasks",
                download: "Download"
            },
            materials: {
                title: "Materials",
                available: "{{count}} material available",
                emptyDescription: "No material has been added to this session yet",
                empty: "No material yet for this session."
            },
            materialTypes: {
                video: "Video",
                image: "Image",
                file: "File",
                link: "Link"
            },
            recordingContext: {
                title: "Recording and context",
                description: "Recordings and logistics.",
                lessonRecording: "Lesson recording",
                noRecording: "No recording yet.",
                offlineMeeting: "Offline meeting",
                noLocation: "Location has not been provided yet."
            },
            activityTypes: {
                discussion: "Discussion",
                exercise: "Exercise",
                quiz: "Quiz",
                groupWork: "Group work"
            },
            activityStatuses: {
                planned: "Planned",
                active: "Active",
                done: "Done"
            },
            activities: {
                title: "Session activities",
                description: "Teacher-assigned activities for this session. Context appears here; completion happens in Tasks.",
                notice: "Session activities appear here. Quizzes and other actionable activities open in Tasks.",
                questionCount: "{{count}} question",
                answersInTasks: "Answers open in Tasks",
                questionLabel: "Question #{{number}}",
                moreQuestions: "{{count}} more question. Go to Tasks to complete everything.",
                openInTasksHint: "Go to Tasks to complete this activity.",
                closedHint: "This activity is closed. If you have an answer or result, it appears in Tasks.",
                empty: "No separate activities have been added for this session yet."
            },
            preview: {
                unavailable: "Preview is unavailable.",
                videoUnsupported: "Your browser does not support video.",
                directViewUnavailable: "This file cannot be viewed directly in the browser."
            },
            toasts: {
                openMaterialError: "Could not open the material.",
                openRecordingError: "Could not open the recording."
            }
        }
    }
};
