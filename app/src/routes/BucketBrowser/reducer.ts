import { NodePath } from "../../commons/utils";
import { TableData } from "../../components/Table";
import { BucketObject, BucketObjectWithProgress } from "../../models/bucket";
import { getTableData } from "./services";

export interface State {
  tableData: TableData;
  selectedRows: number;
  currentPath: NodePath<BucketObject>;
  uploadingObjects: BucketObjectWithProgress[];
  downloadingObjects: BucketObjectWithProgress[];
  showModal: boolean;
  showAlert: boolean;
}

export const initialState: State = {
  tableData: { rows: [], cols: [] },
  selectedRows: 0,
  currentPath: new NodePath<BucketObject>(""),
  uploadingObjects: [],
  downloadingObjects: [],
  showModal: false,
  showAlert: false
}

type Action =
  | { type: "SELECT_ROW"; index: number }
  | { type: "SELECT_EXCLUSIVE_ROW"; index: number }
  | { type: "DESELECT_ROW"; index: number }
  | { type: "DESELECT_ALL" }
  | { type: "SHOW_MODAL" }
  | { type: "HIDE_MODAL", nextPath: NodePath<BucketObject> }
  | { type: "SET_CURRENT_PATH", nodePath: NodePath<BucketObject> }
  | { type: "UPLOADING", uploadingObjects: BucketObjectWithProgress[] }
  | { type: "DOWNLOADING", downloadingObjects: BucketObjectWithProgress[] }
  | { type: "SHOW_TOO_MANY_DOWNLOAD_ALERT" }
  | { type: "HIDE_TOO_MANY_DOWNLOAD_ALERT" }

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SELECT_ROW": {
      const { tableData } = state;
      let { selectedRows } = state;
      tableData.rows[action.index].selected = true;
      ++selectedRows;
      return {
        ...state,
        tableData,
        selectedRows
      }
    }
    case "SELECT_EXCLUSIVE_ROW": {
      const { tableData } = state;
      tableData.rows.forEach(r => r.selected = false);
      tableData.rows[action.index].selected = true;
      const selectedRows = 1;
      return {
        ...state,
        tableData,
        selectedRows
      }
    }
    case "DESELECT_ROW": {
      const { tableData } = state;
      let { selectedRows } = state;
      tableData.rows[action.index].selected = false;
      selectedRows--;
      if (selectedRows < 0) { selectedRows = 0; }
      return {
        ...state,
        tableData,
        selectedRows
      }
    }
    case "DESELECT_ALL": {
      const { tableData } = state;
      tableData.rows.forEach(r => r.selected = false);
      const selectedRows = 0;
      return {
        ...state,
        tableData,
        selectedRows
      }
    }
    case "SHOW_MODAL":
      return {
        ...state,
        showModal: true
      }
    case "HIDE_MODAL": {
      const currentPath = action.nextPath;
      const tableData = getTableData(currentPath);
      const selectedRows = 0;
      return {
        ...state,
        showModal: false,
        currentPath,
        tableData,
        selectedRows,
      }
    }
    case "SET_CURRENT_PATH": {
      const currentPath = action.nodePath;
      const tableData = getTableData(currentPath);
      return {
        ...state,
        currentPath,
        tableData,
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
