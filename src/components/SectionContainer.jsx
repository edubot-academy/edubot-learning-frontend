
import Card from "./Card";
import programmerImg from "../assets/images/photoprogrammer.png";
import StarImg from "../assets/icons/star.svg";
import { Link } from "react-router-dom";


const SectionContainer = ({ noBg = false, hideTitleAndLink = false, data = [] }) => {

  return (
    <div
      className={`${noBg ? "" : "bg-[#002C37] text-white"
        } px-4 py-8 sm:px-6 lg:px-12`}
    >
      {!hideTitleAndLink && (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
            Топ Курстар
          </h2>

          <div className="flex justify-end mb-6">
            <Link to="/courses" className="text-sm cursor-pointer text-orange-500">
              Увидеть все
            </Link>
          </div>
        </>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {data.slice(0, 3).map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`}>
            <Card
              img={course.coverImageUrl}
              title={course.title}
              description={course.description}
              star={course.imgg}
              price={course.price}
              ratingCount={course.ratingCount}
            />
          </Link>
        ))}
      </div>

    </div>
  );
};

export default SectionContainer;
