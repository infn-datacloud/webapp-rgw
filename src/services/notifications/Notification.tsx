"use client";
import { createPortal } from "react-dom";
import { NotificationProps } from "./types";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import "./notification.css";

const icons = [
  <InformationCircleIcon key="circle-icon" className="text-neutral-800" />,
  <CheckCircleIcon key="check-icon" className="text-green-500" />,
  <ExclamationTriangleIcon key="danger-icon" className="text-amber-500" />,
  <ExclamationCircleIcon key="danger-circle-icon" className="text-red-500" />,
];

const createContainer = () => {
  const id = "notification-container";
  let element = document.getElementById(id);
  if (element) {
    return element;
  }

  element = document.createElement("div");
  element.setAttribute("id", id);
  element.className = "fixed top-8 right-8";
  document.body.appendChild(element);
  return element;
};

const notificationContainer = createContainer();

export const Notification = (props: NotificationProps) => {
  const { id, title, subtitle, timeout, type, onDelete } = props;
  const [isOpen, setIsOpen] = useState(true);
  const lockRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const icon = icons[type];

  const close = () => {
    setIsOpen(false);
  };

  const CloseButton = () => {
    return onDelete ? (
      <button
        className="w-8 p-[5px] text-neutral-500
      hover:bg-neutral-200 rounded-full"
        onClick={close}
      >
        <XCircleIcon />
      </button>
    ) : null;
  };

  useEffect(() => {
    let deleteTimeout: ReturnType<typeof setTimeout> | null;
    const timeToDelete = 200;
    if (!lockRef.current) {
      lockRef.current = true;
      if (timeout) {
        dismissTimerRef.current = setTimeout(close, timeout);
      }
    } else {
      if (!isOpen && onDelete) {
        deleteTimeout = setTimeout(() => onDelete(id), timeToDelete);
      }
    }

    return () => {
      lockRef.current = false;
      if (deleteTimeout) {
        clearTimeout(deleteTimeout);
      }
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [onDelete, id, isOpen, timeout]);

  return createPortal(
    <div className={`notification ${isOpen ? "" : "shrink"}`}>
      <Transition
        show={isOpen}
        appear={true}
        unmount={true}
        enter="transition-transform duration-200"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition-transform duration-200"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        <div className={"flex w-96"}>
          <div className="bg-white rounded-lg border-gray-300 border p-3 shadow-lg w-full">
            <div className="flex items-center w-full">
              <div className="w-5 mr-4">{icon}</div>
              <div className="ml-2 mr-6">
                <span className="font-semibold">{title}</span>
                <span className="block text-gray-500">{subtitle}</span>
              </div>
              <div className="m-auto mr-0">
                <CloseButton />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>,
    notificationContainer
  );
};
