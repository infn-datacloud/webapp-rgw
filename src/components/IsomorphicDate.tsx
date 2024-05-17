import moment from "moment";
import { useEffect, useState } from "react";

/**
 * @description Render a date SSR / CSR
 */
export default function IsomorphicDate(props: { time: string }) {
  const { time } = props;
  const [date, setDate] = useState(time);
  useEffect(() => setDate(moment(time).calendar()), [time]);
  return date;
}
