import { Checkbox as HeadlessCheckbox } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/16/solid";

type CheckBoxProps = {
  checked?: boolean;
  onChange?: (value: boolean) => void;
};

export function Checkbox(props: Readonly<CheckBoxProps>) {
  const { checked, onChange } = props;

  return (
    <HeadlessCheckbox
      checked={checked}
      onChange={onChange}
      className="focus:not-data-focus:outline-none data-checked:bg-white data-focus:outline data-focus:outline-offset-2 data-focus:outline-white group flex size-5 items-center rounded-md border bg-white/10 ring-1 ring-inset ring-white/15"
    >
      <CheckIcon className="m-auto hidden size-4 fill-gray-700 group-data-[checked]:block" />
    </HeadlessCheckbox>
  );
}
