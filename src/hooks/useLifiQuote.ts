"use client"

import { useState, useCallback } from "react"
import { getLifiQuote, formatRouteInfo, type QuoteParams } from "@/lib/lifi"
import type { Route } from "@lifi/sdk"

export interface QuoteState {
  loading: boolean
  error: string | null
  route: Route | null
  formattedInfo: ReturnType<typeof formatRouteInfo> | null
}

export function useLifiQuote() {
  const [state, setState] = useState<QuoteState>({
    loading: false,
    error: null,
    route: null,
    formattedInfo: null,
  })

  const fetchQuote = useCallback(async (params: QuoteParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const route = await getLifiQuote(params)
      if (route) {
        const formattedInfo = formatRouteInfo(route)
        setState({
          loading: false,
          error: null,
          route,
          formattedInfo,
        })
        return route
      } else {
        setState({
          loading: false,
          error: "No route found",
          route: null,
          formattedInfo: null,
        })
        return null
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get quote"
      setState({
        loading: false,
        error: message,
        route: null,
        formattedInfo: null,
      })
      return null
    }
  }, [])

  const clearQuote = useCallback(() => {
    setState({
      loading: false,
      error: null,
      route: null,
      formattedInfo: null,
    })
  }, [])

  return {
    ...state,
    fetchQuote,
    clearQuote,
  }
}
