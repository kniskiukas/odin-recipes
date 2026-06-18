interface TokenResponse {
    access_token: string;
    expires_in: number;
}

interface SpotifyImage {
    url: string;
}

interface SpotifyTrack {
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string; images: SpotifyImage[] };
    duration_ms: number;
}

interface CurrentlyPlaying {
    item: SpotifyTrack | null;
    is_playing: boolean;
    progress_ms: number;
}

interface PlayerState {
    device: { name: string; volume_percent: number } | null;
}

const POLL_INTERVAL = 5000;

let accessToken: string | null = null;
let tokenExpiry = 0;
let isPlaying = false;
let progressInterval: ReturnType<typeof setInterval> | null = null;
let currentProgress = 0;
let currentDuration = 1;

async function getAccessToken(): Promise<string> {
    if (accessToken && Date.now() < tokenExpiry - 30_000) return accessToken;

    const res = await fetch('/api/token');
    if (!res.ok) {
        const body = await res.json() as { error?: string };
        if (body.error === 'invalid_grant') {
            throw new Error('Spotify token expired — re-run the OAuth flow and update SPOTIFY_REFRESH_TOKEN in Vercel');
        }
        throw new Error(`Token error: ${res.status}`);
    }

    const data = await res.json() as TokenResponse;
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;
    return accessToken;
}

async function fetchCurrentlyPlaying(): Promise<CurrentlyPlaying | null> {
    const token = await getAccessToken();
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 204) return null;
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json() as Promise<CurrentlyPlaying>;
}

async function fetchPlayer(): Promise<PlayerState | null> {
    const token = await getAccessToken();
    const res = await fetch('https://api.spotify.com/v1/me/player', {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 204) return null;
    if (!res.ok) throw new Error(`Player error: ${res.status}`);
    const text = await res.text();
    return text ? (JSON.parse(text) as PlayerState) : null;
}

async function spotifyControl(action: string): Promise<void> {
    try {
        const token = await getAccessToken();
        let method = 'POST';
        let url: string;
        if (action === 'play-pause') {
            url = `https://api.spotify.com/v1/me/player/${isPlaying ? 'pause' : 'play'}`;
            method = 'PUT';
        } else {
            url = `https://api.spotify.com/v1/me/player/${action}`;
        }
        await fetch(url, { method, headers: { Authorization: `Bearer ${token}` } });
        setTimeout(updateDisplay, 500);
    } catch (e) {
        setStatus(`Control error: ${(e as Error).message}`);
    }
}

function el<T extends HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
}

function formatTime(ms: number): string {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function setMarquee(wrapId: string, spanId: string, text: string): void {
    const wrap = el(wrapId);
    const span = el(spanId);
    span.textContent = text;
    wrap.classList.toggle('scrolling', span.scrollWidth > wrap.clientWidth);
}

function setStatus(msg: string): void {
    el('sb-device').textContent = msg;
}

function startProgressTick(): void {
    if (progressInterval !== null) clearInterval(progressInterval);
    if (!isPlaying) return;
    progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 1000, currentDuration);
        renderProgress();
    }, 1000);
}

function renderProgress(): void {
    const pct = currentDuration > 0 ? (currentProgress / currentDuration) * 100 : 0;
    el('progress-fill').style.width = `${pct}%`;
    el('time-elapsed').textContent = formatTime(currentProgress);
    el('time-total').textContent = formatTime(currentDuration);
}

async function updateDisplay(): Promise<void> {
    try {
        const [cpData, playerData] = await Promise.all([fetchCurrentlyPlaying(), fetchPlayer()]);

        if (!cpData?.item) {
            isPlaying = false;
            if (progressInterval !== null) clearInterval(progressInterval);
            el('status-led').className = 'status-led';
            el('status-text').textContent = 'Not playing';
            el<HTMLButtonElement>('btn-play').textContent = '▶';
            el('window-title').textContent = 'Spotify — Now Playing';
            setMarquee('track-name-wrap', 'track-name', '—');
            setMarquee('artist-name-wrap', 'artist-name', '—');
            setMarquee('album-name-wrap', 'album-name', '—');
            el<HTMLImageElement>('album-art').style.display = 'none';
            el('art-placeholder').style.display = '';
            currentProgress = 0;
            currentDuration = 1;
            renderProgress();
            setStatus('No track playing');
            el('sb-volume').textContent = 'Vol: —';
            return;
        }

        const { item } = cpData;
        const artist = item.artists.map(a => a.name).join(', ');
        const art = item.album.images[0]?.url;

        isPlaying = cpData.is_playing;
        currentProgress = cpData.progress_ms;
        currentDuration = item.duration_ms;

        if (art) {
            const img = el<HTMLImageElement>('album-art');
            img.src = art;
            img.style.display = '';
            el('art-placeholder').style.display = 'none';
        }

        setMarquee('track-name-wrap', 'track-name', item.name);
        setMarquee('artist-name-wrap', 'artist-name', artist);
        setMarquee('album-name-wrap', 'album-name', item.album.name);

        el('window-title').textContent = `${isPlaying ? '▶' : '⏸'} ${item.name} — ${artist}`;
        el('status-led').className = `status-led ${isPlaying ? 'playing' : 'paused'}`;
        el('status-text').textContent = isPlaying ? 'Playing' : 'Paused';
        el<HTMLButtonElement>('btn-play').textContent = isPlaying ? '⏸' : '▶';

        renderProgress();
        startProgressTick();

        if (playerData?.device) {
            setStatus(`🖥 ${playerData.device.name}`);
            el('sb-volume').textContent = `Vol: ${playerData.device.volume_percent}%`;
        }
    } catch (e) {
        if (progressInterval !== null) clearInterval(progressInterval);
        setStatus(`Error: ${(e as Error).message}`);
        console.error(e);
    }
}

el('btn-prev').addEventListener('click', () => spotifyControl('previous'));
el('btn-play').addEventListener('click', () => spotifyControl('play-pause'));
el('btn-next').addEventListener('click', () => spotifyControl('next'));

updateDisplay();
setInterval(updateDisplay, POLL_INTERVAL);
