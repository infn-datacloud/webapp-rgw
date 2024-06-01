import { ReactNode } from "react";

export interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  type?: "button" | "reset" | "submit";
  icon?: ReactNode;
}

export const Button = (props: ButtonProps) => {
  const { className, icon, title, ...other } = props;

  const buttonClasses =
    `w-full border border-color rounded p-4 ` +
    `${other.disabled ? "text-neutral-200" : "hover:bg-neutral-200"}`;

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
