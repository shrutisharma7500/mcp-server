import axios from "axios";

export async function checkAvailability(data, userConfig = {}) {
    const apiKey = userConfig.calApiKey || process.env.CAL_API_KEY;
    const username = userConfig.calUsername || process.env.CAL_USERNAME;
    const eventSlug = process.env.CAL_EVENT_SLUG || "meet";

    if (!apiKey || !username) {
        return {
            status: "error",
            message: "Cal.com credentials not configured. Please add them in Settings."
        };
    }

    try {
        // Get date range (today + next 7 days)
        const startDate = data.date || new Date().toISOString().split("T")[0];
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        const endDateStr = endDate.toISOString().split("T")[0];

        // Fetch availability from Cal.com
        const response = await axios.get(
            `https://api.cal.com/v1/availability?apiKey=${apiKey}&username=${username}&eventTypeSlug=${eventSlug}&dateFrom=${startDate}&dateTo=${endDateStr}`,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const busy = response.data.busy || [];
        const workingHours = response.data.workingHours || [];
        const timeZone = response.data.timeZone || "UTC";

        // Format available slots
        const availableSlots = [];
        const today = new Date(startDate);

        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            const dateStr = checkDate.toISOString().split("T")[0];

            // Find working hours for this day
            const dayOfWeek = checkDate.getDay();
            const dayHours = workingHours.find(wh => wh.days.includes(dayOfWeek));

            if (dayHours) {
                const slots = [];
                for (let hour = dayHours.startTime / 60; hour < dayHours.endTime / 60; hour++) {
                    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                    const slotStart = `${dateStr}T${timeStr}:00`;

                    // Check if slot is busy
                    const isBusy = busy.some(b => {
                        const busyStart = new Date(b.start);
                        const busyEnd = new Date(b.end);
                        const slotTime = new Date(slotStart);
                        return slotTime >= busyStart && slotTime < busyEnd;
                    });

                    if (!isBusy) {
                        slots.push(timeStr);
                    }
                }

                if (slots.length > 0) {
                    availableSlots.push({
                        date: dateStr,
                        slots: slots.slice(0, 5) // Show first 5 slots per day
                    });
                }
            }
        }

        return {
            status: "success",
            timeZone: timeZone,
            availableSlots: availableSlots,
            summary: formatAvailabilitySummary(availableSlots)
        };
    } catch (error) {
        console.error("Cal.com Availability Error:", error.response?.data || error.message);
        return {
            status: "error",
            message: error.response?.data?.message || "Failed to fetch availability"
        };
    }
}

function formatAvailabilitySummary(slots) {
    if (slots.length === 0) {
        return "No available slots found in the next 7 days. Please check your Cal.com availability settings.";
    }

    let summary = "📅 Available time slots:\n\n";
    slots.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        summary += `${dayName}: ${day.slots.join(", ")}\n`;
    });

    return summary;
}
