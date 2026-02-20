# Magnum Estate Dashboard

A comprehensive real estate analytics dashboard built with vanilla JavaScript, displaying traffic metrics, marketing performance, content analytics, and Google Search Console data.

## 🎯 Features

### Dashboard Tabs

1. **CEO Overview**
   - Real-time user metrics (unique visitors, sessions, engagement)
   - Goal tracking (60,000 monthly users target)
   - User trend visualization
   - Channel distribution analysis
   - Strategic insights and recommendations

2. **Marketing**
   - Channel-wise performance metrics
   - Traffic source analysis
   - Channel trends over time
   - Detailed breakdown of each marketing channel

3. **Content**
   - Top performing pages
   - Page URLs with direct links to live pages
   - Engagement metrics per page
   - Problem page identification
   - User interaction data

4. **Google Search Console**
   - Search impressions tracking
   - Click-through rate (CTR) analysis
   - Search query performance
   - Average search ranking position
   - Impression trend visualization

### Additional Features

- 🌗 **Dark/Light Mode Toggle** - Adaptive theme switching
- 🌐 **Bilingual Support** - Russian and English translations
- 📊 **Interactive Charts** - Chart.js powered visualizations
- 📅 **Date Range Selection** - View data for different time periods
- 🔄 **Real-time Refresh** - Manual data refresh button
- 📱 **Responsive Design** - Works on desktop and tablet
- 🎨 **Custom Branding** - Magnum Estate logo and styling

## 📋 Prerequisites

- Node.js (v14+)
- Google Cloud Project with service account credentials
- GA4 Property ID
- Google Search Console access

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dog3n-tappy/Dashboard-Magnum-Online-Domination.git
cd Dashboard-Magnum-Online-Domination
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Google Credentials

Create a `GA4.env` file in the project root:

```env
GA4_PROPERTY_ID=YOUR_GA4_PROPERTY_ID
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json
```

**To get service account credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new service account
3. Generate a JSON key
4. Download and place in your project directory

### 4. Google Search Console Setup

Add your service account email to each property in Google Search Console:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Settings → Users and permissions
4. Add service account email as **Owner**
5. Wait 5-10 minutes for permissions to propagate

### 5. Start the Server

```bash
npm start
# or
node server.js
```

The dashboard will be available at `http://localhost:3000`

## 📁 Project Structure

```
Dashboard-Magnum-Online-Domination/
├── index.html              # Main HTML file
├── style.css               # Styling (light/dark theme)
├── app.js                  # Frontend logic
├── server.js               # Express server
├── GA4.env                 # (Create this) API credentials
├── api/
│   ├── ga4.js             # GA4 API integration
│   └── backlinks.js       # Google Search Console integration
├── public/
│   └── magnum-estate-logo.png  # Brand logo
└── package.json            # Dependencies
```

## 🔌 API Endpoints

### `/api/ga4`
Fetches Google Analytics 4 data
- **Query Parameters:**
  - `days` (number): Days of data to retrieve (default: 30)
  - `channel` (string): Filter by channel (organic, paid, social, direct, referral)
  - `property` (string): Property identifier (magnum, anoya, shisha)

**Response:**
```json
{
  "days": 30,
  "totalUsers": 25000,
  "sessions": 35000,
  "newUsers": 12000,
  "engagedSessions": 18900,
  "avgTime": 95,
  "channels": [...],
  "sources": [...],
  "pages": [...],
  "dailyUsers": [...]
}
```

### `/api/backlinks`
Fetches Google Search Console data
- **Query Parameters:**
  - `days` (number): Days of data to retrieve
  - `property` (string): Property identifier

**Response:**
```json
{
  "totalBacklinks": 27623,
  "newBacklinks": 4143,
  "referringDomains": 6906,
  "followBacklinks": 18784,
  "nofollowBacklinks": 8839,
  "avgDA": 59,
  "dailyBacklinks": [...],
  "topDomains": [...]
}
```

## 🎨 Customization

### Change Colors
Edit CSS variables in `style.css`:
```css
--color-primary: #2251ff;
--color-accent: #2fd1a6;
--color-warning: #ffb547;
```

### Add More Properties
Edit `GA4_DOMAINS_JSON` in `api/ga4.js`:
```javascript
const GA4_DOMAINS_JSON = {
  'magnum': 'https://magnumestate.com/',
  'anoya': 'https://anoyavillas.com/',
  'shisha': 'https://shishacool.com/',
  'mynew': 'https://mynewproperty.com/' // Add here
};
```

### Change Goal Threshold
Edit in `app.js`:
```javascript
const GOAL_USERS = 60000; // Change this value
```

## 🌐 Translations

Translations are in `app.js` → `translations` object. Add new languages:
```javascript
const translations = {
  en: { /* English */ },
  ru: { /* Russian */ },
  fr: { /* Add French */ }
};
```

## 📊 Data Sources

1. **Google Analytics 4 (GA4)** - User behavior, traffic sources, engagement
2. **Google Search Console** - Search performance, impressions, CTR, rankings

## 🔐 Security Notes

- Never commit `GA4.env` or service account keys to git
- Add to `.gitignore`:
  ```
  GA4.env
  *.json (for credentials)
  node_modules/
  ```
- Keep service account credentials secure and rotate regularly

## 🐛 Troubleshooting

### "API error — check server"
- Ensure `server.js` is running
- Check that `GA4.env` is configured correctly
- Verify Google Cloud project has correct APIs enabled

### "Google Search Console data is not available"
- Verify service account has been added to GSC property
- Wait 5-10 minutes for permissions to propagate
- Check GSC property URL format matches exactly

### Charts not rendering
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for errors
- Ensure Chart.js library loaded correctly

## 📦 Dependencies

- **Express.js** - Web server
- **Chart.js** - Data visualization
- **dotenv** - Environment variables
- **@googleapis/analyticsadmin** - GA4 API
- **googleapis** - Google APIs client

## 📝 License

Proprietary - Magnum Estate

## 👤 Support

For issues or questions, contact the development team.

---

**Last Updated:** February 20, 2026  
**Version:** 1.0.0
