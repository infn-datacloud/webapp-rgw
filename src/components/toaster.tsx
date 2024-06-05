import { toast } from "sonner";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const CustomToast = (props: {
  title: string;
  subtitle?: string;
  dismiss: () => void;
  type: "info" | "success" | "warning" | "danger";
}) => {
  const { title, subtitle, dismiss, type } = props;

  let Icon = () => {
    switch (type) {
      case "info":
        return (
          <InformationCircleIcon
            key="circle-icon"
            className="text-neutral-800"
          />
        );
      case "success":
        return <CheckCircleIcon key="check-icon" className="text-green-500" />;
      case "warning":
        return (
          <ExclamationTriangleIcon
            key="danger-icon"
            className="text-amber-500"
          />
        );
      case "danger":
        return <ExclamationCircleIcon
          key="danger-circle-icon"
          className="text-red-500"
        />;
    }
  };

  return (
    <div className={"flex w-96"}>
      <div className="bg-white rounded-lg border-gray-300 border p-3 shadow-lg w-full">
        <div className="flex items-center w-full">
          <div className="w-5 mr-4">
            <Icon />
          </div>
          <div className="ml-2 mr-6">
            <span className="font-semibold">{title}</span>
            <span className="block text-gray-500">{subtitle}</span>
          </div>
          <div className="m-auto mr-0">
            <button
              className="w-8 p-[5px] text-neutral-500 hover:bg-neutral-200 rounded-full"
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
