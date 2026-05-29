const axios = require('axios');

// @desc    Get active ads for a given competitor's Facebook Page ID from FB Ad Library API
// @route   GET /api/competitors/ads
// @access  Private
const getCompetitorAds = async (req, res, next) => {
  try {
    const { page_id } = req.query;

    if (!page_id) {
      return res.status(400).json({
        success: false,
        message: 'Facebook Page ID (page_id) is required.'
      });
    }

    const accessToken = process.env.FB_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: 'FB_ACCESS_TOKEN is not configured in the server environment (.env file).'
      });
    }

    // Call Facebook Graph API Ads Archive endpoint
    // v19.0 or v20.0 can be used
    const fbApiUrl = 'https://graph.facebook.com/v19.0/ads_archive';

    try {
      const response = await axios.get(fbApiUrl, {
        params: {
          access_token: accessToken,
          search_page_ids: page_id,
          ad_active_status: 'ACTIVE',
          ad_type: 'UNCATEGORIZED', // Default for commercial ads
          fields: 'ad_creative_bodies,ad_creative_link_captions,ad_delivery_start_time,publisher_platforms,snapshot_url',
          limit: 25
        }
      });

      const rawAds = response.data?.data || [];

      // Format Meta Ad Library response into a clean, uniform structure for the frontend
      const formattedAds = rawAds.map(ad => {
        // ad_creative_bodies and ad_creative_link_captions are arrays of strings in Meta API responses
        const body = Array.isArray(ad.ad_creative_bodies) ? ad.ad_creative_bodies[0] : ad.ad_creative_bodies || '';
        const title = Array.isArray(ad.ad_creative_link_captions) ? ad.ad_creative_link_captions[0] : ad.ad_creative_link_captions || '';
        const launched = ad.ad_delivery_start_time ? new Date(ad.ad_delivery_start_time).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'Unknown';

        return {
          id: ad.id,
          body: body || 'No ad text description provided.',
          title: title || 'Sponsored Meta Ad',
          launched,
          platforms: ad.publisher_platforms || ['facebook'],
          snapshotUrl: ad.snapshot_url || ''
        };
      });

      return res.json({
        success: true,
        count: formattedAds.length,
        data: formattedAds
      });

    } catch (fbError) {
      console.error('Facebook Ad Library API Error Details:', fbError.response?.data || fbError.message);
      
      const errorMsg = fbError.response?.data?.error?.message || fbError.message || 'Error communicating with Facebook Ad Library API.';
      return res.status(fbError.response?.status || 502).json({
        success: false,
        message: errorMsg,
        fbError: fbError.response?.data?.error || null
      });
    }

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCompetitorAds
};
