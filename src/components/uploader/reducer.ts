// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { FileObjectWithProgress } from "@/models/bucket";

export type State = {
  show: boolean;
  inProgress: Map<string, FileObjectWithProgress>;
  completed: Map<string, FileObjectWithProgress>;
};

export const defaultState = {
  show: false,
  inProgress: new Map<string, FileObjectWithProgress>(),
  completed: new Map<string, FileObjectWithProgress>(),
};

type Action =
  | { type: "START_UPLOAD"; fileObject: FileObjectWithProgress }
  | { type: "ON_UPDATE"; fileObject: FileObjectWithProgress }
  | { type: "ON_COMPLETE"; fileObject: FileObjectWithProgress }
  | { type: "ABORT"; fileObject: FileObjectWithProgress }
  | { type: "ABORT_ALL" }
  | { type: "CLOSE" };

export default function reducer(state: State, action: Action) {
  switch (action.type) {
    case "START_UPLOAD": {
      const inProgress = new Map(state.inProgress);
      inProgress.set(action.fileObject.id, action.fileObject);
      const show = true;
      return {
        ...state,
        inProgress,
        show,
      };
    }
    case "ON_UPDATE": {
      const inProgress = new Map(state.inProgress);
      inProgress.set(action.fileObject.id, action.fileObject);
      return {
        ...state,
        inProgress,
      };
    }
    case "ON_COMPLETE": {
      const inProgress = new Map(state.inProgress);
      const completed = new Map(state.completed);
      inProgress.delete(action.fileObject.id);
      completed.set(action.fileObject.id, action.fileObject);
      return {
        ...state,
        inProgress,
        completed,
      };
    }
    case "ABORT": {
      const inProgress = new Map(state.inProgress);
      const completed = new Map(state.completed);
      inProgress.delete(action.fileObject.id);
      completed.set(action.fileObject.id, action.fileObject);
      action.fileObject.abort();
      return {
        ...state,
        inProgress,
        completed,
      };
    }
    case "ABORT_ALL": {
      const inProgress = new Map(state.inProgress);
      const completed = new Map(state.completed);
      inProgress.forEach(ps => {
        if (ps.state() === "pending" || ps.state() === "uploading") {
          ps.abort();
          completed.set(ps.id, ps);
        }
      });
      return {
        ...state,
        inProgress,
        completed,
      };
    }
    case "CLOSE": {
      return defaultState;
    }
  }
}
