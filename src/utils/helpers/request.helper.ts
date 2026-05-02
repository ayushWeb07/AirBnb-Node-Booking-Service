import { AsyncLocalStorage } from "async_hooks";

interface AsyncLocalStorageItem {
	correlationId: string;
}

const asyncLocalStorage = new AsyncLocalStorage<AsyncLocalStorageItem>();

const getCorrelationId = (): string => {
	const storage = asyncLocalStorage.getStore();
	return storage ? storage.correlationId : "-";
};

export { asyncLocalStorage, getCorrelationId };
