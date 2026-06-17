/** Loose input for query/list validators — runtime Zod still enforces the schema. */
export type ValidatorRecordInput = Record<string, string | number | boolean | undefined | null>
