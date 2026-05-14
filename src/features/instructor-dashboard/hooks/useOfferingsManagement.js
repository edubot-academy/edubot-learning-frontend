import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    listOfferingsForCourse,
} from '@services/api';

export const useOfferingsManagement = (courses) => {
    const [offeringsByCourse, setOfferingsByCourse] = useState({});
    const [loadingOfferings, setLoadingOfferings] = useState(false);

    const offerings = useMemo(
        () => courses.flatMap((course) => offeringsByCourse[course.id] || []),
        [courses, offeringsByCourse]
    );

    const loadOfferingsForCourses = useCallback(async (courseArray) => {
        if (!courseArray.length) {
            setOfferingsByCourse({});
            return;
        }

        setLoadingOfferings(true);
        const offeringsMap = {};

        try {
            await Promise.all(
                courseArray.map(async (course) => {
                    try {
                        const data = await listOfferingsForCourse(course.id);
                        const list = Array.isArray(data) ? data : data?.offerings || [];
                        offeringsMap[course.id] = list.map((offering) => ({
                            ...offering,
                            course,
                        }));
                    } catch (error) {
                        console.error(`Failed to load offerings for course ${course.id}:`, error);
                        offeringsMap[course.id] = [];
                    }
                })
            );

            setOfferingsByCourse(offeringsMap);
        } finally {
            setLoadingOfferings(false);
        }
    }, []);

    useEffect(() => {
        loadOfferingsForCourses(courses);
    }, [courses, loadOfferingsForCourses]);

    const handleRefreshOfferings = useCallback(() => {
        if (courses.length) {
            loadOfferingsForCourses(courses);
        }
    }, [courses, loadOfferingsForCourses]);

    const summary = useMemo(() => {
        const now = Date.now();
        const upcoming = offerings.filter(
            (offering) => offering.startAt && new Date(offering.startAt).getTime() >= now
        );
        const past = offerings.length - upcoming.length;
        const company = offerings.filter((offering) => offering.companyId);
        const publicOnes = offerings.filter((offering) => offering.visibility === 'PUBLIC');
        const statusCounts = offerings.reduce((acc, offering) => {
            const key = offering.status || 'DRAFT';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return {
            total: offerings.length,
            upcoming: upcoming.length,
            past,
            company: company.length,
            public: publicOnes.length,
            active: statusCounts.ACTIVE || 0,
            draft: statusCounts.DRAFT || 0,
            completed: (statusCounts.COMPLETED || 0) + (statusCounts.ARCHIVED || 0),
        };
    }, [offerings]);

    return {
        offerings,
        offeringsByCourse,
        loadingOfferings,
        summary,
        loadOfferingsForCourses,
        handleRefreshOfferings,
    };
};
