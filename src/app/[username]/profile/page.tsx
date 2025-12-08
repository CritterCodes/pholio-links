import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { PreviewBlock } from '@/components/preview/PreviewBlock';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { EmailCaptureBlock } from '@/components/profile/EmailCaptureBlock';

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

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

interface UserProfile {
  name: string;
  subtitle: string;
  bio: string;
  profileImage: string;
  heroImage: string;
  blocks: Block[];
  theme: ThemeData;
  emailCapture?: {
    enabled: boolean;
    title?: string;
    description?: string;
    successMessage?: string;
  };
  status?: {
    message: string;
    emoji?: string;
  };
}

// Fetch user profile from API
async function getUserProfile(username: string): Promise<UserProfile | null> {
  try {
    console.log(`[USERNAME PROFILE] Fetching profile for username: "${username}"`);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/profile?username=${username}`;
    console.log(`[USERNAME PROFILE] Full fetch URL: ${url}`);
    
    const response = await fetch(url, {
      cache: 'no-store',
    });

    console.log(`[USERNAME PROFILE] Response status: ${response.status}`);

    if (!response.ok) {
      const text = await response.text();
      console.log(`[USERNAME PROFILE] Profile not found for username: "${username}". Response: ${text}`);
      return null;
    }

    const data = await response.json();
    console.log(`[USERNAME PROFILE] Profile loaded successfully for: "${username}". Data:`, data);

    return {
      name: data.displayName || data.name || '',
      subtitle: data.subtitle || '',
      bio: data.bio || '',
      profileImage: data.profileImage || '',
      heroImage: data.heroImage || '',
      blocks: data.blocks || [],
      theme: data.theme || {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        linkStyle: 'rounded',
        linkColor: '#3b82f6',
        backgroundType: 'solid',
        gradientFrom: '#ffffff',
        gradientTo: '#ffffff',
        font: 'Inter, sans-serif',
      },
      emailCapture: data.emailCapture,
      status: data.status,
    };
  } catch (error) {
    console.error(`[USERNAME PROFILE] Failed to fetch profile for "${username}":`, error);
    return null;
  }
}

export default async function UsernameProfilePage({ params }: UserProfilePageProps) {
  const resolvedParams = await params;
  console.log(`[USERNAME PROFILE] Page rendered for username: "${resolvedParams.username}"`);
  const profile = await getUserProfile(resolvedParams.username);

  if (!profile) {
    console.log(`[USERNAME PROFILE] Profile is null, showing notFound()`);
    notFound();
  }

  console.log(`[USERNAME PROFILE] Rendering profile page for: "${resolvedParams.username}"`);

  const getBackgroundStyle = () => {
    if (profile.theme.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${profile.theme.gradientFrom}, ${profile.theme.gradientTo})`,
      };
    }
    return { backgroundColor: profile.theme.backgroundColor };
  };

  return (
    <div style={getBackgroundStyle()} className="min-h-screen">
      <AnalyticsTracker username={resolvedParams.username} />
      {/* Hero Image Section */}
      {profile.heroImage && (
        <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden">
          <Image
            src={profile.heroImage}
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Image */}
        <div className={profile.heroImage ? '-mt-20 mb-8 relative z-10' : 'mb-8'}>
          {profile.profileImage ? (
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden mx-auto">
              <Image
                src={profile.profileImage}
                alt={profile.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 mx-auto flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="text-center mb-8">
          <h1 style={{ color: profile.theme.textColor }} className="text-4xl font-bold mb-2">
            {profile.name || 'No Name'}
          </h1>

          {/* Status Badge */}
          {profile.status && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 backdrop-blur-sm border border-black/10 dark:bg-white/10 dark:border-white/20 mb-4 mx-auto max-w-full">
              <span className="text-lg flex-shrink-0">{profile.status.emoji || '💭'}</span>
              <span style={{ color: profile.theme.textColor }} className="text-sm font-medium truncate">
                {profile.status.message}
              </span>
            </div>
          )}

          {profile.subtitle && (
            <p style={{ color: profile.theme.textColor }} className="text-lg opacity-90 mb-4">
              {profile.subtitle}
            </p>
          )}
          {profile.bio && (
            <p style={{ color: profile.theme.textColor }} className="text-base opacity-75 max-w-md mx-auto">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Blocks */}
        {profile.blocks && profile.blocks.length > 0 && (
          <div className="space-y-4">
            {profile.blocks
              .filter((block) => block.enabled)
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <PreviewBlock
                  key={block._id}
                  block={{
                    ...block,
                    content: block.content as Record<string, string>,
                  }}
                  theme={profile.theme}
                  username={resolvedParams.username}
                />
              ))}
          </div>
        )}

        {/* Email Capture */}
        {profile.emailCapture?.enabled && (
          <div className="mt-8">
            <EmailCaptureBlock
              username={resolvedParams.username}
              title={profile.emailCapture.title}
              description={profile.emailCapture.description}
              successMessage={profile.emailCapture.successMessage}
              theme={profile.theme}
            />
          </div>
        )}

        {/* Empty State */}
        {(!profile.blocks || profile.blocks.length === 0) && (
          <div style={{ color: profile.theme.textColor }} className="text-center py-12 opacity-50">
            <p>No content yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
