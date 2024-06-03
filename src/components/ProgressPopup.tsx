import { ProgressBar, ProgressElement } from "./ProgressBar";

export interface StatusElement {
  title: string;
  value: number;
}

interface ProgressPopupProps {
  title?: string;
  show: boolean;
  progressList: ProgressElement[];
}

export const ProgressPopup = (props: ProgressPopupProps) => {
  const { title, show, progressList } = props;
  if (!show) {
    return;
  }

  return (
    <div className="z-50 fixed bottom-4 right-4 w-72 bg-white p-4 shadow-lg rounded">
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
};
