import { parseWithValidationMessage } from '../errors'
import {
  protectedFileBatchRequestSchema,
  type ProtectedFileBatchRequestValidated,
} from '../file-proxy.schema'

export * from '../file-proxy.schema'

export function parseProtectedFileBatchRequest(
  objectKeys: string[],
  fallback = 'Daftar file tidak valid',
): ProtectedFileBatchRequestValidated {
  return parseWithValidationMessage(protectedFileBatchRequestSchema, { objects: objectKeys }, fallback)
}
