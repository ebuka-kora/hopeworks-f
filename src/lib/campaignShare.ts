const CAMPAIGN_PARAM = 'campaign';

export function getCampaignShareUrl(projectId: string): string {
  return `${window.location.origin}/c/${encodeURIComponent(projectId)}`;
}

export function toAbsoluteImageUrl(imageUrl: string, origin = typeof window !== 'undefined' ? window.location.origin : ''): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/')) return `${origin}${imageUrl}`;
  return `${origin}/${imageUrl}`;
}

export function readCampaignIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(CAMPAIGN_PARAM);
}

export function setCampaignShareUrl(projectId: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set(CAMPAIGN_PARAM, projectId);
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
}

export function clearCampaignShareUrl(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(CAMPAIGN_PARAM)) return;
  url.searchParams.delete(CAMPAIGN_PARAM);
  const next = url.search ? `${url.pathname}${url.search}` : url.pathname;
  window.history.replaceState(null, '', next);
}

export function canShareCampaign(
  status: string,
  ownerId: string,
  currentUserId?: string | null
): boolean {
  if (currentUserId && currentUserId === ownerId) return true;
  return status === 'active' || status === 'completed';
}

export function getShareMessage(title: string, summary: string): string {
  const blurb = summary.trim() || title;
  return `Support "${title}" on HopeWorks — ${blurb}`;
}

export function getTwitterShareUrl(shareUrl: string, message: string): string {
  const params = new URLSearchParams({
    url: shareUrl,
    text: message,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function getFacebookShareUrl(shareUrl: string): string {
  const params = new URLSearchParams({ u: shareUrl });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

export function getLinkedInShareUrl(shareUrl: string): string {
  const params = new URLSearchParams({ url: shareUrl });
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

export function getWhatsAppShareUrl(shareUrl: string, message: string): string {
  const params = new URLSearchParams({ text: `${message} ${shareUrl}` });
  return `https://wa.me/?${params.toString()}`;
}
