import type { ValidatorRecordInput } from '../types'
import type { z } from 'zod'
import type { ModuleCreateRequest, ModuleUpdateRequest } from '@/services/module'
import { parseWithValidationMessage } from '../errors'
import {
  moduleCourseUidParamSchema,
  moduleCreateRequestSchema,
  moduleListParamsSchema,
  moduleUidParamSchema,
  moduleUpdateRequestSchema,
  type ModuleCreateRequestValidated,
  type ModuleUpdateRequestValidated,
} from '../module.schema'

export * from '../module.schema'

export function parseModuleCreateRequest(
  payload: ModuleCreateRequest,
  fallback = 'Payload modul tidak valid',
): ModuleCreateRequestValidated {
  return parseWithValidationMessage(moduleCreateRequestSchema, payload, fallback)
}

export function parseModuleUpdateRequest(
  payload: ModuleUpdateRequest,
  fallback = 'Payload pembaruan modul tidak valid',
): ModuleUpdateRequestValidated {
  return parseWithValidationMessage(moduleUpdateRequestSchema, payload, fallback)
}

export function parseModuleListParams(
  params?: ValidatorRecordInput,
  fallback = 'Parameter daftar modul tidak valid',
) {
  if (!params) return undefined
  return parseWithValidationMessage(
    moduleListParamsSchema,
    params as z.input<typeof moduleListParamsSchema>,
    fallback,
  )
}

export function parseModuleUidParam(uid: string, fallback = 'UID modul tidak valid'): string {
  return parseWithValidationMessage(moduleUidParamSchema, uid, fallback)
}

export function parseModuleCourseUidParam(uid: string, fallback = 'UID kursus tidak valid'): string {
  return parseWithValidationMessage(moduleCourseUidParamSchema, uid, fallback)
}
