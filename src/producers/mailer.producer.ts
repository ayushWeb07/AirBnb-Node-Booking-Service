import { mailerQueue } from "../queues/mailer.queue.ts";
import type { AddEmailDto } from "../dtos/mailer.dto.ts";
import { logger } from "../config/logger.config.ts";
import { serverConfig } from "../config/index.ts";

const addEmailToQueue = async (payload: AddEmailDto) => {
	try {
		await mailerQueue.add(serverConfig.BULLMQ_MAILER_PAYLOAD_NAME, payload, {
			attempts: serverConfig.BULLMQ_MAILER_ADD_EMAIL_ATTEMPTS,
			backoff: {
				type: "exponential",
				delay: serverConfig.BULLMQ_MAILER_ADD_EMAIL_DELAY,
			},
		});
		logger.info(
			`Successfully added the email to queue: ${JSON.stringify(payload)}`,
		);
	} catch (error) {
		logger.error("Failed to add the email to queue", error);
	}
};

export { addEmailToQueue };
