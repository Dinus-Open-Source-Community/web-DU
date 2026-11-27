import { describe, expect, it } from 'vitest'
import {
  CODE_LANGUAGES,
  getCodeLanguageLabel,
  isPlainTextLanguage,
  normalizeCodeLanguage,
} from './tiptap-code-languages'

describe('tiptap-code-languages', () => {
  it('maps common aliases to registered values', () => {
    expect(normalizeCodeLanguage('js')).toBe('javascript')
    expect(normalizeCodeLanguage('ts')).toBe('typescript')
    expect(normalizeCodeLanguage('html')).toBe('xml')
    expect(normalizeCodeLanguage('py')).toBe('python')
    expect(normalizeCodeLanguage('sh')).toBe('bash')
    expect(normalizeCodeLanguage('c++')).toBe('cpp')
  })

  it('falls back to plaintext for unknown or empty values', () => {
    expect(normalizeCodeLanguage('ruby-on-rails')).toBe('plaintext')
    expect(normalizeCodeLanguage('')).toBe('plaintext')
    expect(normalizeCodeLanguage(null)).toBe('plaintext')
  })

  it('returns Indonesian labels from the fixed list', () => {
    expect(getCodeLanguageLabel('javascript')).toBe('JavaScript')
    expect(getCodeLanguageLabel('xml')).toBe('HTML')
    expect(getCodeLanguageLabel('plaintext')).toBe('Teks biasa')
    expect(getCodeLanguageLabel('unknown')).toBe('Teks biasa')
  })

  it('detects plaintext', () => {
    expect(isPlainTextLanguage('plaintext')).toBe(true)
    expect(isPlainTextLanguage('javascript')).toBe(false)
  })

  it('keeps values unique', () => {
    const values = CODE_LANGUAGES.map((item) => item.value)
    expect(new Set(values).size).toBe(values.length)
  })
})
