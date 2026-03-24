import { Link } from 'react-router-dom';

const StudentEmptyState = () => (
    <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xl">
            !
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                Окуу мүмкүнчүлүгү азырынча активдүү эмес
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Сизде азырынча активдүү курс жок. Төлөм ырасталгандан же каттоо иштетилгенден кийин
                бул жерде курстарыңыз, сабактарыңыз жана прогрессиңиз көрүнөт.
            </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
                to="/catalog"
                className="inline-flex px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
            >
                Видео курстарды көрүү
            </Link>
            <Link
                to="/student?tab=profile"
                className="inline-flex px-4 py-2 rounded-full border text-sm text-gray-700 dark:text-gray-300 dark:border-gray-700"
            >
                Профилди ачуу
            </Link>
        </div>
    </div>
);

export default StudentEmptyState;
