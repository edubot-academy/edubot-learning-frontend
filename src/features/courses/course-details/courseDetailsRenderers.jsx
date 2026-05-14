import CourseDescription from '@features/courses/components/CourseDescription';
import InstructorsInfo from '@features/courses/components/InstructorsInfo';
import CourseReview from '@features/courses/components/CourseReview';
import CourseContent from '@features/courses/components/CourseContent';

export const renderInstructorInfo = (course) => (
    <InstructorsInfo
        instructorData={course.instructor}
        ratingAverage={course.ratingAverage}
        ratingCount={course.ratingCount}
    />
);

export const renderCourseReview = (course) => (
    <CourseReview
        ratingAverage={course.ratingAverage}
        ratingCount={course.ratingCount}
        ratingBreakdown={course?.ratingBreakdown}
    />
);

export const renderPublicCourseInfo = (course, courseId, sections, { includeReview = true } = {}) => (
    <>
        <CourseDescription course={course} />
        {renderInstructorInfo(course)}
        <CourseContent courseId={courseId} sections={sections} presentationVariant="prospect" />
        {includeReview ? renderCourseReview(course) : null}
    </>
);
