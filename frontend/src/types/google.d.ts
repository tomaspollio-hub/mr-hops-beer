interface Window {
  google: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string
          callback: (response: { credential: string }) => void
          auto_select?: boolean
        }) => void
        prompt: () => void
        renderButton: (element: HTMLElement, options: Record<string, unknown>) => void
      }
    }
  }
}
