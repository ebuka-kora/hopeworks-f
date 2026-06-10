import type { VercelRequest, VercelResponse } from '@vercel/node';

interface CampaignProject {
  id: string;
  title: string;
  summary: string;
  coverUrl: string;
  status: string;
}

const BOT_UA =
  /facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|discordbot|telegrambot|googlebot|bingbot|applebot/i;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getApiBase(): string {
  const base = process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:3001';
  return base.replace(/\/+$/, '');
}

function absoluteImageUrl(coverUrl: string, origin: string): string {
  if (!coverUrl) return `${origin}/apple-touch-icon.png`;
  if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) return coverUrl;
  if (coverUrl.startsWith('/')) return `${origin}${coverUrl}`;
  return `${origin}/${coverUrl}`;
}

function buildOgHtml(options: {
  title: string;
  description: string;
  image: string;
  pageUrl: string;
  redirectUrl?: string;
}): string {
  const title = escapeHtml(options.title);
  const description = escapeHtml(options.description);
  const image = escapeHtml(options.image);
  const pageUrl = escapeHtml(options.pageUrl);
  const redirectMeta = options.redirectUrl
    ? `<meta http-equiv="refresh" content="0;url=${escapeHtml(options.redirectUrl)}" />`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="HopeWorks" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  ${redirectMeta}
</head>
<body>
  <p>Opening campaign on HopeWorks… <a href="${escapeHtml(options.redirectUrl || pageUrl)}">Continue</a></p>
</body>
</html>`;
}

async function fetchProject(id: string): Promise<CampaignProject | null> {
  const res = await fetch(`${getApiBase()}/api/projects/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Project fetch failed: ${res.status}`);
  return res.json() as Promise<CampaignProject>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawId = req.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id) {
    return res.status(400).send('Missing campaign id');
  }

  const host = req.headers.host || 'hopeworks-xi.vercel.app';
  const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
  const origin = `${protocol}://${host}`;
  const pageUrl = `${origin}/c/${id}`;
  const appUrl = `${origin}/?campaign=${encodeURIComponent(id)}`;
  const userAgent = String(req.headers['user-agent'] || '');
  const isBot = BOT_UA.test(userAgent);

  const sendHtml = (html: string, status = 200) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(status).send(html);
  };

  try {
    const project = await fetchProject(id);

    if (!project || project.status === 'rejected') {
      const html = buildOgHtml({
        title: 'HopeWorks — SDG Campaign Escrow',
        description: 'Fund transparent campaigns matched to UN development milestones.',
        image: `${origin}/apple-touch-icon.png`,
        pageUrl,
        redirectUrl: isBot ? undefined : appUrl,
      });
      return sendHtml(html);
    }

    const html = buildOgHtml({
      title: project.title,
      description: project.summary || 'Support this HopeWorks campaign aligned with UN SDG goals.',
      image: absoluteImageUrl(project.coverUrl, origin),
      pageUrl,
      redirectUrl: isBot ? undefined : appUrl,
    });

    if (!isBot) {
      return res.redirect(302, appUrl);
    }

    return sendHtml(html);
  } catch {
    const html = buildOgHtml({
      title: 'HopeWorks — SDG Campaign Escrow',
      description: 'Fund transparent campaigns matched to UN development milestones.',
      image: `${origin}/apple-touch-icon.png`,
      pageUrl,
      redirectUrl: isBot ? undefined : appUrl,
    });
    return sendHtml(html);
  }
}
