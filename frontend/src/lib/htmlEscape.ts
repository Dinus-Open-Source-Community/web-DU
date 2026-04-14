export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function toPreviewHtmlFragment(raw: string): string {
  const t = raw.trim()
  if (t.startsWith('<')) return raw
  return `<p class="text-sm leading-relaxed text-slate-700">${escapeHtml(raw)}</p>`
}
