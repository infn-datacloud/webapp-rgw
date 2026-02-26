// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel";
import { getMigrations } from "better-auth/db";
import Database from "better-sqlite3";

import { settings } from "@/config";
import { authConfig } from "./auth.ts";

const {
  WEBAPP_RGW_OTEL_DISABLE_TELEMETRY,
  WEBAPP_RGW_OTEL_SERVICE_NAME,
  WEBAPP_RGW_OTEL_SERVICE_NAMESPACE,
  WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT,
} = settings;

declare global {
  var db: Database.Database;
}

const isNodeRuntime = process.env.NEXT_RUNTIME === "nodejs";

async function registerDatabase() {
  globalThis.db = new Database(":memory:");
  const migrations = await getMigrations(authConfig(db));
  const { toBeCreated, toBeAdded, runMigrations } = migrations;
  if (toBeCreated.length + toBeAdded.length > 0) {
    try {
      await runMigrations();
    } catch (e) {
      const msg = e instanceof Error ? e.message : e;
      throw new Error(`Failed to initialize session database, error: ${msg}`);
    }
    console.log("Session database initialized.");
  } else {
    // it should be logged only for not in memory databases
    console.log("Session database already initialized, nothing to do.");
  }
}

async function registerTelemetry() {
  if (WEBAPP_RGW_OTEL_DISABLE_TELEMETRY) {
    return;
  }

  const msg = `Telemetry enabled, sending data to ${WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT}.
Export 'WEBAPP_RGW_OTEL_DISABLE_TELEMETRY=1' to disable telemetry.`;
  console.log(msg);

  if (isNodeRuntime) {
    await import("./instrumentation.node.ts");
  }
  registerOTel({
    serviceName: WEBAPP_RGW_OTEL_SERVICE_NAME,
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
    attributes: {
      "service.namespace": WEBAPP_RGW_OTEL_SERVICE_NAMESPACE,
    },
  });
}

export async function register() {
  await registerDatabase();
  await registerTelemetry();
}
