import { logger } from "../../config/logger.config.ts";
import { serverConfig } from "../../config/index.ts";
import type { Express } from "express";
import type { AddEmailDto } from "../../dtos/mailer.dto.ts";
import { addEmailToQueue } from "../../producers/mailer.producer.ts";

const startServer = async (app: Express) => {
	try {
		logger.info("Successfully connected to the DB");

		app.listen(serverConfig.PORT, async () => {
			logger.info(`Server listening on http://localhost:${serverConfig.PORT}`);

			// add an email notification to the queue
			const email: AddEmailDto = {
				toMailAddress: "john@gmail.com",
				subject: "Thanks for purchase",
				templateId: "temp-101",
				params: {
					userName: "johnDoe",
					userId: "user-909",
				},
			};

			await addEmailToQueue(email);
		});
	} catch (error) {
		logger.error("Unable to connect to the database:", error);
		process.exit(1);
	}
};

export { startServer };
