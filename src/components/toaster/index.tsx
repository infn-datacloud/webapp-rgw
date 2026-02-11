// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { toast } from "sonner";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type ToastType = "info" | "success" | "warning" | "danger";

type IconProps = {
  type: ToastType;
};

function Icon(props: Readonly<IconProps>) {
  const { type } = props;
  switch (type) {
    case "info":
      return (
        <InformationCircleIcon key="circle-icon" className="text-primary" />
      );
    case "success":
      return <CheckCircleIcon key="check-icon" className="text-success" />;
    case "warning":
      return (
        <ExclamationTriangleIcon key="danger-icon" className="text-warning" />
      );
    case "danger":
      return (
        <ExclamationCircleIcon
          key="danger-circle-icon"
          className="text-danger"
        />
      );
  }
}

type CustomToastProps = {
  title: string;
  subtitle?: string;
  dismiss: () => void;
  type: "info" | "success" | "warning" | "danger";
};

const CustomToast = (props: Readonly<CustomToastProps>) => {
  const { title, subtitle, dismiss, type } = props;
  return (
    <div className={"flex w-96"}>
      <div className="text:primary dark:text-secondary w-full rounded-lg border border-gray-300 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-slate-800">
        <div className="flex w-full items-center">
          <div className="mr-4 w-5">
            <Icon type={type} />
          </div>
          <div className="mr-6 ml-2">
            <span className="font-semibold">{title}</span>
            <span className="block text-gray-500">{subtitle}</span>
          </div>
          <div className="m-auto mr-0">
            <button
              className="hover:bg-secondary dark:hover:bg-light w-8 rounded-full p-1.25 text-neutral-500"
              onClick={dismiss}
            >
              <XCircleIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const toaster = {
  info: (message: string, subtitle?: string) =>
    toast.custom(t => (
      <CustomToast
        title={message}
        subtitle={subtitle}
        dismiss={() => toast.dismiss(t)}
        type="info"
      />
    )),
  success: (message: string, subtitle?: string) =>
    toast.custom(t => (
      <CustomToast
        title={message}
        subtitle={subtitle}
        dismiss={() => toast.dismiss(t)}
        type="success"
      />
    )),
  warning: (message: string, subtitle?: string) =>
    toast.custom(t => (
      <CustomToast
        title={message}
        subtitle={subtitle}
        dismiss={() => toast.dismiss(t)}
        type="warning"
      />
    )),
  danger: (message: string, subtitle?: string) =>
    toast.custom(t => (
      <CustomToast
        title={message}
        subtitle={subtitle}
        dismiss={() => toast.dismiss(t)}
        type="danger"
      />
    )),
};
