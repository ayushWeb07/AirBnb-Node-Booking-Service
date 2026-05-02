import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import { getCorrelationId } from "../utils/helpers/request.helper.ts";
import { serverConfig } from "./index.ts";

// Create a Logtail client
const logtail = new Logtail(serverConfig.LOGTAIL_SOURCE_TOKEN, {
	endpoint: serverConfig.LOGTAIL_URL,
});

const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({
			format: () =>
				new Date().toLocaleString("en-IN", {
					timeZone: "Asia/Kolkata",
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hour12: false, // ✅ 24-hour
				}),
		}),

		winston.format.prettyPrint(),

		winston.format.printf(({ level, message, timestamp, ...data }) => {
			const resObj = {
				level,
				message,
				timestamp,
				correlationId: getCorrelationId(),
				data,
			};

			return JSON.stringify(resObj);
		}),
	),

	transports: [
		new LogtailTransport(logtail),

		new winston.transports.Console(),

		// info + warn + error
		new DailyRotateFile({
			level: "info",
			filename: "logs/info-%DATE%.log",
			datePattern: "DD-MM-YYYY",
			maxSize: "20m",
			maxFiles: "14d",
		}),

		// error
		new DailyRotateFile({
			level: "error",
			filename: "logs/error-%DATE%.log",
			datePattern: "DD-MM-YYYY",
			maxSize: "20m",
			maxFiles: "14d",
		}),

		// warn + error
		new DailyRotateFile({
			level: "warn",
			filename: "logs/warn-%DATE%.log",
			datePattern: "DD-MM-YYYY",
			maxSize: "20m",
			maxFiles: "14d",
		}),
	],
});

export { logtail, logger };
