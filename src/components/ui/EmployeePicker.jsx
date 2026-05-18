import { useState } from 'react';

export default function EmployeePicker({ users, onSelect }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  // Only show employees assigned to Tailor Scan 2
  const tailorUsers = users.filter((u) =>
    u.locations?.some((loc) => loc.name?.toLowerCase() === 'tailor scan 2')
  );

  const filtered = tailorUsers.filter((u) => {
    const q = search.toLowerCase();
    return u.user_name?.toLowerCase().includes(q) || String(u.id).includes(q);
  });

  const shortName = (u) => u.user_name?.split('/')[0]?.trim() ?? `Employee ${u.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm md:max-w-md">
        {/* Header */}
        <div className="text-center px-8 pt-8 pb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Select Employee
          </h2>
          <p className="text-gray-400 text-xs mt-1">{tailorUsers.length} employees in Tailor Scan 2</p>
        </div>

        {/* Search */}
        <div className="px-6 pb-3">
          <input
            type="text"
            autoFocus
            placeholder="Search by name or ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Employee list */}
        <ul className="mx-6 mb-4 max-h-64 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
          {filtered.length === 0 && (
            <li className="px-4 py-4 text-sm text-gray-400 text-center">No employees found</li>
          )}
          {filtered.map((u) => {
            const isActive = selected?.id === u.id;
            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => setSelected(u)}
                  className={`w-full text-left px-4 py-3 text-sm transition flex items-center justify-between
                    ${isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                >
                  <span>
                    <span className={`font-semibold ${isActive ? 'text-indigo-700' : 'text-gray-800'}`}>
                      {shortName(u)}
                    </span>
                    <span className="ml-2 text-gray-400 text-xs">#{u.id}</span>
                  </span>
                  {isActive && (
                    <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Action */}
        <div className="px-6 pb-7">
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200
              text-white font-semibold py-3 rounded-xl transition active:scale-95"
          >
            {selected ? `View Records — ${shortName(selected)}` : 'Select an employee'}
          </button>
        </div>
      </div>
    </div>
  );
}
