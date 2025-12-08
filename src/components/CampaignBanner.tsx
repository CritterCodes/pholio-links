'use client';

import { useState, useEffect } from 'react';
import { HiTag, HiX } from 'react-icons/hi';

interface Campaign {
  title: string;
  description: string;
  code: string;
  percentOff: number;
}

export default function CampaignBanner() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchActiveCampaign = async () => {
      try {
        const res = await fetch('/api/campaigns/active');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setCampaign(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch active campaign', error);
      }
    };

    fetchActiveCampaign();
  }, []);

  if (!campaign || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-purple-800">
              <HiTag className="h-6 w-6 text-white" aria-hidden="true" />
            </span>
            <p className="ml-3 font-medium text-white truncate">
              <span className="md:hidden">{campaign.title}</span>
              <span className="hidden md:inline">
                <span className="font-bold">{campaign.title}:</span> {campaign.description}
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <div className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-purple-600 bg-white hover:bg-purple-50">
              Use Code: <span className="font-bold ml-1 select-all">{campaign.code}</span>
            </div>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="-mr-1 flex p-2 rounded-md hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
            >
              <span className="sr-only">Dismiss</span>
              <HiX className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
