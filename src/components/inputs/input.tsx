// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  error?: string;
}

export default function Input(props: Readonly<InputProps>) {
  const { error, ...others } = props;
  return (
    <div className={props.className}>
      <input
        className="placeholder:text-secondary-light font-small border-primary text-primary dark:border-secondary dark:text-secondary w-full rounded-full border bg-white px-3 py-2 text-sm dark:bg-slate-800"
        {...others}
      />
      {error ? <div className="text-danger">{error}</div> : null}
    </div>
  );
}
