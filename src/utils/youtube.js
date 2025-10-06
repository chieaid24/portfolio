export function getYouTubeId(input) {
  if (!input) return null;

  const idLike = String(input).trim();

  // Already an 11-char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(idLike)) return idLike;

  // Try to parse as URL
  try {
    const url = new URL(idLike);

    // youtu.be/<id>
    if (url.hostname.includes('youtu.be')) {
      const seg = url.pathname.split('/').filter(Boolean)[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(seg) ? seg : null;
    }

    // youtube.com variants
    if (url.hostname.includes('youtube.com')) {
      // /watch?v=<id>
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      // /embed/<id>, /shorts/<id>, /live/<id>
      const m = url.pathname.match(/\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[2];
    }

    return null;
  } catch {
    // Not a URL; not an ID
    return null;
  }
}
