export type CaseType = {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'pending' | 'closed';
    client: string;
    date: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
};