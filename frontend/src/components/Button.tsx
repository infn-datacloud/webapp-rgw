import { ReactNode } from "react"

interface ButtonProps {
  type?: "button" | "reset" | "submit"
  className?: string,
  title: string,
  icon?: ReactNode
  disabled?: boolean
  onClick?: () => void
}

export const Button = (props: ButtonProps) => {
  const {
    type,
    className,
    title,
    icon,
    disabled,
    onClick
  } = props;

  let buttonClasses = className + " border border-color rounded p-4 "
  buttonClasses +=
    (disabled === true) ? "text-neutral-200" : "hover:bg-neutral-200";

  return (
    <button
      className={buttonClasses}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex w-full">
        {icon ?
          <div className="w-5">{icon}</div>
          : null}
        <div className="ml-4">
          {title}
        </div>
      </div>

    </button>
  )
}
