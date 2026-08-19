export interface Client {
  id: number
  fname: string
  lname: string
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
  status: string
}

export interface Proposal {
  id: number
  clientId: number
  client?: Client
  title: string
  amount?: string | null
  status: string
  validUntil?: string | null
}

export interface Contract {
  id: number
  clientId: number
  client?: Client
  proposalId?: number | null
  title: string
  type: string
  status: string
  startDate: string
  endDate?: string | null
}

export interface Invoice {
  id: number
  clientId: number
  client?: Client
  contractId?: number | null
  number: string
  amount: string
  tax: string
  total: string
  dueDate: string
  paidAt?: string | null
  status: string
}

export interface Task {
  id: number
  clientId?: number | null
  client?: Client
  title: string
  description?: string | null
  dueDate?: string | null
  status: string
}

export interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'client-select'
  options?: string[]
  required?: boolean
  placeholder?: string
}

export interface ColumnDef<T> {
  key: string
  label: string
  render?: (row: T) => string
}
