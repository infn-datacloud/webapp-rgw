export interface Cell {
  value: string | React.ReactElement;
}

export interface Column {
  id: string;
  name?: string;
}

export interface Row {
  id: string;
  selected: boolean;
  columns: Map<string, Cell>;
}

export interface TableData {
  rows: Row[];
  cols: Column[];
}
