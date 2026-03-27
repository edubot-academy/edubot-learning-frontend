import { Link } from 'react-router-dom';
import { FiAlertCircle, FiBookOpen, FiUser } from 'react-icons/fi';

const StudentEmptyState = () => (
    <div className="dashboard-panel relative overflow-hidden px-8 py-12 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(241,126,34,0.12),transparent_42%)]" />
        <div className="relative mx-auto max-w-4xl space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700 shadow-[0_18px_40px_-30px_rgba(217,119,6,0.55)] dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                <FiAlertCircle className="h-9 w-9" />
            </div>

            <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-edubot-orange">
                    Student access
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-edubot-ink dark:text-white sm:text-4xl">
                Окуу мүмкүнчүлүгү азырынча активдүү эмес
                </h2>
                <p className="mx-auto max-w-3xl text-base leading-8 text-edubot-muted dark:text-slate-300 sm:text-lg">
                    Сизде азырынча активдүү курс жок. Төлөм ырасталгандан же каттоо иштетилгенден кийин
                    бул жерде курстарыңыз, сабактарыңыз жана прогрессиңиз көрүнөт.
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                    to="/catalog"
                    className="dashboard-button-primary inline-flex min-w-[220px] justify-center"
                >
                    <FiBookOpen className="h-4 w-4" />
                    Видео курстарды көрүү
                </Link>
                <Link
                    to="/student?tab=profile"
                    className="dashboard-button-secondary inline-flex min-w-[220px] justify-center"
                >
                    <FiUser className="h-4 w-4" />
                    Профилди ачуу
                </Link>
            </div>
        </div>
    </div>
);

export default StudentEmptyState;
