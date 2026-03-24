// Course info operations for useCourseBuilder hook
// Extracted from CreateCourse.jsx and EditInstructorCourse.jsx

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { getCourseInfoErrors, getAllCourseInfoFieldsTouched } from '../validation';
import { prepareCourseInfoForApi, validateCoverImage, createFilePreviewUrl } from '../utils';

import { createCourse, updateCourse, uploadCourseImage } from '../../api';
import { isForbiddenError, parseApiError } from '../../../../shared/api/error';

/**
 * Course info operations hook
 * @param {Object} courseBuilderState - Main course builder state
 * @returns {Object} - Course info operations
 */
export const useCourseBuilderInfo = (courseBuilderState) => {
    const {
        courseInfo,
        setCourseInfo,
        infoTouched,
        setInfoTouched,
        courseId,
        setCourseId,
        mode,
        setStep,
        navigate,
    } = courseBuilderState;

    // Handle course info form changes
    const handleCourseInfoChange = useCallback((e) => {
        const { name, value, files, type, checked } = e.target;

        if (name === 'cover' && files && files[0]) {
            const file = files[0];

            // Validate cover image
            const validation = validateCoverImage(file);
            if (!validation.valid) {
                toast.error(validation.error);
                return;
            }

            setCourseInfo((prev) => ({
                ...prev,
                cover: file,
                coverImageUrl: createFilePreviewUrl(file),
            }));
            setInfoTouched((prev) => ({ ...prev, cover: true }));
            return;
        }

        setInfoTouched((prev) => ({ ...prev, [name]: true }));

        if (type === 'checkbox') {
            if (name === 'isPaid' && !checked) {
                setCourseInfo((prev) => ({ ...prev, isPaid: false, price: 0 }));
                return;
            }
            setCourseInfo((prev) => ({ ...prev, [name]: checked }));
            return;
        }

        setCourseInfo((prev) => ({ ...prev, [name]: value }));
    }, [setCourseInfo, setInfoTouched]);

    // Validate course info
    const validateCourseInfo = useCallback(() => {
        const errors = getCourseInfoErrors(courseInfo);
        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }, [courseInfo]);

    // Handle course submission (create or update)
    const handleCourseSubmit = useCallback(async () => {
        const { isValid, errors } = validateCourseInfo();

        if (!isValid) {
            setInfoTouched(getAllCourseInfoFieldsTouched());
            toast.error('Маалымат табындагы каталарды оңдоңуз.');
            return;
        }

        try {
            const coursePayload = prepareCourseInfoForApi(courseInfo);

            let savedCourse;
            if (mode === 'create') {
                savedCourse = await createCourse(coursePayload);
                // Update course info with the returned data
                setCourseInfo((prev) => ({ ...prev, id: savedCourse.id }));
                // Update courseId state
                setCourseId(savedCourse.id);
            } else {
                await updateCourse(courseId, coursePayload);
                savedCourse = { ...courseInfo, id: courseId };
            }

            // Upload cover image if provided
            if (courseInfo.cover instanceof File) {
                const targetCourseId = mode === 'create' ? savedCourse.id : courseId;
                await uploadCourseImage(targetCourseId, courseInfo.cover);
            }

            const successMessage = mode === 'create' ? 'Курс ийгиликтүү түзүлдү!' : 'Курс ийгиликтүү сакталды!';
            toast.success(successMessage);

            setStep(2);
        } catch (err) {
            console.error(err);
            const errorMessage = mode === 'create' ? 'Курс түзүүдө ката кетти.' : 'Курс сактоодо ката кетти.';
            toast.error(errorMessage);
        }
    }, [courseInfo, courseId, mode, setCourseInfo, setStep, validateCourseInfo, setInfoTouched]);

    // Reset course info to defaults
    const resetCourseInfo = useCallback(() => {
        // This will be used by the main hook when needed
        // Implementation depends on whether we have defaults imported
    }, []);

    // Check if course info has changes (for edit mode)
    const hasCourseInfoChanges = useCallback((originalCourse) => {
        if (!originalCourse) return false;

        // Compare relevant fields
        const fieldsToCompare = ['title', 'subtitle', 'description', 'price', 'languageCode', 'learningOutcomesText', 'aiAssistantEnabled', 'isPaid'];

        return fieldsToCompare.some(field => {
            const currentValue = courseInfo[field];
            const originalValue = originalCourse[field];

            // Handle special cases
            if (field === 'price') {
                return Number(currentValue) !== Number(originalValue);
            }

            if (field === 'learningOutcomesText') {
                const currentArray = currentValue ? currentValue.split('\n').filter(Boolean) : [];
                const originalArray = originalValue || [];
                return JSON.stringify(currentArray) !== JSON.stringify(originalArray);
            }

            return currentValue !== originalValue;
        });
    }, [courseInfo]);

    // Check if course info is valid
    const isCourseInfoValid = useCallback(() => {
        const errors = getCourseInfoErrors(courseInfo);
        return Object.keys(errors).length === 0;
    }, [courseInfo]);

    return {
        // Operations
        handleCourseInfoChange,
        handleCourseSubmit,
        validateCourseInfo,
        resetCourseInfo,

        // Computed values
        courseInfoErrors: getCourseInfoErrors(courseInfo),
        isCourseInfoValid,
        hasCourseInfoChanges,

        // State access (read-only)
        isCourseInfoDirty: Object.keys(infoTouched).some(key => infoTouched[key]),
    };
};
