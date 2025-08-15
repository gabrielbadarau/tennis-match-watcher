import { pad2, escapeICS } from '../utils/text.js';
import env from '../config/env.js';
import { MatchFields } from '../utils/types.js';

const TZID = 'Europe/Bucharest';

function ymdhms(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(
    d.getMinutes(),
  )}00`;
}

function buildLocal(dateStr: string, timeStr: string) {
  // local "wall time", TZ applied on the property via TZID
  return ymdhms(new Date(`${dateStr}T${timeStr}:00`));
}

function addHoursLocal(dateStr: string, timeStr: string, hours: number) {
  const d = new Date(`${dateStr}T${timeStr}:00`);
  d.setHours(d.getHours() + hours);
  return ymdhms(d);
}

export function buildICSForMatch(
  m: MatchFields,
  seq: number = 1,
  method: 'REQUEST' | 'PUBLISH' = 'REQUEST',
) {
  const uid = `match-${m.match_id}@match-watcher`;
  const dtstamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');

  const dtstartLocal = buildLocal(m.schedule_date, m.schedule_hour);
  const dtendLocal = addHoursLocal(m.schedule_date, m.schedule_hour, 2); // 2h default

  const summary = `${m.player_name} vs ${m.opponent_name} — ${m.tournament_name} (${m.game_level})`;
  const location = `${m.club_name} - Court ${m.court_name}`;
  const descriptionLines = [
    `Tournament: ${m.tournament_name}`,
    `Level: ${m.game_level} / ${m.game_type}`,
    `Players: ${m.player_name} vs ${m.opponent_name}`,
    m.schedule_info ? `Info: ${m.schedule_info}` : '',
    m.players_notes ? `Player Notes: ${m.players_notes}` : '',
  ]
    .filter(Boolean)
    .join('\\n');

  // Full VTIMEZONE for Europe/Bucharest (EET/EEST)
  const vtimezone = [
    'BEGIN:VTIMEZONE',
    `TZID:${TZID}`,
    'X-LIC-LOCATION:Europe/Bucharest',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0300',
    'TZNAME:EEST',
    'DTSTART:19700329T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0300',
    'TZOFFSETTO:+0200',
    'TZNAME:EET',
    'DTSTART:19701025T040000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
  ].join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'PRODID:-//Match Watcher//EN',
    'VERSION:2.0',
    `METHOD:${method}`,
    'CALSCALE:GREGORIAN',
    vtimezone,
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${TZID}:${dtstartLocal}`,
    `DTEND;TZID=${TZID}:${dtendLocal}`,
    `SEQUENCE:${seq}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    `SUMMARY:${escapeICS(summary)}`,
    `LOCATION:${escapeICS(location)}`,
    `DESCRIPTION:${escapeICS(descriptionLines)}`,
    `ORGANIZER;CN=Match Watcher:mailto:${env.mailUser}`,
    `ATTENDEE;CN=${env.myName};ROLE=REQ-PARTICIPANT;RSVP=TRUE;PARTSTAT=ACCEPTED:mailto:${env.toEmail}`,
    // 🔔 Notification 3 hours before
    'BEGIN:VALARM',
    'TRIGGER:-PT3H', // negative = before the event
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
