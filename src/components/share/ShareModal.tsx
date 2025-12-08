'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { X, Download, Share2, CreditCard, QrCode, Phone, Mail, Globe } from 'lucide-react';
import Image from 'next/image';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  profileUrl: string;
}

interface ProfileData {
  displayName: string;
  subtitle: string;
  profileImage: string;
  theme: {
    backgroundColor: string;
    textColor: string;
    linkColor: string;
  };
  businessCard?: {
    layout: 'classic' | 'modern' | 'minimal';
    showQr: boolean;
    showAvatar: boolean;
    showSubtitle: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showWebsite: boolean;
    phoneNumber: string;
    email: string;
    website: string;
    theme: 'default' | 'custom';
    customColors: {
      background: string;
      text: string;
      accent: string;
    };
  };
}

export function ShareModal({ isOpen, onClose, username, profileUrl }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'card'>('qr');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && username) {
      fetchProfileData();
    }
  }, [isOpen, username]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/profile?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          displayName: data.displayName || data.name || username,
          subtitle: data.subtitle || '',
          profileImage: data.profileImage || '',
          theme: data.theme || {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            linkColor: '#3b82f6',
          },
          businessCard: data.businessCard
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile for share card:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${username}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const downloadBusinessCard = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2, // Higher resolution
          backgroundColor: null,
          useCORS: true, // Important for external images like profile pics
          allowTaint: true,
        });
        
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${username}-business-card.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (error) {
        console.error('Failed to generate business card:', error);
      }
    }
  };

  if (!isOpen) return null;

  const cardConfig = profileData?.businessCard || {
    layout: 'classic',
    showQr: true,
    showAvatar: true,
    showSubtitle: true,
    showPhone: false,
    showEmail: false,
    showWebsite: false,
    phoneNumber: '',
    email: '',
    website: '',
    theme: 'default',
    customColors: { background: '#ffffff', text: '#000000', accent: '#3b82f6' }
  };

  const colors = (profileData && cardConfig.theme === 'default') ? {
    background: profileData.theme.backgroundColor,
    text: profileData.theme.textColor,
    accent: profileData.theme.linkColor
  } : cardConfig.customColors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Profile
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'qr'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'card'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Business Card
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={profileUrl}
                  size={200}
                  level={"H"}
                  includeMargin={true}
                  imageSettings={{
                    src: "/logo-icon.png", // Assuming we have a logo asset, or we can omit
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Scan this code to visit <span className="font-medium text-gray-900 dark:text-gray-100">{profileUrl.replace('https://', '')}</span>
              </p>
              <button
                onClick={downloadQRCode}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
            </div>
          )}

          {activeTab === 'card' && (
            <div className="flex flex-col items-center space-y-6">
              {loading || !profileData ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Card Preview */}
                  <div 
                    ref={cardRef}
                    className="w-full aspect-[1.586/1] bg-white rounded-xl shadow-lg overflow-hidden relative flex flex-col"
                    style={{
                      background: cardConfig.layout === 'modern' 
                        ? `linear-gradient(135deg, ${colors.background}, ${colors.background === '#ffffff' ? '#f3f4f6' : '#000000'})`
                        : colors.background,
                      color: colors.text
                    }}
                  >
                    {/* Decorative Elements */}
                    {cardConfig.layout === 'modern' && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-bl-full"></div>
                    )}
                    {cardConfig.layout === 'classic' && (
                      <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: colors.accent }}></div>
                    )}
                    
                    <div className={`flex-1 p-6 flex ${cardConfig.layout === 'minimal' ? 'flex-col items-center text-center justify-center' : 'items-center'} gap-6 relative z-10`}>
                      {/* Profile Image */}
                      {cardConfig.showAvatar && (
                        <div className="shrink-0">
                          {profileData.profileImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={profileData.profileImage} 
                              alt="Profile" 
                              className={`w-24 h-24 object-cover shadow-md ${cardConfig.layout === 'minimal' ? 'rounded-full' : 'rounded-full border-4 border-white/20'}`}
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                              {profileData.displayName.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Info */}
                      <div className={`flex-1 min-w-0 ${cardConfig.layout === 'minimal' ? 'w-full' : ''}`}>
                        <h3 className="text-xl font-bold truncate leading-tight mb-1">
                          {profileData.displayName}
                        </h3>
                        {cardConfig.showSubtitle && (
                          <p className="text-sm opacity-80 truncate mb-3">
                            {profileData.subtitle}
                          </p>
                        )}
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 text-xs font-medium ${cardConfig.layout === 'minimal' ? 'mx-auto' : ''}`}>
                          <span className="truncate">{profileUrl.replace('https://', '')}</span>
                        </div>

                        {/* Contact Details */}
                        {(cardConfig.showPhone || cardConfig.showEmail || cardConfig.showWebsite) && (
                          <div className={`mt-4 space-y-1.5 ${cardConfig.layout === 'minimal' ? 'flex flex-col items-center' : ''}`}>
                            {cardConfig.showPhone && cardConfig.phoneNumber && (
                              <div className="flex items-center gap-2 text-xs opacity-90">
                                <Phone className="w-3 h-3" />
                                <span>{cardConfig.phoneNumber}</span>
                              </div>
                            )}
                            {cardConfig.showEmail && cardConfig.email && (
                              <div className="flex items-center gap-2 text-xs opacity-90">
                                <Mail className="w-3 h-3" />
                                <span>{cardConfig.email}</span>
                              </div>
                            )}
                            {cardConfig.showWebsite && cardConfig.website && (
                              <div className="flex items-center gap-2 text-xs opacity-90">
                                <Globe className="w-3 h-3" />
                                <span>{cardConfig.website}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* QR Code */}
                      {cardConfig.showQr && cardConfig.layout !== 'minimal' && (
                        <div className="shrink-0 bg-white p-2 rounded-lg shadow-sm">
                          <QRCodeCanvas
                            value={profileUrl}
                            size={64}
                            level={"M"}
                          />
                        </div>
                      )}
                    </div>

                    {/* Footer Branding */}
                    <div className="px-6 py-2 bg-black/5 dark:bg-white/5 flex items-center justify-between text-[10px] font-medium opacity-60">
                      <span>Pholio.Links</span>
                      <span>Scan to connect</span>
                    </div>
                  </div>

                  <button
                    onClick={downloadBusinessCard}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                    Download Card
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
