import { Title } from "./Title";

type Props = {
  title: string;
  children: React.ReactNode;
};

export const Page = (props: Props) => {
  const { title, children } = props;
  return (
    <>
      <Title>{title}</Title>
      <hr className="h-px w-full my-8 bg-gray-200 border-0"></hr>
      {children}
    </>
  );
};
