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
  const classNameEnabled = "border border-color rounded p-4 hover:bg-neutral-200";
  const classNameDisabled = "border border-color rounded p-4 text-neutral-200";
  return (
    <div className={props.className}>
      <button
        className={props.disabled ? classNameDisabled : classNameEnabled}
        type={props.type}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        <div className="flex">
          {props.icon ?
            <div className="w-5">{props.icon}</div>
            : null}
          <div className="ml-4">
            {props.title}
          </div>
        </div>

      </button>
    </div>
  )
}
