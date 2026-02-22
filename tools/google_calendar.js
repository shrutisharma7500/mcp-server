import { google } from "googleapis";

/**
 * Google Calendar Tool Integration
 * Requires credentials in .env:
 * GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 */

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

export async function createCalendarEvent({ summary, description, startTime, endTime }) {
    try {
        const event = {
            summary,
            description,
            start: {
                dateTime: startTime,
                timeZone: "Asia/Kolkata",
            },
            end: {
                dateTime: endTime,
                timeZone: "Asia/Kolkata",
            },
            conferenceData: {
                createRequest: {
                    requestId: `mcp-${Date.now()}`,
                    conferenceSolutionKey: { type: "hangoutsMeet" },
                },
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: "popup", minutes: 30 },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: "primary",
            resource: event,
            conferenceDataVersion: 1, // 🚀 Required to generate Googl Meet link
        });

        return {
            status: "success",
            eventId: response.data.id,
            meetingLink: response.data.hangoutLink, // 🔗 Actual Google Meet Link
            link: response.data.htmlLink,
        };
    } catch (error) {
        console.error("GCal Error:", error.message);
        return {
            status: "error",
            message: error.message,
        };
    }
}

export async function listEvents() {
    try {
        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: "startTime",
        });

        return response.data.items.map((event) => ({
            id: event.id,
            summary: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
        }));
    } catch (error) {
        console.error("GCal List Error:", error.message);
        return [];
    }
}
