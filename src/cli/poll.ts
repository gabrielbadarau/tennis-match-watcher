import { pollMatches } from '../scheduler/jobs.js';

(async () => {
  try {
    await pollMatches();
  } catch (err) {
    process.exit(1);
  }
})();
