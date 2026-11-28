import { describe, expect, it } from 'vitest'
import { sanitizeRichHtml } from './sanitize-html'

describe('sanitizeRichHtml code blocks', () => {
  it('keeps language class and code title', () => {
    const html =
      '<pre data-code-title="Contoh &amp; judul" class="tiptap-code-block"><code class="language-js">if (a &lt; b &amp;&amp; c &gt; d) { x = &quot;&amp;&quot;; }</code></pre>'
    const out = sanitizeRichHtml(html)
    expect(out).toContain('data-code-title="Contoh &amp; judul"')
    expect(out).toContain('class="language-js"')
    expect(out).toContain('if (a &lt; b &amp;&amp; c &gt; d) { x = "&amp;"; }')
  })

  it('removes scripts and event handlers', () => {
    const out = sanitizeRichHtml(
      '<pre onclick="alert(1)"><code>&lt;script&gt;alert(1)&lt;/script&gt;</code></pre>',
    )
    expect(out).not.toContain('onclick')
    expect(out).not.toContain('<script>')
    expect(out).toContain('&lt;script&gt;')
  })
})
