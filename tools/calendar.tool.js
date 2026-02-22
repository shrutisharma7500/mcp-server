import axios from "axios";

export async function scheduleMeeting(data, userConfig = {}) {
  const apiKey = userConfig.calApiKey || process.env.CAL_API_KEY;
  const eventTypeId = userConfig.calEventTypeId || process.env.CAL_EVENT_TYPE_ID;

  if (!apiKey) {
    console.error("❌ CAL_API_KEY is missing");
    return { status: "error", message: "Cal.com API key not configured. Please add it in Settings." };
  }

  if (!eventTypeId) {
    console.error("❌ CAL_EVENT_TYPE_ID is missing");
    return { status: "error", message: "Cal.com Event Type ID not configured. Please add it in Settings." };
  }

  try {
    // 📅 Smart Date Handling: Ensure valid HH:mm format
    const date = (data.date || new Date().toISOString().split("T")[0]).trim();
    const time = (data.time || "10:00").trim();
    const userTimeZone = process.env.TIMEZONE || "Asia/Kolkata"; // 🌏 Default to user's local timezone

    // Safety check for time format (HH:mm)
    const validTime = time.match(/^\d{2}:\d{2}$/) ? time : "10:00";
    // 🌍 IMPORTANT: Cal.com v1 needs an offset to match your IST timezone.
    const isoStart = `${date}T${validTime}:00+05:30`;

    console.log("🚀 Cal.com Payload:", { date, validTime, isoStart, userTimeZone });

    const response = await axios.post(
      `https://api.cal.com/v1/bookings?apiKey=${apiKey}`,
      {
        eventTypeId: Number(eventTypeId),
        start: isoStart,
        responses: {
          name: data.title || "AI Scheduled Meeting",
          email: userConfig.email || "demo@example.com"
        },
        timeZone: userTimeZone,
        language: "en",
        metadata: {}
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("🔥 Cal.com Response:", JSON.stringify(response.data, null, 2));

    const bookingUid = response.data.booking?.uid || response.data.uid;

    return {
      status: "success",
      meetingId: bookingUid,
      meetingLink: bookingUid,
      date: date,
      time: validTime
    };
  } catch (error) {
    if (error.message === "formattedTime is not defined") {
      console.error("❌ Logic Error: Use validTime instead of formattedTime");
    }
    console.error("Cal.com API Error:", error.response?.data || error.message);

    let userFriendlyMessage = error.response?.data?.message || error.message || "Failed to create Cal.com event";

    // Better message for the common availability error
    if (userFriendlyMessage === "no_available_users_found_error") {
      userFriendlyMessage = "No availability found for this time. Please check your Cal.com working hours (especially for weekends) or try a different slot.";
    }

    return {
      status: "error",
      message: userFriendlyMessage
    };
  }
}
console.log("CAL_API_KEY LOADED:", !!process.env.CAL_API_KEY);
