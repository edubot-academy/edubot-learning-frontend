import { getTopRatings } from '@services/api';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useCallback, useState } from 'react';
import CardFeedback from '../../marketing/components/CardFeedback';

const FeedbackSlider = ({ arrows }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        dragFree: false,
        loop: true,
        containScroll: 'keepSnaps',
    });

    const [newDate, setNewDate] = useState([]);

    const getTopRate = async () => {
        const data = await getTopRatings();
        const result = data;
        setNewDate(result);
    };
    useEffect(() => {
        getTopRate();
    }, []);

    const [, setCanPrev] = useState(false);
    const [, setCanNext] = useState(true);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanPrev(emblaApi.canScrollPrev());
        setCanNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    const handleArrowClick = (e) => {
        const btn = e.target.closest('[data-arrow]');
        if (!btn || !emblaApi) return;

        if (btn.dataset.arrow === 'prev') emblaApi.scrollPrev();
        if (btn.dataset.arrow === 'next') emblaApi.scrollNext();
    };

    return (
        <div>
            <div className="absolute bottom-[80%] left-[88%]" onClick={handleArrowClick}>
                {arrows}
            </div>

            <div ref={emblaRef} className="overflow-hidden mt-6">
                <div className="flex">
                    {newDate.length !== 0 ? (
                        newDate.map((item, index) => (
                            <div
                                key={index}
                                className="px-3 min-w-[100%] sm:min-w-[50%] lg:min-w-[33.33%]"
                            >
                                <CardFeedback {...item} />
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="max-w-[320px] w-full min-h-[384px] animate-pulse shadow-xl bg-neutral-200 rounded-xl"></div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackSlider;
