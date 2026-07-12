export const DEFAULT_DELIVERY_COURSE = {
    courseType: 'offline',
    title: '',
    description: '',
    categoryId: '',
    price: '',
    languageCode: 'ky',
};

const hasValue = (value) => value === 0 || Boolean(value);

export const normalizeDeliveryCourseFormValues = (values = null) => {
    if (!values) return DEFAULT_DELIVERY_COURSE;

    return {
        courseType: values.courseType || 'offline',
        title: values.title || '',
        description: values.description || '',
        categoryId: values.categoryId ? String(values.categoryId) : '',
        price: hasValue(values.price) ? String(values.price) : '',
        languageCode: values.languageCode || 'ky',
    };
};

export const normalizeDeliveryCourseEditState = (course) => {
    if (!course) return null;

    return {
        id: course.id,
        courseType: course.courseType || 'offline',
        title: course.title || '',
        description: course.description || '',
        categoryId: course.category?.id || course.categoryId || '',
        price: course.price || 0,
        languageCode: course.languageCode || 'ky',
        status: course.status || '',
        isPublished: Boolean(course.isPublished),
    };
};

export const buildDeliveryCoursePayload = (payload) => {
    const price = Number(payload.price || 0);

    return {
        title: payload.title,
        description: payload.description,
        categoryId: parseInt(payload.categoryId, 10),
        price,
        languageCode: payload.languageCode || 'ky',
        courseType: payload.courseType,
        isPaid: price > 0,
    };
};

export const isMissingRequiredDeliveryCourseFields = (payload) =>
    !payload?.title || !payload?.description || !payload?.categoryId;
