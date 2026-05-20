export const courses = {
    catalogPage: {
        title: "Catalog",
        description: "Search by course title, subject, or instructor.",
        search: {
            label: "Search courses",
            placeholder: "Search courses...",
            helper: "Search updates after a short pause."
        },
        status: {
            loading: "Loading catalog...",
            loadError: "Catalog was not loaded.",
            results: "{{value}} courses shown",
            resultsForQuery: "{{value}} courses found for \"{{query}}\"",
            noResults: "No courses found"
        },
        price: {
            free: "Free",
            amount: "{{amount}} KGS",
            notSpecified: "Price is not specified"
        },
        courseTypes: {
            offline: "Offline",
            onlineLive: "Online live",
            video: "Video course"
        },
        duration: {
            hours: "{{value}} hours",
            lessons: "{{value}} lessons",
            notSpecified: "Duration is not specified"
        },
        error: {
            title: "Catalog was not loaded.",
            description: "Try again."
        },
        actions: {
            retry: "Reload"
        },
        empty: {
            search: "No courses were found for this search.",
            default: "There are no courses in the catalog yet."
        },
        pagination: {
            label: "Catalog pages",
            previous: "Previous",
            next: "Next",
            page: "Page {{page}}"
        }
    },
    videoUpload: {
        label: "Upload video",
        uploading: "Uploading: {{progress}}%",
        errors: {
            invalidType: "Invalid file type. Upload MP4, WebM, AVI, MOV, MKV, or WMV.",
            tooLarge: "File size must be less than 1 GB.",
            uploadFailed: "Failed to upload video."
        }
    },
    courseApi: {
        toasts: {
            certificatePdfDownloadFailed: "Could not download certificate PDF.",
            courseDeleted: "Course deleted successfully.",
            courseDeleteFailed: "Failed to delete course."
        },
        errors: {
            uploadUrlFailed: "Could not prepare file upload.",
            fileTooLarge: "The selected file is too large.",
            fileUploadFailed: "Could not upload the file."
        }
    },
    courseLearning: {
        actions: {
            back: "Back",
            home: "Return home"
        },
        quiz: {
            notFound: "Quiz not found.",
            startTitle: "Ready to start the test?",
            startAction: "Start test",
            scoreSummary: "{{score}}% ({{correct}}/{{total}}) correct",
            gradeAlt: {
                passed: "Passed quiz grade",
                nearlyPassed: "Nearly passed quiz grade",
                failed: "Failed quiz grade"
            },
            passedMessage: "You showed strong knowledge!",
            failedMessage: "You did not pass. Try again.",
            retake: "Retake",
            viewAnswers: "View answers",
            yourAnswer: "Your answer",
            skipped: "Skipped",
            correctAnswer: "Correct answer",
            skip: "Skip",
            submit: "Finish",
            next: "Next",
            skippedCount: "Skipped questions: {{skipped}} / {{total}}",
            noQuestions: "No questions found.",
            toasts: {
                allQuestionsRequired: "All questions must be handled"
            }
        },
        challenge: {
            notFound: "Code challenge not found.",
            task: "Task",
            noInstructions: "No instructions provided.",
            visibleTests: "Visible tests",
            args: "args",
            code: "Code",
            timeLimitMinutes: "{{value}} min",
            codePlaceholder: "// Write any JavaScript code",
            checking: "Checking...",
            submit: "Submit",
            resultsTitle: "Test results",
            allPassed: "All tests passed successfully!",
            someFailed: "Some tests failed.",
            testFallback: "Test {{number}}",
            hiddenSuffix: "(hidden)",
            actualResult: "Actual result",
            expectedResult: "Expected result"
        }
    }
};
