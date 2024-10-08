import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { v4 as uuidv4 } from 'uuid'

export class EmailService {
  constructor() {
    this.sessions = new Map();
  }

  async createSession(email, password) {
    const sessionId = uuidv4();
    const config = {
      host: 'imap.ipm.edu.mo',
      port: 993,
      secure: true,
      auth: { user: email, pass: password }
    };
    const client = new ImapFlow(config);
    await client.connect();
    this.sessions.set(sessionId, { client, email });
    return sessionId;
  }

  async getLatestEmail(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Invalid session')

    let lock = await session.client.getMailboxLock('INBOX')
    try {
      let message = await session.client.fetchOne(session.client.mailbox.exists, { source: true });
      const parsed = await simpleParser(message.source);

      return {
        subject: parsed.subject,
        from: parsed.from.text,
        to: parsed.to.text,
        date: parsed.date,
        text: parsed.text,
        html: parsed.html
      };

    } finally {
      lock.release();
    }
  }

  async getEmails(sessionId, count = 10) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Invalid session')

    let lock = await session.client.getMailboxLock('INBOX')
    try {
      let emails = [];
      for await (let message of session.client.fetch(`1:${count}`, { envelope: true })) {
        const parsed = await simpleParser(message.source);
        emails.push({
          id: message.uid,
          subject: parsed.subject,
          from: parsed.from.text,
          date: parsed.date,
          text: parsed.text,
        });
      }
      return emails;
    } finally {
      lock.release();
    }
  }

  async closeSession(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Invalid session')

    await session.client.logout()
    this.sessions.delete(sessionId)
  }
}