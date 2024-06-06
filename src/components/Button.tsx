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
  let className = "primary";
  switch (colorType) {
    case "primary":
      className = "bg-primary hover:bg-primary-hover text-secondary";
      break;
    case "primary-outline":
      className = "border bg-secondary text-primary " +
        "hover:bg-primary-hover hover:text-secondary";
      break;
    case "secondary":
      className = "bg-secondary text-primary hover:bg-secondary-hover "
        + "hover:text-secondary";
      break;
    case "secondary-outline":
      className = "border text-secondary bg-primary hover:bg-secondary " +
      "hover:text-primary";
      break;
    case "success":
      className = "bg-success hover:bg-success-hover text-secondary";
      break;
    case "success-outline":
      className =
        "border bg-secondary text-success hover:bg-success " +
        "hover:text-success";
      break;
    case "warning":
      className = "bg-warning hover:bg-warning-hover text-primary";
      break;
    case "warning-outline":
      className =
        "bg-secondary border  text-warning " +
        "hover:bg-warning hover:text-secondary";
      break;
    case "danger":
      className = "bg-danger text-secondary hover:bg-danger-hover";
      break;
    case "danger-outline":
      className =
        "bg-secondary border text-danger " +
        "hover:bg-danger hover:text-secondary ";
      break;
    default:
  }
  return className;
}

export const Button = (props: ButtonProps) => {
  const { className, icon, title, color, ...other } = props;
  const colorClasses = toColorClasses(color ?? "primary");

  const buttonClasses = `w-full rounded-full p-2 ${colorClasses}`;
  // TODO: `${other.disabled ? "text-neutral-200" : "hover:bg-neutral-200"}`;

  return (
    <div className={className}>
      <button className={buttonClasses} {...other}>
        <div className="flex justify-center w-full">
          {icon ? <div className="w-5 mr-2 my-auto">{icon}</div> : null}
          <small>{title}</small>
        </div>
      </button>
    </div>
  );
};
