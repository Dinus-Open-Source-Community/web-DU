import { describe, expect, it } from 'vitest'
import { normalizeRichText } from './lesson-content-equality'

describe('normalizeRichText', () => {
  it('keeps whitespace inside pre', () => {
    const html = '<pre><code>  const a = 1\n\n\tconst b = 2  </code></pre>'
    expect(normalizeRichText(html)).toBe(html)
  })

  it('still normalizes whitespace outside pre', () => {
    expect(normalizeRichText('<p>a   b</p>')).toBe('<p>a b</p>')
  })

  it('detects indentation-only changes', () => {
    const a = normalizeRichText('<pre><code>a\n  b</code></pre>')
    const b = normalizeRichText('<pre><code>a\n    b</code></pre>')
    expect(a).not.toBe(b)
  })
})
