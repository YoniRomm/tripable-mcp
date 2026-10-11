# Tripable MCP

Connect Claude (or any MCP-compatible AI assistant) to your [Tripable](https://tripableai.com) trips. Ask it to list your trips, add activities, expenses, todos, packing items and more — in plain language.

## Quick start

**Requirements:** [Node.js 18+](https://nodejs.org/)

### 1. Get your token
Log in to the [Tripable web app](https://tripableai.com/profile) and go to your profile: **Profile → AI Assistant (MCP) Keys → Generate New Key**, then copy the token.

### 2. Add it to Claude Desktop
Open **Claude Desktop → Settings → Developer → Edit Config** and add:

```json
{
  "mcpServers": {
    "tripable": {
      "command": "npx",
      "args": ["-y", "github:YoniRomm/tripable-mcp"],
      "env": {
        "MCP_TOKEN": "PASTE_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

Save, then fully quit and reopen Claude Desktop. You should see a `tripable` server with its tools.

### 3. Use it
Just talk to Claude:
- "Show me my trips"
- "Add a safari activity on day 3 of the Tanzania trip"
- "Add a $50 expense for dinner"

## Available tools

| Area | Tools |
|---|---|
| Trips | `list_trips`, `create_trip`, `update_trip_day` |
| Members | `list_trip_members`, `get_user_id` |
| Add | `add_activity`, `add_expense`, `add_todo`, `add_shopping_item`, `add_equipment_item`, `add_travel_info` |
| Read | `get_activities`, `get_expenses`, `get_todos`, `get_shopping`, `get_equipment`, `get_travel_info` |
| Edit / delete | `update_record`, `delete_record` |

## How it works
This is a thin local proxy. It talks to your AI client over stdio and forwards each tool call, together with your token, to Tripable's backend. No database credentials live on your machine — treat your token like a password and delete it from Profile if it leaks.

## Development
```bash
npm install
npm run build
MCP_TOKEN=... npm start
```
`dist/` is committed so `npx github:...` works without a build step.

---

## עברית

1. באתר [Tripable](https://tripableai.com/profile): **Profile ← AI Assistant (MCP) Keys ← Generate New Key** והעתק את הטוקן.
2. ב-Claude Desktop: **Settings ← Developer ← Edit Config**, הדבק את ה-JSON שלמעלה עם הטוקן שלך (נדרש Node.js 18+).
3. סגור את Claude Desktop לגמרי ופתח מחדש. עכשיו אפשר לבקש ממנו לנהל את הטיולים שלך.
