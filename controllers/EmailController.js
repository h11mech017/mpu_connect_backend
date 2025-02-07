export class EmailController {
    constructor(emailService) {
        this.emailService = emailService
    }

    async login(req, res) {
        const { email, password } = req.body

        try {
            const response = await this.emailService.createSession(email, password)
            res.status(200).send(response)
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
            let page
            if (req.query.page) {
                page = parseInt(req.query.page, 10)
            }
            let pageSize
            if (req.query.pageSize) {
                pageSize = parseInt(req.query.pageSize, 10)
            }
            const emails = await this.emailService.getEmails(sessionId, page, pageSize)
            res.status(200).send(emails)
        } catch (error) {
            res.status(500).send(error.message)
        }
    }

    async getEmailDetail(req, res) {
        try {
            const { sessionId, seq } = req.params
            const email = await this.emailService.getEmailDetail(sessionId, seq)
            res.status(200).json(email)
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