import { ReactNode } from "react"

interface ButtonProps {
  type?: "button" | "reset" | "submit"
  title: string,
  icon?: ReactNode
  onClick?: () => void
}

export const Button = (props: ButtonProps) => {
  return (
    <button
      className="border rounded p-4 hover:bg-neutral-200"
      type={props.type}
      onClick={props.onClick}
    >
      <div className="flex">
        {props.icon ?
          <div className="w-5">{props.icon}</div>
          : null}
        <div className="w-20">
          {props.title}
        </div>
      </div>

    </button>
  )
}
