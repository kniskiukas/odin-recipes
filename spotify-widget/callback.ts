const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const error = params.get('error');
const content = document.getElementById('content') as HTMLElement;

function makeEl<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    text?: string,
    className?: string,
): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
}

content.innerHTML = '';

if (error) {
    const p = makeEl('p', 'Authorization failed: ', 'error');
    p.appendChild(makeEl('strong', error));
    content.appendChild(p);
    content.appendChild(makeEl('p', 'Close this window and try the authorization link again.', 'note'));
} else if (code) {
    content.appendChild(makeEl('p', 'Authorization code received. Copy it below, then run the curl command to exchange it for a refresh token.'));

    const wrapper = makeEl('div');
    wrapper.appendChild(makeEl('div', 'Authorization Code (click to select all)', 'label'));
    const codeBox = makeEl('div', code, 'code-box');
    codeBox.id = 'code-box';
    wrapper.appendChild(codeBox);
    content.appendChild(wrapper);

    const copyBtn = makeEl('button', 'Copy Code', 'btn');
    content.appendChild(copyBtn);

    const copyStatus = makeEl('p', '', 'note');
    copyStatus.id = 'copy-status';
    content.appendChild(copyStatus);

    const note = makeEl('p', 'Next step — run this in your terminal (fill in your client ID and secret):', 'note');
    note.appendChild(makeEl('br'));
    note.appendChild(makeEl('br'));
    const codeSpan = makeEl('span');
    codeSpan.style.fontFamily = 'monospace';
    codeSpan.style.fontSize = '10px';
    const curlLines = [
        'curl -X POST https://accounts.spotify.com/api/token \\',
        '  -u "CLIENT_ID:CLIENT_SECRET" \\',
        '  -d "grant_type=authorization_code" \\',
        `  -d "code=${code}" \\`,
        '  -d "redirect_uri=YOUR_VERCEL_URL/spotify-widget/callback.html"',
    ];
    curlLines.forEach((line, i) => {
        codeSpan.appendChild(document.createTextNode(line));
        if (i < curlLines.length - 1) codeSpan.appendChild(makeEl('br'));
    });
    note.appendChild(codeSpan);
    content.appendChild(note);

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(code).then(() => {
            copyStatus.textContent = 'Copied!';
        });
    });
} else {
    content.appendChild(makeEl('p', 'No authorization code found in the URL.', 'error'));
    content.appendChild(makeEl('p', "This page should only be opened by Spotify's redirect. Start the authorization flow from the widget setup instructions.", 'note'));
}
