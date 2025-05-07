import React, { useState, useEffect } from "react";
import { getVideoDuration } from "../utils/videoUtils";
import { fetchCourses, fetchSections, updateLessonDuration } from "../services/api";
import toast from "react-hot-toast";

const AdminBackfillLessonDurations = () => {
    const [processing, setProcessing] = useState(false);
    const [log, setLog] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    useEffect(() => {
        fetchCourses().then((data) => {
            setCourses(data.courses);
        });
    }, []);

    const logMessage = (msg) => setLog((prev) => [...prev, msg]);

    const backfill = async () => {
        if (!selectedCourseId) {
            toast.error("Please select a course.");
            return;
        }

        setProcessing(true);
        setLog(["🔍 Scanning lessons for selected course..."]);

        try {
            const course = courses.find((c) => c.id === selectedCourseId);
            if (!course) {
                toast.error("Selected course not found.");
                return;
            }

            logMessage(`📘 Course: ${course.title}`);
            const sections = await fetchSections(course.id);

            for (const section of sections) {
                for (const lesson of section.lessons || []) {
                    if (lesson.duration && lesson.duration > 0) {
                        logMessage(`✅ Skipping (has duration): ${lesson.title}`);
                        continue;
                    }

                    if (!lesson.videoUrl) {
                        logMessage(`⚠️ No videoUrl for: ${lesson.title}`);
                        continue;
                    }

                    try {
                        const res = await fetch(lesson.videoUrl);
                        const blob = await res.blob();
                        const file = new File([blob], "video.mp4", { type: blob.type });

                        const duration = await getVideoDuration(file);

                        if (duration > 0) {
                            await updateLessonDuration(course.id, section.id, lesson.id, duration);
                            logMessage(`✅ Updated: ${lesson.title} → ${duration.toFixed(2)}s`);
                        } else {
                            logMessage(`⚠️ Invalid duration for: ${lesson.title}`);
                        }
                    } catch (err) {
                        logMessage(`❌ Failed to process: ${lesson.title}`);
                        console.warn(err);
                    }
                }
            }

            toast.success("Course lessons processed!");
        } catch (err) {
            toast.error("Error while processing lessons.");
            console.error(err);
        }

        setProcessing(false);
    };

    return (
        <div className="max-w-4xl mx-auto mt-20 p-6 bg-white shadow-lg rounded">
            <h2 className="text-2xl font-bold mb-4">🛠️ Backfill Lesson Durations</h2>
            <p className="mb-4 text-gray-600">
                This tool scans a selected course and adds duration to lessons if missing (via video metadata).
            </p>

            <select
                value={selectedCourseId || ""}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                className="mb-4 p-2 border rounded"
            >
                <option value="">📘 Select a course</option>
                {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                ))}
            </select>

            <button
                onClick={backfill}
                disabled={processing || !selectedCourseId}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {processing ? "Processing..." : "Start Backfill"}
            </button>

            <div className="mt-6 max-h-80 overflow-y-auto border border-gray-200 rounded p-3 text-sm font-mono bg-gray-50">
                {log.map((line, idx) => (
                    <div key={idx} className="mb-1 whitespace-pre-wrap">{line}</div>
                ))}
            </div>
        </div>
    );
};

export default AdminBackfillLessonDurations;
