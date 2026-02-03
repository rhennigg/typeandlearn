import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null, // { name, email, picture }
    accessToken: null,
    isAuthenticated: false,
    isSyncing: false,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setAccessToken: (token) => set({ accessToken: token }),
    setSyncing: (isSyncing) => set({ isSyncing }),

    logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));

export default useAuthStore;
