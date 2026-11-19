// Tracks whether the one-time VIP warning on the alarms page was already shown.
// This lives at module scope: it survives in-app page switches, and resets when
// the mini app is closed and reopened (the webview JS context is recreated).
export const alarmsNotice = { shown: false };
