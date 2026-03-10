// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel";
import { getMigrations } from "better-auth/db/migration";
import Database from "better-sqlite3";

import { settings } from "@/config";

const {
  WEBAPP_RGW_VERSION,
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
  if (!isNodeRuntime) {
    return;
  }
  // this must be imported after registering the telemetry, but don't know way
  const auth = await import("@/auth.ts");
  globalThis.db = new Database(":memory:");
  const migrations = await getMigrations(auth.authConfig(globalThis.db));
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
      "service.name": WEBAPP_RGW_OTEL_SERVICE_NAME,
      "service.namespace": WEBAPP_RGW_OTEL_SERVICE_NAMESPACE,
      "service.version": WEBAPP_RGW_VERSION,
    },
  });
}

export async function register() {
  // for a completely unknown reason, telemetry must be registered first,
  // otherwise AWS instrumentation won't work.
  await registerTelemetry();
  await registerDatabase();
}
