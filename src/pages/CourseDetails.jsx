import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import {
  fetchCourseDetails,
  fetchSections,
  markLessonComplete,
  fetchUserProgress,
  updateLastViewedLesson,
  getLastViewedLesson,
  getVideoTime,
  updateVideoTime,
  fetchEnrollment,
} from "../services/api";
import { AuthContext } from "../context/AuthContext";
// import CourseSidebar from "../components/CourseSidebar"; // <-- импорт компонента боковой панели курса
import CourseHeader from "../components/CourseHeader";
import CourseVideoPlayer from "../components/CourseVideoPlayer";

const CourseDetailsPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const activeLessonRef = useRef(null);
  const [lastViewedLessonId, setLastViewedLessonId] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [resumeVideoTime, setResumeVideoTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const lessonRefs = useRef({});
  const videoRef = useRef(null);
  const hasPlayedRef = useRef(false);
  const [shouldScrollToLesson, setShouldScrollToLesson] = useState(true);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    hasPlayedRef.current = false;
  }, [activeLesson]);

  useEffect(() => {
    activeLessonRef.current = activeLesson;
  }, [activeLesson]);

  const scrollToLesson = (lessonId) => {
    if (!shouldScrollToLesson) return;

    setTimeout(() => {
      const el = lessonRefs.current[lessonId];
      if (el) {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isVisible) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 100);
  };

  const debouncedTimeUpdate = useCallback(
    debounce((time) => {
      if (user && enrolled && activeLessonRef.current?.id) {
        updateVideoTime({
          courseId: Number(id),
          lessonId: activeLessonRef.current.id,
          time,
        });
      }
    }, 3000),
    [id, user, enrolled]
  );

  const handleTimeUpdate = (time) => {
    if (user && enrolled) {
      debouncedTimeUpdate(time);
    }
  };

  const handlePause = () => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    if (currentTime < (activeLessonRef.current?.duration ?? 9999) * 0.9) return;
    if (user && enrolled) {
      updateVideoTime({
        courseId: Number(id),
        lessonId: activeLessonRef.current.id,
        time: currentTime,
      });
    }
  };

  // ------------------ CourseSidebar: handle lesson click ------------------
  const handleLessonClick = async (lesson) => {
    // Закомментирован код, если нужно включить — раскомментируй
    // setActiveLesson(lesson);
    // localStorage.setItem(`active_section_${id}`, String(lesson.sectionId));
    // setActiveSectionId(lesson.sectionId);
    // scrollToLesson(lesson.id);
    // setTimeout(() => {
    //   if (videoRef.current) {
    //     videoRef.current.load();
    //     if (!hasPlayedRef.current) {
    //       videoRef.current
    //         .play()
    //         .catch((err) => console.warn("Autoplay failed:", err));
    //     }
    //   }
    // }, 0);
    // if (user && enrolled && !lesson.locked) {
    //   await updateLastViewedLesson({
    //     courseId: Number(id),
    //     lessonId: lesson.id,
    //   });
    //   const videoTime = await getVideoTime(id, lesson.id);
    //   if (
    //     videoTime?.time &&
    //     videoTime.time < (lesson.duration || 9999) * 0.95 &&
    //     !completedLessons.includes(lesson.id)
    //   ) {
    //     setResumeVideoTime(videoTime.time);
    //   } else {
    //     setResumeVideoTime(0);
    //   }
    // }
  };

  const findPrevNextLessons = () => {
    const flatLessons = sections.flatMap((sec) => sec.lessons || []);
    const index = flatLessons.findIndex((l) => l.id === activeLesson?.id);
    const prev = flatLessons[index - 1];
    const next = flatLessons[index + 1];
    return { prev, next };
  };

  const handleEnded = async () => {
    if (!hasPlayedRef.current) return;
    if (user && enrolled && activeLesson) {
      const resp = await markLessonComplete(
        Number(id),
        activeLesson.sectionId,
        activeLesson.id
      );
      if (resp.completed) {
        setCompletedLessons((prev) => [...new Set([...prev, activeLesson.id])]);
      }
    }
    const { next } = findPrevNextLessons();
    if (next) handleLessonClick(next);
  };

  const handleVideoProgress = useCallback(
    async (progress, lessonParam) => {
      if (!hasPlayedRef.current && progress > 0) {
        hasPlayedRef.current = true;
      }
      if (
        enrolled &&
        lessonParam.id === activeLessonRef.current?.id &&
        hasPlayedRef.current &&
        progress >= 95 &&
        lessonParam.duration &&
        !completedLessons.includes(lessonParam.id)
      ) {
        const resp = await markLessonComplete(
          Number(id),
          lessonParam.sectionId,
          lessonParam.id
        );
        if (resp.completed) {
          setCompletedLessons((prev) => [
            ...new Set([...prev, lessonParam.id]),
          ]);
        }
      }
    },
    [id, enrolled, completedLessons]
  );

  // ------------------ CourseSidebar: checkbox toggle ------------------
  // const handleCheckboxToggle = async (lesson) => {
  //   if (!enrolled) return;
  //   const response = await markLessonComplete(id, lesson.sectionId, lesson.id);
  //   if (response.completed) {
  //     setCompletedLessons((prev) => [...new Set([...prev, lesson.id])]);
  //   } else {
  //     await updateVideoTime({
  //       courseId: Number(id),
  //       lessonId: lesson.id,
  //       time: 0,
  //     });
  //     if (activeLesson?.id === lesson.id) {
  //       setResumeVideoTime(0);
  //     }
  //     setCompletedLessons((prev) => prev.filter((lId) => lId !== lesson.id));
  //   }
  // };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        let enrollment = { enrolled: false };
        if (user) {
          if (user.role === "student") {
            enrollment = await fetchEnrollment(id, user.id);
          } else enrollment = { enrolled: true };
        }
        setEnrolled(enrollment.enrolled);

        const data = await fetchCourseDetails(id);
        setCourse(data);
        const sectionData = await fetchSections(id);

        const updatedSections = sectionData.map((sec) => ({
          ...sec,
          lessons: sec.lessons
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((lesson) => ({
              ...lesson,
              sectionId: sec.id,
              locked: !enrollment.enrolled && !lesson.previewVideo,
            })),
        }));

        setSections(updatedSections.sort((a, b) => a.order - b.order));

        if (enrollment.enrolled && user) {
          const progress = await fetchUserProgress(id);
          setCompletedLessons(progress.completedLessonIds || []);
        }

        let lastLesson = null;
        if (user && enrollment.enrolled) {
          const lastViewed = await getLastViewedLesson(id);
          if (lastViewed?.lessonId) {
            setLastViewedLessonId(lastViewed.lessonId);
            for (let sec of updatedSections) {
              for (let lesson of sec.lessons || []) {
                if (lesson.id === lastViewed.lessonId) {
                  lastLesson = lesson;
                  break;
                }
              }
              if (lastLesson) break;
            }
          }
        }

        if (!lastLesson) {
          for (let sec of updatedSections) {
            for (let lesson of sec.lessons || []) {
              if (completedLessons.includes(lesson.id)) {
                lastLesson = lesson;
              }
            }
          }
        }

        if (!lastLesson && updatedSections.length > 0) {
          lastLesson = updatedSections[0].lessons?.[0];
        }

        if (lastLesson?.id) {
          setActiveLesson(lastLesson);
          setActiveSectionId(lastLesson.sectionId);
          localStorage.setItem(
            `active_section_${id}`,
            String(lastLesson.sectionId)
          );
          scrollToLesson(lastLesson.id);
          if (user && enrollment.enrolled && !lastLesson.locked) {
            const videoTime = await getVideoTime(id, lastLesson.id);
            setResumeVideoTime(
              videoTime?.time &&
                videoTime.time < 0.95 * (lastLesson.duration || 9999)
                ? videoTime.time
                : 0
            );
          }
        }

        if (!lastLesson) {
          const storedSection = localStorage.getItem(`active_section_${id}`);
          setActiveSectionId(
            storedSection ? Number(storedSection) : updatedSections[0]?.id
          );
        }
      } catch (err) {
        setError(err.message || "Курс жүктөлбөй калды.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user]);

  if (loading) return <div>Жүктөлүүдө...</div>;
  if (error) return <div>Ката: {error}</div>;
  if (!course) return <div>Курс табылган жок</div>;

  const { prev: prevLesson, next: nextLesson } = findPrevNextLessons();
  const totalLessons = sections.reduce(
    (count, sec) => count + (sec.lessons?.length || 0),
    0
  );
  const progress = Math.round((completedLessons.length / totalLessons) * 100);

  const changPaid = () => setPaid(!paid);

  return (
    <div className="min-h-screen pt-24">
      <button onClick={changPaid}>tap</button>
      {paid ? (
        <CourseHeader course={course} progress={progress} enrolled={enrolled} />
      ) : (
        <div className="max-w-6xl mx-auto p-6">
          {/* ИЗМЕНЕНИЕ: Заменил grid на flex-col для центрирования */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-4xl">
              {activeLesson?.videoUrl && (
                <CourseVideoPlayer
                  key={activeLesson.id}
                  activeLesson={activeLesson}
                  resumeVideoTime={resumeVideoTime}
                  handleVideoProgress={(progress) =>
                    handleVideoProgress(progress, activeLesson)
                  }
                  handleTimeUpdate={handleTimeUpdate}
                  handlePause={handlePause}
                  videoRef={videoRef}
                  nextLesson={nextLesson}
                  prevLesson={prevLesson}
                  onEnded={handleEnded}
                  handleLessonClick={handleLessonClick}
                />
              )}
            </div>

            {/* Когда добавишь CourseSidebar обратно: */}
            {/* 
              <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mt-6">
                <div className="lg:w-2/3">
                  <CourseVideoPlayer ... />
                </div>
                <div className="lg:w-1/3">
                  <CourseSidebar ... />
                </div>
              </div>
              */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
