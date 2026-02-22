# IntelliSchedule Personal MCP Server

This is a standalone Model Context Protocol (MCP) server that exposes scheduling, calendar management, and productivity tools. It can be integrated with AI clients like Claude, ChatGPT, or any other MCP-compatible interface.

## Features

- **Google Calendar Integration**: Create and list events.
- **Cal.com Scheduling**: Book meetings programmatically.
- **Availability Checker**: Check for free slots on your calendar.
- **Reminders & Notes**: Manage personal tasks and notes.
- **Email Notifications**: Send meeting confirmations.

## Setup

1. **Clone the repository**:
   ```bash
   git clone <your-new-repo-url>
   cd intellischedule-mcp-server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```

## Using with Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "intellischedule": {
      "command": "node",
      "args": ["/path/to/intellischedule-mcp-server/index.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "...",
        "GOOGLE_CLIENT_SECRET": "...",
        "GOOGLE_REFRESH_TOKEN": "...",
        "CAL_API_KEY": "...",
        "CAL_EVENT_TYPE_ID": "...",
        "CAL_USERNAME": "...",
        "SMTP_USER": "...",
        "SMTP_PASS": "...",
        "USER_EMAIL": "..."
      }
    }
  }
}
```
