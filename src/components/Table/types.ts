export type ColumnId = string;

export interface Cell {
  value: string | React.ReactElement;
}

export interface Column {
  id: ColumnId;
  name?: string;
}

export interface Row {
  selected: boolean;
  columns: Map<ColumnId, Cell>;
}

export interface TableData {
  rows: Row[];
  cols: Column[];
}
