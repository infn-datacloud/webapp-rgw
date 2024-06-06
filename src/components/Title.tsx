type Props = {
  children: React.ReactNode;
};

export const Title = ({ children }: Props) => {
  return (
    <div className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
      {children}
    </div>
  );
};
