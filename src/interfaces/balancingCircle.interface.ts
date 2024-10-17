// Interface definition to determine properties and types for specific objects

export interface Member {
  id: string;
  name: string;
  type: 'Producer' | 'Consumer';
  inflows: Map<string, number>;
  outflows: Map<string, number>;
}

export interface ImbalanceTime {
  time: string;
  value: number;
}

export interface Date {
  date: string;
  imbalance: ImbalanceTime[];
}


export interface Group {
  groupName: string;
  imbalances: Date[];
  members: Member[];
}
