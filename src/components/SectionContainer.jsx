const SectionContainer = ({
	title,
	subtitle,
	buttonText,
	data = [],
	CardComponent,
	hideTitleAndLink = false,
	rightContent = null,
}) => {
	return (
		<div className='px-4 py-16 sm:px-6 lg:px-12 bg-white'>
			{!hideTitleAndLink && (
				<div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-12'>
					<div className='flex flex-col gap-2'>
						{title && (
							<h2 className='font-suisse font-bold text-[#141619] text-4xl'>
								{title}
							</h2>
						)}
						{subtitle && (
							<p className='font-suisse font-normal text-[#3E424A] text-base max-w-md'>
								{subtitle}
							</p>
						)}
					</div>
					<div>{rightContent}</div>
				</div>
			)}

			{/* ИСПРАВЛЕННАЯ ЧАСТЬ - рендерим CardComponent */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
				{data.map((course) => (
					<CardComponent
						key={course.id}
						id={course.id}
						coverImageUrl={course.coverImageUrl}
						title={course.title}
						instructor={course.instructor}
						price={course.price}
						ratingCount={course.ratingCount}
						ratingAverage={course.ratingAverage}
					/>
				))}
			</div>
		</div>
	);
};

export default SectionContainer;
