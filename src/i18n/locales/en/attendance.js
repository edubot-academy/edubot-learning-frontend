export const attendance = {
    attendance: {
        page: {
            title: "Attendance",
            description: "Manage and monitor student attendance for sessions."
        },
        view: {
            table: "Table view",
            session: "Session view",
            cards: "Cards",
            virtualized: "Optimized"
        },
        filters: {
            course: "Course",
            group: "Group",
            session: "Session",
            status: "Status",
            all: "All",
            allStatuses: "All statuses",
            searchStudent: "Search students...",
            rateBelow50: "Below 50%",
            clearWithCount: "Clear ({{count}})",
            advanced: "Advanced filters",
            customDateRange: "Custom date range",
            sessionFilter: "Session filter",
            allSessions: "All sessions",
            quickFilters: "Quick filters",
            onlyAbsent: "Show absences only",
            lowAttendance: "Low attendance %",
            thisWeek: "This week",
            onlyPresent: "Show present students only"
        },
        placeholders: {
            course: "Select course",
            group: "Select group",
            session: "Select session",
            notes: "Leave a short note"
        },
        labels: {
            selected: "Selected",
            activeSession: "Active session",
            joinedAt: "Joined: {{time}}",
            leftAt: "Left: {{time}}"
        },
        fields: {
            notes: "Note"
        },
        delivery: {
            individual: "Individual course",
            group: "Group"
        },
        status: {
            present: "Present",
            late: "Late",
            absent: "Absent",
            excused: "Excused",
            notScheduled: "Not scheduled"
        },
        metrics: {
            students: "Students",
            total: "Total",
            rate: "Attendance %"
        },
        workspace: {
            eyebrow: "Attendance dashboard",
            title: "Session attendance",
            description: "Attendance is managed by exact group and session, not only by course or date."
        },
        summary: {
            eyebrow: "Attendance summary",
            title: "Selected session summary",
            description: "This block summarizes the real attendance state for the selected session.",
            totalAttendance: "Total attendance",
            trends: "Attendance trends",
            attendanceRate: "Attendance %:",
            studentCategories: "Student attendance categories",
            studentCategoriesShort: "Student categories",
            distribution: "Attendance distribution",
            bySession: "Attendance by session",
            studentCount: "{{count}} students",
            currentPeriod: "Current period",
            previousPeriod: "Previous period",
            categories: {
                excellent: "Excellent (90-100%)",
                good: "Good (75-89%)",
                fair: "Fair (50-74%)",
                poor: "Poor (<50%)",
                noData: "No data"
            }
        },
        actions: {
            openEditMode: "Open edit mode",
            closeEditMode: "Close edit mode",
            saveAttendance: "Save attendance",
            noChanges: "No changes",
            saving: "Saving...",
            save: "Save",
            clear: "Clear"
        },
        admin: {
            overrideOpen: "Administrator edit mode is open",
            readOnly: "Admin read-only mode",
            overrideOpenDescription: "You can edit attendance now. Save changes and close the mode when finished.",
            readOnlyDescription: "For admins, this screen is read-only by default. Open edit mode first if changes are needed."
        },
        empty: {
            selectGroupTitle: "Select a group",
            selectGroupForTable: "Select a group first to use table view.",
            selectCourseTitle: "Select a course",
            selectCourseDescription: "Select an offline or live course first to view attendance.",
            selectGroupDescription: "Attendance for this course is managed through a group.",
            selectSessionTitle: "Select a session",
            selectSessionDescription: "Attendance is saved to one exact session.",
            noStudentsTitle: "No students found",
            noStudentsDescription: "The selected group does not have an attendance roster yet.",
            noRecordsTitle: "No records found",
            noRecordsDescription: "Change the session or status filter and try again."
        },
        fallbacks: {
            lesson: "Lesson",
            sessionWithId: "Session #{{id}}",
            location: "Location is not specified",
            timezone: "No timezone",
            noSession: "No session selected",
            noDate: "No date",
            unknownDate: "Unknown date"
        },
        loading: {
            title: "Loading",
            courses: "Loading courses...",
            groups: "Loading groups...",
            sessions: "Loading sessions...",
            roster: "Loading attendance roster...",
            working: "Working...",
            progressComplete: "{{current}} / {{total}} complete"
        },
        notices: {
            coursesLoadErrorTitle: "Courses were not loaded",
            groupsLoadErrorTitle: "Groups were not loaded",
            sessionsLoadErrorTitle: "Sessions were not loaded",
            rosterLoadErrorTitle: "Attendance roster was not loaded",
            unsavedTitle: "Unsaved changes",
            statusChanged: "You changed attendance status. It will not reach the server until you save.",
            notesChanged: "The note changed. It will not reach the server until you save.",
            selectionRequiredTitle: "Complete selection required",
            selectionRequired: "Select course, group, and session to save attendance.",
            editModeClosedTitle: "Edit mode is closed",
            editModeClosed: "As an admin, open edit mode first to change attendance.",
            noChangesTitle: "No changes",
            noChanges: "The current attendance roster matches the saved state.",
            noStudentsTitle: "No students",
            noStudentsToSave: "The attendance roster to save is empty for this group.",
            savedTitle: "Attendance saved",
            saveErrorTitle: "Attendance was not saved"
        },
        toasts: {
            coursesLoadError: "Could not load attendance courses.",
            groupsLoadError: "Could not load groups.",
            sessionsLoadError: "Could not load sessions.",
            selectionRequired: "Select course, group, and session.",
            openEditModeFirst: "Open edit mode first.",
            disabled: "Attendance is disabled for this tenant.",
            noChanges: "No changes.",
            noStudents: "No students found for this group.",
            saved: "Attendance saved successfully.",
            updateSuccess: "Attendance updated successfully.",
            bulkUpdateSuccess: "{{count}} attendance records updated.",
            updateFailed: "Failed to update attendance."
        },
        bulk: {
            selection: {
                cellsSelected: "{{count}} cells selected",
                summary: "{{students}} students • {{sessions}} sessions"
            },
            quickActions: {
                markAllPresent: "Mark all present",
                markAllAbsent: "Mark all absent",
                clearAbsent: "Clear absences"
            },
            actions: {
                markPresent: "Mark present",
                markLate: "Mark late",
                markAbsent: "Mark absent",
                markExcused: "Mark excused",
                exportCsv: "Export CSV",
                exportExcel: "Export Excel",
                notifyParents: "Notify parents",
                clearSelection: "Clear selection"
            },
            notificationMessage: "Information about your child's session attendance",
            toasts: {
                updateSuccess: "{{count}} attendance records updated to \"{{status}}\".",
                updateFailed: "Bulk update failed.",
                selectStudentsForExport: "Select students to export.",
                exportSuccess: "Attendance data exported.",
                exportFailed: "Export failed.",
                selectStudentsForNotification: "Select students for notification.",
                noStudentsToNotify: "No students need a notification.",
                notifySuccess: "Notifications sent to {{count}} parents.",
                notifyFailed: "Notification sending failed.",
                clearAbsentSuccess: "{{count}} absence records cleared."
            }
        },
        cardView: {
            noStudentsFound: "No students found",
            unknownStudent: "Unknown",
            attendanceRate: "Attendance %:",
            attended: "Attended:"
        },
        table: {
            summary: "Summary",
            selectCellsHint: "Select cells to mark attendance.",
            unsavedChanges: "{{count}} unsaved changes",
            saveEnabledHint: "The save button becomes active after you make a change.",
            clickCellHint: "Click a table cell to change attendance status.",
            selectStatusTitle: "Choose attendance status",
            actions: {
                reload: "Reload",
                discard: "Discard"
            },
            toasts: {
                noChangesToSave: "No changes to save.",
                saveSuccess: "{{count}} attendance records saved successfully.",
                saveFailed: "Could not save attendance."
            }
        },
        loadingStates: {
            empty: {
                sessionsTitle: "No sessions",
                sessionsSubtitle: "No sessions are scheduled for this course.",
                dataTitle: "No data",
                dataSubtitle: "There is no data to show."
            },
            error: {
                title: "Something went wrong",
                unknown: "Unknown error. Try again.",
                retry: "Try again"
            }
        },
        accessibility: {
            labels: {
                attendanceCell: "Change attendance status for {{studentName}} in {{sessionTitle}}",
                statusButton: "Mark {{studentName}} as {{status}}",
                bulkAction: "Mark selected students as {{status}}",
                clearSelection: "Clear all selections",
                saveChanges: "Save attendance changes"
            },
            announcements: {
                statusChanged: "Attendance status changed to {{status}}",
                selectionCleared: "Selection cleared",
                changesSaved: "All changes saved successfully",
                error: "Error: {{message}}",
                allCellsSelected: "All cells selected"
            },
            shortcuts: {
                cycleStatus: "Change status",
                selectMultiple: "Select multiple",
                clearSelection: "Clear selection",
                saveChanges: "Save changes",
                navigation: "Navigation",
                markAbsent: "Mark absent",
                selectAll: "Select all"
            }
        },
        errors: {
            sessionExpired: "Session expired. Sign in again.",
            forbidden: "You do not have permission for this action.",
            notFound: "The selected group or session was not found.",
            validation: "Validation error.",
            rateLimited: "Too many attempts. Try again later.",
            server: "Server error."
        },
        legacy: {
            overview: "Attendance overview",
            loadingData: "Loading attendance data...",
            loadError: "Error loading attendance data",
            loadFailed: "Failed to load attendance data",
            empty: "No attendance data available",
            noStudentsSubtitle: "Add students to this group to start tracking attendance.",
            groupAttendance: "Group attendance",
            counts: "{{students}} students · {{sessions}} sessions",
            searchStudents: "Search students...",
            studentName: "Student name",
            changeAttendanceAria: "Change attendance for {{student}} in {{session}}",
            cellsSelected: "{{count}} cells selected",
            markPresent: "Mark present",
            markLate: "Mark late",
            markAbsent: "Mark absent",
            clearSelection: "Clear selection",
            paginationSummary: "Showing {{start}} to {{end}} of {{total}} students"
        }
    },
    groupSessions: {
        workspace: {
            tabs: {
                attendance: "Attendance",
                materials: "Resources",
                homework: "Homework",
                activities: "Activities",
                notes: "Notes",
                engagement: "Next actions"
            },
            errors: {
                unauthorized: "Your session expired. Sign in again.",
                forbidden: "This course, group, or session is not assigned to you."
            },
            tabGroups: {
                primary: {
                    label: "Primary workflow",
                    description: "The most-used actions during a session."
                },
                secondary: {
                    label: "Additional workspace",
                    description: "Reflection, activity, and engagement analysis."
                }
            },
            page: {
                sessionModes: {
                    upcoming: "Upcoming",
                    live: "Live",
                    completed: "Completed",
                    scheduled: "Scheduled"
                },
                deliveryModes: {
                    individual: "Individual course",
                    group: "Group"
                },
                toasts: {
                    selectSession: "Select a session.",
                    notesSaved: "Notes saved.",
                    notesSaveError: "Could not save notes."
                },
                primaryTools: {
                    attendance: {
                        label: "Mark attendance",
                        description: "{{students}} students, {{rate}}% attendance"
                    },
                    materials: {
                        label: "Lesson resources",
                        liveDescription: "Live link, recording, and materials",
                        defaultDescription: "Materials and recordings"
                    },
                    homework: {
                        label: "Homework",
                        description: "{{homework}} assignments, {{review}} responses need review"
                    }
                },
                emptyUnavailable: {
                    title: "Session dashboard is not available yet",
                    subtitle: "This section opens for approved offline or online live courses. Create that type of course first or wait until an approved course is added."
                },
                hero: {
                    eyebrow: "Instructor workbench",
                    title: "Session dashboard",
                    description: "The active session center inside the instructor dashboard. After course, group, and session are selected, attendance, resources, and homework work in that context."
                },
                metrics: {
                    today: "Today's sessions",
                    attendanceRate: "Attendance %",
                    homeworkPublished: "Homework published",
                    riskStudents: "At-risk students"
                },
                activeContext: {
                    title: "Active context",
                    description: "Select the exact course, group, and session first. Attendance, homework, and resources then use that active session context."
                },
                filters: {
                    course: "Course",
                    selectCourse: "Select course",
                    group: "Group",
                    selectGroup: "Select group",
                    session: "Switch session",
                    selectSession: "Select session"
                },
                fallbacks: {
                    course: "Course",
                    groupWithId: "Group #{{id}}",
                    sessionWithId: "Session #{{id}}",
                    groupSession: "Group session",
                    notSelected: "Not selected",
                    noSession: "No session selected"
                },
                today: {
                    title: "Today's sessions for the selected group",
                    descriptionForGroup: "Switch sessions for {{group}} quickly from here.",
                    descriptionEmpty: "Select a group first, then today's sessions for that group will appear.",
                    empty: "The selected group has no sessions today."
                },
                countdown: {
                    remainingInline: " • {{value}} remaining"
                },
                livePanel: {
                    title: "Online live session",
                    startsIn: "Starts in: {{value}}",
                    endsIn: "Ends in: {{value}}",
                    completed: "Session completed",
                    joinWindowHint: "Join opens 10 minutes before class."
                },
                actions: {
                    joinClass: "Join class",
                    createSession: "Create new session",
                    editSession: "Edit session",
                    openGroups: "Open groups dashboard"
                },
                setup: {
                    title: "Session setup",
                    description: "Create and edit actions stay in the modal. The main canvas is focused on running the active session."
                },
                context: {
                    title: "Context",
                    course: "Course",
                    group: "Group",
                    session: "Session"
                },
                header: {
                    activeSession: "Active session",
                    sessionStatus: "Session status",
                    updating: "Updating..."
                },
                attendanceMetrics: {
                    totalStudents: "Total students"
                }
            },
            validation: {
                selectSession: "Select a session."
            },
            activities: {
                toasts: {
                    created: "Activity added.",
                    updated: "Activity updated.",
                    deleted: "Activity deleted.",
                    createError: "Could not save the activity.",
                    updateError: "Could not update the activity.",
                    deleteError: "Could not delete the activity.",
                    loadResponsesError: "Could not load activity results.",
                    responseUpdated: "Activity response updated.",
                    responseSaveError: "Could not save the activity response."
                }
            },
            attendance: {
                title: "Attendance",
                description: "Mark session attendance and use bulk actions to update and save faster.",
                sessionStatus: {
                    present: "Present",
                    late: "Late",
                    absent: "Absent",
                    excused: "Excused"
                },
                sessionModes: {
                    upcoming: "Upcoming",
                    live: "Live",
                    completed: "Completed"
                },
                fallbacks: {
                    session: "Session #{{value}}",
                    group: "Group",
                    noTime: "No time"
                },
                actions: {
                    importingZoom: "Importing...",
                    importZoom: "Import Zoom",
                    saving: "Saving...",
                    save: "Save attendance",
                    noChanges: "No changes"
                },
                filters: {
                    searchPlaceholder: "Search students",
                    all: "All",
                    unmarked: "Unmarked",
                    changed: "Changed"
                },
                bulk: {
                    present: "Mark all present",
                    late: "Mark all late",
                    absent: "Mark all absent",
                    clearVisible: "Clear visible"
                },
                counters: {
                    visible: "Visible: {{count}}",
                    unmarked: "Unmarked: {{count}}",
                    unsaved: "Unsaved: {{value}}",
                    marked: "Marked: {{marked}}/{{total}}",
                    presentRate: "Attendance rate: {{value}}%"
                },
                values: {
                    yes: "yes",
                    no: "no"
                },
                unsavedMessage: "Changes are not saved yet. The save button stores all marks for the current session.",
                savedMessage: "Attendance is saved. Bulk actions only apply to students matching the current search and filter.",
                empty: {
                    selectSession: "Select a session before marking attendance.",
                    loadingStudents: "Students are loading...",
                    noStudents: "No students found.",
                    noFilteredStudents: "No students found for this filter."
                },
                studentStatusHelper: "Choose the attendance status for this session.",
                notesPlaceholder: "Note",
                toasts: {
                    loadError: "Could not load session data.",
                    selectSession: "Select a session before saving attendance.",
                    noChanges: "No changes.",
                    saved: "Attendance was saved for this session.",
                    saveError: "Could not save attendance."
                },
                notices: {
                    noSessionTitle: "No session selected",
                    noSessionMessage: "Select an active session before saving attendance.",
                    unmarkedTitle: "Attendance is incomplete",
                    unmarkedMessage: "Select attendance status for {{count}} students first.",
                    noChangesTitle: "No changes",
                    noChangesMessage: "The attendance list matches the saved state.",
                    savedTitle: "Attendance saved",
                    savedMessage: "Attendance was updated for this active session.",
                    saveFailedTitle: "Attendance was not saved"
                }
            },
            homework: {
                deadlineStates: {
                    noDeadline: "No deadline",
                    unknown: "Deadline unknown",
                    overdue: "Overdue",
                    dueSoon: "Due soon",
                    active: "Active"
                },
                validation: {
                    titleRequired: "Enter the homework title.",
                    selectSessionFirst: "Select a session first."
                },
                toasts: {
                    loadError: "Could not load homework.",
                    reviewRosterLoadError: "Could not load the review roster.",
                    published: "Homework published.",
                    unpublished: "Homework unpublished.",
                    publishError: "Could not publish homework.",
                    updateError: "Could not update homework.",
                    reviewUpdated: "Submission review status updated.",
                    reviewError: "Could not review the submission.",
                    statusError: "Could not update homework status."
                }
            },
            resources: {
                fallbacks: {
                    lessonVideo: "Lesson video"
                },
                toasts: {
                    courseMaterialsLoadError: "Could not load course materials.",
                    materialsUpdated: "Materials updated.",
                    materialsUpdateError: "Could not update materials.",
                    fileAdded: "File added to materials.",
                    fileUploadError: "Could not upload the file.",
                    materialAlreadyAdded: "This material is already attached to the session.",
                    meetingLinkUpdated: "Meeting link updated.",
                    meetingLinkSaveError: "Could not save the meeting link.",
                    meetingStateUpdated: "Meeting state refreshed.",
                    meetingNotFound: "Meeting was not found.",
                    meetingDeleted: "Meeting deleted.",
                    meetingDeleteError: "Could not delete the meeting.",
                    zoomAttendanceImported: "Zoom attendance imported.",
                    attendanceImportError: "Could not import attendance.",
                    zoomRecordingsSynced: "Zoom recordings synced.",
                    recordingsSyncError: "Could not sync recordings.",
                    meetingLinkMissing: "Meeting link was not found."
                }
            },
            selections: {
                toasts: {
                    coursesLoadError: "Could not load courses.",
                    groupsLoadError: "Could not load groups.",
                    sessionsLoadError: "Could not load sessions."
                },
                notices: {
                    coursesLoadTitle: "Courses did not load",
                    groupsLoadTitle: "Groups did not load",
                    sessionsLoadTitle: "Sessions did not load"
                }
            }
        },
        notes: {
            title: "Session notes",
            description: "Private instructor notes and next steps for this session.",
            status: {
                unsaved: "Changes are not saved.",
                saved: "Notes are saved.",
                empty: "There are no notes for this session yet."
            },
            saveState: {
                saving: "Saving notes...",
                ready: "Changes are ready. Save them.",
                lastSaved: "Last saved: {{date}}",
                notCreated: "No separate note has been created for this session yet."
            },
            actions: {
                save: "Save note",
                saving: "Saving..."
            },
            field: {
                label: "Session note",
                placeholder: "Write observations, follow-up tasks, or private notes for this session."
            },
            empty: {
                selectSession: "Select a session before adding a note."
            }
        },
        engagement: {
            title: "Next actions",
            loadError: "Could not load next actions.",
            loadingDescription: "Reliable signals for this session are loading.",
            description: "Priority signals from attendance, homework, and activities.",
            tabs: {
                attendance: "Attendance",
                homework: "Homework",
                activities: "Activities"
            },
            metrics: {
                attendanceMarked: "Attendance marked",
                unmarkedHelper: "{{count}} students are not marked yet",
                needsAttention: "Needs attention",
                attentionLimitHelper: "Top {{count}} students are shown",
                teacherQueue: "Instructor queue",
                teacherQueueHelper: "Review or marking is waiting",
                positiveSignal: "Positive signal",
                positiveLimitHelper: "Top {{count}} positive students"
            },
            attention: {
                title: "Who needs outreach",
                description: "List sorted by priority, reason count, and severity.",
                moreReasons: "+{{count}} more"
            },
            severity: {
                high: "Immediate attention",
                medium: "Near follow-up",
                low: "Reminder"
            },
            actions: {
                openFirst: "Open first"
            },
            queue: {
                title: "Instructor queue",
                description: "Choose which item to open first.",
                attendanceTitle: "Attendance incomplete",
                attendanceDescription: "Students who are not marked yet",
                homeworkTitle: "Homework review",
                homeworkDescription: "Answers in submitted state",
                activitiesTitle: "Activity review",
                activitiesDescription: "Activity submissions not reviewed yet"
            },
            signals: {
                title: "Signal summary",
                description: "Quickly see which block needs follow-up. \"Due soon\" = {{hours}} hours.",
                attendance: "Attendance",
                absentValue: "{{count}} absent",
                attendanceHelper: "{{late}} late, {{excused}} excused",
                homework: "Homework student signals",
                homeworkHelper: "{{revision}} in revision, {{dueSoon}} due soon",
                activities: "Activity student signals",
                activitiesHelper: "{{revision}} in revision, {{missing}} without response, {{notStarted}} not started",
                positive: "Doing well",
                positiveHelper: "Positive signal without risk"
            },
            positive: {
                title: "Students doing well",
                description: "Students with no follow-up needed and steady positive signals.",
                streak: "{{count}} in a row"
            },
            empty: {
                noAttentionStudents: "No students currently require special follow-up for this session.",
                noPositiveStudents: "No separate positive momentum is visible yet."
            }
        },
        activities: {
            title: "Session activities",
            description: "This section syncs with students. Each activity is saved separately: planned is hidden, active is visible, and done is visible but closed.",
            insightFocus: "Insight focus",
            focusFallback: "Focus",
            focusHelpFallback: "Review responses in this direction first.",
            loading: "Loading...",
            lastUpdated: "Last updated: {{date}}",
            types: {
                discussion: "Discussion",
                exercise: "Exercise",
                quiz: "Quiz",
                groupWork: "Group work",
                vocabulary: "Vocabulary",
                fillBlank: "Fill in the blanks",
                wordMatch: "Word match",
                listening: "Listening",
                writingCorrection: "Writing correction"
            },
            typeHelp: {
                discussion: "Students can submit text or a short answer",
                exercise: "Completed with text, a file, or a link",
                quiz: "Auto-graded with immediate results",
                groupWork: "Each student submits an individual result or short report",
                vocabulary: "Flashcard review — students flip cards and mark what they know",
                fillBlank: "Students complete sentences with missing words",
                wordMatch: "Students match words on the left with meanings on the right",
                listening: "Students listen to an audio clip and answer a question",
                writingCorrection: "Students write a response based on a prompt"
            },
            payload: {
                vocabulary: {
                    wordLabel: "Word",
                    definitionLabel: "Definition",
                    addWord: "Add word",
                    wordPlaceholder: "Word",
                    definitionPlaceholder: "Definition"
                },
                fillBlank: {
                    addSentence: "Add sentence",
                    sentencePlaceholder: "Sentence (use ___ for the blank)",
                    blankPlaceholder: "Correct answer"
                },
                wordMatch: {
                    addPair: "Add pair",
                    leftPlaceholder: "Left (word)",
                    rightPlaceholder: "Right (meaning)"
                },
                listening: {
                    audioUrlLabel: "Audio URL",
                    audioUrlPlaceholder: "https://...",
                    promptLabel: "Question / prompt",
                    promptPlaceholder: "What did you hear about…?"
                },
                writingCorrection: {
                    promptLabel: "Writing prompt",
                    promptPlaceholder: "Write about…",
                    rubricLabel: "Grading criteria (optional)",
                    rubricPlaceholder: "Check for grammar, vocabulary…"
                }
            },
            status: {
                planned: "Planned",
                active: "Active now",
                done: "Done"
            },
            statusHelp: {
                planned: "Hidden from students",
                active: "Visible to students",
                done: "Visible to students, closed"
            },
            submissionStatus: {
                submitted: "Under review",
                approved: "Approved",
                needsRevision: "Needs revision",
                rejected: "Rejected"
            },
            filters: {
                all: "All",
                pending: "Not reviewed",
                reviewed: "Reviewed",
                revision: "Revision/rejected",
                passed: "Passed quizzes",
                failed: "Failed quizzes",
                notStarted: "Not started quizzes",
                missingResponse: "No response"
            },
            filterHelp: {
                all: "Overall view",
                pending: "Focus on submitted responses",
                reviewed: "Completed responses",
                revision: "Items requiring another review",
                passed: "Successfully completed attempts",
                failed: "Requires follow-up",
                notStarted: "Student has not attempted yet",
                missingResponse: "Open activities without a response"
            },
            metrics: {
                total: "Total",
                visible: "Visible",
                hidden: "Hidden",
                quiz: "Quiz"
            },
            actions: {
                addActivity: "Add activity",
                cancel: "Cancel",
                saving: "Saving...",
                save: "Save",
                saveActivity: "Save activity",
                saveChanges: "Save changes",
                responses: "Responses",
                edit: "Edit",
                delete: "Delete",
                deleting: "Deleting...",
                toggle: "Open/close",
                addQuestion: "Add question",
                addOption: "Add option",
                openAttachment: "Open attachment",
                collapse: "Collapse"
            },
            editor: {
                newActivity: "New activity",
                activityNumber: "Activity #{{number}}",
                reviewHint: "For useful student feedback, leave at least a comment or score during review."
            },
            fields: {
                title: "Activity title",
                description: "Write a short explanation or what students need to do."
            },
            quiz: {
                questionsTitle: "Quiz questions",
                questionsHelp: "{{count}} questions. Each question needs at least two options and one correct answer.",
                questionCount: "{{count}} questions",
                questionNumber: "Question #{{number}}",
                questionPlaceholder: "Write the question",
                singleChoice: "One correct answer",
                multipleChoice: "Multiple correct answers",
                correct: "Correct",
                optionPlaceholder: "Option {{number}}",
                summaryTitle: "Quiz summary",
                summaryDescription: "Correct answers are not shown here. Students see results based on status.",
                viewMode: "View mode"
            },
            responses: {
                student: "Student",
                passed: "Passed",
                failed: "Failed",
                studentsShown: "{{count}} students shown",
                attempt: "Attempt",
                answer: "Answer",
                result: "Result",
                passedShort: "Passed",
                failedShort: "Failed",
                response: "Response",
                responsesShown: "{{count}} responses shown"
            },
            review: {
                currentResult: "Current result",
                score: "Score: {{score}}",
                reviewedAt: "Reviewed: {{date}}",
                editReview: "Edit review",
                previousThread: "Previous thread",
                approve: "Approve",
                requestRevision: "Request revision",
                reject: "Reject",
                scorePlaceholder: "Score",
                commentPlaceholder: "Feedback",
                requireFeedback: "Approved, needs revision, and rejected statuses require at least feedback or a score."
            },
            empty: {
                noActivitiesYet: "No activities have been added yet.",
                noResponses: "No responses yet.",
                noActivities: "There are no session activities yet. You can add a discussion, exercise, group work, or quiz."
            },
            fallbacks: {
                student: "Student",
                instructor: "Instructor"
            }
        },
        resources: {
            loading: "Loading...",
            toasts: {
                copyFailed: "Could not copy the link.",
                joinLinkCopied: "Join link copied.",
                recordingLinkCopied: "Recording link copied."
            },
            validation: {
                httpUrl: "The link must start with `http://` or `https://`."
            },
            notices: {
                materialAdded: "\"{{title}}\" was added to the session.",
                materialUpdated: "\"{{title}}\" was updated.",
                materialDeleted: "\"{{title}}\" was removed from materials.",
                fileAdded: "\"{{title}}\" file was added to materials.",
                videoAdded: "\"{{title}}\" video was added to the session."
            },
            empty: {
                noSessionTitle: "Select a session for resources",
                noSessionSubtitle: "Materials, meeting links, and recordings are linked to the active session.",
                noMaterials: "No materials have been saved for this session.",
                noVideoSearchResults: "No videos match the search.",
                noReusableVideos: "No reusable lesson videos were found in this course."
            },
            materials: {
                title: "Lesson materials",
                description: "Manage links, files, and reused videos needed for the session here.",
                uploadedUrlReadonly: "The link cannot be changed for an uploaded file."
            },
            actions: {
                uploadingFile: "Uploading file...",
                uploadFile: "Upload file",
                addLink: "Add link",
                addVideoFromCourse: "Add video from course",
                saving: "Saving...",
                save: "Save",
                cancel: "Cancel",
                play: "Play",
                open: "Open",
                rename: "Rename",
                delete: "Delete",
                deleting: "Deleting...",
                copyLink: "Copy link",
                collapse: "Collapse",
                expand: "Open",
                add: "Add"
            },
            composer: {
                title: "Add new link",
                description: "Add an external link to the session with a title."
            },
            fields: {
                materialTitle: "Material title",
                publishNow: "Publish now",
                availableAt: "Release date"
            },
            labels: {
                video: "Video",
                uploadedFile: "Uploaded file",
                externalLink: "External link",
                draft: "Draft",
                published: "Published",
                availableAt: "Releases {{date}}"
            },
            meeting: {
                title: "Live lesson",
                description: "Save the meeting link for this session and join from the same place during class.",
                platform: "Platform",
                statusTitle: "Meeting status",
                joinReady: "Join link is saved and ready for class.",
                joinMissing: "No join link has been saved for this session.",
                update: "Update meeting",
                create: "Create meeting",
                join: "Join class",
                delete: "Delete meeting",
                joinWindowHint: "Join becomes available only 10 minutes before class."
            },
            format: {
                title: "Session format",
                description: "This session is not online live, so meeting management is not shown here.",
                label: "Format",
                offline: "Offline session",
                noLiveMeeting: "Live meeting is not required",
                location: "Location"
            },
            recording: {
                title: "Recording",
                description: "The recording link saved for this session appears here. If Zoom sync runs, the session field is updated too.",
                statusTitle: "Recording status",
                found: "A recording linked to the session was found.",
                missing: "There is no recording link for this session yet.",
                syncing: "Syncing...",
                sync: "Sync Zoom recordings",
                open: "Open recording"
            },
            integrations: {
                title: "Integration tools",
                description: "These utility actions are outside the normal lesson flow and are usually needed only for Zoom import or recovery.",
                note: "These actions are outside the normal lesson flow.",
                loadMeetingState: "Load meeting state",
                importing: "Importing...",
                importZoomAttendance: "Import Zoom attendance"
            },
            assetLibrary: {
                title: "Add video from course",
                sourceCourse: "Source video course",
                searchPlaceholder: "Search by lesson or section",
                attachedVideos: "Attached videos",
                videoCount: "{{count}} videos",
                loading: "Loading course materials...",
                attached: "Attached",
                added: "Added"
            },
            deleteModal: {
                title: "Delete material",
                messageWithTitle: "Delete \"{{title}}\" from materials?",
                message: "Delete this material?"
            },
            video: {
                loadingPlayer: "Loading video player..."
            },
            fallbacks: {
                noSection: "No section",
                material: "Material",
                thisMaterial: "This material",
                noLocation: "No location provided",
                courseWithId: "Course #{{id}}"
            }
        },
        setup: {
            workspace: {
                createTitle: "New session",
                editTitle: "Edit session",
                createDescription: "Create the group’s next lesson and add its time and optional material.",
                editDescription: "Update the selected session time, status, and recording link.",
                createDisabledReason: "Select a group before creating a session.",
                editDisabledReason: "Select an active session before editing.",
                creating: "Creating...",
                createAction: "Create session",
                saving: "Saving...",
                saveAction: "Save changes"
            },
            modal: {
                createContextHint: "Course and group are selected with the picker above",
                editContextHint: "Editing happens in the active session context"
            },
            sections: {
                basic: "Basic information",
                schedule: "Schedule",
                locationAndMaterials: "Location and materials",
                materialsAndRecording: "Materials and recording",
                materials: "Materials",
                context: "Context",
                makeup: "Makeup session"
            },
            fields: {
                sessionIndex: "Session index *",
                sessionTitle: "Session title *",
                groupLocation: "Group location",
                recordingUrl: "Recording link",
                materialTitle: "Material title",
                materialUrl: "Material URL",
                isMakeup: "This is a makeup session",
                makeupForSessionId: "Original session number"
            },
            help: {
                nextSessionIndex: "Next available number: {{index}}. Change it only if needed.",
                uniqueSessionIndex: "The number must be unique within this group.",
                editMaterialsInResources: "To change materials, edit the session and update saved links in the Resources tab.",
                saveChangesHere: "Save all changes here.",
                makeupSession: "Enable if this session replaces a missed one and enter the original session number."
            },
            context: {
                course: "Course",
                group: "Group",
                format: "Format",
                newSession: "New session",
                addedToSelectedGroup: "Will be added to the selected group",
                session: "Session"
            },
            delivery: {
                offline: "Offline",
                onlineLive: "Online live",
                video: "Video course"
            },
            status: {
                scheduled: "Scheduled",
                completed: "Completed",
                cancelled: "Cancelled"
            },
            actions: {
                close: "Close"
            },
            fallbacks: {
                noLocation: "No location provided",
                notSelected: "Not selected"
            },
            feedback: {
                noGroupTitle: "No group selected",
                noGroupMessage: "Select a group before creating a new session.",
                incompleteTitle: "Session information is incomplete",
                createIncompleteMessage: "Session number, title, start time, and end time are required.",
                updateIncompleteMessage: "Session title, start time, and end time are required.",
                createdTitle: "Session created",
                createdMessage: "{{title}} opened in the active workspace.",
                createFailedTitle: "Session was not created",
                noSessionTitle: "No session selected",
                noSessionMessage: "Select an active session before editing.",
                updatedTitle: "Session updated",
                updatedMessage: "Changes for {{title}} were saved.",
                updateFailedTitle: "Session was not updated"
            },
            toasts: {
                selectGroup: "Select a group first.",
                createIncomplete: "Session number, title, start time, and end time are required.",
                created: "Session created.",
                createError: "Could not create session.",
                selectSession: "Select a session.",
                updateIncomplete: "Session title, start time, and end time are required.",
                updated: "Session updated.",
                updateError: "Could not update session.",
                statusUpdated: "Session status updated.",
                statusUpdateError: "Could not update session status."
            }
        },
        homeworkModal: {
            header: {
                editEyebrow: "Edit",
                createEyebrow: "Create",
                editTitle: "Edit homework",
                createTitle: "New homework",
                editDescription: "Update the selected homework task.",
                createDescription: "Create a new homework task and send it to students."
            },
            sections: {
                basic: "Basic information",
                deadline: "Deadline",
                publishing: "Publishing options",
                context: "Context"
            },
            fields: {
                title: "Task title",
                description: "Task description",
                deadline: "Deadline time (optional)",
                publishNow: "Publish immediately",
                maxScore: "Max score (optional)"
            },
            placeholders: {
                title: "Enter the task title",
                description: "Describe the task in detail...",
                maxScore: "e.g. 100"
            },
            maxScoreHelp: "Maximum possible score for this task. Leave empty for unscored tasks.",
            validation: {
                titleRequired: "Enter the task title.",
                descriptionRequired: "Enter the task description."
            },
            publishHelp: {
                published: "Homework will be visible to students immediately.",
                draft: "Homework will be saved as a draft and can be published later."
            },
            context: {
                session: "Session"
            },
            fallbacks: {
                sessionWithId: "Session #{{id}}"
            },
            deadlineHelp: "If no deadline is set, students can submit the task at any time.",
            escapeHint: "Save all changes, then press Escape to close.",
            actions: {
                cancel: "Cancel",
                create: "Create",
                update: "Update",
                saving: "Saving..."
            }
        },
        homeworkTab: {
            toasts: {
                created: "Homework created successfully.",
                updated: "Homework updated successfully.",
                deleted: "Homework deleted successfully.",
                saveError: "Could not save homework.",
                deleteError: "Could not delete homework.",
                previewError: "Could not open the attachment."
            },
            metrics: {
                total: "Total homework",
                active: "Active",
                dueSoon: "Due soon",
                overdue: "Overdue"
            },
            filters: {
                all: "All",
                active: "Active",
                dueSoon: "Due soon",
                overdue: "Overdue",
                noDeadline: "No deadline"
            },
            labels: {
                deadline: "Deadline",
                session: "Session"
            },
            status: {
                published: "Published",
                unpublished: "Unpublished"
            },
            actions: {
                publish: "Publish",
                unpublish: "Unpublish",
                delete: "Delete homework",
                deleteShort: "Delete",
                edit: "Edit",
                view: "View",
                download: "Download",
                approve: "Approve",
                requestRevision: "Request revision",
                sendForRevision: "Send for revision",
                reject: "Reject",
                cancel: "Cancel",
                deleting: "Deleting...",
                confirmDelete: "Yes, delete it"
            },
            create: {
                title: "New homework",
                description: "Create a new homework task for students.",
                action: "Create homework",
                assignedTo: "Assigned to"
            },
            list: {
                title: "Homework list",
                description: "Search, filter by deadline status, and choose a task to review.",
                searchPlaceholder: "Search homework",
                loading: "Loading homework..."
            },
            selected: {
                title: "Selected homework",
                description: "Task content and current status.",
                assignedStudents: "Assigned students: {{count}}",
                needsReviewCount: "{{count}} awaiting review"
            },
            review: {
                title: "Review submissions",
                description: "This list shows every student assigned to the task: who submitted, who is waiting for review, and who has not submitted yet.",
                studentsCount: "Students: {{count}}",
                needsReview: "Needs review",
                needsRevision: "Needs revision",
                missing: "Not submitted",
                pending: "Waiting",
                late: "Late",
                approved: "Approved",
                rejected: "Rejected",
                loading: "Loading review list...",
                submittedAt: "Submitted: {{date}}",
                missingAfterDeadline: "The deadline has passed, but this student has not submitted the task.",
                pendingSubmission: "This student has not submitted the task yet.",
                answerContent: "Answer content",
                attachment: "Attached file",
                attachmentDescription: "File uploaded to the LMS or an external link",
                feedback: "Feedback",
                followUpNeeded: "Follow-up needed",
                waiting: "Waiting for now"
            },
            reviewStates: {
                missing: "Not submitted",
                pendingSubmission: "Not submitted yet",
                needsReview: "Needs review",
                approved: "Approved",
                needsRevision: "Needs revision",
                needsRevisionFilter: "Needs revision",
                pending: "Pending",
                rejected: "Rejected",
                late: "Late submission",
                lateShort: "Late"
            },
            preview: {
                title: "Attachment",
                loadError: "Could not load the attachment.",
                unsupportedTitle: "Previewing this file inside the page is not supported.",
                unsupportedDescription: "Download the file to open it."
            },
            empty: {
                noSessionTitle: "Select a session for homework",
                noSessionSubtitle: "Choose a session from the active group before publishing, editing, or reviewing homework.",
                noHomework: "There is no homework for this session yet.",
                noFilteredHomework: "No homework matches the search or filter.",
                noStudents: "No student list was found for this task.",
                noFilteredStudents: "No students match the selected filter.",
                selectHomeworkPanelTitle: "Select homework",
                selectHomeworkPanelDescription: "Choose a task from the list to view its content and student submissions here.",
                selectHomeworkTitle: "No homework selected",
                selectHomeworkSubtitle: "Select a task from the list on the left to start reviewing it."
            },
            reviewModal: {
                approveTitle: "Approve answer",
                revisionTitle: "Return for revision",
                rejectTitle: "Reject answer",
                subtitleWithName: "Leave a comment for {{name}}.",
                subtitle: "Leave a comment.",
                approveHelp: "Add a comment if needed. Approval can be saved without a comment.",
                requiredHelp: "Write a short explanation for this action so the student understands what to fix or why the answer was rejected.",
                scoreLabel: "Score (optional)",
                scoreMax: "out of {{max}}",
                scorePlaceholder: "Enter score",
                commentLabel: "Comment",
                approvePlaceholder: "Example: The answer is clear and complete.",
                requiredPlaceholder: "Example: The main points are missing. Please review the attachment and resubmit.",
                commentRequired: "A comment is required for this action."
            },
            deleteModal: {
                title: "Delete homework",
                subtitle: "Are you sure you want to delete \"{{title}}\"? This action cannot be undone.",
                warningTitle: "Warning",
                warningDescription: "After deleting homework, it cannot be restored. All student submissions and related data will be removed."
            },
            fallbacks: {
                noGroup: "No group selected",
                homework: "Homework",
                noDescription: "No description added yet.",
                noDeadline: "No deadline set",
                answerUploaded: "Answer uploaded for review.",
                attachment: "Attachment"
            }
        }
    },
    internalLeaderboard: {
        trackSwitcherLabel: "Choose leaderboard track",
        currentView: "Current view",
        tracks: {
            all: {
                label: "All",
                helper: "Overall activity"
            },
            video: {
                label: "Video",
                helper: "Self-paced learning"
            },
            live: {
                label: "Live",
                helper: "Session-based learning"
            }
        },
        roles: {
            student: {
                eyebrow: "Student Ranking",
                title: "My internal ranking",
                description: "Compare your place, course leaders, and this week’s activity.",
                courseLabel: "My courses",
                courseDescription: "Compare leaders in the courses you are taking."
            },
            instructor: {
                eyebrow: "Instructor Ranking",
                title: "Student ranking",
                description: "Track active students, student of the week, and course pace in your courses.",
                courseLabel: "My courses",
                courseDescription: "Select a course to see active students inside that course."
            },
            admin: {
                eyebrow: "Admin Ranking",
                title: "Platform ranking",
                description: "Review weekly platform activity, homepage leaders, and course rankings.",
                courseLabel: "Platform courses",
                courseDescription: "Check the internal ranking for any course."
            },
            default: {
                eyebrow: "Leaderboard workspace",
                title: "Internal ranking",
                description: "See weekly leaders, student of the week, and course rankings here.",
                courseLabel: "Course boards",
                courseDescription: "Compare top students inside the selected course."
            }
        },
        metrics: {
            weekly: "Weekly leaders",
            homepage: "Homepage top students",
            studentOfWeek: "Student of the week"
        },
        row: {
            streakDays: "🔥 {{count}} days",
            quizCount: "{{count}} tests"
        },
        weekly: {
            title: "Weekly ranking",
            description: "Currently most active students.",
            emptyTitle: "No leaders found",
            emptySubtitle: "There is no ranking data for the selected track yet."
        },
        studentOfWeek: {
            title: "Student of the week",
            description: "The highlighted participant of the week and homepage top students.",
            emptyTitle: "No student of the week",
            emptySubtitle: "No highlighted student has been determined for this track yet."
        },
        homepage: {
            title: "Homepage top students",
            emptyTitle: "No homepage data",
            emptySubtitle: "There are no homepage leaders for the selected track."
        },
        courseBoard: {
            title: "Course ranking",
            description: "Compare top students inside the selected course.",
            courseLabel: "Course",
            selectCourse: "Select course",
            noCourseTitle: "No course selected",
            noCourseSubtitle: "Select a course above to view its internal ranking.",
            noDataTitle: "No data",
            noDataSubtitle: "Ranking is not available for this course and track combination yet."
        },
        fallbacks: {
            student: "Student",
            course: "Course"
        },
        errors: {
            coursesLoad: "Could not load courses.",
            leaderboardLoad: "Could not load internal leaderboard data.",
            courseBoardLoad: "Course ranking is not loading right now."
        }
    }
};
