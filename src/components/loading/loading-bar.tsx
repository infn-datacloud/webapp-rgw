// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

type LoadingBarProps = {
  show: boolean;
};

export function LoadingBar(props: Readonly<LoadingBarProps>) {
  const { show } = props;
  return (
    <div
      className="bg-primary/10 dark:bg-secondary/10 h-1.5 w-full overflow-hidden rounded-full data-[hidden=true]:hidden"
      data-hidden={!show}
    >
      <div className="animate-wiggle bg-primary dark:bg-primary-200 h-full w-full origin-left rounded-full" />
    </div>
  );
}
