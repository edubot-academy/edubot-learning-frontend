import PropTypes from 'prop-types';
import { DashboardInsetPanel } from '../../../components/ui/dashboard';

const Card = ({ title, children }) => <DashboardInsetPanel title={title}>{children}</DashboardInsetPanel>;

Card.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
};

const praiseBadges = [
    'Жигердүү',
    'Көп жардам берди',
    'Тартиптүү',
    'Үй тапшырма мыкты',
];

const SessionEngagementTab = ({
    leaderboard,
    onSendBadge,
    studentStreaks,
    students,
    topStudents,
}) => (
    <div className="grid gap-4 md:grid-cols-2">
        <Card title="Attendance Streaks">
            {students.slice(0, 8).map((student) => (
                <div
                    key={student.id}
                    className="flex justify-between py-1 text-sm"
                >
                    <span>{student.fullName}</span>
                    <span>{studentStreaks[student.id] || 0} күн</span>
                </div>
            ))}
        </Card>
        <Card title="Top Students">
            {topStudents.map((student, idx) => (
                <div
                    key={student.id}
                    className="flex justify-between py-1 text-sm"
                >
                    <span>
                        #{idx + 1} {student.fullName}
                    </span>
                    <span>{student.xp} XP</span>
                </div>
            ))}
        </Card>
        <Card title="Quick Praise Badges">
            <div className="flex flex-wrap gap-2">
                {praiseBadges.map((badge) => (
                    <button
                        key={badge}
                        onClick={() => onSendBadge(badge)}
                        className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700"
                    >
                        {badge}
                    </button>
                ))}
            </div>
        </Card>
        <Card title="Homework Leaderboard">
            {leaderboard.map((student, idx) => (
                <div
                    key={student.id}
                    className="flex justify-between py-1 text-sm"
                >
                    <span>
                        #{idx + 1} {student.fullName}
                    </span>
                    <span>{student.xp}</span>
                </div>
            ))}
        </Card>
    </div>
);

SessionEngagementTab.propTypes = {
    leaderboard: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSendBadge: PropTypes.func.isRequired,
    studentStreaks: PropTypes.object.isRequired,
    students: PropTypes.arrayOf(PropTypes.object).isRequired,
    topStudents: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SessionEngagementTab;
