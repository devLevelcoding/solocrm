import { useEffect, useState } from 'react'
import Sidebar, { type NavItem } from './components/Sidebar'
import ResourceView from './components/ResourceView'
import { listResource } from './api'
import type { Client, Contract, Invoice, Proposal, Task } from './types'

const NAV: NavItem[] = [
  { key: 'clients', label: 'Clients' },
  { key: 'proposals', label: 'Proposals' },
  { key: 'contracts', label: 'Contracts' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'tasks', label: 'Tasks' },
]

const clientName = (row: { client?: Client }) =>
  row.client ? `${row.client.fname} ${row.client.lname}` : '—'

export default function App() {
  const [active, setActive] = useState('clients')
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    listResource<Client>('clients').then(r => setClients(r.data)).catch(() => {})
  }, [active])

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-[13px]">
      <header className="flex items-center gap-3 h-[46px] px-5 border-b border-border bg-surface flex-shrink-0">
        <span className="text-[15px] font-extrabold tracking-tight text-accent">
          solo<span className="text-txt2 font-normal">crm</span>
        </span>
        <div className="flex-1" />
        <span className="text-xs text-txt2">Type 1 &middot; Pure SassFactory reuse</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={NAV} selected={active} onSelect={setActive} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {active === 'clients' && (
            <ResourceView<Client>
              resource="clients"
              title="Clients"
              columns={[
                { key: 'fname', label: 'First name' },
                { key: 'lname', label: 'Last name' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'fname', label: 'First name', required: true },
                { key: 'lname', label: 'Last name', required: true },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'address', label: 'Address' },
                { key: 'notes', label: 'Notes' },
              ]}
            />
          )}

          {active === 'proposals' && (
            <ResourceView<Proposal>
              resource="proposals"
              title="Proposals"
              clients={clients}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'client', label: 'Client', render: clientName },
                { key: 'amount', label: 'Amount' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'clientId', label: 'Client', type: 'client-select', required: true },
                { key: 'title', label: 'Title', required: true },
                { key: 'amount', label: 'Amount', type: 'number' },
                { key: 'status', label: 'Status (draft / sent / accepted)', placeholder: 'draft' },
              ]}
            />
          )}

          {active === 'contracts' && (
            <ResourceView<Contract>
              resource="contracts"
              title="Contracts"
              clients={clients}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'client', label: 'Client', render: clientName },
                { key: 'type', label: 'Type' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'clientId', label: 'Client', type: 'client-select', required: true },
                { key: 'title', label: 'Title', required: true },
                { key: 'type', label: 'Type', placeholder: 'service' },
                { key: 'status', label: 'Status', placeholder: 'active' },
              ]}
            />
          )}

          {active === 'invoices' && (
            <ResourceView<Invoice>
              resource="invoices"
              title="Invoices"
              clients={clients}
              quickAction={{ label: 'Mark paid', action: 'pay', showIf: r => r.status !== 'paid' }}
              columns={[
                { key: 'number', label: 'Number' },
                { key: 'client', label: 'Client', render: clientName },
                { key: 'total', label: 'Total' },
                { key: 'dueDate', label: 'Due', render: r => new Date(r.dueDate).toLocaleDateString() },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'clientId', label: 'Client', type: 'client-select', required: true },
                { key: 'number', label: 'Invoice #', required: true, placeholder: 'INV-001' },
                { key: 'amount', label: 'Amount', type: 'number', required: true },
                { key: 'tax', label: 'Tax', type: 'number' },
                { key: 'dueDate', label: 'Due date', type: 'date', required: true },
              ]}
            />
          )}

          {active === 'tasks' && (
            <ResourceView<Task>
              resource="tasks"
              title="Tasks"
              clients={clients}
              quickAction={{ label: 'Complete', action: 'complete', showIf: r => r.status !== 'done' }}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'client', label: 'Client', render: clientName },
                { key: 'dueDate', label: 'Due', render: r => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—' },
                { key: 'status', label: 'Status' },
              ]}
              formFields={[
                { key: 'title', label: 'Title', required: true },
                { key: 'clientId', label: 'Client', type: 'client-select' },
                { key: 'description', label: 'Description' },
                { key: 'dueDate', label: 'Due date', type: 'date' },
              ]}
            />
          )}
        </main>
      </div>
    </div>
  )
}
