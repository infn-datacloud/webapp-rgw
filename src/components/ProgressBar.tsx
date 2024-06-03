interface ProgressBarProps {
  value: number;
  title: string;
  id: string;
}

export type ProgressElement = ProgressBarProps;

export const ProgressBar = (props: ProgressBarProps) => {
  const { title, value } = props;
  const progress = `${Math.round(value * 100)}%`;
  return (
    <>
      <div className="mb-1 text-base font-medium">{title}</div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className="bg-infn h-2.5 rounded-full"
          style={{ width: progress }}
        ></div>
      </div>
    </>
  );
};
