// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

export function SummaryLoading(props: Readonly<{ bucket?: string }>) {
  const { bucket } = props;
  return (
    <div className="bg-secondary text-primary dark:text-secondary dark:border-secondary/30 mt-4 rounded-xl border border-gray-200 p-4 dark:bg-transparent">
      <div className="flex flex-col gap-1">
        <div className="text-xl font-bold">{bucket}</div>
        {/* Animation */}
        <div className="dark:bg-secondary/20 my-auto h-3 max-w-24 animate-pulse rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
