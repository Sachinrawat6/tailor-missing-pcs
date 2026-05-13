import Button from "../ui/Button";

const WarnIcon = () => (
  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

export default function ErrorScreen({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto">
          <WarnIcon />
        </div>
        <div>
          <p className="font-semibold text-gray-800">Connection Error</p>
          <p className="text-red-500 text-sm mt-1">{message}</p>
        </div>
        {onRetry && (
          <Button fullWidth onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
