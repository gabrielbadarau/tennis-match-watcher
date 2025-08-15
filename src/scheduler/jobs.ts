import apiClient from '../services/apiClient';
import { loadState, saveState } from '../utils/fileStore';
import {
  isAboutMeOrMyFriends,
  isFuture,
  hasLocationAndHour,
  pickFields,
  signature,
} from '../services/matchService';
import { sendMatchInvites } from '../services/emailService';
import env from '../config/env';
import { Match, MatchFields } from '../utils/types';

export async function pollMatches() {
  const t0 = Date.now();
  const ts = () => new Date().toISOString();

  try {
    const state = await loadState();
    const { data } = await apiClient.post<Match[]>(env.apiUrl, undefined);

    if (!Array.isArray(data)) throw new Error('API did not return array');

    const relevant = data
      .filter(isAboutMeOrMyFriends)
      .filter(isFuture)
      .filter(hasLocationAndHour)
      .filter((m: Match) => !m.winner_id && !m.score);

    const changes: { kind: 'NEW' | 'UPDATED'; match: MatchFields; seq: number; diff?: any[] }[] =
      [];

    for (const m of relevant) {
      const fields = pickFields(m);
      const sig = signature(fields);
      const prev = state.byId[fields.match_id];
      if (!prev) {
        changes.push({ kind: 'NEW', match: fields, seq: 1 });
        state.byId[fields.match_id] = { sig, last: fields, seq: 1 };
      } else if (prev.sig !== sig) {
        const nextSeq = (prev.seq || 1) + 1;
        changes.push({ kind: 'UPDATED', match: fields, seq: nextSeq });
        state.byId[fields.match_id] = { sig, last: fields, seq: nextSeq };
      }
    }

    if (!changes.length) {
      console.info(
        `[${ts()}] ✅ No changes detected${
          relevant.length === 0 ? ' (no upcoming relevant matches)' : ''
        } — ${Date.now() - t0}ms`,
      );
    } else {
      const ids = changes.map((c) => `${c.kind}#${c.match.match_id}`).join(', ');

      console.info(`[${ts()}] 📧 ${changes.length} change(s) detected [${ids}] — sending email…`);

      await sendMatchInvites(changes);

      console.info(`[${ts()}] ✅ Email sent — ${Date.now() - t0}ms`);
    }

    await saveState(state);
  } catch (err: any) {
    console.error(`[${ts()}] ❌ pollMatches error:`, err?.message || err);
  }
}
