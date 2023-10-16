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

  const buttonClasses = `w-full border border-color rounded p-4 ` +
    `${disabled ? "text-neutral-200" : "hover:bg-neutral-200"}`;

  return (
    <div className={className}>
      <button
        className={buttonClasses}
        type={type}
        onClick={onClick}
        disabled={disabled}
      >
        <div className="flex justify-center w-full">
          {icon ?
            <div className="w-5 mr-4">{icon}</div>
            : null}
          <div>
            {title}
          </div>
        </div>
      </button>
    </div>
  )
}
