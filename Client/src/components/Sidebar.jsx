import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  FiGrid, 
  FiCalendar, 
  FiUsers, 
  FiUserCheck, 
  FiFileText, 
  FiClipboard,
  FiUser,
  FiClock
} from 'react-icons/fi';

const Sidebar = () => {
  const { role } = useContext(AuthContext);

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: FiGrid },
    { name: 'Elections', path: '/admin/elections', icon: FiCalendar },
    { name: 'Candidates', path: '/admin/candidates', icon: FiUsers },
    { name: 'Voters Approval', path: '/admin/voters', icon: FiUserCheck },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: FiFileText },
  ];

  const voterLinks = [
    { name: 'Elections', path: '/dashboard', icon: FiClipboard },
    { name: 'Voting History', path: '/dashboard/history', icon: FiClock },
    { name: 'My Profile', path: '/dashboard/profile', icon: FiUser },
  ];

  const activeStyle = "flex items-center space-x-3 px-4 py-3 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 font-semibold transition-all";
  const inactiveStyle = "flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 font-medium transition-all hover:text-slate-900 dark:hover:text-slate-200";

  const links = (role === 'admin' || role === 'superadmin') ? adminLinks : voterLinks;

  return (
    <aside className="w-full md:w-64 glass-card md:min-h-[calc(100vh-80px)] p-4 flex flex-col space-y-2 rounded-none md:rounded-r-2xl border-t-0 border-l-0 shadow-sm">
      <div className="px-4 py-2 mb-4">
        <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
          Menu Portal
        </p>
      </div>

      <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-x-visible no-scrollbar pb-2 md:pb-0">
        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={index}
              to={link.path}
              end
              className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-nowrap text-sm">{link.name}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
