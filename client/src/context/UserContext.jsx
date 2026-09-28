import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const defaultAdminUser = {
    name: 'Admin User',
    email: 'admin@gujrb.gov.in',
    role: 'Admin',
    district: null,
    isSuperAdmin: true
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = localStorage.getItem('gujrb_user');
            return saved ? JSON.parse(saved) : defaultAdminUser;
        } catch (e) {
            return defaultAdminUser;
        }
    });

    const [usersList, setUsersList] = useState([defaultAdminUser]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users');
                const users = Array.isArray(res.data) ? res.data : (res.data?.value || []);
                if (users.length > 0) {
                    setUsersList(users);
                    // If current user is in list, sync details
                    const matched = users.find((u) => u.email === currentUser.email);
                    if (matched) {
                        setCurrentUser((prev) => ({ ...prev, ...matched }));
                    }
                }
            } catch (err) {
                console.error('Failed to load users for role switcher:', err);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    const switchUser = (user) => {
        setCurrentUser(user);
        try {
            localStorage.setItem('gujrb_user', JSON.stringify(user));
        } catch (e) {
            console.error('Failed to persist user to localStorage', e);
        }
    };

    return (
        <UserContext.Provider value={{ currentUser, usersList, switchUser, loadingUsers }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
