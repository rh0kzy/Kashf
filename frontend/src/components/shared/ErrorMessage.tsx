interface Props {
  message: string
  onRetry?: () => void
}

const ErrorMessage = ({ message, onRetry }: Props) => (
  <div className="border border-red-900 bg-red-950/30 rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="text-red-400 text-lg">⚠</span>
      <p className="text-red-300 text-sm">{message}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs text-red-400 hover:text-white border border-red-800 hover:border-white px-3 py-1 rounded transition-colors ml-4 shrink-0"
      >
        Retry
      </button>
    )}
  </div>
)

export default ErrorMessage