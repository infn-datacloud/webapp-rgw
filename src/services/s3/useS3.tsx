// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { s3ClientConfig } from "@/services/s3/actions";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { S3Service } from ".";

export function useS3() {
  const { status, data } = useSession();
  const [service, setService] = useState<S3Service>();

  useEffect(() => {
    async function connect() {
      if (status === "authenticated") {
        if (!data?.credentials) {
          throw new Error("Session not found");
        }
        const config = await s3ClientConfig(data.credentials);
        setService(new S3Service(config));
      }
    }
    connect();
  }, [status, data]);

  return service;
}
