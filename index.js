import { FastMCP } from "fastmcp";
import "dotenv/config";
import { createCalendarEvent, listEvents } from "./tools/google_calendar.js";
import { scheduleMeeting } from "./tools/calendar.tool.js";
import { setReminder } from "./tools/reminder.tool.js";
import { saveNote } from "./tools/notes.tool.js";
import { sendEmail } from "./tools/email.tool.js";
import { checkAvailability } from "./tools/availability.tool.js";

const server = new FastMCP("IntelliSchedule AI Personal MCP Server");

// --- Google Calendar Tools ---
server.addTool({
    name: "google_create_event",
    description: "Create a Google Calendar event",
    parameters: {
        summary: { type: "string", description: "Event title" },
        description: { type: "string", description: "Event description" },
        startTime: { type: "string", description: "Start time (ISO format)" },
        endTime: { type: "string", description: "End time (ISO format)" }
    },
    execute: async (args) => {
        return await createCalendarEvent(args);
    }
});

server.addTool({
    name: "google_list_events",
    description: "List upcoming Google Calendar events",
    parameters: {},
    execute: async () => {
        return await listEvents();
    }
});

// --- Cal.com Scheduling ---
server.addTool({
    name: "schedule_meeting",
    description: "Schedule a meeting via Cal.com",
    parameters: {
        title: { type: "string", description: "Meeting title" },
        date: { type: "string", description: "Date (YYYY-MM-DD)" },
        time: { type: "string", description: "Time (HH:mm)" }
    },
    execute: async (args) => {
        const userConfig = {
            calApiKey: process.env.CAL_API_KEY,
            calEventTypeId: process.env.CAL_EVENT_TYPE_ID,
            calUsername: process.env.CAL_USERNAME
        };
        return await scheduleMeeting(args, userConfig);
    }
});

// --- General Tools ---
server.addTool({
    name: "set_reminder",
    description: "Set a reminder for a task or event",
    parameters: {
        message: { type: "string", description: "Reminder message" },
        minutes_before: { type: "number", description: "Minutes before to remind" }
    },
    execute: async (args) => {
        return await setReminder(args);
    }
});

server.addTool({
    name: "save_note",
    description: "Save a personal note",
    parameters: {
        content: { type: "string", description: "Note content" }
    },
    execute: async (args) => {
        return await saveNote(args);
    }
});

server.addTool({
    name: "send_email",
    description: "Send an email notification",
    parameters: {
        to: { type: "string", description: "Recipient email" },
        subject: { type: "string", description: "Email subject" },
        body: { type: "string", description: "Email body text" }
    },
    execute: async (args) => {
        const userConfig = {
            smtpUser: process.env.SMTP_USER,
            smtpPass: process.env.SMTP_PASS,
            email: process.env.USER_EMAIL
        };
        if (!args.to) args.to = userConfig.email;
        return await sendEmail(args, userConfig);
    }
});

server.addTool({
    name: "check_availability",
    description: "Check user availability for a given date",
    parameters: {
        date: { type: "string", description: "Date to check (YYYY-MM-DD)" }
    },
    execute: async (args) => {
        const userConfig = {
            calApiKey: process.env.CAL_API_KEY,
            calUsername: process.env.CAL_USERNAME
        };
        return await checkAvailability(args, userConfig);
    }
});

server.start();
console.log("🚀 IntelliSchedule Standalone MCP Server started!");
