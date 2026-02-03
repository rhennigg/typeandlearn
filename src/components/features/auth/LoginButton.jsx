import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/Button';
import useAuthStore from '@/store/useAuthStore';
import { listFiles } from '@/services/googleDrive';

export const LoginButton = () => {
    const { setUser, setAccessToken } = useAuthStore();

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log('Login Success:', tokenResponse);
            setAccessToken(tokenResponse.access_token);

            // Fetch User Info
            try {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoResponse.json();
                setUser(userInfo);

                // Test Drive Access
                // listFiles(tokenResponse.access_token).then(files => console.log('Drive Files:', files));
            } catch (error) {
                console.error('Failed to fetch user info', error);
            }
        },
        onError: error => console.log('Login Failed:', error),
        scope: 'https://www.googleapis.com/auth/drive.file', // Request Drive access immediately
    });

    return (
        <Button onClick={() => login()} variant="primary" size="lg">
            Sign In with Google
        </Button>
    );
};
