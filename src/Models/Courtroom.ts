
export interface SimulationResponse {
  session_id: string;
  history: string[];
  next_speaker: string | null;
  simulation_over: boolean;
}