import { z } from 'zod'
import { beResolvableUidSchema } from './common'

export const assignMentorsToCoursePayloadSchema = z
  .object({
    mentor_uids: z
      .array(beResolvableUidSchema, { message: 'Daftar mentor wajib diisi' })
      .min(1, 'Minimal satu mentor harus dipilih')
      .max(50, 'Maksimal 50 mentor per penugasan'),
  })
  .strict()
  .superRefine((data, ctx) => {
    const seen = new Set<string>()
    for (let index = 0; index < data.mentor_uids.length; index += 1) {
      const uid = data.mentor_uids[index].toLowerCase()
      if (seen.has(uid)) {
        ctx.addIssue({
          code: 'custom',
          message: 'UID mentor tidak boleh duplikat',
          path: ['mentor_uids', index],
        })
      }
      seen.add(uid)
    }
  })

export const assignMentorsCourseUidParamSchema = beResolvableUidSchema

export type AssignMentorsToCoursePayloadValidated = z.infer<typeof assignMentorsToCoursePayloadSchema>
