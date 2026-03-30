import type { SQL } from "drizzle-orm";
import { and, ilike, or } from "drizzle-orm";

export type SortOrder = "asc" | "desc";

export interface PaginationInput {
	page?: unknown;
	limit?: unknown;
	order?: unknown;
}

export interface Pagination {
	page: number;
	limit: number;
	offset: number;
	order: SortOrder;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const parsePagination = (query: PaginationInput): Pagination => {
	const pageRaw = typeof query.page === "string" ? query.page : undefined;
	const limitRaw = typeof query.limit === "string" ? query.limit : undefined;
	const orderRaw = typeof query.order === "string" ? query.order : undefined;

	let page = pageRaw ? Number.parseInt(pageRaw, 10) : DEFAULT_PAGE;
	let limit = limitRaw ? Number.parseInt(limitRaw, 10) : DEFAULT_LIMIT;

	if (!Number.isFinite(page) || page < 1) page = DEFAULT_PAGE;
	if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
	if (limit > MAX_LIMIT) limit = MAX_LIMIT;

	const order: SortOrder = orderRaw === "asc" ? "asc" : "desc";
	const offset = (page - 1) * limit;

	return { page, limit, offset, order };
};

export const parseBoolean = (value: unknown): boolean | undefined => {
	if (value === undefined) return undefined;
	if (typeof value === "boolean") return value;
	if (typeof value === "string") {
		if (value.toLowerCase() === "true") return true;
		if (value.toLowerCase() === "false") return false;
	}
	return undefined;
};

export const parseNumber = (value: unknown): number | undefined => {
	if (value === undefined) return undefined;
	if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
	if (typeof value === "string" && value.trim() !== "") {
		const n = Number(value);
		return Number.isFinite(n) ? n : undefined;
	}
	return undefined;
};

export const parseString = (value: unknown): string | undefined => {
	if (value === undefined) return undefined;
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length ? trimmed : undefined;
};

export const buildWhere = (...conditions: Array<SQL | undefined>): SQL | undefined => {
	const filtered = conditions.filter(Boolean) as SQL[];
	if (!filtered.length) return undefined;
	return and(...filtered);
};

export const buildSearch = (q: unknown, ...fields: Array<unknown>): SQL | undefined => {
	const query = parseString(q);
	if (!query) return undefined;
	// NOTE: We accept fields as raw column SQL and apply ILIKE against each field.
	// Drizzle's `ilike` expects a column-like arg.
	const pattern = `%${query.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
	const ors: SQL[] = [];
	for (const field of fields) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		ors.push(ilike(field as any, pattern));
	}
	if (!ors.length) return undefined;
	return or(...ors);
};
