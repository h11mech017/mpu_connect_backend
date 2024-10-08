export class EmailController {
    constructor(emailService) {
        this.emailService = emailService
    }

    async login(req, res) {
        const { email, password } = req.body

        try {
            const sessionId = await this.emailService.createSession(email, password)
            res.status(200).send({ sessionId })
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    async getLatestEmail(req, res) {
        try {
            const { sessionId } = req.params
            const latestMessage = await this.emailService.getLatestEmail(sessionId)

            res.status(200).send(latestMessage)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    async getEmails(req, res) {
        try {
            const { sessionId } = req.params
            const count = req.query
            const emails = await this.emailService.getEmails(sessionId, count)
            res.status(200).send(emails)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    async logout(req, res) {
        try {
            const { sessionId } = req.params
            await this.emailService.closeSession(sessionId)
            res.status(200).send("Logged out")
        } catch (error) {
            res.status(500).send(error.message)
        }
    }
}