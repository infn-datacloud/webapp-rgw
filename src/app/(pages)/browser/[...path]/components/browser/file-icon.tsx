import {
  DocumentIcon,
  FolderIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

function Icon(props: { extension: string | undefined }) {
  const { extension } = props;
  switch (extension) {
    case "png":
    case "jpeg":
    case "jpg":
      return <PhotoIcon />;
    case "folder":
      return <FolderIcon />;
    default:
      return <DocumentIcon />;
  }
}

export function FileIcon(props: { extension: string | undefined }) {
  return <div className="size-5">{<Icon {...props} />}</div>;
}
