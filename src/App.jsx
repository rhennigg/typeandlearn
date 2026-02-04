import React, { useState } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google';
import useAuthStore from '@/store/useAuthStore';
import { LoginButton } from '@/components/features/auth/LoginButton';
import { Button } from '@/components/ui/Button';
import useDocumentStore from '@/store/useDocumentStore';
import { PDFUploader } from '@/components/features/pdf/PDFUploader';
import { TypingEngine } from '@/components/features/typing/TypingEngine';
import { ThemeToggle } from '@/components/features/ui/ThemeToggle';
import { ReadingEngine } from '@/components/features/reading/ReadingEngine';
import { PDFExporter } from '@/components/features/export/PDFExporter';

// NOTE: You need to create a .env file with VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID";

function AppContent() {
    const { isAuthenticated, isGuest, user, logout, setGuestMode } = useAuthStore();
    const { document, resetDocument } = useDocumentStore();
    const [appMode, setAppMode] = useState('idle'); // 'idle', 'typing', 'reading'

    const handleStartTyping = () => setAppMode('typing');
    const handleStartReading = () => setAppMode('reading');
    const handleExitSession = () => setAppMode('idle');

    const handleReset = () => {
        setAppMode('idle');
        resetDocument();
    };

    const handleGuestMode = () => {
        setGuestMode(true);
    };

    // Active Session View
    if (appMode !== 'idle' && document) {
        return (
            <div className="relative">
                <div className="fixed top-4 right-8 z-50 flex items-center gap-2">
                    <ThemeToggle />
                    <div className="h-6 w-px bg-ink/20 mx-2"></div>
                    <Button
                        variant={appMode === 'reading' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={handleStartReading}
                        className={appMode === 'reading' ? "cursor-default" : ""}
                    >
                        Read
                    </Button>
                    <Button
                        variant={appMode === 'typing' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={handleStartTyping}
                        className={appMode === 'typing' ? "cursor-default" : ""}
                    >
                        Type
                    </Button>
                    <div className="h-6 w-px bg-ink/20 mx-2"></div>
                    <Button variant="ghost" size="sm" onClick={handleExitSession}>Exit</Button>
                </div>

                {appMode === 'typing' ? <TypingEngine /> : <ReadingEngine />}
            </div>
        );
    }

    const showMainUI = isAuthenticated || isGuest;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center font-serif text-ink dark:text-gray-100 transition-colors duration-500 bg-background-light dark:bg-background-dark">
            <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-display text-2xl font-bold tracking-tight cursor-pointer" onClick={handleReset}>ActiveReader AI</h1>
                    {document && <PDFExporter />}
                </div>

                <nav className="text-sm font-sans text-ink-light space-x-4 flex items-center">
                    <ThemeToggle />
                    {showMainUI ? (
                        <>
                            {isAuthenticated && <span className="hidden sm:inline-block">Welcome, {user?.given_name}</span>}
                            {isGuest && <span className="hidden sm:inline-block italic opacity-60">Guest Mode</span>}
                            <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
                            {document && <Button variant="ghost" size="sm" onClick={handleReset}>New Upload</Button>}
                        </>
                    ) : (
                        <span className="text-xs uppercase tracking-widest opacity-50">Locked</span>
                    )}
                </nav>
            </header>

            <main className="text-center space-y-8 max-w-3xl px-6 relative z-0 w-full">
                {!document && (
                    <>
                        <div className="w-24 h-1 bg-ink mx-auto mb-8"></div>

                        <h2 className="font-display text-5xl md:text-6xl font-medium leading-tight">
                            Read deeply. <br /> Type to learn.
                        </h2>

                        <p className="text-xl text-ink-light leading-relaxed font-sans max-w-lg mx-auto">
                            Transform static PDFs into dynamic typing streams. Engage with every word, track your flow, and sync your progress.
                        </p>
                    </>
                )}

                <div className="pt-10 flex flex-col items-center gap-4 w-full">
                    {!showMainUI ? (
                        <div className="animate-fade-in-up flex flex-col items-center gap-4">
                            <LoginButton />
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-xs text-ink-light opacity-50 font-sans uppercase tracking-widest">or</span>
                                <Button variant="ghost" onClick={handleGuestMode} className="text-xs">Continue as Guest</Button>
                            </div>
                            <p className="mt-4 text-xs text-ink-light/60 font-sans max-w-xs mx-auto">
                                Authentication required to sync progress to Google Drive.
                            </p>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up w-full flex justify-center">
                            {!document ? (
                                <div className="w-full max-w-md">
                                    <PDFUploader />
                                </div>
                            ) : (
                                <div className="text-center animate-fade-in-up">
                                    <p className="text-2xl font-display mb-8">
                                        Ready to read: <br />
                                        <span className="font-bold text-3xl block mt-2">{document.title}</span>
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <Button size="lg" onClick={handleStartReading} className="px-8">Read Mode</Button>
                                        <Button size="lg" variant="secondary" onClick={handleStartTyping} className="px-8">Type Mode</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <footer className="absolute bottom-6 w-full px-6 flex justify-between text-xs text-ink-light font-sans opacity-60">
                <span>v0.1.0 Alpha</span>
                <span>Editorial Minimalist Design</span>
            </footer>
        </div>
    )
}

function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AppContent />
        </GoogleOAuthProvider>
    )
}

export default App
