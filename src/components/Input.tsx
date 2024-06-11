export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  error?: string;
}

export default function Input(props: Readonly<InputProps>) {
  const { error, ...others } = props;
  const className =
    "placeholder:text-secondary-light rounded-full bg-secondary border py-2 px-3 border-primary text-primary";

  return (
    <div className={props.className}>
      <input className={className} {...others} />
      {error ? <div className="text-danger">{error}</div> : null}
    </div>
  );
}
