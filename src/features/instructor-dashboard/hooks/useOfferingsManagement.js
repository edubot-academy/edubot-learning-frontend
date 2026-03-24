import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
    listOfferingsForCourse,
    createOffering,
    updateOffering,
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
                        offeringsMap[course.id] = data?.offerings || [];
                    } catch (error) {
                        console.error(`Failed to load offerings for course ${course.id}:`, error);
                        offeringsMap[course.id] = [];
                    }
                })
            );

            setOfferingsByCourse(offeringsMap);
        } catch (error) {
            console.error('Failed to load offerings', error);
            toast.error('Offeringлерди жүктөөдө ката кетти');
        } finally {
            setLoadingOfferings(false);
        }
    }, []);

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
