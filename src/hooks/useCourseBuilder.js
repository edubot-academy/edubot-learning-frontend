import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const DEFAULT_COPY = {
    validation: {
        title: 'Title is required',
        description: 'Description is required',
        category: 'Pick a category',
        seatLimit: 'Seat limit should be at least 1',
        dates: 'Please pick start and end dates',
        dateOrder: 'Start date must be before end date',
        days: 'Pick at least one weekday',
        hours: 'Hours per day should be greater than 0',
    },
};

const DEFAULT_INFO = {
    title: '',
    description: '',
    categoryId: '',
    price: '',
    cover: null,
    coverImageUrl: '',
    seatLimit: 10,
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    hoursPerDay: 1,
    defaultStartTime: '10:00',
    dayTimes: {},
    timezone: 'Asia/Bishkek',
    location: '',
    meetingUrl: '',
    languageCode: 'ky',
};

const clampSeatLimit = (value) => {
    const numeric = Number(value) || 0;
    if (numeric < 1) return 1;
    if (numeric > 500) return 500;
    return numeric;
};

export const useCourseBuilder = (initialType = 'offline') => {
    const [courseType, setCourseType] = useState(initialType);
    const [courseInfo, setCourseInfo] = useState({ ...DEFAULT_INFO, courseType: initialType });
    const [planMode, setPlanMode] = useState('ai');
    const [aiRequest, setAiRequest] = useState({
        goal: '',
        topics: '',
        level: 'beginner',
        difficulty: 'easy',
    });
    const [aiPlan, setAiPlan] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);

    const lang = courseInfo.languageCode || 'ky';

    const copy = useMemo(
        () => ({
            ky: {
                validation: {
                    title: 'Курс аталышын толтуруңуз',
                    description: 'Сүрөттөмө талап кылынат',
                    category: 'Категорияны тандаңыз',
                    seatLimit: 'Орун саны кеминде 1 болушу керек',
                    dates: 'Башталуу жана аяктоо датасын тандаңыз',
                    dateOrder: 'Башталуу датасы аяктоо датасынан кеч болбошу керек',
                    days: 'Кеминде бир күндү тандаңыз',
                    hours: 'Сабак узактыгы 0дөн чоң болушу керек',
                },
            },
            ru: {
                validation: {
                    title: 'Заполните название курса',
                    description: 'Описание обязательно',
                    category: 'Выберите категорию',
                    seatLimit: 'Лимит мест должен быть минимум 1',
                    dates: 'Укажите даты начала и конца',
                    dateOrder: 'Дата начала не может быть позже даты окончания',
                    days: 'Выберите хотя бы один день недели',
                    hours: 'Длительность занятия должна быть больше нуля',
                },
            },
        })[lang] || DEFAULT_COPY,
        [lang]
    );

    const handleInfoChange = (field, value) => {
        if (field === 'cover') {
            setCourseInfo((prev) => ({
                ...prev,
                cover: value,
                coverImageUrl: value ? URL.createObjectURL(value) : '',
            }));
            return;
        }

        if (field === 'daysOfWeek') {
            setCourseInfo((prev) => {
                const exists = prev.daysOfWeek.includes(value);
                const days = exists
                    ? prev.daysOfWeek.filter((d) => d !== value)
                    : [...prev.daysOfWeek, value];
                return { ...prev, daysOfWeek: days };
            });
            return;
        }

        if (field === 'seatLimit') {
            setCourseInfo((prev) => ({ ...prev, seatLimit: clampSeatLimit(value) }));
            return;
        }

        if (field === 'hoursPerDay') {
            if (value === '') {
                setCourseInfo((prev) => ({ ...prev, hoursPerDay: '' }));
            } else {
                setCourseInfo((prev) => ({ ...prev, hoursPerDay: Number(value) || 0 }));
            }
            return;
        }

        if (field === 'dayTimes' && value && typeof value === 'object') {
            setCourseInfo((prev) => ({ ...prev, dayTimes: { ...prev.dayTimes, ...value } }));
            return;
        }

        setCourseInfo((prev) => ({ ...prev, [field]: value }));
    };

    const validateInfo = () => {
        if (!courseInfo.title?.trim()) {
            toast.error(copy.validation.title);
            return false;
        }
        if (!courseInfo.description?.trim()) {
            toast.error(copy.validation.description);
            return false;
        }
        if (!courseInfo.categoryId) {
            toast.error(copy.validation.category);
            return false;
        }
        if (!courseInfo.startDate || !courseInfo.endDate) {
            toast.error(copy.validation.dates);
            return false;
        }
        if (new Date(courseInfo.startDate) > new Date(courseInfo.endDate)) {
            toast.error(copy.validation.dateOrder);
            return false;
        }
        if (!courseInfo.daysOfWeek?.length) {
            toast.error(copy.validation.days);
            return false;
        }
        if (!courseInfo.hoursPerDay || Number(courseInfo.hoursPerDay) <= 0) {
            toast.error(copy.validation.hours);
            return false;
        }
        if (courseInfo.seatLimit < 1) {
            toast.error(copy.validation.seatLimit);
            return false;
        }
        return true;
    };

    return {
        courseType,
        setCourseType,
        courseInfo,
        setCourseInfo,
        handleInfoChange,
        planMode,
        setPlanMode,
        aiRequest,
        setAiRequest,
        aiPlan,
        setAiPlan,
        aiLoading,
        setAiLoading,
        validateInfo,
        lang,
    };
};

export default useCourseBuilder;
