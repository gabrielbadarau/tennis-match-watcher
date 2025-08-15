# 📅 Match Watcher — Automatic Tennis Match Notifications

Match Watcher is a **Node.js + Express + TypeScript** application that monitors your tennis matches (and optionally your friends' matches) and sends automatic **email notifications** with **calendar invites** when new matches are scheduled or existing ones change.  
It polls your tennis API every 30 minutes (configurable via cron) and updates you in real time.

## ✨ Features

- ⏱ **Automatic polling** of your match schedule from a given API.
- 📩 **Beautiful HTML emails** with match details:
  - Tournament name, match level, game type
  - Date, time, club, and court
  - Side notes and player notes
- 📅 **iCalendar (.ics) invites** so matches appear in Google Calendar, iPhone Calendar, Outlook, etc.
- 🔄 **Update detection** — if a match is rescheduled, location changes, or notes are added, you get an updated invite.
- 👥 **Friends Mode** — get notified about your friends’ matches (without sending calendar invites).
- 🛠 **Developer-friendly modular code** using TypeScript, Axios, Node-Cron, and Nodemailer.

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/match-watcher.git
cd match-watcher

# Install dependencies
npm install

# Create a .env file from the example
cp .env.example .env
```

---

## ⚙️ Configuration

Edit the `.env` file with your own details:

```env
# === Match Watcher Config ===

# POST endpoint that returns your schedule array
API_URL=https://your-supabase-project-url/rest/v1/rpc/get_schedule

# API key auth (header name defaults to X-API-Key if not set)
API_KEY=your_api_key_here
API_KEY_HEADER=Apikey

# Your name exactly as it appears in the API
MY_NAME=Your Name Here

# Comma-separated list of friends’ names (exactly as they appear in the API)
# Matches involving these friends will trigger email notifications (without calendar invites)
MY_FRIENDS=John Doe,Jane Smith,Mark Johnson

# Email sending config (supports Gmail, Yahoo, Outlook, etc.)
MAIL_SERVICE=yahoo
MAIL_USER=your-email@example.com
MAIL_APP_PASSWORD=your_app_password_here

# Where to receive notifications
TO_EMAIL=recipient@example.com

# Poll every 30 minutes
POLL_CRON=*/30 * * * *

# State file path
STATE_FILE=./data/state.json

# Express port
PORT=8080
```

---

## 📧 Getting `MAIL_USER` and `MAIL_APP_PASSWORD`

### Gmail

1. Go to [Google Account Security](https://myaccount.google.com/security).
2. Enable **2-Step Verification**.
3. Go to **App Passwords** → create a new app password for "Mail".
4. Use your Gmail address as `MAIL_USER` and the generated 16-character password as `MAIL_APP_PASSWORD`.

### Yahoo Mail

1. Go to [Yahoo Account Security](https://login.yahoo.com/account/security).
2. Enable **2-Step Verification**.
3. Click **Generate app password** → choose "Other App" (name it `Match Watcher`).
4. Use your Yahoo email as `MAIL_USER` and the generated password as `MAIL_APP_PASSWORD`.

### Outlook/Hotmail

1. Go to [Microsoft Security Settings](https://account.live.com/proofs/Manage).
2. Enable **Two-step verification**.
3. Under **App passwords**, create a new one for this app.
4. Use your Outlook address as `MAIL_USER` and the generated password as `MAIL_APP_PASSWORD`.

---

## 🚀 Running the App

```bash
# Development mode (auto-restarts on changes)
npm run dev

# Production build
npm run build
npm start
```

---

## 🕒 How It Works

1. **Polling** — Every `POLL_CRON` interval (default: every 30 minutes), the app requests match data from your API.
2. **Detection** — It compares the latest data with the saved state in `STATE_FILE`.
3. **Notification** — If new matches or updates are found:
   - Sends a **beautiful HTML email** with match details.
   - Attaches an **.ics invite** so the event appears in your calendar automatically.
4. **Update Handling** — If a match changes (time, location, notes), an updated calendar invite is sent.

---

## 📅 Calendar Auto-Add Tips

- **Google Calendar**: Gmail automatically detects `.ics` invites from trusted senders and adds them to your calendar.
- **Apple Calendar (iPhone/Mac)**: If you open the email in the Mail app and it contains a valid `.ics` invite, you’ll be prompted to add it to your calendar automatically.
- If using the **same email as sender and recipient**, some providers may skip auto-adding; use a different sender email if needed.

---

## 📜 License

MIT License.
