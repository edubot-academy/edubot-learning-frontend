import React from "react";
import { useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const coursesData = [
    {
        id: 1,
        title: "Web Development Masterclass",
        instructor: "John Doe",
        duration: "10 hours",
        level: "Beginner",
        price: 19.99,
        rating: 4.8,
        videoPreview: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        curriculum: [
            "Introduction to Web Development",
            "HTML & CSS Basics",
            "JavaScript Fundamentals",
            "Building Responsive Websites",
            "Introduction to React.js",
            "Final Project",
        ],
        reviews: [
            { user: "Alice", rating: 5, comment: "Amazing course! Learned so much." },
            { user: "Bob", rating: 4, comment: "Great explanations, but could use more projects." },
        ],
    },
    {
        id: 2,
        title: "Data Science Bootcamp",
        instructor: "Jane Smith",
        duration: "12 hours",
        level: "Intermediate",
        price: 29.99,
        rating: 4.7,
        videoPreview: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        curriculum: [
            "Introduction to Data Science",
            "Python for Data Analysis",
            "Machine Learning Basics",
            "Deep Learning Introduction",
            "Data Visualization Techniques",
            "Capstone Project",
        ],
        reviews: [
            { user: "Charlie", rating: 5, comment: "Best course on Data Science!" },
            { user: "David", rating: 4, comment: "Informative but needs more real-world projects." },
        ],
    },
    {
        id: 3,
        title: "Machine Learning Fundamentals",
        instructor: "Michael Lee",
        duration: "15 hours",
        level: "Advanced",
        price: 39.99,
        rating: 4.9,
        videoPreview: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        curriculum: [
            "Introduction to Machine Learning",
            "Supervised vs Unsupervised Learning",
            "Feature Engineering",
            "Model Evaluation Techniques",
            "Building Neural Networks",
            "Final Project",
        ],
        reviews: [
            { user: "Emma", rating: 5, comment: "Fantastic course with in-depth explanations!" },
            { user: "Liam", rating: 4, comment: "Great course, but would love more coding examples." },
        ],
    }
];

const CourseDetailsPage = () => {
    const { id } = useParams();
    const course = coursesData.find((c) => c.id === parseInt(id));

    if (!course) {
        return <div className="text-center text-red-600 text-2xl mt-10">Course Not Found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-24 max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-center">{course.title}</h1>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-2/3">
                    <iframe
                        className="w-full h-64 md:h-96 rounded-lg shadow-lg"
                        src={course.videoPreview}
                        title="Course Preview"
                        allowFullScreen
                    ></iframe>
                </div>
                <div className="md:w-1/3 bg-white p-6 rounded-lg shadow-md">
                    <p className="text-gray-700 text-lg mb-2"><strong>Instructor:</strong> {course.instructor}</p>
                    <p className="text-gray-700 text-lg mb-2"><strong>Duration:</strong> {course.duration}</p>
                    <p className="text-gray-700 text-lg mb-2"><strong>Level:</strong> {course.level}</p>
                    <div className="flex items-center text-yellow-500 my-2">
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < Math.floor(course.rating) ? "text-lg" : "text-lg text-gray-300"} />
                        ))}
                        <span className="text-gray-600 text-sm ml-2">({course.rating})</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mb-4">${course.price}</p>
                    <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-bold hover:bg-blue-700 transition">
                        Enroll Now
                    </button>
                </div>
            </div>
            <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Curriculum</h2>
                <ul className="list-disc pl-5 text-gray-700">
                    {course.curriculum.map((lesson, index) => (
                        <li key={index} className="mb-2">{lesson}</li>
                    ))}
                </ul>
            </div>
            <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
                {course.reviews.map((review, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md mb-3">
                        <p className="font-semibold">{review.user}</p>
                        <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={i < review.rating ? "text-lg" : "text-lg text-gray-300"} />
                            ))}
                        </div>
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseDetailsPage;