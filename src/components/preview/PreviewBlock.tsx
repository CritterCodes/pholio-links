'use client';

import { Instagram, Twitter, Facebook, Youtube, Linkedin, Github, Globe, ImageIcon, ExternalLink, Phone, Mail, MapPin } from 'lucide-react';

interface Block {
  _id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

interface ThemeData {
  backgroundColor: string;
  textColor: string;
  linkStyle: 'rounded' | 'square' | 'pill';
  linkColor: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  gradientFrom: string;
  gradientTo: string;
  font: string;
}

interface PreviewBlockProps {
  block: Block;
  theme?: ThemeData;
}

export function PreviewBlock({ block, theme }: PreviewBlockProps) {
  const getLinkButtonClass = () => {
    const baseClass = "w-full px-4 py-3 text-center font-medium transition-all duration-200 hover:opacity-90";
    let styleClass = '';
    
    if (theme?.linkStyle === 'pill') {
      styleClass = 'rounded-full';
    } else if (theme?.linkStyle === 'square') {
      styleClass = 'rounded-none';
    } else {
      styleClass = 'rounded-lg';
    }
    
    return `${baseClass} ${styleClass}`;
  };

  switch (block.type) {
    case 'bio':
      const bioText = (block.content as { text?: string })?.text;
      return bioText ? (
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 text-center mb-4">
          {bioText}
        </p>
      ) : null;

    case 'subtitle':
      const subtitle = (block.content as { subtitle?: string })?.subtitle;
      return subtitle ? (
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 text-center mb-3">
          {subtitle}
        </h3>
      ) : null;

    case 'links':
      const links = (block.content as { links?: Array<{ id: string; title: string; url: string; description?: string; color?: string }> })?.links || [];
      return links.length > 0 ? (
        <div className="space-y-2 mb-4">
          {links.map(link => (
            <div 
              key={link.id}
              className={getLinkButtonClass()}
              style={{ 
                backgroundColor: link.color || (theme?.linkColor ?? '#3b82f6'),
                color: '#ffffff'
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{link.title}</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : null;

    case 'social_icons':
      const socialLinks = (block.content as { socialLinks?: Array<{ id: string; platform: string; url: string; enabled: boolean }> })?.socialLinks || [];
      const enabledSocialLinks = socialLinks.filter(link => link.enabled && link.url);
      
      if (enabledSocialLinks.length === 0) return null;

      const getPlatformIcon = (platform: string) => {
        switch (platform) {
          case 'instagram': return <Instagram className="w-5 h-5" />;
          case 'twitter': return <Twitter className="w-5 h-5" />;
          case 'facebook': return <Facebook className="w-5 h-5" />;
          case 'youtube': return <Youtube className="w-5 h-5" />;
          case 'linkedin': return <Linkedin className="w-5 h-5" />;
          case 'github': return <Github className="w-5 h-5" />;
          case 'website': return <Globe className="w-5 h-5" />;
          default: return <Globe className="w-5 h-5" />;
        }
      };

      const getPlatformColor = (platform: string) => {
        switch (platform) {
          case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
          case 'twitter': return 'bg-gradient-to-r from-blue-400 to-blue-500';
          case 'facebook': return 'bg-gradient-to-r from-blue-600 to-blue-700';
          case 'youtube': return 'bg-gradient-to-r from-red-500 to-red-600';
          case 'linkedin': return 'bg-gradient-to-r from-blue-700 to-blue-800';
          case 'github': return 'bg-gradient-to-r from-gray-700 to-gray-800';
          case 'website': return 'bg-gradient-to-r from-green-500 to-green-600';
          default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
        }
      };

      return (
        <div className="flex justify-center gap-3 mb-4 flex-wrap">
          {enabledSocialLinks.map(link => (
            <div 
              key={link.id}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getPlatformColor(link.platform)}`}
            >
              {getPlatformIcon(link.platform)}
            </div>
          ))}
        </div>
      );

    case 'gallery':
      const galleryTitle = (block.content as { title?: string })?.title || 'Gallery';
      const selectedImageIds = (block.content as { selectedImageIds?: string[] })?.selectedImageIds || [];
      const maxImages = (block.content as { maxImages?: number })?.maxImages || 6;
      const columns = (block.content as { columns?: number })?.columns || 2;
      
      if (selectedImageIds.length === 0) {
        return (
          <div className="w-full space-y-3 mb-4">
            <h3 className="text-lg font-semibold text-center">{galleryTitle}</h3>
            <div className={`grid gap-2 ${
              columns === 1 ? 'grid-cols-1' : 
              columns === 2 ? 'grid-cols-2' : 
              'grid-cols-3'
            }`}>
              {Array.from({ length: Math.min(4, maxImages) }).map((_, index) => (
                <div key={`placeholder-${index}`} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div className="w-full space-y-3 mb-4">
          <h3 className="text-lg font-semibold text-center">{galleryTitle}</h3>
          <div className={`grid gap-2 ${
            columns === 1 ? 'grid-cols-1' : 
            columns === 2 ? 'grid-cols-2' : 
            'grid-cols-3'
          }`}>
            {selectedImageIds.slice(0, maxImages).map((imageId, index) => (
              <div key={imageId} className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer hover:opacity-90 transition-opacity">
                {/* Placeholder for actual image - would be replaced with actual image data */}
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-xs text-gray-500 ml-1">#{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'divider':
      const dividerStyle = (block.content as { style?: string })?.style || 'solid';
      const dividerColor = (block.content as { color?: string })?.color || '#e5e7eb';
      const dividerThickness = (block.content as { thickness?: number })?.thickness || 2;
      const dividerWidth = (block.content as { width?: string })?.width || 'medium';

      const getWidthValue = (width: string) => {
        switch (width) {
          case 'small': return '25%';
          case 'large': return '100%';
          default: return '50%'; // medium
        }
      };

      return (
        <div className="my-4 flex justify-center">
          <div 
            style={{
              height: `${dividerThickness}px`,
              borderTop: dividerStyle === 'dashed' ? `${dividerThickness}px dashed ${dividerColor}` : 
                        dividerStyle === 'dotted' ? `${dividerThickness}px dotted ${dividerColor}` : 'none',
              backgroundColor: dividerStyle === 'solid' ? dividerColor : 'transparent',
              width: getWidthValue(dividerWidth),
              maxWidth: '300px'
            }}
          />
        </div>
      );

    case 'contact':
      const contactTitle = (block.content as { title?: string })?.title || 'Contact Me';
      const contacts = (block.content as { contacts?: Array<{
        id: string;
        type: 'phone' | 'email' | 'address';
        label: string;
        value: string;
        enabled: boolean;
      }> })?.contacts || [];

      const enabledContacts = contacts.filter(contact => contact.enabled && contact.value.trim());

      if (enabledContacts.length === 0) return null;

      return (
        <div className="w-full space-y-3 mb-4">
          <h3 className="text-lg font-semibold text-center">{contactTitle}</h3>
          <div className="space-y-2">
            {enabledContacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400">
                  {contact.type === 'phone' && <span className="text-sm">📞</span>}
                  {contact.type === 'email' && <span className="text-sm">📧</span>}
                  {contact.type === 'address' && <span className="text-sm">📍</span>}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{contact.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{contact.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}