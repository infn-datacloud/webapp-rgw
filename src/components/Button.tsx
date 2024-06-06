import { ReactNode } from "react";

export type ButtonColor =
  | "primary"
  | "primary-outline"
  | "secondary"
  | "secondary-outline"
  | "success"
  | "success-outline"
  | "warning"
  | "warning-outline"
  | "danger"
  | "danger-outline";

export interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  type?: "button" | "reset" | "submit";
  icon?: ReactNode;
  color?: ButtonColor;
}

function toColorClasses(colorType: ButtonColor) {
  switch (colorType) {
    case "primary":
      return "bg-primary text-secondary";
    case "primary-outline":
      return "secondary border-color-primary"
    default:
      return "primary";
  }
}

export const Button = (props: ButtonProps) => {
  const { className, icon, title, color, ...other } = props;
  const colorClasses = toColorClasses(color ?? "primary");

  const buttonClasses =
    `w-full border border-color rounded-full p-2 ${colorClasses}`
    // TODO: `${other.disabled ? "text-neutral-200" : "hover:bg-neutral-200"}`;

  return (
    <div className={className}>
      <button className={buttonClasses} {...other}>
        <div className="flex justify-center w-full">
          {icon ? <div className="w-5 mr-4">{icon}</div> : null}
          <div>{title}</div>
        </div>
      </button>
    </div>
  );
};
