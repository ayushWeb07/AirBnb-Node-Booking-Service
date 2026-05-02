import { logger } from "../../config/logger.config.ts";
import { serverConfig } from "../../config/index.ts";
import type { Express } from "express";

const startServer = async (app: Express) => {
	try {
		logger.info("Successfully connected to the DB");

		app.listen(serverConfig.PORT, () => {
			logger.info(`Server listening on http://localhost:${serverConfig.PORT}`);
		});
	} catch (error) {
		logger.error("Unable to connect to the database:", error);
		process.exit(1);
	}
};

export { startServer };
