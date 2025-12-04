import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useCallback, useState } from 'react';

const FeedbackSlider = ({ data = [], CardComponent, arrows }) => {
  
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: 'start',
		dragFree: false,
		loop: true,
		containScroll: 'keepSnaps',
	});

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
			<div
				className='absolute bottom-[80%] left-[88%]'
				onClick={handleArrowClick}
			>
				{arrows}
			</div>

			<div ref={emblaRef} className='overflow-hidden mt-6'>
				<div className='flex'>
					{data.map((item, index) => (
						<div
							key={index}
							className='px-3 min-w-[100%] sm:min-w-[50%] lg:min-w-[33.33%]'
						>
							<CardComponent {...item}/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default FeedbackSlider;
