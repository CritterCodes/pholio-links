import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { PreviewBlock } from '@/components/preview/PreviewBlock';

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
}

// Fetch user profile from API
async function getUserProfile(username: string): Promise<UserProfile | null> {
  try {
    console.log(`[PROFILE PAGE] Fetching profile for username: "${username}"`);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    console.log(`[PROFILE PAGE] Base URL: ${baseUrl}`);
    const response = await fetch(`${baseUrl}/api/profile?username=${username}`, {
      cache: 'no-store',
    });

    console.log(`[PROFILE PAGE] Response status: ${response.status}`);

    if (!response.ok) {
      console.log(`[PROFILE PAGE] Profile not found for username: "${username}"`);
      return null;
    }

    const data = await response.json();
    console.log(`[PROFILE PAGE] Profile loaded successfully for: "${username}"`);

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
    };
  } catch (error) {
    console.error(`[PROFILE PAGE] Failed to fetch profile for "${username}":`, error);
    return null;
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const resolvedParams = await params;
  console.log(`[PROFILE PAGE] Page rendered for username: "${resolvedParams.username}"`);
  const profile = await getUserProfile(resolvedParams.username);

  if (!profile) {
    console.log(`[PROFILE PAGE] Profile is null, showing notFound()`);
    notFound();
  }

  console.log(`[PROFILE PAGE] Rendering profile page for: "${resolvedParams.username}"`);

  const getBackgroundStyle = () => {
    if (profile.theme.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${profile.theme.gradientFrom}, ${profile.theme.gradientTo})`,
      };
    } else {
      return {
        backgroundColor: profile.theme.backgroundColor,
      };
    }
  };

  const getThemeStyles = () => {
    return {
      color: profile.theme.textColor,
      fontFamily: profile.theme.font,
    };
  };

  return (
    <div
      className="min-h-screen"
      style={{
        ...getBackgroundStyle(),
        ...getThemeStyles(),
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Banner Section */}
        <div className="relative -mx-4 -mt-8 mb-6">
          {/* Banner Image */}
          {profile.heroImage ? (
            <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <Image
                src={profile.heroImage}
                alt="Banner"
                width={800}
                height={224}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-56 bg-gradient-to-b from-blue-400 to-blue-300 dark:from-blue-700 dark:to-blue-600"></div>
          )}

          {/* Profile Image (centered, peaking halfway into banner) */}
          <div className="flex justify-center -translate-y-1/2 relative z-10 px-4">
            {profile.profileImage ? (
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-900">
                <Image
                  src={profile.profileImage}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-900">
                <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-4">
          {/* Display Name and Subtitle */}
          <div className="text-center mb-6">
            {profile.name ? (
              <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
            ) : (
              <h1 className="text-3xl font-bold text-gray-400 dark:text-gray-500 mb-2">
                @{resolvedParams.username}
              </h1>
            )}

            {profile.subtitle && (
              <p className="text-lg opacity-80 font-medium mb-4">{profile.subtitle}</p>
            )}

            {profile.bio && <p className="text-base opacity-70 mb-6">{profile.bio}</p>}
          </div>

          {/* Blocks */}
          <div className="space-y-4">
            {profile.blocks.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                <p className="text-sm">No content yet</p>
              </div>
            ) : (
              profile.blocks
                .filter((block) => block.enabled)
                .sort((a, b) => a.order - b.order)
                .map((block) => (
                  <PreviewBlock
                    key={block._id}
                    block={block}
                    theme={profile.theme}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}