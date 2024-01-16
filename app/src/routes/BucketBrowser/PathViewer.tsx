interface PathViewerProps {
  path: string;
  prefix?: string;
  className?: string;
}

export const PathViewer = (props: PathViewerProps) => {
  const { prefix, path, className } = props;
  return (
    <div className={className}>
      <div className="flex space-x-4">
        <div className="font-bold">Current path:</div>
        <div>{prefix ? prefix + path : path}</div>
      </div>
    </div>
  );
};
