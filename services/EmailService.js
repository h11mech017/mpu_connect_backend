import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config()

export class EmailService {
  constructor() {
    this.sessions = new Map()
  }

  async createSession(email, password) {
    const sessionId = uuidv4()
    const config = {
      host: process.env.EMAIL_IMAP_HOST,
      port: process.env.EMAIL_IMAP_PORT,
      secure: true,
      auth: { user: email, pass: password }
    };
    const client = new ImapFlow(config)
    await client.connect()
    this.sessions.set(sessionId, { client, email })
    return sessionId;
  }

  async getLatestEmail(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Invalid session')

    let lock = await session.client.getMailboxLock('INBOX')
    try {
      let message = await session.client.fetchOne(session.client.mailbox.exists, { source: true })
      const parsed = await simpleParser(message.source)

      return {
        subject: parsed.subject,
        from: parsed.from.text,
        to: parsed.to.text,
        date: parsed.date,
        text: parsed.text,
        html: parsed.html
      };

    } finally {
      lock.release()
    }
  }

  async getEmails(sessionId, count) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Invalid session')

    let lock = await session.client.getMailboxLock('INBOX')
    try {
      let emails = []
      if (!count) count = 10
      const fetchOptions = {
        envelope: true,
        uid: true,
      };

      const mailboxStatus = await session.client.status('INBOX', { messages: true });
      const totalMessages = mailboxStatus.messages;

      const endSequence = totalMessages;
      const startSequence = Math.max(1, endSequence - count + 1);
      const fetchSet = `${startSequence}:${endSequence}`;

      const messages = session.client.fetch(fetchSet, fetchOptions);

      for await (let message of messages) {

        emails.push({
          seq: message.seq,
          subject: message.envelope.subject || '(No subject)',
        })
      }

      return emails.reverse()
    } catch (error) {
      console.error('Error in getEmails:', error)
      throw error
    } finally {
      lock.release();
    }
  }

  async getEmailDetail(sessionId, seq) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Invalid session')

    let lock = await session.client.getMailboxLock('INBOX')
    try {
      const message = await session.client.fetchOne(seq, { source: true })
      const parsed = await simpleParser(message.source)

      return {
        subject: parsed.subject,
        from: parsed.from.text,
        to: parsed.to.text,
        date: parsed.date,
        text: parsed.text,
        html: parsed.html
      };

    } catch (error) {
      console.error('Error in getEmailDetail:', error)
      throw error
    } finally {
      lock.release()
    }
  }

  async closeSession(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Invalid session')

    await session.client.logout()
    this.sessions.delete(sessionId)
  }
}