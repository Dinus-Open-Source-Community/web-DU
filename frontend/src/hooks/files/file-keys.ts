export const protectedFileKeys = {
  all: ['protected-files'] as const,
  single: (bucket: string, objectKey: string) =>
    ['protected-files', 'single', bucket, objectKey] as const,
  batch: (bucket: string, objectKeys: string[]) =>
    [
      'protected-files',
      'batch',
      bucket,
      [...objectKeys].sort().join('\u0000'),
    ] as const,
}
