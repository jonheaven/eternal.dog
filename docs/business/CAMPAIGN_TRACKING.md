# Campaign Tracking & Ad Performance

eternal.dog now tracks all traffic sources via UTM parameters so you can see exactly which ad campaigns are driving sign-ups, checkouts, and completed inscriptions.

## How It Works

1. **Add UTM params to your ad links** - Every link you share should include tracking parameters
2. **Users visit your site** - Frontend automatically extracts UTM params from URL
3. **Events logged with campaign data** - Every upload, checkout, and inscription tracks which campaign brought the user
4. **Real-time Slack alerts** - See campaign source in every notification
5. **Dashboard metrics** - `/stats` endpoint shows breakdown by campaign with conversion rates

## Setting Up Ad Links

### Format
```
https://eternal.dog?utm_source=SOURCE&utm_campaign=CAMPAIGN&utm_medium=MEDIUM&utm_content=CONTENT
```

### Examples

**Instagram Ads**
```
https://eternal.dog?utm_source=instagram&utm_campaign=dog_lovers_dec&utm_medium=paid_social&utm_content=carousel_ad_1
```

**TikTok Ads**
```
https://eternal.dog?utm_source=tiktok&utm_campaign=viral_dogs_dec&utm_medium=paid_social&utm_content=video_ad_3
```

**YouTube Ads**
```
https://eternal.dog?utm_source=youtube&utm_campaign=holiday_campaign&utm_medium=cpc&utm_content=preroll_15s
```

**Facebook Ads**
```
https://eternal.dog?utm_source=facebook&utm_campaign=retargeting_nov&utm_medium=paid_social&utm_content=dynamic_ad
```

**Google Ads**
```
https://eternal.dog?utm_source=google&utm_campaign=search_doge&utm_medium=cpc&utm_content=doge_inscription
```

### UTM Parameter Guide

| Parameter | Purpose | Examples |
|-----------|---------|----------|
| `utm_source` | Traffic source | instagram, tiktok, youtube, facebook, google, reddit, twitter, tiktok_creator |
| `utm_campaign` | Campaign name | dog_lovers_dec, viral_dogs_nov, holiday_campaign, retargeting_nov |
| `utm_medium` | Channel type | paid_social, cpc, display, email, organic, video |
| `utm_content` | Ad variant | carousel_ad_1, video_ad_3, preroll_15s, dynamic_ad, banner_v2 |

## Viewing Your Performance

### Real-Time Slack Alerts
Every event notification includes the campaign:
```
🐶 *New Preview Upload*
userId: user123
campaign: instagram
timestamp: 2025-12-11T14:30:45Z
```

### Daily Stats Dashboard
```bash
curl http://localhost:5000/stats
# or in production:
curl https://eternal-dog-backend.render.com/stats
```

**Response Example:**
```json
{
  "total": 47,
  "uploads": 32,
  "checkouts": 18,
  "inscriptions": 12,
  "errors": 0,
  "uniqueUsers": 32,
  "revenue": 170.4,
  "byCampaign": {
    "instagram": {
      "uploads": 15,
      "checkouts": 8,
      "inscriptions": 6,
      "completionRate": "40%",
      "revenue": 85.2
    },
    "tiktok": {
      "uploads": 12,
      "checkouts": 7,
      "inscriptions": 4,
      "completionRate": "33.3%",
      "revenue": 56.8
    },
    "youtube": {
      "uploads": 5,
      "checkouts": 3,
      "inscriptions": 2,
      "completionRate": "40%",
      "revenue": 28.4
    },
    "direct": {
      "uploads": 0,
      "checkouts": 0,
      "inscriptions": 0,
      "completionRate": "0%",
      "revenue": 0
    }
  }
}
```

## Key Metrics to Watch

1. **Completion Rate** - `inscriptions / uploads`
   - How many people who uploaded actually paid
   - Instagram: 40% is good, TikTok: 33% is typical
   - If a channel has <10%, the traffic quality may be poor

2. **Revenue per Campaign** - `inscriptions × $14.20`
   - Which campaigns are making you money
   - Track ROI: revenue vs ad spend

3. **Conversion Funnel** - uploads → checkouts → inscriptions
   - Where do users drop off per channel?
   - Instagram strong on uploads but weak on checkout → audience needs better pitch
   - YouTube weak on uploads → ad targeting needs refinement

4. **Unique Users** - How many new people discovered you
   - More users at low cost = good channel
   - Few users at high cost = bad channel

## Example Analysis

**Scenario: You spent $50 on Instagram and $50 on TikTok**

Instagram results (from `/stats`):
- 15 uploads, 8 checkouts, 6 inscriptions
- Completion rate: 40%
- Revenue: $85.20
- ROI: +$35.20 (85.20 - 50)

TikTok results:
- 12 uploads, 7 checkouts, 4 inscriptions  
- Completion rate: 33%
- Revenue: $56.80
- ROI: +$6.80 (56.80 - 50)

**Conclusion**: Instagram is 5x better ROI. Scale Instagram, pause TikTok, or refine TikTok targeting.

## How Data Flows

```
User clicks ad link with utm_source=instagram
          ↓
User arrives at eternal.dog?utm_source=instagram
          ↓
Frontend extracts utm_source from URL
          ↓
User uploads dog photo
          ↓
API call includes utm_source=instagram
          ↓
Backend logs Event with utmSource: 'instagram'
          ↓
Slack notification shows: campaign: instagram
          ↓
/stats endpoint aggregates all events by utmSource
```

## Data Retention

- Events stored in MongoDB with 30-day TTL
- Full campaign history available for 30 days
- Export stats before 30 days if you want permanent records

## Troubleshooting

**Not seeing campaign data?**
- Check the URL has `?utm_source=...` params
- Reload the page after adding params
- Check browser console for errors
- Verify .env has all required vars (no changes needed for tracking)

**Stats endpoint shows only "direct"?**
- Users may be visiting directly without ads
- Share your links WITH utm params via ads
- Check Slack notifications to confirm utm_source is captured

**Want to test locally?**
```bash
# Run with fake UTM params
http://localhost:3000?utm_source=test_instagram&utm_campaign=test&utm_medium=paid_social
```

## Next Steps

1. Create your ad links with unique utm_source per platform
2. Launch ads with these links
3. Monitor Slack for real-time notifications
4. Check `/stats` daily to track performance
5. Adjust ad spend based on ROI per campaign
