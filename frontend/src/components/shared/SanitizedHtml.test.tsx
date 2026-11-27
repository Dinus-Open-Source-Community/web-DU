import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SanitizedHtml } from './SanitizedHtml'

describe('SanitizedHtml code blocks', () => {
  it('replaces pre with the read-only code block', () => {
    const { container } = render(
      <SanitizedHtml
        html={
          '<p>Intro</p><pre data-code-title="Contoh"><code class="language-js">const a = 1</code></pre>'
        }
      />,
    )
    expect(screen.getByText('Intro')).toBeInTheDocument()
    expect(screen.getByText('Contoh')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salin kode' })).toBeInTheDocument()
    expect(container.querySelector('code')?.textContent).toBe('const a = 1')
  })

  it('does not execute script content', () => {
    render(<SanitizedHtml html={'<p>safe</p><script>alert(1)</script>'} />)
    expect(screen.getByText('safe')).toBeInTheDocument()
    expect(document.querySelector('script')).toBeNull()
  })
})
