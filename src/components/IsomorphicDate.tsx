import { dateToHuman } from "@/app/(pages)/home/utils";
import { useEffect, useState } from "react";

/**
 * @description Render a date SSR / CSR
 */
export default function IsomorphicDate(props: { date: Date }) {
  const { date } = props;
  const [_date, setDate] = useState("");
  useEffect(() => setDate(dateToHuman(date)), [date]);
  return <>date</>;
}
