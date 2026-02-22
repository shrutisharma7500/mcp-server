import fs from "fs";

export async function saveNote({ content }) {
  fs.appendFileSync("notes.txt", content + "\n");
  return { status: "note saved" };
}
