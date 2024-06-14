type SubviewProps = {
  title: string;
  item: React.ReactNode;
  icon: JSX.Element;
};

export default function Subview({ title, item, icon }: SubviewProps) {
  return (
    <div className="mt-2 flex content-center">
      <div className="my-auto mr-2 w-5">{icon}</div>
      <div className="my-auto mr-1 font-semibold">{title}</div>
      {item}
    </div>
  );
}
