const SidebarOverlay = ({ isOpen, onClose, position = 'left', children }) => {
    return (
        <div
            className={`fixed inset-0 z-50 w-full flex ${
                position === 'right' ? '' : 'flex-row-reverse'
            } ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
            <div
                className={`flex-1 bg-black/50 transition-opacity duration-300 
        ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            <div
                className={`w-2/3 md:max-w-[393px] bg-white h-full p-4 shadow-lg fixed
        ${position === 'right' ? 'right-0' : 'left-0'}
        transition-transform duration-300 overflow-y-auto
        ${
            isOpen
                ? 'translate-x-0'
                : position === 'right'
                  ? 'translate-x-full'
                  : '-translate-x-full'
        }`}
            >
                {children}
            </div>
        </div>
    );
};

export default SidebarOverlay;
