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
        className="border rounded p-4 hover:bg-neutral-200 w-full h-full"
        type={props.type}
        onClick={props.onClick}
      >
        <div className="flex">
          {props.icon ?
            <div className="w-5">{props.icon}</div>
            : null}
          <div className="mx-auto">
            {props.title}
          </div>
        </div>

      </button>
    </div>

  )
}
