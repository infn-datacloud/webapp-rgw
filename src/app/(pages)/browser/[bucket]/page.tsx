import { Page } from "@/components/Page";

export default function Browser(props: { params: { bucket: string } }) {
  const { params } = props;
  const { bucket } = params;
  return <Page title={bucket}>Hello</Page>;
}
