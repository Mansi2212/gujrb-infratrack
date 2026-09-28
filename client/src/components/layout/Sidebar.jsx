import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, PlusSquare, Map, ClipboardList, PenTool, BarChart3, Bell } from 'lucide-react';

const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Layers, label: 'Assets', path: '/assets' },
    { icon: Map, label: 'Map', path: '/map' },
    { icon: ClipboardList, label: 'Inspections', path: '/inspections' },
    { icon: PenTool, label: 'Maintenance', path: '/maintenance' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

const Sidebar = () => {
    return (
        <aside className="w-64 bg-primary-900 text-white flex-shrink-0 flex flex-col h-full border-r border-primary-700 shadow-xl overflow-y-auto">
            <div className="p-5 flex items-center gap-3 bg-primary-900 border-b border-primary-700/50 sticky top-0 z-10">
                <div className="w-8 h-8 rounded bg-white text-primary-700 font-bold flex items-center justify-center shadow">
                    GJ
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight leading-tight text-white whitespace-nowrap">GujR&B</h1>
                    <p className="text-xs text-primary-100 font-medium tracking-wide">InfraTrack System</p>
                </div>
            </div>

            <nav className="flex-1 py-4 px-3 space-y-1">
                <div className="text-xs font-semibold text-primary-100/50 uppercase tracking-wider mb-2 px-3">Main Menu</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.disabled ? '#' : item.path}
                        onClick={(e) => item.disabled && e.preventDefault()}
                        className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200
              ${item.disabled ? 'opacity-40 cursor-not-allowed text-primary-100 hover:bg-transparent' :
                                isActive ? 'bg-primary-500/20 text-white font-semibold shadow-inner' : 'text-primary-100 hover:bg-primary-500/10 hover:text-white'}
            `}
                    >
                        <item.icon size={20} className={item.disabled ? '' : 'text-primary-100'} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-primary-700/50">
                <div className="bg-primary-500/10 rounded-lg p-3">
                    <p className="text-xs text-primary-100 text-center uppercase tracking-widest font-semibold mb-1">Status</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-white font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        System Online
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
