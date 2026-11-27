import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ReadOnlyCodeBlock } from './ReadOnlyCodeBlock'

describe('ReadOnlyCodeBlock', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders title, language, line numbers, and exact code', () => {
    const code = 'const a = 1\n\nconst b = "<&>"'
    const { container } = render(
      <ReadOnlyCodeBlock title="Contoh" language="javascript" code={code} />,
    )
    expect(screen.getByText('Contoh')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(container.querySelector('code')?.textContent).toBe(code)
  })

  it('copies the original code and shows Tersalin', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<ReadOnlyCodeBlock language="plaintext" code={'a < b'} />)
    fireEvent.click(screen.getByRole('button', { name: 'Salin kode' }))
    expect(writeText).toHaveBeenCalledWith('a < b')
    expect(await screen.findByText('Tersalin')).toBeInTheDocument()
  })

  it('shows an error when the clipboard rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<ReadOnlyCodeBlock language="plaintext" code={'a'} />)
    fireEvent.click(screen.getByRole('button', { name: 'Salin kode' }))
    expect(await screen.findByText('Gagal menyalin')).toBeInTheDocument()
  })

  it('falls back to plain text for an unknown language', () => {
    render(<ReadOnlyCodeBlock language="not-a-language" code={'<tag>'} />)
    expect(screen.getByText('Teks biasa')).toBeInTheDocument()
    expect(screen.queryByText('not-a-language')).not.toBeInTheDocument()
  })
})
