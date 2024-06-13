export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  error?: string;
}

export default function Input(props: Readonly<InputProps>) {
  const { error, ...others } = props;
  return (
    <div className={props.className}>
      <input
        className="placeholder:text-secondary-light font-small w-full rounded-full border border-primary bg-secondary px-3 py-2 text-sm text-primary dark:border-secondary dark:bg-slate-800 dark:text-secondary"
        {...others}
      />
      {error ? <div className="text-danger">{error}</div> : null}
    </div>
  );
}
