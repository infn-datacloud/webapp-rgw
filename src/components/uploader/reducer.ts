// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { FileObjectWithProgress } from "@/models/bucket";

export type State = {
  show: boolean;
  inProgress: number;
  allComplete: boolean;
  progressStates: Map<string, FileObjectWithProgress>;
};

export const defaultState = {
  show: false,
  inProgress: 0,
  allComplete: false,
  progressStates: new Map<string, FileObjectWithProgress>(),
};

type Action =
  | { type: "START_UPLOADS"; objects: FileObjectWithProgress[] }
  | { type: "ON_UPDATE"; object: FileObjectWithProgress }
  | { type: "ON_COMPLETE" }
  | { type: "ABORT"; object: FileObjectWithProgress }
  | { type: "ABORT_ALL" }
  | { type: "CLOSE" };

export default function reducer(state: State, action: Action) {
  switch (action.type) {
    case "START_UPLOADS": {
      const progressStates = new Map(state.progressStates);
      action.objects.forEach(obj => progressStates.set(obj.id, obj));
      return {
        ...state,
        progressStates,
        show: true,
        inProgress: state.inProgress + action.objects.length,
        allComplete: false,
      };
    }
    case "ON_UPDATE": {
      const progressStates = new Map(state.progressStates);
      progressStates.set(action.object.id, action.object);
      return {
        ...state,
        progressStates,
      };
    }
    case "ON_COMPLETE": {
      let { inProgress, allComplete, ...other } = state;
      if (--inProgress <= 0) {
        inProgress = 0;
        allComplete = true;
      }
      return {
        inProgress,
        allComplete,
        ...other,
      };
    }
    case "ABORT": {
      let { inProgress, allComplete, progressStates, ...other } = state;
      if (--inProgress <= 0) {
        inProgress = 0;
        allComplete = true;
      }
      const newProgressStates = new Map(progressStates);
      const toAbort = newProgressStates.get(action.object.id);
      if (toAbort) {
        toAbort.abort();
      }
      return {
        inProgress,
        allComplete,
        progressStates: newProgressStates,
        ...other,
      };
    }
    case "ABORT_ALL": {
      let { inProgress, allComplete, progressStates, ...other } = state;
      inProgress = 0;
      allComplete = true;
      const newProgressStates = new Map(progressStates);
      newProgressStates.forEach(ps => {
        if (ps.state() === "pending" || ps.state() === "uploading") {
          ps.abort();
        }
      });
      return {
        inProgress,
        allComplete,
        progressStates,
        ...other,
      };
    }
    case "CLOSE": {
      return {
        ...defaultState,
        show: false,
        progressStates: new Map<string, FileObjectWithProgress>(),
      };
    }
  }
}
