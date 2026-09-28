import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden selection:bg-primary-200 selection:text-primary-900">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <TopBar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
