interface ProgressBarProps {
  value: number;
  title: string;
  id: string;
}

export type ProgressElement = ProgressBarProps;

export default function ProgressBar(props: ProgressBarProps) {
  const { title, value } = props;
  const progress = `${Math.round(value * 100)}%`;
  return (
    <>
      <div className="mb-1 text-base font-medium">{title}</div>
      <div className="mb-4 h-2.5 w-full rounded-full bg-gray-200 dark:bg-slate-700">
        <div
          className="h-2.5 rounded-full bg-primary-200"
          style={{ width: progress }}
        ></div>
      </div>
    </>
  );
}
