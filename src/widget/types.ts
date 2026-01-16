// Widget configuration types

export interface HyLoWidgetConfig {
  /** Your app identifier (optional, for analytics) */
  appId?: string
  /** Theme: 'dark' or 'light' */
  theme?: 'dark' | 'light'
  /** Primary accent color (hex) */
  primaryColor?: string
  /** Callback when deposit succeeds */
  onSuccess?: (result: DepositResult) => void
  /** Callback when deposit fails */
  onError?: (error: WidgetError) => void
  /** Callback when widget is closed */
  onClose?: () => void
}

export interface DepositOptions {
  /** Recipient address on HyperEVM */
  recipient: string
  /** Suggested amount (user can change) */
  amount?: string
  /** Destination token symbol (default: USDC) */
  destinationToken?: 'USDC' | 'HYPE'
  /** Pre-select origin chain ID */
  fromChainId?: number
  /** Pre-select origin token address */
  fromToken?: string
}

export interface DepositResult {
  /** Transaction hash */
  txHash: string
  /** Amount deposited (in destination token) */
  amount: string
  /** Destination token symbol */
  token: string
  /** Recipient address */
  recipient: string
  /** Origin chain ID */
  fromChainId: number
  /** Destination chain ID (999 for HyperEVM) */
  toChainId: number
}

export interface WidgetError {
  /** Error code */
  code: 'USER_CANCELLED' | 'WALLET_ERROR' | 'BRIDGE_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN'
  /** Human-readable message */
  message: string
  /** Original error details */
  details?: unknown
}

// Message types for iframe communication
export type WidgetMessage =
  | { type: 'HYLO_READY' }
  | { type: 'HYLO_CLOSE' }
  | { type: 'HYLO_SUCCESS'; payload: DepositResult }
  | { type: 'HYLO_ERROR'; payload: WidgetError }
  | { type: 'HYLO_RESIZE'; payload: { height: number } }

export type ParentMessage =
  | { type: 'HYLO_INIT'; payload: HyLoWidgetConfig & DepositOptions }
  | { type: 'HYLO_CLOSE' }
