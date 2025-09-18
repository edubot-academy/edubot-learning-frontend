import { IoCheckmark } from "react-icons/io5";

const CourseIncludes = () => {
  const items = [
    "Figma аркылуу UX-дизайнер болуп иштөөнү кантип баштоо керек",
    "Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот",
    "Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот",
    "Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот",
    "Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот",
    "Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот",
    "Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот",
    "Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот",
    "Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот",
    "Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот",
  ];

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-[#0EA78B]">Бул курс эмнелерди камтыйт</h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <IoCheckmark className="text-orange-500 mt-1" />
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseIncludes;
