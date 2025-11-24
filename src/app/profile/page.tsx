import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { PreviewBlock } from '@/components/preview/PreviewBlock';

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

const rootDomain = 'pholio.link';

function extractSubdomain(hostname: string): string | null {
  console.log(`[PROFILE] extractSubdomain called with hostname: "${hostname}"`);
  
  const parts = hostname.split(':')[0].split('.');
  console.log(`[PROFILE] hostname parts:`, parts);
  
  // localhost with subdomain: subdomain.localhost
  if (hostname.includes('localhost')) {
    console.log(`[PROFILE] Detected localhost`);
    const result = parts.length > 1 && parts[0] !== 'localhost' ? parts[0] : null;
    console.log(`[PROFILE] localhost subdomain result:`, result);
    return result;
  }

  // Production: subdomain.pholio.link
  if (parts.length > 2) {
    console.log(`[PROFILE] parts.length > 2, returning first part:`, parts[0]);
    return parts[0]; // subdomain
  }
  
  if (parts.length === 2 && parts[0] !== 'www') {
    console.log(`[PROFILE] parts.length === 2 and not www, returning:`, parts[0]);
    return parts[0]; // subdomain.pholio.link where subdomain is not www
  }

  console.log(`[PROFILE] No subdomain detected`);
  return null;
}

async function getUserProfile(subdomain: string): Promise<UserProfile | null> {
  try {
    console.log(`[PROFILE] getUserProfile called with subdomain: "${subdomain}"`);

    // Use absolute URL for server-side fetch
    const vercelUrl = process.env.VERCEL_URL;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const baseUrl = vercelUrl 
      ? `https://${vercelUrl}`
      : nextAuthUrl || 'http://localhost:3000';
    
    console.log(`[PROFILE] VERCEL_URL: ${vercelUrl}`);
    console.log(`[PROFILE] NEXTAUTH_URL: ${nextAuthUrl}`);
    console.log(`[PROFILE] baseUrl: ${baseUrl}`);
    
    const url = `${baseUrl}/api/profile?username=${subdomain}`;
    console.log(`[PROFILE] Fetch URL: ${url}`);

    const response = await fetch(url, {
      cache: 'no-store',
    });

    console.log(`[PROFILE] Response status: ${response.status}`);

    if (!response.ok) {
      const text = await response.text();
      console.log(`[PROFILE] Profile fetch failed. Status: ${response.status}, Response: ${text}`);
      return null;
    }

    const data = await response.json();
    console.log(`[PROFILE] Profile data received:`, JSON.stringify(data, null, 2));

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
    console.error(`[PROFILE] Error in getUserProfile:`, error);
    return null;
  }
}

export default async function ProfilePage() {
  try {
    console.log(`[PROFILE] ProfilePage component rendered`);
    
    const headersList = await headers();
    const host = headersList.get('host') || '';
    
    console.log(`[PROFILE] Host header: "${host}"`);
    console.log(`[PROFILE] All headers:`, Object.fromEntries(headersList));

    const subdomain = extractSubdomain(host);
    console.log(`[PROFILE] Extracted subdomain: "${subdomain}"`);
    
    if (!subdomain) {
      console.log(`[PROFILE] No subdomain found, showing notFound`);
      notFound();
    }

    console.log(`[PROFILE] Calling getUserProfile for subdomain: "${subdomain}"`);
    const profile = await getUserProfile(subdomain);

    if (!profile) {
      console.log(`[PROFILE] Profile is null, showing notFound`);
      notFound();
    }

    console.log(`[PROFILE] Profile loaded successfully:`, JSON.stringify(profile, null, 2));

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
                  />
                ))}
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
  } catch (error) {
    console.error(`[PROFILE] Unexpected error in ProfilePage:`, error);
    notFound();
  }
}
