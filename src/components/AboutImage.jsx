import aboutUs from '../assets/images/about-us.png'

function AboutImage() {
  return (
    <div className='flex justify-center items-center flex-col'>
      <h1 className='font-semibold text-3xl md:text-4xl'>Биз жонундо</h1>
      <img className='mb-[-55px]' src={aboutUs} alt="" />
    </div>
  )
}

export default AboutImage
