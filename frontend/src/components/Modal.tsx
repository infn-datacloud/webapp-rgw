import { ReactNode } from "react"

interface ModalProps {
  children?: ReactNode;
  open: boolean;
  onClose?: () => void;
}

export const Modal = (props: ModalProps) => {
  const { open, children } = props;
  
  if (!open) {
    return <></>;
  }

  return (
    <div className="relative inset-0" role="dialog">
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}