import PropTypes from 'prop-types';

const SessionNotesTab = ({ sessionNotes, setSessionNotes }) => (
    <textarea
        value={sessionNotes}
        onChange={(e) => setSessionNotes(e.target.value)}
        rows={10}
        placeholder="Сессия боюнча жазуу: эмне өттүк, кимге колдоо керек, кийинки кадам..."
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-[#0E0E0E]"
    />
);

SessionNotesTab.propTypes = {
    sessionNotes: PropTypes.string.isRequired,
    setSessionNotes: PropTypes.func.isRequired,
};

export default SessionNotesTab;
