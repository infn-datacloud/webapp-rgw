// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

export interface ToggleSwitchProps extends React.HTMLProps<HTMLInputElement> {
  defaultChecked?: boolean;
}

export default function ToggleSwitch(props: ToggleSwitchProps) {
  const { defaultChecked, ...other } = props;
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        defaultChecked={defaultChecked}
        {...other}
      />
      <div className="peer-focus:ring-primary-light peer peer-checked:bg-primary dark:peer-checked:bg-success h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-600"></div>
    </label>
  );
}
