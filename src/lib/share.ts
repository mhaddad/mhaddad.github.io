export type ShareNetwork = 'linkedin' | 'whatsapp';

export function shareUrl(network: ShareNetwork, url: string, title: string): string {
  if (network === 'linkedin') {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
}
