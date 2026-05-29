# 🚀 Facebook Ad Library API Integration Guide

This guide describes how to obtain the `FB_ACCESS_TOKEN` for the D360 CRM Competitor Intelligence page. Since this is an internal CRM tool, we use a **Long-Lived User Access Token** with `ads_read` permissions. This bypasses the need for complex Facebook App Review or approvals!

---

## 🛠️ Step-by-Step: How to Get `FB_ACCESS_TOKEN`

### Step 1: Create a Meta Developer App
1. Go to the [Meta for Developers Portal](https://developers.facebook.com/) and log in with your Facebook account.
2. Click **My Apps** in the top right, then click **Create App**.
3. Select **Other** as the app type and click **Next**.
4. Choose **Business** or **None/Consumer** (Consumer is easiest as it requires no business verification) and click **Next**.
5. Give your app a name (e.g., `D360 CRM Intel`) and click **Create App**.

---

### Step 2: Generate a Short-Lived User Token via Graph API Explorer
1. Navigate to the [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2. In the **Meta App** dropdown (top right), select your newly created app (`D360 CRM Intel`).
3. In the **User or Page** dropdown, select **User Access Token**.
4. Under **Permissions** (in the right sidebar), add the following scope:
   * **`ads_read`** (This permission permits searching the public Meta Ads Archive/Ad Library).
5. Click the **Generate Access Token** button.
6. A Facebook popup will appear. Approve the permissions for your personal account.
7. *Copy the generated token string.* (This is a short-lived token valid for about 2 hours).

---

### Step 3: Convert to a 60-Day Long-Lived Access Token
To avoid having to renew the token every 2 hours, we exchange it for a **Long-Lived Token** (valid for 60 days):

1. Open your terminal or a browser tab and construct the following GET request:
   ```http
   GET https://graph.facebook.com/v19.0/oauth/access_token?
       grant_type=fb_exchange_token&
       client_id=YOUR_APP_ID&
       client_secret=YOUR_APP_SECRET&
       fb_exchange_token=SHORT_LIVED_TOKEN
   ```
   * *Where to find App ID and Secret:* Go to your Meta Developer dashboard -> **App Settings** -> **Basic**.
2. **Alternative (Easiest)**:
   * In the [Graph API Explorer](https://developers.facebook.com/tools/explorer/), next to the access token field, click the **ⓘ (Info)** icon.
   * Click **Open in Access Token Tool**.
   * Click **Extend Access Token** at the bottom of the page.
   * Facebook will generate a new long-lived token valid for **60 days**. Copy it!

---

### Step 4: Add to your environment file
Add the token to your backend's `.env` configuration file (`server/.env`):

```env
# Facebook Ad Library Access Token (Long-Lived 60-Day User Token)
FB_ACCESS_TOKEN=EAAG...
```

---

## 🔍 How to Test
1. Make sure your server is running with the new `.env` configuration.
2. Go to the **Competitor Intelligence** page in D360.
3. Click the **Meta Ads Library** button on any competitor card.
4. If a Facebook Page ID is configured (e.g. `106198901389812`), the CRM will dynamically fetch active ads.
5. If no Facebook Page ID is configured, you can enter one (like your own brand's Page ID or a competitor's Page ID) directly in the input box and click **Fetch Live Ads**!
