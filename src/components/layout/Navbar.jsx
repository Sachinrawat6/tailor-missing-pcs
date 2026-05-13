import Button from "../ui/Button";

const ClipboardIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

/**
 * Top navigation bar shown on the scanner page.
 */
export default function Navbar({ user, onLogout }) {
  // Show first word of name to save space on mobile
  const shortName = user.user_name.split(" ")[0].split("/")[0].trim();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand + user */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <ClipboardIcon />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
              {shortName}
            </p>
            <p className="text-xs text-gray-400 leading-tight">ID: {user.id}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-1">
            Missing PCs
          </span>
          <Button variant="danger" onClick={onLogout} className="py-1.5 px-3 text-xs">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
