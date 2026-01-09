import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            <div className='blur-bg'>
                <div className='blur-circle-yellow'></div>
                <div className='blur-circle-orange'></div>
                <div className='blur-circle-red'></div>
                <div className='blur-circle-orange-2'></div>
            </div>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}


            <main className="main-container">
                {/* Top Header logic could go here if needed, or inside Dashboard */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className='header'>
                    <div className="brand" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '40px', fontWeight: 500 }}>
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            aria-label="Toggle menu"
                        >
                            <Menu size={24} color="white" />
                        </button>
                        {/* <div style={{ width: 20, height: 20, background: 'white', transform: 'rotate(45deg)' }}></div> */}
                        Intellexa
                    </div>

                    {/* <div className="top-actions" style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '2rem', lineHeight: '0.5' }}>...</span>
                    </div> */}
                </header>
                <div className="body-container">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
