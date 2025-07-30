// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col justify-center space-y-4 p-32 text-center">
      <p className="gap-2 text-5xl text-pink-600">
        <span className="text-7xl text-gray-400">500</span> Internal Server
        Error
      </p>
      <div>
        <p className="text-gray-600">Oops, something went wrong :&#40;</p>
        <p className="text-gray-600">
          We apologize for the inconvenience. Please try again later.
        </p>
      </div>
    </div>
  );
}
