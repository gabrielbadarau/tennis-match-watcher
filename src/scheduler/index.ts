import cron, { ScheduledTask } from 'node-cron';
import env from '../config/env';
import { pollMatches } from './jobs';

let job: ScheduledTask | null = null;

export function startScheduler() {
  job = cron.schedule(env.pollCron, () => {
    pollMatches().catch(console.error);
  });
  // immediate first run
  pollMatches().catch(console.error);
}

export function stopScheduler() {
  if (job) job.stop();
}
