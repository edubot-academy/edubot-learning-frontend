import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CardFeedback from '../../marketing/components/CardFeedback';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const FeedbackSlider = ({ data }) => {
    const { t } = useTranslation();
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        dragFree: false,
        loop: true,
        containScroll: 'keepSnaps',
    });

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="relative">
            <div className="mb-4 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => emblaApi?.scrollPrev()}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-orange-300 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-[#222222] dark:text-white"
                    aria-label={t('public.courseShared.feedback.previous')}
                >
                    <FiChevronLeft aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={() => emblaApi?.scrollNext()}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-orange-300 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-[#222222] dark:text-white"
                    aria-label={t('public.courseShared.feedback.next')}
                >
                    <FiChevronRight aria-hidden="true" />
                </button>
            </div>

            <div ref={emblaRef} className="overflow-hidden mt-6">
                <div className="flex">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="px-3 min-w-[100%] sm:min-w-[50%] lg:min-w-[33.33%]"
                        >
                            <CardFeedback {...item} />
                        </div>
                    ))
                    }
                </div>
            </div>
        </div>
    );
};

export default FeedbackSlider;
