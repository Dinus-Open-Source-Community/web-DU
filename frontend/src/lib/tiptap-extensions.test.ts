import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'
import { createTiptapExtensions } from './tiptap-extensions'

function makeEditor() {
  return new Editor({
    element: document.createElement('div'),
    extensions: createTiptapExtensions('test'),
    content: '<p></p>',
  })
}

describe('tiptap code block extension', () => {
  it('round-trips language and title', () => {
    const editor = makeEditor()
    editor.commands.setContent(
      '<pre data-code-title="Contoh &amp; judul" class="tiptap-code-block"><code class="language-javascript">const a = 1 &lt; 2</code></pre>',
    )
    const html = editor.getHTML()
    expect(html).toContain('data-code-title="Contoh &amp; judul"')
    expect(html).toContain('language-javascript')
    expect(html).toContain('const a = 1 &lt; 2')
    editor.destroy()
  })
})
