import { ReactNode } from "react"
import { Transition } from '@headlessui/react';

export interface InspectorProps {
  children?: ReactNode;
  isOpen: boolean;
}
export const Inspector = ({ isOpen, children }: InspectorProps) => {
  return (
    <Transition
      show={isOpen}
      enter="transition-transform duration-200"
      enterFrom="translate-x-64"
      enterTo="translate-x-0"
      leave="transition-transform duration-200"
      leaveFrom='translate-x-0'
      leaveTo="translate-x-64"
    >
      <div className="w-64 right-0 top-0 h-screen fixed z-1 overflow-auto">
        <div className='h-full bg-gray-100'>
          {children}
        </div>
      </div>
    </Transition>
  )
}