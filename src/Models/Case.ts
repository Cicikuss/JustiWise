export type CaseType ={
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'closed';
  client: string;
  lawyer: string;
  date: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  file?: File; 
}

export type EditableCase = Partial<Omit<CaseType, 'id' | 'date'>>;
export type newCase = Omit<CaseType, 'id' | 'date'| 'lawyer'|"client">;