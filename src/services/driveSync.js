import { listFiles, initGoogleDriveClient } from './googleDrive';

const PROGRESS_FILE_SUFFIX = '_progress.json';

// Helper to create file
const createFile = async (accessToken, name, content) => {
    const metadata = {
        name: name,
        mimeType: 'application/json'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(content)], { type: 'application/json' }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: form
    });

    if (!response.ok) throw new Error('Failed to create file');
    return response.json();
};

// Helper to update file
const updateFile = async (accessToken, fileId, content) => {
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
    });

    if (!response.ok) throw new Error('Failed to update file');
    return response.json();
};

export const syncProgress = async (accessToken, documentTitle, progressData) => {
    if (!accessToken || !documentTitle) return;

    const fileName = `${documentTitle}${PROGRESS_FILE_SUFFIX}`;

    try {
        // 1. Find existing file
        // Note: In real prod, strict query escaping needed for titles
        const query = `name = '${fileName}' and trashed = false`;
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        const files = data.files || [];

        if (files.length > 0) {
            // Update existing
            const fileId = files[0].id;
            console.log(`Syncing: Updating ${fileName} (${fileId})`);
            return await updateFile(accessToken, fileId, progressData);
        } else {
            // Create new
            console.log(`Syncing: Creating ${fileName}`);
            return await createFile(accessToken, fileName, progressData);
        }

    } catch (error) {
        console.error("Sync Error:", error);
        throw error;
    }
};

export const loadProgress = async (accessToken, documentTitle) => {
    if (!accessToken || !documentTitle) return null;

    const fileName = `${documentTitle}${PROGRESS_FILE_SUFFIX}`;
    try {
        const query = `name = '${fileName}' and trashed = false`;
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();

        if (data.files && data.files.length > 0) {
            const fileId = data.files[0].id;
            const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            return await contentResponse.json();
        }
        return null; // No save found
    } catch (error) {
        console.error("Load Error:", error);
        return null;
    }
}
