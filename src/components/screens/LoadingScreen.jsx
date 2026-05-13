import Spinner from "../ui/Spinner";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-3">
        <Spinner className="w-10 h-10 text-indigo-600 mx-auto" />
        <p className="text-indigo-700 font-medium text-sm">{message}</p>
      </div>
    </div>
  );
}
