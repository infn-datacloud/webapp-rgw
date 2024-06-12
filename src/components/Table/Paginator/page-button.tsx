import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

type PaginatorButtonType = "first" | "previous" | "next" | "last";

type PaginatorButtonProps = {
  children?: React.ReactNode;
  onClick: () => void;
  type: PaginatorButtonType;
};

export default function PaginatorButton(props: PaginatorButtonProps) {
  const { onClick, type } = props;
  let className =
    "ml-0 flex h-6 w-6 border border-gray-300 bg-white hover:bg-gray-100";
  let icon!: React.ReactNode;
  let title!: string;

  switch (type) {
    case "first":
      title = "First Page";
      icon = <ChevronDoubleLeftIcon className="m-auto w-4" />;
      className += " rounded-l-lg";
      break;
    case "previous":
      title = "Previous Page";
      icon = <ChevronLeftIcon className="m-auto w-4" />;
      break;
    case "next":
      title = "Next";
      icon = <ChevronRightIcon className="m-auto w-4" />;
      break;
    case "last":
      title = "Last Page";
      icon = <ChevronDoubleRightIcon className="m-auto w-4" />;
      className += " rounded-r-lg";
      break;
    default:
  }

  return (
    <button title={title} className={className} onClick={onClick} type="button">
      {icon}
    </button>
  );
}
