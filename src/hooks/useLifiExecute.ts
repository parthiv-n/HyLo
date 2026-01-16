"use client"

import { useState, useCallback } from "react"
import { useWalletClient } from "wagmi"
import { executeLifiRoute, getTransactionStatus } from "@/lib/lifi"
import type { Route } from "@lifi/sdk"

export type ExecutionStatus = 
  | "idle"
  | "approving"
  | "swapping"
  | "bridging"
  | "confirming"
  | "completed"
  | "failed"

export interface ExecutionState {
  status: ExecutionStatus
  currentStep: number
  totalSteps: number
  txHash: string | null
  error: string | null
  completedRoute: Route | null
}

export function useLifiExecute() {
  const { data: walletClient } = useWalletClient()
  
  const [state, setState] = useState<ExecutionState>({
    status: "idle",
    currentStep: 0,
    totalSteps: 0,
    txHash: null,
    error: null,
    completedRoute: null,
  })

  const execute = useCallback(async (route: Route) => {
    if (!walletClient) {
      setState((prev) => ({ ...prev, error: "Wallet not connected" }))
      return null
    }

    const totalSteps = route.steps.length
    setState({
      status: "approving",
      currentStep: 0,
      totalSteps,
      txHash: null,
      error: null,
      completedRoute: null,
    })

    try {
      const executedRoute = await executeLifiRoute(route, walletClient, {
        onStepStarted: (step) => {
          const stepType = route.steps[step]?.type as string
          let status: ExecutionStatus = "swapping"
          if (stepType === "cross" || stepType === "lifi") status = "bridging"
          
          setState((prev) => ({
            ...prev,
            status,
            currentStep: step,
          }))
        },
        onStepCompleted: (completedSteps) => {
          setState((prev) => ({
            ...prev,
            currentStep: completedSteps,
            status: completedSteps === totalSteps ? "confirming" : prev.status,
          }))
        },
        onError: (error) => {
          setState((prev) => ({
            ...prev,
            status: "failed",
            error: error.message,
          }))
        },
        onSuccess: (completedRoute) => {
          setState((prev) => ({
            ...prev,
            status: "completed",
            completedRoute,
          }))
        },
      })

      return executedRoute
    } catch (error) {
      const message = error instanceof Error ? error.message : "Execution failed"
      setState((prev) => ({
        ...prev,
        status: "failed",
        error: message,
      }))
      return null
    }
  }, [walletClient])

  const checkStatus = useCallback(async (txHash: string, fromChain: number, toChain: number) => {
    const status = await getTransactionStatus(txHash, fromChain, toChain)
    return status
  }, [])

  const reset = useCallback(() => {
    setState({
      status: "idle",
      currentStep: 0,
      totalSteps: 0,
      txHash: null,
      error: null,
      completedRoute: null,
    })
  }, [])

  return {
    ...state,
    execute,
    checkStatus,
    reset,
  }
}
