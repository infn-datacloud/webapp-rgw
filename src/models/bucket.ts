// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { _Object } from "@aws-sdk/client-s3";

export type UploadedChunkMetadata = {
  bytes: number; // bytes
  interval: number; // milliseconds
};

export class FileObjectWithProgress {
  id: string;
  object: _Object;
  file: File;
  abortController: AbortController;
  #loaded: number;
  #size: number;
  #state: "pending" | "uploading" | "complete" | "aborted";
  #lastUpdate: number;
  #lastUploadedChunk: UploadedChunkMetadata;

  constructor(object: _Object, file: File) {
    this.id = self.crypto.randomUUID();
    this.object = object;
    this.file = file;
    this.#loaded = 0;
    this.#size = 0;
    this.abortController = new AbortController();
    this.#state = "pending";
    this.#lastUpdate = 0;
    this.#lastUploadedChunk = { bytes: 0, interval: 0 };
  }

  setLoaded(value: number) {
    const now = Date.now();
    const interval = now - this.#lastUpdate;
    const bytes = value - this.#loaded;
    this.#lastUploadedChunk = { bytes, interval };
    this.#lastUpdate = now;
    this.#loaded = value;
  }

  setSize(value: number) {
    this.#size = value;
  }

  size() {
    return this.#size;
  }

  loaded() {
    return this.#loaded;
  }

  progress() {
    if (this.#size === 0) {
      return 0;
    }
    return this.#loaded / this.#size;
  }

  lastUploadedChunk() {
    return this.#lastUploadedChunk;
  }

  abort() {
    this.#loaded = this.#size;
    this.abortController.abort();
    this.#state = "aborted";
  }

  aborted() {
    return this.abortController.signal.aborted;
  }

  state() {
    return this.#state;
  }

  start() {
    this.#state = "uploading";
  }

  complete() {
    this.#state = "complete";
  }
}

export type BucketConfiguration = {
  versioning: boolean;
  objectLock: boolean;
};
