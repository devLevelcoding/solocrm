import { useEffect, useRef, useState } from 'react'
import Markdown from './Markdown'

// "Ask your CRM" (devLevelcoding/ask-your-crm): a read-only copilot on Cloud Run that answers from
// this CRM's own API. Every number is computed by its tools, not by the model.
// VITE_COPILOT_URL overrides it (e.g. http://localhost:3031 with a local copilot on a local API)
const COPILOT_URL = (import.meta.env.VITE_COPILOT_URL ?? 'https://ask-your-crm-661261272598.europe-west1.run.app').replace(/\/$/, '')

const SAMPLES = ['Who owes me money?', 'Give me my weekly digest', 'Which tasks are overdue?', 'How is my pipeline?']
const STATUS: Record<string, string> = {
  money_owed: 'Adding up unpaid invoices', find_clients: 'Looking up clients', client_overview: 'Reading the client file',
  pipeline: 'Checking proposals', contracts_ending: 'Checking contracts', tasks: 'Checking tasks', weekly_digest: 'Building your digest',
}

interface Msg { role: 'user' | 'model'; text: string; status?: string; error?: boolean }

export default function Copilot({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }) }, [msgs])

  const patchLast = (p: Partial<Msg>) => setMsgs(ms => [...ms.slice(0, -1), { ...ms[ms.length - 1], ...p }])

  async function send(text: string) {
    const message = text.trim()
    if (!message || busy) return
    const history = msgs.filter(m => !m.error && m.text).map(({ role, text }) => ({ role, text })).slice(-10)
    setInput(''); setBusy(true)
    setMsgs(ms => [...ms, { role: 'user', text: message }, { role: 'model', text: '', status: 'Thinking' }])
    try {
      const res = await fetch(`${COPILOT_URL}/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? `The copilot answered ${res.status}`)
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let buf = ''
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const blocks = buf.split('\n\n')
        buf = blocks.pop() ?? ''
        for (const b of blocks) {
          const data = b.split('\n').filter(l => l.startsWith('data: ')).map(l => l.slice(6)).join('\n')
          if (!data) continue
          const ev = JSON.parse(data)
          if (ev.type === 'tool') patchLast({ status: STATUS[ev.name] ?? 'Working' })
          else if (ev.type === 'text') patchLast({ text: ev.text, status: undefined })
          else if (ev.type === 'error') throw new Error(ev.message)
        }
      }
    } catch (e) {
      patchLast({ text: (e as Error).message, error: true, status: undefined })
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null
  return (
    <aside className="w-[400px] max-w-full flex-shrink-0 border-l border-border bg-surface flex flex-col">
      <div className="flex items-center gap-2 px-4 h-[46px] border-b border-border">
        <span className="text-accent font-bold">Ask your CRM</span>
        <span className="text-[11px] text-txt2">read-only</span>
        <div className="flex-1" />
        <button onClick={() => setMsgs([])} className="text-txt2 hover:text-txt text-xs px-2" title="New conversation">New</button>
        <button onClick={onClose} className="text-txt2 hover:text-txt text-lg leading-none px-1" aria-label="Close">&times;</button>
      </div>
      <div ref={logRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 scrollbar-thin">
        {msgs.length === 0 ? (
          <div className="m-auto text-center text-txt2 flex flex-col gap-2">
            <p>Questions about your clients, invoices, proposals, contracts and tasks.</p>
            {SAMPLES.map(q => (
              <button key={q} onClick={() => send(q)} disabled={!COPILOT_URL}
                      className="border border-border rounded px-3 py-1.5 hover:bg-surface2 hover:text-txt">{q}</button>
            ))}
            {!COPILOT_URL && <p className="text-danger text-xs">VITE_COPILOT_URL is not set.</p>}
          </div>
        ) : msgs.map((m, i) => m.role === 'user' ? (
          <div key={i} className="self-end max-w-[85%] bg-accent text-white rounded-lg px-3 py-2 whitespace-pre-wrap">{m.text}</div>
        ) : (
          <div key={i} className={`max-w-[95%] rounded-lg px-3 py-2 border ${m.error ? 'border-danger text-danger' : 'border-border bg-bg text-txt'}`}>
            {m.status ? <span className="text-txt2 animate-pulse">{m.status}...</span> : m.error ? m.text : <Markdown text={m.text} />}
          </div>
        ))}
      </div>
      <form className="flex gap-2 p-3 border-t border-border" onSubmit={e => { e.preventDefault(); send(input) }}>
        <input value={input} onChange={e => setInput(e.target.value)} maxLength={1000} disabled={busy || !COPILOT_URL}
               placeholder="Who owes me money?"
               className="flex-1 bg-bg border border-border rounded px-3 py-2 text-txt outline-none focus:border-accent" />
        <button disabled={busy || !input.trim()} className="bg-accent text-white rounded px-3 disabled:opacity-40">Ask</button>
      </form>
    </aside>
  )
}
