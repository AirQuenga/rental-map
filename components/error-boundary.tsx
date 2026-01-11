"use client"

import type React from "react"

import { Component, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Lightweight React Error Boundary
 *
 * Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error)
    console.error("[ErrorBoundary] Error info:", errorInfo.componentStack)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Return custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">Something went wrong</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button variant="outline" onClick={this.handleRetry}>
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Property Detail Panel Error Fallback
 */
export function PropertyDetailFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
      <h3 className="mb-2 font-semibold text-foreground">Unable to load property details</h3>
      <p className="text-sm text-muted-foreground">Some data may be missing or incomplete.</p>
    </div>
  )
}
