'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { HiCursorClick, HiEye, HiChartBar, HiArrowSmUp, HiArrowSmDown } from 'react-icons/hi';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [range]);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/analytics/stats?range=${range}`);
      if (res.status === 403) {
        setError('Upgrade to Pro to view analytics.');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg inline-block">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Access Restricted</h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          {error.includes('Upgrade') && (
            <a href="/settings" className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
              Upgrade Now
            </a>
          )}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Helper to safely get counts
  const getCount = (list: any[], type: string) => list?.find((t: any) => t._id === type)?.count || 0;

  // Current Period Totals
  const totalViews = getCount(stats.totals, 'view');
  const totalClicks = getCount(stats.totals, 'click');
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';

  // Previous Period Totals
  const prevViews = getCount(stats.totalsPrevious, 'view');
  const prevClicks = getCount(stats.totalsPrevious, 'click');
  const prevCtr = prevViews > 0 ? ((prevClicks / prevViews) * 100).toFixed(1) : '0';

  // Calculate Percentage Changes
  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const viewsChange = calcChange(totalViews, prevViews);
  const clicksChange = calcChange(totalClicks, prevClicks);
  const ctrChange = calcChange(parseFloat(ctr), parseFloat(prevCtr));

  // Process daily stats for the comparison chart
  // We need to map dates to a common index (Day 1, Day 2, etc.) to overlay them
  const daysMap = new Map();

  // Helper to fill map
  const fillMap = (data: any[], key: string) => {
    data.filter((item: any) => item._id.type === 'view').forEach((item: any) => {
      // We use the date string as a key, but for comparison we need to align by index
      // Since the API returns sorted data, we can just use the array index if the dates are continuous
      // However, to be robust, let's just trust the API returns sorted arrays and map by index
    });
  };

  // Create a merged dataset based on the range duration
  // The API returns sparse data (only days with events), so we should ideally fill gaps
  // For simplicity, we'll map the existing data points to their relative position
  
  // Better approach: Create an array of the last N days
  const getDatesArray = (days: number) => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const rangeDays = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const currentDates = getDatesArray(rangeDays);
  
  // Create a map for quick lookup
  const currentDataMap = new Map(stats.daily.filter((i: any) => i._id.type === 'view').map((i: any) => [i._id.date, i.count]));
  
  // For previous data, we need to map it to the current dates (1st day of prev range -> 1st day of current range)
  // The API returns previous data sorted by date.
  const prevDataList = stats.dailyPrevious.filter((i: any) => i._id.type === 'view');
  
  // We need to align previous data. 
  // Let's assume the previous period has the same number of days.
  // We can map the i-th day of previous data to the i-th day of current data?
  // No, previous data is also sparse.
  
  // Let's build a "relative day index" map for previous data
  // If range is 7d, previous range is [today-14, today-7].
  // We need to calculate the start date of the previous range.
  const prevEndDate = new Date();
  prevEndDate.setDate(prevEndDate.getDate() - rangeDays);
  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - rangeDays + 1); // +1 to match inclusive range logic roughly

  const chartData = currentDates.map((date, index) => {
    // Current value
    const currentVal = currentDataMap.get(date) || 0;

    // Previous value
    // Calculate the corresponding date in the previous period
    const d = new Date(date);
    d.setDate(d.getDate() - rangeDays);
    const prevDateStr = d.toISOString().split('T')[0];
    
    const prevVal = prevDataList.find((i: any) => i._id.date === prevDateStr)?.count || 0;

    return {
      date,
      views: currentVal,
      prevViews: prevVal
    };
  });

  const renderChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? <HiArrowSmUp className="w-4 h-4" /> : <HiArrowSmDown className="w-4 h-4" />}
        <span>{Math.abs(change)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <HiEye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalViews}</p>
            {renderChange(viewsChange)}
          </div>
          <p className="text-xs text-gray-500 mt-1">vs. previous {rangeDays} days</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clicks</p>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <HiCursorClick className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalClicks}</p>
            {renderChange(clicksChange)}
          </div>
          <p className="text-xs text-gray-500 mt-1">vs. previous {rangeDays} days</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Click-Through Rate</p>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <HiChartBar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{ctr}%</p>
            {renderChange(ctrChange)}
          </div>
          <p className="text-xs text-gray-500 mt-1">vs. previous {rangeDays} days</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Over Time */}
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-lg shadow border border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Traffic Over Time</h3>
              <div className="flex items-center gap-4 mt-1 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-purple-500"></span>
                  <span className="text-gray-500">Current</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-gray-400 border-t border-dashed"></span>
                  <span className="text-gray-500">Previous</span>
                </div>
              </div>
            </div>
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1 self-start sm:self-auto">
              {['7d', '30d', '90d'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    range === r
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  fontSize={12} 
                  tickFormatter={(str) => str.slice(5)}
                  tickMargin={10}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
                  cursor={{ stroke: '#6B7280', strokeWidth: 1, strokeDasharray: '4 4' }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  name="Current Period"
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="prevViews" 
                  name="Previous Period"
                  stroke="#9CA3AF" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 6, fill: '#9CA3AF', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Devices</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.devices}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                >
                  {stats.devices.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {stats.devices.map((entry: any, index: number) => (
                <div key={index} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry._id || 'Unknown'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Referrers & Top Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Links */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Performing Links</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {stats.topLinks.map((link: any, i: number) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="font-medium">{link.title}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[200px]">{link.url}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                      {link.clicks}
                    </td>
                  </tr>
                ))}
                {stats.topLinks.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">No clicks recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Referrers</h3>
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visitors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {stats.referrers.map((ref: any, i: number) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {ref._id === 'direct' ? 'Direct / None' : ref._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                    {ref.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
