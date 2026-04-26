import { serverConfig } from "../../config/index.ts";
import { logger } from "../../config/logger.config.ts";

const sendHeartBeatPings = async () => {
    try {
        await fetch(serverConfig.BETTERSTACK_HEARTBEAT_URL)
        logger.info("Successfully pinged the heartbeat")
    } catch (error) {
        logger.error("Failed to ping the heartbeat", error);
    }
}

export { sendHeartBeatPings }