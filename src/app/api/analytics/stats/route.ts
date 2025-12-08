import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAnalyticsCollection, getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Check if user is Pro (or Admin)
  // Assuming 'pro_monthly' or 'pro_yearly' or 'paid' or 'admin'
  const isPro = (session.user as any).subscriptionTier !== 'free' || (session.user as any).isAdmin;

  if (!isPro) {
    return new NextResponse('Upgrade required', { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d'; // 7d, 30d, 90d

    const analyticsCollection = await getAnalyticsCollection();
    const usersCollection = await getUsersCollection();
    const userId = new ObjectId(session.user.id);

    // Fetch user profile to get link details
    const user = await usersCollection.findOne({ _id: userId });
    const userLinks = user?.blocks?.filter((b: any) => b.type === 'link') || [];
    const linkMap = new Map(userLinks.map((l: any) => [l._id.toString(), l.content]));

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (range === '7d') startDate.setDate(now.getDate() - 7);
    else if (range === '90d') startDate.setDate(now.getDate() - 90);
    else startDate.setDate(now.getDate() - 30); // Default 30d

    // Aggregation Pipeline
    const stats = await analyticsCollection.aggregate([
      {
        $match: {
          profileOwnerId: userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $facet: {
          // Total Counts
          totals: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 }
              }
            }
          ],
          // Daily Stats
          daily: [
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                  type: "$type"
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { "_id.date": 1 } }
          ],
          // Top Links (Clicks)
          topLinks: [
            { $match: { type: 'click', linkId: { $ne: null } } },
            {
              $group: {
                _id: '$linkId',
                clicks: { $sum: 1 }
              }
            },
            { $sort: { clicks: -1 } },
            { $limit: 5 }
          ],
          // Device Stats
          devices: [
            {
              $group: {
                _id: '$metadata.device',
                count: { $sum: 1 }
              }
            }
          ],
          // Referrer Stats
          referrers: [
            {
              $group: {
                _id: '$metadata.referrer',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]).toArray();

    const result = stats[0];

    // Enrich topLinks with title and url
    result.topLinks = result.topLinks.map((link: any) => {
      const linkData = linkMap.get(link._id.toString());
      return {
        ...link,
        title: linkData?.title || 'Unknown Link',
        url: linkData?.url || '#'
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
