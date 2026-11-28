export type CodeLanguageOption = {
  value: string
  label: string
}

export const CODE_LANGUAGES: ReadonlyArray<CodeLanguageOption> = [
  { value: 'plaintext', label: 'Teks biasa' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'php', label: 'PHP' },
  { value: 'python', label: 'Python' },
  { value: 'xml', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'dart', label: 'Dart' },
]

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  html: 'xml',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  'c++': 'cpp',
}

const KNOWN_LANGUAGES = new Set(CODE_LANGUAGES.map((item) => item.value))
const LABEL_BY_VALUE = new Map(CODE_LANGUAGES.map((item) => [item.value, item.label]))

export function normalizeCodeLanguage(value?: string | null): string {
  const raw = (value ?? '').trim().toLowerCase().replace(/^language-/, '')
  if (!raw) return 'plaintext'

  const mapped = LANGUAGE_ALIASES[raw] ?? raw
  return KNOWN_LANGUAGES.has(mapped) ? mapped : 'plaintext'
}

export function getCodeLanguageLabel(value?: string | null): string {
  return LABEL_BY_VALUE.get(normalizeCodeLanguage(value)) ?? 'Teks biasa'
}

export function isPlainTextLanguage(value?: string | null): boolean {
  return normalizeCodeLanguage(value) === 'plaintext'
}
