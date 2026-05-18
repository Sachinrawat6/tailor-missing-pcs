import { useState } from 'react';
import EmployeePicker from './EmployeePicker.jsx';
import ScanRecordList from './ScanRecordList.jsx';

/**
 * UpdateScannedItem — admin-only screen.
 *
 * Flow:
 *   1. Show EmployeePicker (second login) so admin picks which employee to view.
 *   2. Show ScanRecordList for that employee with a "Change Employee" button.
 *
 * Props:
 *   user    — the logged-in admin user object
 *   users   — full employee list (fetched in App.jsx)
 *   onLogout
 */
export default function UpdateScannedItem({ user, users = [], onLogout }) {
  const [targetEmployee, setTargetEmployee] = useState(null);

  if (!targetEmployee) {
    return (
      <EmployeePicker
        users={users}
        onSelect={(employee) => setTargetEmployee(employee)}
      />
    );
  }

  return (
    <ScanRecordList
      adminUser={user}
      targetEmployee={targetEmployee}
      onChangeEmployee={() => setTargetEmployee(null)}
      onLogout={onLogout}
    />
  );
}
