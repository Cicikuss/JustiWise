const apiCalltoSimulation = async (endpoint: string, body: object): Promise<SimulationResponse | null> => {

    const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || 'API tarafında bir hata oluştu.');
    }
    return await response.json();

};
