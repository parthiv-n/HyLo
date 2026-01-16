import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Transaction {
  id: string
  fromChain: number
  toChain: number
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  recipient: string
  status: "pending" | "completed" | "failed"
  txHash?: string
  timestamp: number
}

interface TransactionStore {
  transactions: Transaction[]
  addTransaction: (tx: Omit<Transaction, "id" | "timestamp">) => string
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  getTransaction: (id: string) => Transaction | undefined
  clearTransactions: () => void
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      
      addTransaction: (tx) => {
        const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
        const transaction: Transaction = {
          ...tx,
          id,
          timestamp: Date.now(),
        }
        set((state) => ({
          transactions: [transaction, ...state.transactions].slice(0, 50), // Keep last 50
        }))
        return id
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        }))
      },

      getTransaction: (id) => {
        return get().transactions.find((tx) => tx.id === id)
      },

      clearTransactions: () => {
        set({ transactions: [] })
      },
    }),
    {
      name: "hylo-transactions",
    }
  )
)
