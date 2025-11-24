import { 
  FaInstagram, 
  FaTwitter, 
  FaFacebook, 
  FaLinkedin, 
  FaYoutube, 
  FaTiktok, 
  FaSnapchat, 
  FaPinterest, 
  FaGithub, 
  FaDiscord, 
  FaTwitch, 
  FaSpotify, 
  FaApple, 
  FaSoundcloud,
  FaBehance,
  FaDribbble,
  FaMedium,
  FaReddit,
  FaTumblr,
  FaVimeo,
  FaWhatsapp,
  FaTelegram
} from 'react-icons/fa';
import { 
  SiOnlyfans, 
  SiPatreon, 
  SiKofi, 
  SiBuymeacoffee, 
  SiCashapp, 
  SiVenmo,
  SiPaypal
} from 'react-icons/si';

export interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  baseUrl: string;
  placeholder: string;
}

export const socialPlatforms: Record<string, SocialPlatform> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    color: '#E4405F',
    baseUrl: 'https://instagram.com/',
    placeholder: 'username'
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter/X',
    icon: FaTwitter,
    color: '#1DA1F2',
    baseUrl: 'https://twitter.com/',
    placeholder: 'username'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: FaFacebook,
    color: '#1877F2',
    baseUrl: 'https://facebook.com/',
    placeholder: 'username'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: FaLinkedin,
    color: '#0A66C2',
    baseUrl: 'https://linkedin.com/in/',
    placeholder: 'username'
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: FaYoutube,
    color: '#FF0000',
    baseUrl: 'https://youtube.com/',
    placeholder: '@username or channel'
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: FaTiktok,
    color: '#000000',
    baseUrl: 'https://tiktok.com/@',
    placeholder: 'username'
  },
  snapchat: {
    id: 'snapchat',
    name: 'Snapchat',
    icon: FaSnapchat,
    color: '#FFFC00',
    baseUrl: 'https://snapchat.com/add/',
    placeholder: 'username'
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    icon: FaPinterest,
    color: '#BD081C',
    baseUrl: 'https://pinterest.com/',
    placeholder: 'username'
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: FaGithub,
    color: '#181717',
    baseUrl: 'https://github.com/',
    placeholder: 'username'
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    icon: FaDiscord,
    color: '#5865F2',
    baseUrl: 'https://discord.gg/',
    placeholder: 'invite-code'
  },
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    icon: FaTwitch,
    color: '#9146FF',
    baseUrl: 'https://twitch.tv/',
    placeholder: 'username'
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    icon: FaSpotify,
    color: '#1DB954',
    baseUrl: 'https://open.spotify.com/user/',
    placeholder: 'user-id'
  },
  apple: {
    id: 'apple',
    name: 'Apple Music',
    icon: FaApple,
    color: '#000000',
    baseUrl: 'https://music.apple.com/profile/',
    placeholder: 'username'
  },
  soundcloud: {
    id: 'soundcloud',
    name: 'SoundCloud',
    icon: FaSoundcloud,
    color: '#FF3300',
    baseUrl: 'https://soundcloud.com/',
    placeholder: 'username'
  },
  behance: {
    id: 'behance',
    name: 'Behance',
    icon: FaBehance,
    color: '#1769FF',
    baseUrl: 'https://behance.net/',
    placeholder: 'username'
  },
  dribbble: {
    id: 'dribbble',
    name: 'Dribbble',
    icon: FaDribbble,
    color: '#EA4C89',
    baseUrl: 'https://dribbble.com/',
    placeholder: 'username'
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    icon: FaMedium,
    color: '#000000',
    baseUrl: 'https://medium.com/@',
    placeholder: 'username'
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    icon: FaReddit,
    color: '#FF4500',
    baseUrl: 'https://reddit.com/u/',
    placeholder: 'username'
  },
  tumblr: {
    id: 'tumblr',
    name: 'Tumblr',
    icon: FaTumblr,
    color: '#001935',
    baseUrl: 'https://.tumblr.com/',
    placeholder: 'username'
  },
  vimeo: {
    id: 'vimeo',
    name: 'Vimeo',
    icon: FaVimeo,
    color: '#1AB7EA',
    baseUrl: 'https://vimeo.com/',
    placeholder: 'username'
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: FaWhatsapp,
    color: '#25D366',
    baseUrl: 'https://wa.me/',
    placeholder: 'phone number'
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    icon: FaTelegram,
    color: '#0088CC',
    baseUrl: 'https://t.me/',
    placeholder: 'username'
  },
  onlyfans: {
    id: 'onlyfans',
    name: 'OnlyFans',
    icon: SiOnlyfans,
    color: '#00AFF0',
    baseUrl: 'https://onlyfans.com/',
    placeholder: 'username'
  },
  patreon: {
    id: 'patreon',
    name: 'Patreon',
    icon: SiPatreon,
    color: '#FF424D',
    baseUrl: 'https://patreon.com/',
    placeholder: 'username'
  },
  kofi: {
    id: 'kofi',
    name: 'Ko-fi',
    icon: SiKofi,
    color: '#FF5E5B',
    baseUrl: 'https://ko-fi.com/',
    placeholder: 'username'
  },
  buymeacoffee: {
    id: 'buymeacoffee',
    name: 'Buy Me a Coffee',
    icon: SiBuymeacoffee,
    color: '#FFDD00',
    baseUrl: 'https://buymeacoffee.com/',
    placeholder: 'username'
  },
  cashapp: {
    id: 'cashapp',
    name: 'Cash App',
    icon: SiCashapp,
    color: '#00D632',
    baseUrl: 'https://cash.app/$',
    placeholder: 'cashtag'
  },
  venmo: {
    id: 'venmo',
    name: 'Venmo',
    icon: SiVenmo,
    color: '#008CFF',
    baseUrl: 'https://venmo.com/',
    placeholder: 'username'
  },
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    icon: SiPaypal,
    color: '#003087',
    baseUrl: 'https://paypal.me/',
    placeholder: 'username'
  }
};

export const getSocialPlatformFromUrl = (url: string): string | null => {
  for (const [platformId, platform] of Object.entries(socialPlatforms)) {
    if (url.includes(platform.baseUrl.replace('https://', '').split('/')[0])) {
      return platformId;
    }
  }
  return null;
};

export const getSocialIcon = (platformId: string) => {
  return socialPlatforms[platformId]?.icon || null;
};

export const getSocialColor = (platformId: string) => {
  return socialPlatforms[platformId]?.color || '#6B7280';
};