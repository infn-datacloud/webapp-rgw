export interface ToggleSwitchProps extends React.HTMLProps<HTMLInputElement> {
  defaultChecked?: boolean;
}

export default function ToggleSwitch(props: ToggleSwitchProps) {
  let { type, className, defaultChecked, ...other } = props;
  type = "checkbox";
  className = "sr-only peer";

  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type={type}
        className={className}
        defaultChecked={defaultChecked}
        {...other}
      />
      <div className="peer-focus:ring-primary-light peer peer-checked:bg-primary dark:peer-checked:bg-success h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-600"></div>
    </label>
  );
}
