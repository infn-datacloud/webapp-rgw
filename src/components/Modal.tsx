"use client";
import { useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CloseButton from "./CloseButton";

export interface ModalProps {
  title?: string;
  children?: ReactNode;
  id: string;
}

export const ModalBody = (props: { children?: ReactNode }) => {
  const { children } = props;
  return <div className="infn-modal-body">{children}</div>;
};

export const ModalFooter = (props: { children?: ReactNode }) => {
  const { children } = props;
  return (
    <div className="infn-modal-footer">
      <div className="flex justify-end mt-2 space-x-4">{children}</div>
    </div>
  );
};

export default function Modal(props: ModalProps) {
  const { title, children, id } = props;
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const modal = searchParams.get("modal");
    setShow(modal === id);
  }, [searchParams, id]);

  const close = () => {
    router.back();
  };

  return (
    <div
      className={`infn-modal ${show ? "show" : "hide"}`}
      onClick={close}
      aria-hidden="true"
    >
      <div
        className={`infn-modal-content ${show ? "show" : "hide"}`}
        onClick={e => e.stopPropagation()}
        aria-hidden="true"
      >
        <div className="infn-modal-header">
          <div className="infn-subtitle">{title}</div>
          <CloseButton onClose={close} />
        </div>
        {children}
      </div>
    </div>
  );
}
