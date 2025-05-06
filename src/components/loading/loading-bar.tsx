type LoadingBarProps = {
  show: boolean;
};

export function LoadingBar(props: Readonly<LoadingBarProps>) {
  const { show } = props;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10 data-[hidden=true]:hidden dark:bg-secondary/10"
      data-hidden={!show}
    >
      <div className="h-full w-full origin-left animate-progress rounded-full bg-primary dark:bg-primary-200" />
    </div>
  );
}
