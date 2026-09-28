import React, { useState, useRef, useEffect } from 'react';
import {
    Search,
    Bell,
    User,
    Clock,
    ChevronDown,
    Shield,
    Check,
    MapPin,
    Briefcase,
    SearchCheck,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const TopBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const { currentUser, usersList, switchUser } = useUser();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchTerm.trim()) {
                navigate(`/assets?search=${encodeURIComponent(searchTerm.trim())}`);
            }
        }
    };

    // Calculate avatar initials
    const getInitials = (name = '') => {
        const parts = name.replace(/^Er\.\s*/i, '').trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase() || 'AU';
    };

    const getRoleBadge = (role, district) => {
        if (role === 'Admin') return 'Super Admin';
        if (district) return `${role} • ${district}`;
        return role;
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'District Officer':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Field Inspector':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 shadow-xs flex items-center justify-between px-6 z-30 sticky top-0">
            {/* Search Input */}
            <div className="flex-1 flex items-center">
                <div className="w-full max-w-lg relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:shadow-xs sm:text-sm transition-all duration-200"
                        placeholder="Search assets by ID, name, or location (e.g. BR-GJ-AHM-00452)..."
                    />
                </div>
            </div>

            {/* Right Header Navigation & Role Switcher */}
            <div className="flex items-center gap-4 ml-4">
                {/* Date Display */}
                <div className="hidden md:flex items-center text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                    <Clock size={13} className="mr-1.5 text-gray-400" />
                    {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>

                {/* Notifications Bell */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    title="View System Alerts"
                >
                    <Bell size={19} />
                    <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white shadow-xs"></span>
                </button>

                <div className="h-6 w-px bg-gray-200"></div>

                {/* Interactive Role / Profile Switcher */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border transition-all duration-200 focus:outline-none ${
                            dropdownOpen
                                ? 'bg-primary-50/70 border-primary-300 ring-2 ring-primary-100'
                                : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                        title="Click to change active role or user profile"
                    >
                        <div className="flex flex-col items-end text-right">
                            <span className="text-xs font-bold text-gray-900 leading-tight">
                                {currentUser?.name || 'Admin User'}
                            </span>
                            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider flex items-center gap-1">
                                {getRoleBadge(currentUser?.role, currentUser?.district)}
                            </span>
                        </div>

                        {/* Avatar */}
                        <div className="h-9 w-9 rounded-lg bg-primary-700 text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-wider">
                            {getInitials(currentUser?.name)}
                        </div>

                        <ChevronDown
                            size={15}
                            className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-primary-600' : ''}`}
                        />
                    </button>

                    {/* Role Switcher Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            {/* Current Profile Summary */}
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                                <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                                    Active Session Profile
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                        {getInitials(currentUser?.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900 truncate">
                                            {currentUser?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                                    </div>
                                </div>
                                <div className="mt-2.5 flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getRoleColor(currentUser?.role)}`}>
                                        {currentUser?.role === 'Admin' ? 'Super Admin' : currentUser?.role}
                                    </span>
                                    {currentUser?.district && (
                                        <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-gray-200">
                                            <MapPin size={11} className="text-primary-600" /> {currentUser.district}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Switch Role Header */}
                            <div className="px-4 pt-3 pb-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    Switch Role or Profile ({usersList.length})
                                </p>
                            </div>

                            {/* User Profiles List */}
                            <div className="max-h-64 overflow-y-auto px-2 py-1 space-y-1 divide-y divide-gray-50">
                                {usersList.map((user) => {
                                    const isSelected = user.email === currentUser?.email;
                                    return (
                                        <button
                                            key={user.email}
                                            onClick={() => {
                                                switchUser(user);
                                                setDropdownOpen(false);
                                            }}
                                            className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                                                isSelected
                                                    ? 'bg-primary-50/80 text-primary-900 border border-primary-200'
                                                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div
                                                    className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                                        isSelected
                                                            ? 'bg-primary-600 text-white shadow-xs'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {getInitials(user.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 truncate flex items-center gap-1.5">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                                                        <span>{user.role === 'Admin' ? 'Super Admin' : user.role}</span>
                                                        {user.district && (
                                                            <span>• {user.district}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {isSelected ? (
                                                <span className="flex items-center gap-1 text-[11px] font-bold text-primary-700 bg-white px-2 py-0.5 rounded-full border border-primary-200 shadow-2xs">
                                                    <Check size={12} className="stroke-[3]" /> Active
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary-600 uppercase">
                                                    Select
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Quick Action Footer */}
                            <div className="px-3 pt-2 pb-1 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[11px] text-gray-400 font-medium">Session preserved</span>
                                <button
                                    onClick={() => {
                                        const admin = usersList.find((u) => u.role === 'Admin') || usersList[0];
                                        switchUser(admin);
                                        setDropdownOpen(false);
                                    }}
                                    className="text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors"
                                >
                                    Reset to Super Admin
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
