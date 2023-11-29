import { NodePath } from "../../commons/utils";
import { BucketObject, BucketObjectWithProgress } from "../../models/bucket";

export interface State {
  selectedRows: Set<number>;
  currentPath: NodePath<BucketObject>;
  uploadingObjects: BucketObjectWithProgress[];
  downloadingObjects: BucketObjectWithProgress[];
  showModal: boolean;
  showAlert: boolean;
}

export const initialState: State = {
  selectedRows: new Set(),
  currentPath: new NodePath<BucketObject>(""),
  uploadingObjects: [],
  downloadingObjects: [],
  showModal: false,
  showAlert: false
}

type Action =
  | { type: "SELECT_ROWS"; selectedRows: Set<number> }
  | { type: "DESELECT_ALL" }
  | { type: "SHOW_MODAL" }
  | { type: "HIDE_MODAL" }
  | { type: "SET_CURRENT_PATH", nodePath: NodePath<BucketObject> }
  | { type: "UPLOADING", uploadingObjects: BucketObjectWithProgress[] }
  | { type: "DOWNLOADING", downloadingObjects: BucketObjectWithProgress[] }
  | { type: "SHOW_TOO_MANY_DOWNLOAD_ALERT" }
  | { type: "HIDE_TOO_MANY_DOWNLOAD_ALERT" }

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SELECT_ROWS": {
      const { selectedRows } = action;
      return {
        ...state,
        selectedRows
      }
    }
    case "DESELECT_ALL": {
      const { selectedRows } = state;
      selectedRows.clear();
      return {
        ...state,
        selectedRows
      }
    }
    case "SHOW_MODAL":
      return {
        ...state,
        showModal: true
      }
    case "HIDE_MODAL":
      return {
        ...state,
        showModal: false
      }
    case "SET_CURRENT_PATH": {
      const currentPath = action.nodePath;
      const { selectedRows } = state;
      selectedRows.clear();
      return {
        ...state,
        currentPath,
        selectedRows,
      }
    }
    case "UPLOADING": {
      const { uploadingObjects } = action;
      return {
        ...state,
        uploadingObjects
      }
    }
    case "DOWNLOADING": {
      const { downloadingObjects } = action;
      return {
        ...state,
        downloadingObjects
      }
    }
    case "SHOW_TOO_MANY_DOWNLOAD_ALERT":
      return {
        ...state,
        showAlert: true
      }
    case "HIDE_TOO_MANY_DOWNLOAD_ALERT":
      return {
        ...state,
        showAlert: false
      }
  }
}
