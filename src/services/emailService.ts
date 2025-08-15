import nodemailer from 'nodemailer';
import env from '../config/env';
import { buildICSForMatch } from './calendar';
import { MatchFields, MatchWatcherMailOptions } from '../utils/types';
import { normalize } from '../utils/text';

interface ChangeItem {
  kind: 'NEW' | 'UPDATED';
  match: MatchFields;
  seq: number;
  diff?: { field: string; from: any; to: any }[];
}

function toHTML(items: ChangeItem[], myName: string) {
  const styles = `
  <style>
    body { font-family: Arial, sans-serif; background:#f7f7fb; padding:24px; color:#111; }
    .container { max-width: 720px; margin: 0 auto; background:#fff; border-radius:16px; box-shadow: 0 6px 24px rgba(0,0,0,0.06); overflow: hidden; border-left: 0.5px solid #d1d5db; border-right: 0.5px solid #d1d5db; border-bottom: 0.5px solid #d1d5db;}
    .header { background: #0F2027; background: -webkit-linear-gradient(to right, #2C5364, #203A43, #0F2027); background: linear-gradient(to right, #2C5364, #203A43, #0F2027); color:#fff; padding:20px 24px; }
    .header h1 { margin:0; font-size:20px; }
    .match { background-color: #f8fafc; padding:16px; border-bottom: 0.5px solid #d1d5db;}
    .badge { display:inline-block; font-size:10.5px; padding:2px 6px; border-radius:999px; color:#fff; }
    .badge.new { background:#1e293b; }
    .badge.updated { background:#dc2626; }
    .note { background:#f9fafb; border:1px dashed #e5e7eb; padding:10px; border-radius:12px; margin-top:8px; color:#333; }
    .changes { margin-top:8px; font-size:13px; color:#333; }
    .card-title { display:inline-block; vertical-align:middle; }
  </style>`;

  const body = items
    .map((item) => {
      const m = item.match;
      const badge =
        item.kind === 'NEW'
          ? `<span class="badge new">NEW</span>`
          : `<span class="badge updated">UPDATED</span>`;
      const sideNotes = [m.schedule_info, m.players_notes].filter(Boolean).length
        ? `<div class="note"><b>Side notes:</b><br>${[m.schedule_info, m.players_notes]
            .filter(Boolean)
            .join('<br>')}</div>`
        : '';
      const changes = item.diff?.length
        ? `<ul class="changes">${item.diff
            .map((d) => `<li><b>${d.field}</b>: "${d.from ?? '—'}" → "${d.to ?? '—'}"</li>`)
            .join('')}</ul>`
        : '';
      return `
    <div class="match">
      <div class="card-title">${badge} <b style="margin-left:4px">${m.player_name} vs ${m.opponent_name}</b></div>
      <div style="margin-top:8px; display:flex;"><img width="24" height="24" src="https://img.icons8.com/quill/24/trophy.png" alt="trophy" style="margin-right:6px"/> ${m.tournament_name} — ${m.game_level} / ${m.game_type}</div>
      <div style="display:flex;"><img width="24" height="24" src="https://img.icons8.com/quill/24/calendar.png" alt="calendar" style="margin-right:6px"/> ${m.schedule_day} at ${m.schedule_hour}</div>
      <div style="display:flex;"><img width="24" height="24" src="https://img.icons8.com/quill/24/marker.png" alt="marker" style="margin-right:6px"/> ${m.club_name} — Court ${m.court_name}</div>
      ${sideNotes}
      ${changes}
    </div>`;
    })
    .join('');

  return `<!doctype html><html><head>${styles}</head><body><div class="container"><div class="header"><h1>Match Info</h1></div>${body}</div></body></html>`;
}

export async function sendMatchInvites(items: ChangeItem[]) {
  const transporter = nodemailer.createTransport({
    service: env.mailService,
    auth: { user: env.mailUser, pass: env.mailAppPassword },
  });

  for (const item of items) {
    const m = item.match;
    const subjectBase = `${m.player_name} vs ${m.opponent_name}`;
    const subject = `🎾 ${subjectBase}`;

    console.info('Match Info to be sent: ', item.match);

    const mailOptions: MatchWatcherMailOptions = {
      from: `"Match Watcher" <${env.mailUser}>`,
      to: env.toEmail,
      subject,
      html: toHTML([item], env.myName),
    };

    const isMatchAboutMe =
      normalize(m.player_name).includes(normalize(env.myName)) ||
      normalize(m.opponent_name).includes(normalize(env.myName));

    if (isMatchAboutMe) {
      mailOptions.icalEvent = {
        method: 'REQUEST',
        content: buildICSForMatch(m, item.seq, 'REQUEST'),
        filename: `match-${m.match_id}.ics`,
      };
    }

    await transporter.sendMail(mailOptions);
  }
}
