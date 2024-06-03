export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  error?: string;
}

export default function Input(props: InputProps) {
  const { className, error, ...others } = props;

  const inputClassName =
    `placeholder:${error ? "text-red-400" : "text-slate-400"} ` +
    `block bg-white w-full border ${
      error ? "border-red-400" : "border-slate-400"
    } ` +
    `rounded-md py-2 pl-4 pr-3 shadow-sm focus:outline-none ` +
    `focus:${error ? "border-red-400" : "border-sky-500"}` +
    `focus:${error ? "ring-red-400" : "ring-sky-500"}` +
    `focus: ring-1 smbre: text - sm`;

  return (
    <div className={className}>
      <input className={inputClassName} {...others} />
      {error ? <div className="text-red-400">{error}</div> : null}
    </div>
  );
}
