export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  error?: string;
}

export default function Input(props: InputProps) {
  const { className, error, ...others } = props;

  const inputClassName =
    `placeholder:${error ? "text-danger" : "text-primary-light"} ` +
    `block bg-secondary w-full border ${
      error ? "border-danger" : "border-primary"
    } ` +
    `rounded-full py-1 pl-4 pr-3 shadow-sm focus:outline-none ` +
    `focus:${error ? "border-danger" : "border-primary"}` +
    `focus:${error ? "ring-red-danger" : "ring-primary"}` +
    `focus: ring-1 smbre: text - sm`;

  return (
    <div className={className}>
      <input className={inputClassName} {...others} />
      {error ? <div className="text-red-400">{error}</div> : null}
    </div>
  );
}
