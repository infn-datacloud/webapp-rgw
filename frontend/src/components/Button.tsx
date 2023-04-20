import { ReactNode } from "react"

interface ButtonProps {
  type?: "button" | "reset" | "submit"
  className?: string,
  title: string,
  icon?: ReactNode
  onClick?: () => void
}

export const Button = (props: ButtonProps) => {
  return (
    <div className={props.className}>
      <button
        className="border border-colorounded p-4 hover:bg-neutral-200"
        type={props.type}
        onClick={props.onClick}
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
