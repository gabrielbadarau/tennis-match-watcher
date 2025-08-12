import express from 'express';
import env from './config/env';
import { startScheduler, stopScheduler } from './scheduler/index';
import { pollMatches } from './scheduler/jobs';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/trigger', async (_req, res) => {
  try {
    await pollMatches();
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'error' });
  }
});

app.listen(env.port, () => {
  startScheduler();
  console.log(`🚀 Server running on http://localhost:${env.port}`);
});

process.on('SIGINT', () => {
  stopScheduler();
  process.exit(0);
});
