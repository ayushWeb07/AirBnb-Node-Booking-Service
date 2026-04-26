import { logtail, logger } from "./logger.config.ts"


const registerShutdownHandlers = () => {
    // Graceful shutdown
    process.on('SIGTERM', async () => {
        await logtail.flush();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        await logtail.flush();
        process.exit(0);
    });

    // Uncaught errors
    process.on('uncaughtException', async (error) => {
        logger.error('Uncaught exception', { error: error });
        await logtail.flush();
        process.exit(1);
    });

    process.on('unhandledRejection', async (reason) => {
        logger.error('Unhandled rejection', { error: reason });
        await logtail.flush();
        process.exit(1);
    });
}

export { registerShutdownHandlers }