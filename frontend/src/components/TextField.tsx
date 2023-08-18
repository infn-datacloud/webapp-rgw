interface TextFieldProps {
  placeholder?: string;
  className?: string;
  value: string;
  type?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.ChangeEventHandler<HTMLInputElement>;
  error?: any;
}

export const TextField = (props: TextFieldProps) => {
  const { placeholder, value, className, type, onChange, onBlur, error } = props;
  const inputType = type ?? "text";
  const inputClassName =
    `placeholder:${error ? "text-red-400" : "text-slate-400"} ` +
    `block bg-white w-full border ${error ? "border-red-400" : "border-slate-400"} ` +
    `rounded-md py-2 pl-4 pr-3 shadow-sm focus:outline-none ` +
    `focus:${error ? "border-red-400" : "border-sky-500"}` +
    `focus:${error ? "ring-red-400" : "ring-sky-500"} focus:ring-1 smbre:text-sm`
  return (
    <div className={className}>
      <input
        className={inputClassName}
        placeholder={placeholder}
        type={inputType}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error ? <div className="text-red-400">{error}</div> : null}
    </div>
  )
}