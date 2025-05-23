export type CaseType ={
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'closed';
  client: string;
  lawyer: string;
  created_at: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  file?: File; 
}

export type EditableCase = Partial<Omit<CaseType, 'id' | 'created_at'>>;
export type newCase = Omit<CaseType, 'id' | 'created_at'| 'lawyer'|"client">;