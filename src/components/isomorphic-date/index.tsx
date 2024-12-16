import { dateToHuman } from "@/commons/utils";
import { useEffect, useState } from "react";

/**
 * @description Render a date SSR / CSR
 */
export default function IsomorphicDate(props: Readonly<{ date: Date }>) {
  const { date } = props;
  const [polymorphicDate, setPolymorphicDate] = useState("");
  useEffect(() => setPolymorphicDate(dateToHuman(date)), [date]);
  return <>{polymorphicDate}</>;
}
