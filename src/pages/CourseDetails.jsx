import { useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import Loader from '@shared/ui/Loader';
import SectionContainer from '@features/marketing/components/SectionContainer';
import ExternalResourceCard from '@features/externalResources/components/ExternalResourceCard';
import { fetchResourcesByCourse } from '@features/externalResources/api';
import { useCourseDetailsController } from '@features/courses/course-details/useCourseDetailsRuntime';
import {
    ActiveLessonRuntime,
    CourseDetailsErrorState,
    CourseDetailsMainArea,
    CourseDetailsMobileArea,
    CourseDetailsNotFoundState,
    CourseDetailsJourneyBanner,
    CourseDetailsSidebar,
    EnrolledCourseSupport,
    InstructorChatDock,
} from '@features/courses/course-details/CourseDetailsView';
import {
    renderCourseReview,
    renderInstructorInfo,
    renderPublicCourseInfo,
} from '@features/courses/course-details/courseDetailsRenderers';

const CourseDetailsPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { user } = useContext(AuthContext);
    const { t } = useTranslation();
    const {
        activeChallenge,
        activeLesson,
        activeQuiz,
        activeTab,
        autoPlayActiveLesson,
        assistantAvailableMessage,
        challengeLoading,
        challengeSubmitting,
        completedLessons,
        course,
        enrolled,
        error,
        handleChallengeCodeChange,
        handleChallengeSubmit,
        handleCheckboxToggle,
        handleEnded,
        handleLessonClick,
        handlePause,
        handleQuizAnswerChange,
        handleQuizRetake,
        handleQuizSubmit,
        handleTabChange,
        handleTimeUpdate,
        handleVideoProgress,
        isAiAvailable,
        isDesktop,
        lessonChallengeCode,
        lessonChallengeResults,
        lessonCount,
        lessonQuizAnswers,
        lessonQuizResults,
        lessonRefs,
        loading,
        nextLesson,
        prevLesson,
        quizLoading,
        quizSubmitting,
        resumeVideoTime,
        sections,
        tabs,
        videoRef,
    } = useCourseDetailsController({ courseId: id, searchParams, user });

    const [linkedResources, setLinkedResources] = useState(null);

    useEffect(() => {
        if (!id) return;
        setLinkedResources(null); // clear stale data from previous course immediately
        fetchResourcesByCourse(id)
            .then((data) => setLinkedResources(data))
            .catch(() => setLinkedResources(null));
    }, [id]);

    if (loading) return <Loader fullScreen />;
    if (error) return <CourseDetailsErrorState message={error} />;
    if (!course) return <CourseDetailsNotFoundState />;

    const relatedResources = (linkedResources ?? []).map((r) => ({
        ...r,
        ctaLabel: t('public.externalResources.courseDetailCta'),
    }));

    const activeLessonRuntime = (
        <ActiveLessonRuntime
            activeLesson={activeLesson}
            activeQuiz={activeQuiz}
            activeChallenge={activeChallenge}
            lessonQuizAnswers={lessonQuizAnswers}
            lessonQuizResults={lessonQuizResults}
            lessonChallengeCode={lessonChallengeCode}
            lessonChallengeResults={lessonChallengeResults}
            resumeVideoTime={resumeVideoTime}
            enrolled={enrolled}
            quizLoading={quizLoading}
            quizSubmitting={quizSubmitting}
            challengeLoading={challengeLoading}
            challengeSubmitting={challengeSubmitting}
            videoRef={videoRef}
            nextLesson={nextLesson}
            prevLesson={prevLesson}
            autoPlayActiveLesson={autoPlayActiveLesson}
            onQuizAnswerChange={handleQuizAnswerChange}
            onQuizSubmit={handleQuizSubmit}
            onQuizRetake={handleQuizRetake}
            onChallengeCodeChange={handleChallengeCodeChange}
            onChallengeSubmit={handleChallengeSubmit}
            onVideoProgress={handleVideoProgress}
            onTimeUpdate={handleTimeUpdate}
            onPause={handlePause}
            onEnded={handleEnded}
            onLessonClick={handleLessonClick}
        />
    );
    const instructorNode = renderInstructorInfo(course);
    const reviewNode = renderCourseReview(course, id);
    const publicInfoNode = renderPublicCourseInfo(course, id, sections);
    const desktopPublicInfoNode = renderPublicCourseInfo(course, id, sections);

    return (
        <div className="min-h-screen pt-10 bg-[#f8f9fb] dark:bg-[#1A1A1A]">
            <InstructorChatDock enrolled={enrolled} userRole={user?.role} course={course} />
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                <CourseDetailsJourneyBanner
                    enrolled={enrolled}
                    activeLesson={activeLesson}
                    course={course}
                    lessonCount={lessonCount}
                />
                <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
                    <CourseDetailsMobileArea
                        isDesktop={isDesktop}
                        enrolled={enrolled}
                        activeLessonRuntime={activeLessonRuntime}
                        courseId={id}
                        sections={sections}
                        activeLesson={activeLesson}
                        completedLessons={completedLessons}
                        lessonRefs={lessonRefs}
                        onLessonClick={handleLessonClick}
                        onCheckboxToggle={handleCheckboxToggle}
                        course={course}
                        lessonCount={lessonCount}
                        resumeVideoTime={resumeVideoTime}
                        onVideoProgress={handleVideoProgress}
                        onTimeUpdate={handleTimeUpdate}
                        onPause={handlePause}
                        videoRef={videoRef}
                        onEnded={handleEnded}
                        publicInfoNode={publicInfoNode}
                        instructorNode={instructorNode}
                        reviewNode={reviewNode}
                    />
                    <CourseDetailsMainArea
                        isDesktop={isDesktop}
                        enrolled={enrolled}
                        activeLessonRuntime={activeLessonRuntime}
                        publicInfoNode={desktopPublicInfoNode}
                    />
                    <CourseDetailsSidebar
                        enrolled={enrolled}
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        sections={sections}
                        activeLesson={activeLesson}
                        completedLessons={completedLessons}
                        lessonRefs={lessonRefs}
                        onLessonClick={handleLessonClick}
                        onCheckboxToggle={handleCheckboxToggle}
                        isAiAvailable={isAiAvailable}
                        assistantAvailableMessage={assistantAvailableMessage}
                        courseId={id}
                        languageCode={course.languageCode}
                        course={course}
                        lessonCount={lessonCount}
                    />
                </div>

                <EnrolledCourseSupport
                    enrolled={enrolled}
                    instructorNode={instructorNode}
                    reviewNode={reviewNode}
                    courseId={id}
                />

                {relatedResources.length > 0 && (
                    <SectionContainer
                        title={t('public.externalResources.coursesSectionTitle')}
                        subtitle={t('public.externalResources.courseDetailSectionSubtitle')}
                        rightContent={
                            <Link
                                to="/resources"
                                className="text-sm font-medium text-[#E14219] hover:underline"
                            >
                                {t('public.externalResources.viewAll')} →
                            </Link>
                        }
                        items={relatedResources}
                        CardComponent={ExternalResourceCard}
                    />
                )}
            </div>
        </div>
    );
};

export default CourseDetailsPage;
