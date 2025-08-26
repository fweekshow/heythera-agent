import type { GroupUpdated } from "@xmtp/content-type-group-updated";
import { TransactionReference } from "@xmtp/content-type-transaction-reference";
import { WalletSendCallsParams } from "@xmtp/content-type-wallet-send-calls";
import type { Client } from "@xmtp/node-sdk";
import { getDueReminders, markReminderSent } from "./store.js";

export interface ReminderDispatcher {
  start(
    client: Client<
      string | GroupUpdated | TransactionReference | WalletSendCallsParams
    >,
  ): void;
  stop(): void;
}

class ReminderDispatcherImpl implements ReminderDispatcher {
  private intervalId: NodeJS.Timeout | null = null;
  private client: Client | null = null;

  start(client: Client): void {
    this.client = client;
    this.intervalId = setInterval(async () => {
      await this.processDueReminders();
    }, 30_000); // Check every 30 seconds
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.client = null;
  }

  private async processDueReminders(): Promise<void> {
    if (!this.client) return;

    try {
      const dueReminders = getDueReminders();

      for (const reminder of dueReminders) {
        await this.sendReminder(reminder);
        markReminderSent(reminder.id);
      }
    } catch (error) {
      console.error("Error processing due reminders:", error);
    }
  }

  private async sendReminder(reminder: any): Promise<void> {
    if (!this.client) return;

    try {
      // Handle legacy reminders that don't have conversationId
      if (!reminder.conversationId || reminder.conversationId === "legacy") {
        console.log(
          `Skipping legacy reminder #${reminder.id} - no conversationId`,
        );
        return;
      }

      // Send reminder only to the specific conversation where it was requested
      // This fixes the privacy issue where reminders were sent to all user conversations
      const conversation = await this.client.conversations.getConversationById(
        reminder.conversationId,
      );

      if (conversation) {
        const reminderMessage = `⏰ Reminder: ${reminder.message}`;
        await conversation.send(reminderMessage);
        console.log(
          `Sent reminder #${reminder.id} to conversation ${reminder.conversationId}`,
        );
      } else {
        console.error(
          `Could not find conversation ${reminder.conversationId} for reminder #${reminder.id}`,
        );
      }
    } catch (error) {
      console.error(`Failed to send reminder #${reminder.id}:`, error);
    }
  }
}

export function createReminderDispatcher(): ReminderDispatcher {
  return new ReminderDispatcherImpl();
}
