import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse): Promise<void> {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
        res.status(500).json({ error: 'Missing Spotify credentials' });
        return;
    }

    const creds = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(SPOTIFY_REFRESH_TOKEN)}`,
    });

    if (!response.ok) {
        let errorType = 'Token fetch failed';
        try {
            const body = await response.json() as { error?: string };
            if (body.error === 'invalid_grant') errorType = 'invalid_grant';
        } catch { /* ignore parse errors */ }
        res.status(response.status).json({ error: errorType });
        return;
    }

    const data = await response.json() as { access_token: string; expires_in: number };

    res.setHeader('Cache-Control', 'no-store');
    res.json({ access_token: data.access_token, expires_in: data.expires_in });
}
