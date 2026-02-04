import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null, // { name, email, picture }
    accessToken: null,
    isAuthenticated: false,
    isGuest: false,
    isSyncing: false,

    setUser: (user) => set({ user, isAuthenticated: !!user, isGuest: false }),
    setAccessToken: (token) => set({ accessToken: token }),
    setGuestMode: (isGuest) => set({ isGuest, isAuthenticated: false, user: null }),
    setSyncing: (isSyncing) => set({ isSyncing }),

    logout: () => set({ user: null, accessToken: null, isAuthenticated: false, isGuest: false }),
}));

export default useAuthStore;
