'use client';

import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

export default function MainTopbar() {
    return (
        <header className="hrm-topbar">
            <div className="topbar-search">
                <Search size={16} className="search-icon" />
                <input type="text" placeholder="Tìm kiếm…" className="search-input" />
            </div>
            <div className="topbar-actions">
                <button className="topbar-btn" id="notification-btn">
                    <Bell size={18} />
                </button>
                <button className="topbar-btn" id="settings-btn">
                    <Settings size={18} />
                </button>
            </div>
        </header>
    );
}
