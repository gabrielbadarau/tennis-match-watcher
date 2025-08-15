import 'dotenv/config';

const requiredVars = [
  'API_URL',
  'API_KEY',
  'MY_NAME',
  'MAIL_SERVICE',
  'MAIL_USER',
  'MAIL_APP_PASSWORD',
  'TO_EMAIL',
] as const;

for (const v of requiredVars) {
  if (!process.env[v]) {
    console.error(`❌ Missing required env var: ${v}`);
    process.exit(1);
  }
}

const env = {
  port: Number(process.env.PORT || 8080),
  apiUrl: process.env.API_URL!,
  apiKey: process.env.API_KEY!,
  apiKeyHeader: process.env.API_KEY_HEADER || 'Apikey',
  myName: process.env.MY_NAME!,
  myFriends: process.env.MY_FRIENDS || '',
  mailService: process.env.MAIL_SERVICE!,
  mailUser: process.env.MAIL_USER!,
  mailAppPassword: process.env.MAIL_APP_PASSWORD!,
  toEmail: process.env.TO_EMAIL!,
  pollCron: process.env.POLL_CRON || '*/30 * * * *',
  stateFile: process.env.STATE_FILE || './data/state.json',
};

export default env;
