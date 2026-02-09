// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { getS3ServiceConfig } from "@/services/s3/actions";
import { useEffect, useState } from "react";
import { S3Service } from ".";

export function useS3() {
  const [service, setService] = useState<S3Service>();

  useEffect(() => {
    async function connect() {
      const s3Config = await getS3ServiceConfig();
      setService(new S3Service(s3Config));
    }
    connect();
  }, []);

  return service;
}
