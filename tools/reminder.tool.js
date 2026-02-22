export async function setReminder({ message, minutes_before }) {
  return {
    status: "reminder set",
    reminder: `You will be reminded ${minutes_before} minutes before`,
    message
  };
}
