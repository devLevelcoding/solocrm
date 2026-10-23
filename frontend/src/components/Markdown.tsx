import { Fragment, type ReactNode } from 'react'

// The copilot answers in light markdown: paragraphs, **bold**, bullet lists and pipe tables.
// Rendered as React elements (never innerHTML), so model output can't inject markup.

const ROW = /^\s*\|.*\|\s*$/
const DIVIDER = /^\s*\|[\s:|-]+\|\s*$/
const ITEM = /^\s*(?:[-*]|\d+[.)])\s+(.*)$/

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <b key={i} className="text-txt">{part.slice(2, -2)}</b>
      : <Fragment key={i}>{part}</Fragment>)
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())

export default function Markdown({ text }: { text: string }) {
  const lines = text.split('\n')
  const out: ReactNode[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (ROW.test(line) && DIVIDER.test(lines[i + 1] ?? '')) {
      const head = cells(line)
      const body: string[][] = []
      for (i += 2; i < lines.length && ROW.test(lines[i]); i++) body.push(cells(lines[i]))
      i--
      out.push(
        <div key={out.length} className="overflow-x-auto my-2">
          <table className="text-[12px] border-collapse">
            <thead><tr>{head.map((c, j) => <th key={j} className="text-left px-2 py-1 border border-border text-txt2 font-medium">{inline(c)}</th>)}</tr></thead>
            <tbody>{body.map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j} className="px-2 py-1 border border-border">{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      )
    } else if (ITEM.test(line)) {
      out.push(<p key={out.length} className="pl-3 -indent-3 mb-1">• {inline(line.match(ITEM)![1])}</p>)
    } else if (line.trim()) {
      out.push(<p key={out.length} className="mb-1.5">{inline(line.replace(/^#+\s*/, ''))}</p>)
    }
  }
  return <>{out}</>
}
