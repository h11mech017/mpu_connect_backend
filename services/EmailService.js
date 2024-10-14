import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config()

export class EmailService {
  constructor(sessionTimeout = 6000000) {
    this.sessions = new Map()
    this.sessionTimeout = sessionTimeout
    this.sessionTimers = new Map()
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
    this.resetSessionTimer(sessionId)
    return { sessionId, email };
  }

  resetSessionTimer(sessionId) {
    if (this.sessionTimers.has(sessionId)) {
      clearTimeout(this.sessionTimers.get(sessionId))
    }
    const timer = setTimeout(() => this.closeSession(sessionId), this.sessionTimeout)
    this.sessionTimers.set(sessionId, timer)
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

    } catch (error) {
      console.error('Error in getLatestEmail:', error)
      throw error
    } finally {
      lock.release()
    }
  }

  async getEmails(sessionId, page = 1, pageSize = 10) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Invalid session')

    let lock = await session.client.getMailboxLock('INBOX')
    try {
      let emails = []
      const fetchOptions = {
        envelope: true,
        source: true,
        uid: true,
      };

      const mailboxStatus = await session.client.status('INBOX', { messages: true });
      const totalMessages = mailboxStatus.messages;

      const endSequence = totalMessages - (page - 1) * pageSize;
      const startSequence = Math.max(1, endSequence - pageSize + 1);
      const fetchSet = `${startSequence}:${endSequence}`;

      const messages = session.client.fetch(fetchSet, fetchOptions);

      for await (let message of messages) {
        const parsed = await simpleParser(message.source)
        emails.push({
          seq: message.seq,
          from: message.envelope.from[0].name,
          subject: message.envelope.subject || '(No subject)',
          header: parsed.text.replace(/\n/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 100) + '...'
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
    try {
      if (session.client && session.client.usable) {
        await session.client.logout()
        console.log('Session closed:', sessionId)
      }
      else {
        console.log('Session already closed:', sessionId)
      }
    } catch (error) {
      console.error('Error in closeSession:', error)
    } finally {
      this.sessions.delete(sessionId)
      if (this.sessionTimers.has(sessionId)) {
        clearTimeout(this.sessionTimers.get(sessionId))
        this.sessionTimers.delete(sessionId)
      }
    }

  }
}