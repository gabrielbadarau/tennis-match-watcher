import crypto from 'node:crypto';
import env from '../config/env.ts';
import { normalize } from '../utils/text';
import { Match, MatchFields } from '../utils/types';

export function isAboutMeOrMyFriends(m: Match) {
  const myFriends = env.myFriends.split(',').map(normalize);

  const isMe =
    normalize(m.player_name).includes(normalize(env.myName)) ||
    normalize(m.opponent_name).includes(normalize(env.myName));

  const isFriend = myFriends.some(
    (friend) =>
      normalize(m.player_name).includes(friend) || normalize(m.opponent_name).includes(friend),
  );

  return isMe || isFriend;
}

export function isFuture(m: Match) {
  if (!m.schedule_date) return false;

  const today = new Date().toISOString().slice(0, 10);
  return m.schedule_date >= today;
}

export function hasLocationAndHour(m: Match) {
  return Boolean(m.club_name) && Boolean(m.court_name) && Boolean(m.schedule_hour);
}

export function pickFields(m: Match): MatchFields {
  return {
    match_id: m.match_id,
    tournament_name: m.tournament_name,
    game_level: m.game_level,
    game_type: m.game_type,
    player_name: m.player_name,
    opponent_name: m.opponent_name,
    schedule_date: m.schedule_date,
    schedule_day: m.schedule_day,
    schedule_hour: m.schedule_hour,
    club_name: m.club_name,
    court_name: m.court_name,
    schedule_info: m.schedule_info,
    players_notes: m.players_notes,
    is_final: m.is_final,
    is_draft: m.is_draft,
    winner_id: m.winner_id,
    gl_position: m.gl_position,
    tournament_id: m.tournament_id,
  };
}

export function signature(fields: MatchFields) {
  const key = {
    schedule_date: fields.schedule_date,
    schedule_day: fields.schedule_day,
    schedule_hour: fields.schedule_hour,
    club_name: fields.club_name,
    court_name: fields.court_name,
    schedule_info: fields.schedule_info,
    players_notes: fields.players_notes,
    is_final: fields.is_final,
    is_draft: fields.is_draft,
    winner_id: fields.winner_id,
    gl_position: fields.gl_position,
  };
  return crypto.createHash('sha256').update(JSON.stringify(key)).digest('hex');
}
