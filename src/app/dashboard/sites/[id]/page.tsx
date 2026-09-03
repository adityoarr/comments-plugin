'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Site {
  id: string;
  siteName: string;
  domain: string;
  settings: {
    moderationEnabled: boolean;
    allowAnonymous: boolean;
    maxCommentLength: number;
  };
}

export default function SiteDetailsPage() {
  const params = useParams();
  const siteId = params.id as string;
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSite();
  }, [siteId]);

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/sites/${siteId}`);
      if (!response.ok) throw new Error('Failed to fetch site');
      const data = await response.json();
      setSite(data.site);
    } catch (error) {
      console.error('Error fetching site:', error);
    } finally {
      setLoading(false);
    }
  };

  const embedCode = `<div class="adityoarr-comments" data-thread-id="PAGE_ID"></div>
<script src="https://apps.adityoarr.com/comments-plugin/embed.js" async></script>`;

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!site) {
    return <div className="text-center py-12">Site not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{site.siteName}</h1>
        <p className="text-gray-600">{site.domain}</p>
      </div>

      {/* Embed Code Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold mb-4">Embed Code</h2>
        <p className="text-sm text-gray-600 mb-4">
          Copy this code and paste it into your website where you want comments to appear.
          Replace <code className="bg-gray-100 px-1 rounded">PAGE_ID</code> with a unique identifier for each page.
        </p>
        <div className="relative">
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{embedCode}</code>
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(embedCode)}
            className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Moderation</p>
              <p className="text-sm text-gray-600">Require approval before comments appear</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={site.settings.moderationEnabled} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Anonymous Comments</p>
              <p className="text-sm text-gray-600">Let users comment without signing in</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={site.settings.allowAnonymous} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}