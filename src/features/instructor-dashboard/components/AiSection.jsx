import { Link } from 'react-router-dom';
import InstructorStatCard from './InstructorStatCard.jsx';
import InstructorEmptyState from './InstructorEmptyState.jsx';

const AiSection = ({ aiCourses, totalCourses }) => (
    <div className="rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
                <h2 className="text-2xl font-semibold">EDU AI ассистент</h2>
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                    Курстарыңызда AI жардамчыны кантип колдонуп жатканыңызды көзөмөлдөңүз.
                </p>
            </div>

            <Link
                to="/instructor/courses"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
            >
                AI жөндөөлөрүнө өтүү
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InstructorStatCard label="AI активдүү курстар" value={aiCourses.length} />
            <InstructorStatCard label="Жалпы курстар" value={totalCourses} />
            <InstructorStatCard label="AI жабдылбаган курстар" value={totalCourses - aiCourses.length} />
        </div>

        {aiCourses.length ? (
            <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                    AI жардамчысы иштетилген курстар
                </p>

                {aiCourses.map((course) => (
                    <div
                        key={course.id}
                        className="flex items-center justify-between gap-3 border border-gray-200 rounded-2xl px-4 py-3"
                    >
                        <div>
                            <p className="font-semibold">{course.title}</p>
                            <p className="text-xs text-gray-500 dark:text-[#a6adba]">
                                {course.updatedAt
                                    ? `Жаңыртылды: ${new Date(course.updatedAt).toLocaleDateString()}`
                                    : 'Жаңыртуу маалыматы жок'}
                            </p>
                        </div>

                        <Link
                            to={`/instructor/courses/edit/${course.id}`}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Өзгөртүү
                        </Link>
                    </div>
                ))}
            </div>
        ) : (
            <InstructorEmptyState
                title="AI ассистенти иштетилген курс жок"
                description="Курс редакторунда AI ассистентти активдештирип, студенттерге реалдуу убакыттагы жардам сунуштаңыз."
                actionLabel="Курс түзүү"
                actionLink="/instructor/course/create"
            />
        )}

        <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl p-4 text-sm text-gray-700">
            <p className="font-semibold">Кантип пайдалансам болот?</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Курс редакторунда AI ассистентти активдештириңиз.</li>
                <li>Админ панелинен жеке промптторду кошуңуз.</li>
                <li>Студенттерге AI чат аркылуу суроолорун тез берүү мүмкүнчүлүгүн түзүңүз.</li>
            </ul>
        </div>
    </div>
);

export default AiSection;
