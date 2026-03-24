import { Link } from 'react-router-dom';

const ProfileSection = ({ profile, expertiseTags, socialLinks }) => (
    <div className="rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
                <h2 className="text-2xl font-semibold">Профиль</h2>
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                    Өзүңүз жөнүндө маалымат
                </p>
            </div>

            <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
            >
                Профилди өзгөртүү
            </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141619] p-4">
            <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-2">Био / Өзүм жөнүндө</p>
            <p className="text-gray-800 dark:text-white whitespace-pre-line">
                {profile?.bio?.trim() || 'Маалымат кошула элек'}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">Наам</p>
                <p className="text-gray-800 dark:text-white">{profile?.title?.trim() || '—'}</p>
            </div>
            <div>
                <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">Тажрыйба</p>
                <p className="text-gray-800 dark:text-white">
                    {profile?.yearsOfExperience ? `${profile.yearsOfExperience} жыл` : '—'}
                </p>
            </div>
            <div>
                <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">Студенттер</p>
                <p className="text-gray-800 dark:text-white">{profile?.numberOfStudents ?? '—'}</p>
            </div>
        </div>

        <div>
            <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">Экспертиза</p>
            {expertiseTags.length ? (
                <div className="flex flex-wrap gap-2">
                    {expertiseTags.map((tag) => (
                        <span
                            key={tag}
                            className="text-xs bg-gray-100 dark:bg-[#141619] text-gray-800 dark:text-white px-3 py-1 rounded-full"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">Экспертиза кошула элек</p>
            )}
        </div>

        <div>
            <p className="text-gray-600 dark:text-[#a6adba] font-medium mb-1">
                Социалдык тармактар
            </p>
            {socialLinks.length ? (
                <div className="flex flex-col gap-1">
                    {socialLinks.map(([key, value]) => (
                        <a
                            key={key}
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {value}
                        </a>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-[#a6adba]">
                    Социалдык шилтемелер кошула элек
                </p>
            )}
        </div>
    </div>
);

export default ProfileSection;
