import * as Sentry from "@sentry/node"
import { serverConfig } from "./index.ts";

Sentry.init({
    dsn: serverConfig.SENTRY_DSN,
    tracesSampleRate: 1.0, // capture 100% of transactions for performance monitoring.
    sendDefaultPii: true, // send default PII data to Sentry
});

export { Sentry }