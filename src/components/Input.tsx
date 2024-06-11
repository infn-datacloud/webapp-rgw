export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  error?: string;
}

export default function Input(props: Readonly<InputProps>) {
  const { error, ...others } = props;
  return (
    <div className={props.className}>
      <input
        className="placeholder:text-secondary-light font-small w-full rounded-full border border-primary bg-secondary px-3 py-2"
        {...others}
      />
      {error ? <div className="text-red-400">{error}</div> : null}
    </div>
  );
}
