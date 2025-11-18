import React, { useEffect, useState } from "react";
import SectionContainer from "../components/SectionContainer";
import CardInstructor from "../components/CardInstrictor";
import Button from "./UI/Button";
import { fetchTopInstructors } from "../services/api";

const TopInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchTopInstructors(3);
        setInstructors(res.items);
      } catch (err) {
        setError("Ошибка загрузки инструкторов");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <SectionContainer
      title="Топ Инструктор"
      subtitle="Подборка самых востребованных и эффективных обучающих программ."
      rightContent={<Button variant="secondary">Бардыгын көрүү</Button>}
      data={instructors}
      CardComponent={CardInstructor}
    />
  );
};

export default TopInstructors;
