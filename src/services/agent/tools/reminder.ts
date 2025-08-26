import { tool } from "@langchain/core/tools";
import { DateTime } from "luxon";
import { z } from "zod";
import { SF_TZ } from "@/constant.js";
import {
  cancelAllRemindersForInbox,
  cancelReminder,
  insertReminder,
  listAllPendingForInbox,
} from "@/reminders/store.js";

export const fetchCurrentDateTime = tool(
  () => {
    const now = new Date();
    const sfTime = new Intl.DateTimeFormat("en-US", {
      timeZone: SF_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
    return sfTime;
  },
  {
    name: "FetchCurrentDateTime",
    description:
      "Fetch the current date and time in ISO format. Useful for timestamping events, setting reminder or logging the current moment.",
  },
);

export const fetchAllPendingReminders = tool(
  ({ inboxId }: { inboxId: string }) => {
    const reminders = listAllPendingForInbox(inboxId);
    if (reminders.length === 0) {
      return "No pending reminders.";
    }
    console.log(reminders);
    const reminderList = reminders
      .map((r) => {
        return `#${r.id} — ${r.targetTime} — ${r.message}`;
      })
      .join("\n");
    return `Pending reminders:\n${reminderList}`;
  },
  {
    name: "FetchAllPendingReminders",
    description: `Fetch all pending reminders for a given inbox and displays them in ${SF_TZ}  time with formatted details.`,
    schema: z.object({
      inboxId: z.string().describe("Chat inbox ID where reminders are set"),
    }),
  },
);

export const cancelPendingReminder = tool(
  ({ reminderId }: { reminderId: number }) => {
    const cancelled = cancelReminder(reminderId);
    return cancelled
      ? `Cancelled reminder #${reminderId}.`
      : `Reminder #${reminderId} not found.`;
  },
  {
    name: "CancelReminder",
    description:
      "Cancels a specific pending reminder using its ID (number). Returns a confirmation message if successful or a not-found message otherwise.",
    schema: z.object({
      reminderId: z.number().describe("ID of the reminder to be cancelled"),
    }),
  },
);

export const cancelAllReminders = tool(
  ({ inboxId }: { inboxId: string }) => {
    const count = cancelAllRemindersForInbox(inboxId);
    return `Cancelled ${count} reminder${count !== 1 ? "s" : ""}.`;
  },
  {
    name: "CancelAllReminders",
    description:
      "Cancels all pending reminders for the specified inbox and returns a message indicating how many reminders were cancelled.",
    schema: z.object({
      inboxId: z.string().describe("Chat inbox ID where reminders are set"),
    }),
  },
);

export const setReminder = tool(
  ({
    inboxId,
    conversationId,
    targetTime,
    message,
  }: {
    inboxId: string;
    conversationId: string;
    targetTime: string;
    message: string;
  }) => {
    const reminderId = insertReminder(inboxId, conversationId, targetTime, message);
    return `Reminder #${reminderId} set for ${DateTime.fromISO(targetTime, { zone: SF_TZ }).toFormat("EEE, MMM d h:mm a z")}.`;
  },
  {
    name: "SetReminder",
    description:
      "Schedules a new reminder for a specific inbox at a given date and time with a custom message. Returns the reminder ID and scheduled time upon success.",
    schema: z.object({
      inboxId: z
        .string()
        .describe("The chat inbox ID where the reminder should be set."),
      conversationId: z
        .string()
        .describe("The conversation ID where the reminder was requested and should be sent back to."),
      targetTime: z
        .string()
        .describe("The date and time when the reminder should trigger."),
      message: z
        .string()
        .describe(
          "The message content of the reminder to be sent at the scheduled time.",
        ),
    }),
  },
);
