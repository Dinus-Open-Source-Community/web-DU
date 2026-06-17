import { z } from 'zod'
import { MAX_FILE_PROXY_BATCH_OBJECTS } from './common'

const objectKeySchema = z
  .string({ message: 'Object key wajib diisi' })
  .trim()
  .min(1, 'Object key wajib diisi')
  .max(1024, 'Object key terlalu panjang')
  .refine((value) => !value.includes('..'), 'Object key tidak valid')
  .refine((value) => !value.startsWith('/'), 'Object key tidak valid')

export const minioBucketNameSchema = z
  .string({ message: 'Nama bucket wajib diisi' })
  .trim()
  .min(1, 'Nama bucket wajib diisi')
  .max(63, 'Nama bucket terlalu panjang')
  .regex(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$|^[a-z0-9]$/, 'Format nama bucket tidak valid')

/** Payload POST `/files/:bucket/batch` — selaras `multiFileBatchRequest`. */
export const protectedFileBatchRequestSchema = z
  .object({
    objects: z
      .array(objectKeySchema)
      .min(1, 'Minimal satu object key harus diisi')
      .max(MAX_FILE_PROXY_BATCH_OBJECTS, `Maksimal ${MAX_FILE_PROXY_BATCH_OBJECTS} file per permintaan`),
  })
  .strict()
  .superRefine((data, ctx) => {
    const seen = new Set<string>()
    for (let index = 0; index < data.objects.length; index += 1) {
      const key = data.objects[index]
      if (seen.has(key)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Object key tidak boleh duplikat',
          path: ['objects', index],
        })
      }
      seen.add(key)
    }
  })

export type ProtectedFileBatchRequestValidated = z.infer<typeof protectedFileBatchRequestSchema>
