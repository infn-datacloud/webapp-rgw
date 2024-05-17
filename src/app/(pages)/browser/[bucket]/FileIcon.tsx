import {
  DocumentIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

function Icon(props: { extension: string }) {
  const { extension } = props;
  switch (extension) {
    case "png":
    case "jpeg":
    case "jpg":
      return <PhotoIcon />;
    default:
      return <DocumentIcon />;
  }
}

export default function FileIcon(props: { extension: string }) {
  return <div className="w-5">{<Icon {...props} />}</div>;
}
