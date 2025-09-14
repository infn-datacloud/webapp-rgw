// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { FileObjectWithProgress } from "@/models/bucket";

type State = {
  inProgress: number;
  allComplete: boolean;
  showPopup: boolean;
  progressStates: Map<string, FileObjectWithProgress>;
};

export const defaultState = {
  inProgress: 0,
  allComplete: false,
  showPopup: false,
  progressStates: new Map<string, FileObjectWithProgress>(),
};

type Action =
  | { type: "START_UPLOADS"; objects: FileObjectWithProgress[] }
  | { type: "ON_UPDATE"; object: FileObjectWithProgress }
  | { type: "ON_COMPLETE" };

export default function reducer(state: State, action: Action) {
  switch (action.type) {
    case "START_UPLOADS": {
      const progressStates = new Map(state.progressStates);
      action.objects.forEach(obj => progressStates.set(obj.id, obj));
      return {
        ...state,
        progressStates,
        inProgress: state.inProgress + action.objects.length,
        showPopup: true,
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
      let { inProgress, allComplete, showPopup, progressStates, ...other } =
        state;
      --inProgress;

      if (inProgress <= 0) {
        inProgress = 0;
        progressStates = new Map();
        allComplete = true;
      }
      return {
        inProgress,
        progressStates,
        allComplete,
        showPopup,
        ...other,
      };
    }
  }
}
