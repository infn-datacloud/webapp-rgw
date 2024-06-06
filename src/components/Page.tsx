type Props = {
  title: string;
  children: React.ReactNode;
};

export const Page = (props: Props) => {
  const { title, children } = props;
  return (
    <>
      <h1 className="text-primary">{title}</h1>
      <hr className="h-px w-full my-8 bg-gray-200 border-0"></hr>
      <div className="container px-16">{children}</div>
    </>
  );
};
