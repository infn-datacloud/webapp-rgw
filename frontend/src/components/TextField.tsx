interface TextFieldProps {
  placeholder?: string;
  value: string | number | readonly string[] | undefined;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const TextField = (props: TextFieldProps) => {
  const { placeholder, value, onChange } = props;
  const className = " placeholder:text-slate-400 " +
    "block bg-white w-full border border-slate-300 rounded-md py-2 pl-4 " +
    "pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 " +
    "focus:ring-1 smbre:text-sm"
  return (
    <input
      className={className}
      placeholder={placeholder}
      type="text"
      value={value}
      onChange={onChange}
    />
  )
}