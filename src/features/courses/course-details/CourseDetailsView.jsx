import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import CourseVideoPlayer from '@features/courses/components/CourseVideoPlayer';
import CardVideo from '@features/courses/components/CardVideo';
import ArticleLessonViewer from '@features/courses/components/ArticleLessonViewer';
import LessonQuizPlayer from '@features/courses/components/LessonQuizPlayer';
import LessonChallengePlayer from '@features/courses/components/LessonChallengePlayer';
import Comment from '@features/ratings/components/Comment';
import AiAssistantPanel from '@features/assistant/components/AiAssistantPanel';
import CourseContent from '@features/courses/components/CourseContent';
import InstructorChat from '@features/instructorChat/InstructorChat';
import { HiChatAlt2 } from 'react-icons/hi';
import Loader from '@shared/ui/Loader';
import { COURSE_DETAILS_SUPPORT_PLACEMENT } from './courseDetailsPlacement';

export const InstructorChatDock = ({ enrolled, userRole, course }) => {
    const [instructorChat, setInstructorChat] = useState(false);
    const chatRef = useRef(null);
    const buttonRef = useRef(null);
    const chatButtonRef = useRef(null);
    const chatPanelRef = useRef(null);
    const focusBeforeChatRef = useRef(null);

    const closeInstructorChat = useCallback((restoreFocus = true) => {
        setInstructorChat(false);

        if (restoreFocus && typeof window !== 'undefined') {
            window.requestAnimationFrame(() => {
                const focusTarget = chatButtonRef.current || focusBeforeChatRef.current;
                focusTarget?.focus?.();
            });
        }
    }, []);

    const toggleInstructorChat = useCallback(() => {
        if (instructorChat) {
            closeInstructorChat();
            return;
        }

        focusBeforeChatRef.current = document.activeElement;
        setInstructorChat(true);
    }, [closeInstructorChat, instructorChat]);

    useEffect(() => {
        if (!instructorChat) return undefined;

        const handleClickOutside = (event) => {
            if (
                chatRef.current &&
                !chatRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                closeInstructorChat(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeInstructorChat, instructorChat]);

    useEffect(() => {
        if (!instructorChat || typeof window === 'undefined') return undefined;

        const focusTimer = window.requestAnimationFrame(() => {
            chatPanelRef.current?.focus();
        });

        return () => window.cancelAnimationFrame(focusTimer);
    }, [instructorChat]);

    useEffect(() => {
        if (!instructorChat) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeInstructorChat();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeInstructorChat, instructorChat]);

    if (!enrolled) return null;

    return (
        <>
            {userRole === 'student' && (
                <div className="fixed top-20 right-4 z-50" ref={buttonRef}>
                    <button
                        ref={chatButtonRef}
                        type="button"
                        className={`instructor-chat-button mt-10 mr-4 flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all shadow-lg hover:shadow-xl ${
                            instructorChat
                                ? 'border-[#FB923C] bg-[#FFF7ED]'
                                : 'border-gray-300 bg-white hover:bg-gray-50 dark:bg-[#1A1A1A]'
                        }`}
                        onClick={toggleInstructorChat}
                        aria-label={
                            instructorChat
                                ? 'Окутуучу менен чатты жабуу'
                                : 'Окутуучу менен чатты ачуу'
                        }
                        aria-expanded={instructorChat}
                        aria-controls="instructor-chat-panel"
                    >
                        <HiChatAlt2 className="w-8 h-8 text-[#EA580C]" aria-hidden="true" />
                    </button>
                </div>
            )}

            {instructorChat && course && (
                <div ref={chatRef} className="fixed top-36 right-4 z-40">
                    <div className="w-[400px] h-[600px]">
                        <div
                            id="instructor-chat-panel"
                            ref={chatPanelRef}
                            role="dialog"
                            aria-modal="false"
                            aria-label="Окутуучу менен чат"
                            tabIndex={-1}
                            className="h-full outline-none"
                        >
                            <InstructorChat course={course} onClose={closeInstructorChat} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

InstructorChatDock.propTypes = {
    enrolled: PropTypes.bool.isRequired,
    userRole: PropTypes.string,
    course: PropTypes.shape({}),
};

export const ActiveLessonRuntime = ({
    activeLesson,
    activeQuiz,
    activeChallenge,
    lessonQuizAnswers,
    lessonQuizResults,
    lessonChallengeCode,
    lessonChallengeResults,
    resumeVideoTime,
    enrolled,
    quizLoading,
    quizSubmitting,
    challengeLoading,
    challengeSubmitting,
    videoRef,
    nextLesson,
    prevLesson,
    onQuizAnswerChange,
    onQuizSubmit,
    onQuizRetake,
    onChallengeCodeChange,
    onChallengeSubmit,
    onVideoProgress,
    onTimeUpdate,
    onPause,
    onEnded,
    onLessonClick,
}) => {
    if (!activeLesson) return null;

    if (activeLesson.kind === 'article') {
        return <ArticleLessonViewer key={activeLesson.id} lesson={activeLesson} />;
    }

    if (activeLesson.kind === 'quiz') {
        return activeQuiz ? (
            <LessonQuizPlayer
                key={activeLesson.id}
                quiz={activeQuiz}
                answers={lessonQuizAnswers[activeLesson.id] || {}}
                onAnswerChange={onQuizAnswerChange}
                onSubmit={onQuizSubmit}
                onRetake={onQuizRetake}
                submitting={quizSubmitting}
                disabled={!enrolled || activeLesson.locked}
                loading={quizLoading && !activeQuiz}
                result={lessonQuizResults[activeLesson.id]}
            />
        ) : (
            <div className="flex justify-center py-10">
                <Loader />
            </div>
        );
    }

    if (activeLesson.kind === 'code') {
        return activeChallenge ? (
            <LessonChallengePlayer
                key={activeLesson.id}
                challenge={activeChallenge}
                code={lessonChallengeCode[activeLesson.id] ?? activeChallenge?.starterCode ?? ''}
                onCodeChange={(newCode) => onChallengeCodeChange(activeLesson.id, newCode)}
                onSubmit={onChallengeSubmit}
                submitting={challengeSubmitting}
                disabled={!enrolled || activeLesson.locked}
                loading={challengeLoading && !activeChallenge}
                result={lessonChallengeResults[activeLesson.id]}
            />
        ) : (
            <div className="flex justify-center py-10">
                <Loader />
            </div>
        );
    }

    return (
        <CourseVideoPlayer
            key={activeLesson.id}
            activeLesson={activeLesson}
            resumeVideoTime={resumeVideoTime}
            handleVideoProgress={(progress) => onVideoProgress(progress, activeLesson)}
            handleTimeUpdate={onTimeUpdate}
            handlePause={onPause}
            videoRef={videoRef}
            nextLesson={nextLesson}
            prevLesson={prevLesson}
            onEnded={onEnded}
            handleLessonClick={onLessonClick}
        />
    );
};

ActiveLessonRuntime.propTypes = {
    activeLesson: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        kind: PropTypes.string,
        locked: PropTypes.bool,
    }),
    activeQuiz: PropTypes.shape({}),
    activeChallenge: PropTypes.shape({
        starterCode: PropTypes.string,
    }),
    lessonQuizAnswers: PropTypes.objectOf(PropTypes.shape({})).isRequired,
    lessonQuizResults: PropTypes.objectOf(PropTypes.shape({})).isRequired,
    lessonChallengeCode: PropTypes.objectOf(PropTypes.string).isRequired,
    lessonChallengeResults: PropTypes.objectOf(PropTypes.shape({})).isRequired,
    resumeVideoTime: PropTypes.number.isRequired,
    enrolled: PropTypes.bool.isRequired,
    quizLoading: PropTypes.bool.isRequired,
    quizSubmitting: PropTypes.bool.isRequired,
    challengeLoading: PropTypes.bool.isRequired,
    challengeSubmitting: PropTypes.bool.isRequired,
    videoRef: PropTypes.shape({
        current: PropTypes.object,
    }).isRequired,
    nextLesson: PropTypes.shape({}),
    prevLesson: PropTypes.shape({}),
    onQuizAnswerChange: PropTypes.func.isRequired,
    onQuizSubmit: PropTypes.func.isRequired,
    onQuizRetake: PropTypes.func.isRequired,
    onChallengeCodeChange: PropTypes.func.isRequired,
    onChallengeSubmit: PropTypes.func.isRequired,
    onVideoProgress: PropTypes.func.isRequired,
    onTimeUpdate: PropTypes.func.isRequired,
    onPause: PropTypes.func.isRequired,
    onEnded: PropTypes.func.isRequired,
    onLessonClick: PropTypes.func.isRequired,
};

export const CourseDetailsJourneyBanner = ({ enrolled, activeLesson, course, lessonCount }) => {
    const title = enrolled ? 'Активдүү окуу режими' : 'Курс менен таанышуу режими';
    const description = enrolled
        ? 'Бул бетте видео, тапшырма, прогресс жана окутуучу менен байланыш окууну улантууга багытталат.'
        : 'Бул бетте программанын мазмуну, окутуучу жана сын-пикирлер курска катталуу чечимин колдойт.';
    const primarySignal = enrolled
        ? activeLesson?.title || activeLesson?.name || 'Кийинки сабакты тандаңыз'
        : `${lessonCount} сабак`;
    const secondarySignal = enrolled
        ? 'Сабак мазмуну жана AI жардамчы enrollment абалына жараша ачылат.'
        : course?.level || course?.category?.name || course?.categoryName || 'Курс маалыматы';

    return (
        <section className="rounded-2xl border border-[#E6E8EC] bg-white px-4 py-3 shadow-sm dark:border-[#2A2E35] dark:bg-[#1A1A1A]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        {enrolled ? 'Окуу режими' : 'Таанышуу режими'}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                        {description}
                    </p>
                </div>
                <div className="grid gap-2 text-sm sm:grid-cols-2 md:min-w-[20rem]">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {enrolled ? 'Учурдагы сабак' : 'Программа'}
                        </p>
                        <p className="mt-1 font-semibold text-gray-900 dark:text-white">{primarySignal}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {enrolled ? 'Жеткиликтүүлүк' : 'Контекст'}
                        </p>
                        <p className="mt-1 font-semibold text-gray-900 dark:text-white">{secondarySignal}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

CourseDetailsJourneyBanner.propTypes = {
    enrolled: PropTypes.bool.isRequired,
    activeLesson: PropTypes.shape({
        title: PropTypes.string,
        name: PropTypes.string,
    }),
    course: PropTypes.shape({
        level: PropTypes.string,
        category: PropTypes.shape({
            name: PropTypes.string,
        }),
        categoryName: PropTypes.string,
    }).isRequired,
    lessonCount: PropTypes.number.isRequired,
};

export const CourseDetailsSidebar = ({
    enrolled,
    tabs,
    activeTab,
    onTabChange,
    sections,
    activeLesson,
    completedLessons,
    lessonRefs,
    maxHeight,
    onLessonClick,
    onCheckboxToggle,
    isAiAvailable,
    assistantAvailableMessage,
    courseId,
    languageCode,
    course,
    lessonCount,
    reviewNode,
}) => {
    const renderTabButtons = () => (
        <div className="flex flex-wrap gap-2 dark:bg-white/10 bg-gray-100 rounded-2xl p-1">
            {tabs?.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab)}
                    className={`flex-1 min-w-[140px] px-4 py-2 rounded-xl text-sm font-medium transition ${
                        activeTab === tab.id
                            ? 'dark:bg-[#222222] bg-white text-gray-900 dark:text-[#E8ECF3] shadow'
                            : 'text-gray-600 dark:text-[#a6adba]'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );

    return (
        <div
            className="hidden lg:block lg:col-span-1"
            data-support-placement={
                enrolled
                    ? COURSE_DETAILS_SUPPORT_PLACEMENT.ENROLLED.desktop.join(' ')
                    : COURSE_DETAILS_SUPPORT_PLACEMENT.PROSPECT.desktop.join(' ')
            }
        >
            <div className="space-y-6 sticky top-6">
                {enrolled ? (
                    <div className="bg-white dark:bg-[#1A1A1A] p-5 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-[#E6E8EC] dark:border-[#2A2E35]">
                        <div className="mb-5">{renderTabButtons()}</div>
                        {activeTab === 'program' ? (
                            <CourseContent
                                sections={sections}
                                enrolled={enrolled}
                                onLessonClick={onLessonClick}
                                activeLesson={activeLesson}
                                completedLessons={completedLessons}
                                lessonRefs={lessonRefs}
                                showHeader={false}
                                handleCheckboxToggle={onCheckboxToggle}
                                maxHeight={maxHeight}
                                presentationVariant="learning"
                            />
                        ) : (
                            <div className="bg-white">
                                {isAiAvailable ? (
                                    <AiAssistantPanel
                                        courseId={Number(courseId)}
                                        languageCode={languageCode}
                                    />
                                ) : (
                                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm p-4">
                                        {assistantAvailableMessage}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <CardVideo
                            key={courseId}
                            course={course}
                            lessonCount={lessonCount}
                            coverImageUrl={course.coverImageUrl}
                        />
                        {reviewNode}
                    </>
                )}
            </div>
        </div>
    );
};

CourseDetailsSidebar.propTypes = {
    enrolled: PropTypes.bool.isRequired,
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    activeTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
    sections: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    activeLesson: PropTypes.shape({}),
    completedLessons: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))
        .isRequired,
    lessonRefs: PropTypes.shape({
        current: PropTypes.object,
    }).isRequired,
    maxHeight: PropTypes.string,
    onLessonClick: PropTypes.func.isRequired,
    onCheckboxToggle: PropTypes.func.isRequired,
    isAiAvailable: PropTypes.bool.isRequired,
    assistantAvailableMessage: PropTypes.string.isRequired,
    courseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    languageCode: PropTypes.string,
    course: PropTypes.shape({
        coverImageUrl: PropTypes.string,
    }).isRequired,
    lessonCount: PropTypes.number.isRequired,
    reviewNode: PropTypes.node.isRequired,
};

export const CourseDetailsMobileArea = ({
    isDesktop,
    enrolled,
    activeLessonRuntime,
    courseId,
    sections,
    activeLesson,
    completedLessons,
    lessonRefs,
    onLessonClick,
    onCheckboxToggle,
    course,
    lessonCount,
    resumeVideoTime,
    onVideoProgress,
    onTimeUpdate,
    onPause,
    videoRef,
    onEnded,
    publicInfoNode,
    instructorNode,
    reviewNode,
}) => {
    if (isDesktop) return null;

    if (enrolled) {
        return (
            <div
                className="space-y-6"
                data-support-placement={COURSE_DETAILS_SUPPORT_PLACEMENT.ENROLLED.mobile.join(' ')}
            >
                {activeLessonRuntime}
                <CourseContent
                    courseId={courseId}
                    sections={sections}
                    enrolled={enrolled}
                    onLessonClick={onLessonClick}
                    activeLesson={activeLesson}
                    completedLessons={completedLessons}
                    lessonRefs={lessonRefs}
                    handleCheckboxToggle={onCheckboxToggle}
                    presentationVariant="learning"
                />
                {instructorNode}
                {reviewNode}
                <Comment courseId={courseId} />
            </div>
        );
    }

    return (
        <div
            className="space-y-6"
            data-support-placement={COURSE_DETAILS_SUPPORT_PLACEMENT.PROSPECT.mobile.join(' ')}
        >
            <CardVideo
                key={courseId}
                course={course}
                lessonCount={lessonCount}
                coverImageUrl={course.coverImageUrl}
                resumeVideoTime={resumeVideoTime}
                handleVideoProgress={(progress) => onVideoProgress(progress, activeLesson)}
                handleTimeUpdate={onTimeUpdate}
                handlePause={onPause}
                videoRef={videoRef}
                onEnded={onEnded}
            />
            {publicInfoNode}
        </div>
    );
};

CourseDetailsMobileArea.propTypes = {
    isDesktop: PropTypes.bool.isRequired,
    enrolled: PropTypes.bool.isRequired,
    activeLessonRuntime: PropTypes.node,
    courseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    sections: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    activeLesson: PropTypes.shape({}),
    completedLessons: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))
        .isRequired,
    lessonRefs: PropTypes.shape({
        current: PropTypes.object,
    }).isRequired,
    onLessonClick: PropTypes.func.isRequired,
    onCheckboxToggle: PropTypes.func.isRequired,
    course: PropTypes.shape({
        coverImageUrl: PropTypes.string,
    }).isRequired,
    lessonCount: PropTypes.number.isRequired,
    resumeVideoTime: PropTypes.number.isRequired,
    onVideoProgress: PropTypes.func.isRequired,
    onTimeUpdate: PropTypes.func.isRequired,
    onPause: PropTypes.func.isRequired,
    videoRef: PropTypes.shape({
        current: PropTypes.object,
    }).isRequired,
    onEnded: PropTypes.func.isRequired,
    publicInfoNode: PropTypes.node.isRequired,
    instructorNode: PropTypes.node.isRequired,
    reviewNode: PropTypes.node.isRequired,
};

export const CourseDetailsMainArea = ({
    isDesktop,
    enrolled,
    videoContainerRef,
    activeLessonRuntime,
    publicInfoNode,
}) => {
    if (!isDesktop) return null;

    return (
        <div className="lg:col-span-2">
            {enrolled ? (
                <div className="space-y-8" ref={videoContainerRef}>
                    {activeLessonRuntime}
                </div>
            ) : (
                <div className="space-y-8">{publicInfoNode}</div>
            )}
        </div>
    );
};

CourseDetailsMainArea.propTypes = {
    isDesktop: PropTypes.bool.isRequired,
    enrolled: PropTypes.bool.isRequired,
    videoContainerRef: PropTypes.shape({
        current: PropTypes.object,
    }).isRequired,
    activeLessonRuntime: PropTypes.node,
    publicInfoNode: PropTypes.node.isRequired,
};

export const EnrolledCourseSupport = ({ enrolled, instructorNode, reviewNode, courseId }) => {
    if (!enrolled) return null;

    return (
        <>
            <div
                className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6"
                data-support-placement="below-runtime-instructor-review"
            >
                <div className="lg:col-span-2">{instructorNode}</div>
                <div className="lg:col-span-1">{reviewNode}</div>
            </div>

            <div className="pt-6" data-support-placement="below-runtime-discussion">
                <Comment courseId={courseId} />
            </div>
        </>
    );
};

EnrolledCourseSupport.propTypes = {
    enrolled: PropTypes.bool.isRequired,
    instructorNode: PropTypes.node.isRequired,
    reviewNode: PropTypes.node.isRequired,
    courseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export const CourseDetailsErrorState = ({ message }) => (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-[#222222]">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-100">
            <h1 className="text-2xl font-bold">Курс жүктөлгөн жок</h1>
            <p className="mt-3 text-sm leading-6">{message}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                    Кайра аракет кылуу
                </button>
                <Link
                    to="/courses"
                    className="rounded-lg border border-red-300 px-4 py-2 text-center text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:text-red-100"
                >
                    Курстарга кайтуу
                </Link>
            </div>
        </div>
    </main>
);

CourseDetailsErrorState.propTypes = {
    message: PropTypes.string.isRequired,
};

export const CourseDetailsNotFoundState = () => (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-[#222222]">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-gray-50 p-6 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
            <h1 className="text-2xl font-bold">Курс табылган жок</h1>
            <p className="mt-3 text-sm leading-6">
                Бул курс өчүрүлгөн, жашырылган же шилтемеси туура эмес болушу мүмкүн.
            </p>
            <Link
                to="/courses"
                className="mt-6 inline-flex rounded-lg bg-edubot-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
                Курстарды көрүү
            </Link>
        </div>
    </main>
);
