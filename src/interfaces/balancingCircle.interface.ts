export interface Forecast {
  date: string; // or string, depending on your data
  value: number;
}

export interface Member {
  id: string; // ID type
  name: string;
  type: 'Producer' | 'Consumer';
  inflows: Map<string, number>; // Changed from array to Map for inflows
  outflows: Map<string, number>;
}

export interface ImbalaceValue {
  value: number; // Change from string to number
}

export interface ImbalanceTime {
  time: string;
  value: number; // Keep this as is
}

export interface Date {
  date: string; // Keep this as a string, if that's your intended use
  imbalance: ImbalanceTime[];
}


export interface Group {
  groupName: string;
  imbalances: Date[];
  members: Member[];
}
