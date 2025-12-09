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
    let rangeDays = 30;
    if (range === '7d') rangeDays = 7;
    else if (range === '90d') rangeDays = 90;
    
    const currentStart = new Date(now);
    currentStart.setDate(now.getDate() - rangeDays);
    
    const previousStart = new Date(currentStart);
    previousStart.setDate(currentStart.getDate() - rangeDays);

    // Aggregation Pipeline
    const stats = await analyticsCollection.aggregate([
      {
        $match: {
          profileOwnerId: userId,
          timestamp: { $gte: previousStart }
        }
      },
      {
        $facet: {
          // Total Counts (Current Period)
          totals: [
            { $match: { timestamp: { $gte: currentStart } } },
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 }
              }
            }
          ],
          // Total Counts (Previous Period)
          totalsPrevious: [
            { $match: { timestamp: { $lt: currentStart } } },
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 }
              }
            }
          ],
          // Daily Stats (Current Period)
          daily: [
            { $match: { timestamp: { $gte: currentStart } } },
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
          // Daily Stats (Previous Period)
          dailyPrevious: [
            { $match: { timestamp: { $lt: currentStart } } },
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
          // Top Links (Clicks) - Current Period Only
          topLinks: [
            { $match: { timestamp: { $gte: currentStart }, type: 'click', linkId: { $ne: null } } },
            {
              $group: {
                _id: '$linkId',
                clicks: { $sum: 1 }
              }
            },
            { $sort: { clicks: -1 } },
            { $limit: 5 }
          ],
          // Device Stats - Current Period Only
          devices: [
            { $match: { timestamp: { $gte: currentStart } } },
            {
              $group: {
                _id: '$metadata.device',
                count: { $sum: 1 }
              }
            }
          ],
          // Referrer Stats - Current Period Only
          referrers: [
            { $match: { timestamp: { $gte: currentStart } } },
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
      const linkData = linkMap.get(link._id.toString()) as any;
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
