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

export type CaseTypeWithURL = CaseType & {

   id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'closed';
  client: string;
  lawyer: string;
  created_at: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  document_url?: string; // URL of the file
};

export type EditableCase = Partial<Omit<CaseType, 'id' | 'created_at'>>;
export type newCase = Omit<CaseType, 'id' | 'created_at'| 'lawyer'|"client">;