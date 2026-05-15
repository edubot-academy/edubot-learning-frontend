import CourseDescription from '@features/courses/components/CourseDescription';
import InstructorsInfo from '@features/courses/components/InstructorsInfo';
import CourseReview from '@features/courses/components/CourseReview';
import CourseContent from '@features/courses/components/CourseContent';

export const renderInstructorInfo = (course, options = {}) => (
    <InstructorsInfo
        instructorData={course.instructor}
        ratingAverage={course.ratingAverage}
        ratingCount={course.ratingCount}
        priority={Boolean(options.priority)}
    />
);

export const renderCourseReview = (course, courseId) => (
    <CourseReview
        courseId={courseId}
        ratingAverage={course.ratingAverage}
        ratingCount={course.ratingCount}
        ratingBreakdown={course?.ratingBreakdown}
    />
);

export const renderPublicCourseInfo = (course, courseId, sections, { includeReview = true } = {}) => (
    <>
        <CourseDescription course={course} />
        {renderInstructorInfo(course, { priority: true })}
        <CourseContent courseId={courseId} sections={sections} presentationVariant="prospect" />
        {includeReview ? renderCourseReview(course, courseId) : null}
    </>
);
