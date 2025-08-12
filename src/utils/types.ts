export interface Match {
  match_id: number;
  tournament_id: number;
  competition_id: number;
  tournament_name: string;
  county: string;
  game_level: string;
  game_type: string;
  player_id: number;
  opponent_id: number;
  winner_id: number;
  score: string;
  player_name: string;
  opponent_name: string;
  schedule_day: string;
  schedule_hour: string;
  gl_position: number;
  club_name: string;
  court_name: string;
  schedule_date: string;
  is_draft: boolean;
  umpire: string;
  schedule_info: string;
  players_notes: string | null;
  is_final: boolean;
}
