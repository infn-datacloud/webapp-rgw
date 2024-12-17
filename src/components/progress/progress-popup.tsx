import ProgressBar, { ProgressElement } from "./progress-bar";

export interface StatusElement {
  title: string;
  value: number;
}

interface ProgressPopupProps {
  title?: string;
  show: boolean;
  progressList: ProgressElement[];
}

export default function ProgressPopup(props: ProgressPopupProps) {
  const { title, show, progressList } = props;
  if (!show) {
    return;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded bg-white p-4 text-primary shadow-lg dark:bg-slate-800 dark:text-secondary">
      <div className="flex justify-between">
        <p className="font-bold">{title}</p>
      </div>
      {progressList.map(el => {
        return (
          <ProgressBar
            key={el.id}
            title={el.title}
            value={el.value}
            id={el.id}
          />
        );
      })}
    </div>
  );
}
