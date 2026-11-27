import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CodeBlockView } from './CodeBlockView'

const baseProps = ({
  node: {
    type: 'codeBlock',
    attrs: { language: 'javascript', codeTitle: 'Contoh' },
    textContent: 'a\nb\nc',
  },
  updateAttributes: vi.fn(),
  deleteNode: vi.fn(),
  editor: {},
  decorations: [],
  selected: false,
  view: {
    getPos: vi.fn(),
    mark: vi.fn(),
  } as unknown as { getPos: ReturnType<typeof vi.fn>; mark: ReturnType<typeof vi.fn> },
  innerDecorations: [],
  extension: {} as { [key: string]: unknown },
  HTMLAttributes: {},
  getPos: vi.fn(),
} as unknown) as import('@tiptap/react').NodeViewProps

describe('CodeBlockView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows title, language, and line numbers', () => {
    render(<CodeBlockView {...baseProps} />)
    expect(screen.getByDisplayValue('Contoh')).toBeInTheDocument()
    expect(screen.getByDisplayValue('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('updates language and deletes the node', async () => {
    const updateAttributes = vi.fn()
    const deleteNode = vi.fn()
    const user = userEvent.setup()
    render(
      <CodeBlockView
        {...baseProps}
        updateAttributes={updateAttributes}
        deleteNode={deleteNode}
      />,
    )
    await user.selectOptions(screen.getByLabelText('Bahasa blok kode'), 'python')
    expect(updateAttributes).toHaveBeenCalledWith({ language: 'python' })
    await user.click(screen.getByRole('button', { name: 'Hapus blok kode' }))
    expect(deleteNode).toHaveBeenCalled()
  })
})
