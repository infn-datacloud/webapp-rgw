type Props = {
  title: string;
  children: React.ReactNode;
};

export const Page = (props: Props) => {
  const { title, children } = props;
  return (
    <>
      <h1 className="text-primary dark:text-secondary">{title}</h1>
      <hr className="mb-8 mt-2 h-px w-full border-0 bg-gray-200" />
      <div className="sm:px-16">{children}</div>
    </>
  );
};
