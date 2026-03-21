# 🛠️ Assistive Tools & Resources System

## ✅ What's Been Implemented

A comprehensive **assistive tools and resources system** that helps users find tools based on their disabilities:

- **24+ Pre-seeded Tools** - Common assistive technologies for various disabilities
- **Personalized Recommendations** - Tools matched to user's disabilities
- **Category Organization** - Tools organized by Software, App, Hardware, Service, Resource
- **Platform Filtering** - Filter by Windows, Mac, iOS, Android, Web
- **Cost Information** - Free, Paid, Freemium, Subscription
- **Direct Links** - Visit tool websites directly

## 🎯 Available Tools

### For Deaf/Hard of Hearing 👂
- **Otter.ai** - AI transcription service (Freemium)
- **Live Transcribe** - Google's real-time speech-to-text (Free, Android)
- **Ava** - Group conversation captions (Freemium)

### For Blind/Low Vision 👁️
- **NVDA** - Free screen reader for Windows (Free)
- **JAWS** - Professional screen reader (Paid)
- **VoiceOver** - Built-in Apple screen reader (Free)
- **ZoomText** - Screen magnification software (Paid)
- **Be My Eyes** - Visual assistance app (Free)

### For Color Blindness 🎨
- **Color Oracle** - Color blindness simulator (Free)
- **Colorblind Assistant** - Color identification app (Free)

### For ADHD 🧠
- **Focus@Will** - Focus music service (Subscription)
- **Todoist** - Task management app (Freemium)
- **Forest** - Focus timer app (Paid)

### For Dyslexia 📖
- **Natural Reader** - Text-to-speech software (Freemium)
- **Grammarly** - Writing assistant (Freemium)
- **OpenDyslexic Font** - Dyslexia-friendly font (Free)

### For Mobility Impairments ♿
- **Dragon NaturallySpeaking** - Voice recognition (Paid)
- **Windows Speech Recognition** - Built-in voice control (Free)
- **Eye Gaze Technology** - Eye tracking systems (Paid)

### For Mental Health 🧘
- **Headspace** - Meditation app (Subscription)
- **Calm** - Meditation and sleep app (Subscription)
- **Daylio** - Mood tracking journal (Freemium)

### General Accessibility 🪟
- **Microsoft Accessibility Features** - Built-in Windows tools (Free)
- **Apple Accessibility Features** - Built-in Mac/iOS tools (Free)

## 🚀 How to Use

### For Users

1. **Access Tools Page**:
   - Click "Tools" in the navbar
   - Or go to `/tools`

2. **View Recommended Tools**:
   - Tools are automatically filtered based on your disabilities
   - Organized by category (Software, App, Hardware, etc.)

3. **Filter Tools**:
   - Search by name or description
   - Filter by category (Software, App, etc.)
   - Filter by platform (Windows, Mac, iOS, Android, Web)
   - Filter by cost (Free, Paid, Freemium, Subscription)

4. **Visit Tool Websites**:
   - Click "Visit Website" button on any tool card
   - Opens in new tab with direct link

### For Admins

1. **Add New Tools**:
   - Use API endpoint: `POST /tools`
   - Or add directly to database

2. **Update Tools**:
   - Use API endpoint: `PUT /tools/{tool_id}`

3. **Delete Tools**:
   - Use API endpoint: `DELETE /tools/{tool_id}`

## 📊 Database Structure

### Assistive Tools Table
```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR(255), NOT NULL)
- description (TEXT)
- category (VARCHAR(100)) -- Software, App, Hardware, Service, Resource
- tool_type (VARCHAR(100)) -- Screen Reader, Speech-to-Text, etc.
- platform (VARCHAR(100)) -- Windows, Mac, iOS, Android, Web, All
- cost (VARCHAR(50)) -- Free, Paid, Freemium, Subscription
- website_url (VARCHAR(500))
- icon (VARCHAR(100)) -- Emoji
- features (JSON) -- Array of features
- created_at (DATETIME)
```

### Disability-Tool Association
- Many-to-many relationship
- Links tools to disabilities they help with

## 🔧 API Endpoints

### Get Tools for User
```
GET /tools/for-user/{user_id}
```
Returns tools recommended based on user's disabilities, grouped by category.

### Get All Tools
```
GET /tools
GET /tools?disability_id=1
GET /tools?category=Software
GET /tools?platform=Windows
GET /tools?cost=Free
```

### Get Single Tool
```
GET /tools/{tool_id}
```

### Add Tool (Admin)
```
POST /tools
Body: {
  "name": "Tool Name",
  "description": "Tool description",
  "category": "Software",
  "tool_type": "Screen Reader",
  "platform": "Windows",
  "cost": "Free",
  "website_url": "https://example.com",
  "icon": "🔊",
  "features": ["Feature 1", "Feature 2"],
  "disability_ids": [1, 2, 3]
}
```

### Update Tool (Admin)
```
PUT /tools/{tool_id}
```

### Delete Tool (Admin)
```
DELETE /tools/{tool_id}
```

## 🎨 Frontend Features

### Tools Page (`/tools`)
- **Personalized Recommendations** - Shows tools based on user's disabilities
- **Category Grouping** - Tools organized by category
- **Search & Filters** - Easy to find specific tools
- **Tool Cards** - Beautiful cards with:
  - Icon
  - Name
  - Description
  - Cost badge (color-coded)
  - Platform information
  - Features list
  - Direct website link

### Navigation
- "Tools" link added to navbar
- Accessible from any page when logged in

## 📝 Seeding Tools

To add tools to database:

```bash
python seed_assistive_tools.py
```

This adds 24+ common assistive tools linked to appropriate disabilities.

## 🔄 Migration

To create tables:

```bash
python migrate_tools.py
```

Creates `assistive_tools` table and `disability_tools` association table.

## 🎯 Integration

### With User Profile
- Tools automatically recommended based on selected disabilities
- Updates when user updates their disabilities

### With Job Recommendations
- Tools help users prepare for jobs
- Can be mentioned in chatbot recommendations

### With Chatbot
- Chatbot can recommend tools when users ask
- "What tools can help me?" → Shows relevant tools

## 🔒 Security

- Input validation and sanitization
- Rate limiting on API endpoints
- Admin-only access for add/edit/delete
- User-specific tool recommendations

## 📈 Future Enhancements

- User reviews and ratings for tools
- Tool comparison feature
- Personalized tool recommendations based on job requirements
- Tool usage tracking
- Integration with tool providers
- Video tutorials for tools
- Community forum for tool discussions

## 🐛 Troubleshooting

### "No tools found"
- Make sure you've selected disabilities in your profile
- Check if tools exist in database
- Verify API endpoint is working

### "Tools not showing"
- Check user has disabilities selected
- Verify tools are linked to disabilities
- Check browser console for errors

### "Website link not working"
- Verify URL is correct in database
- Check if website is accessible
- Some tools may require registration

## ✅ Summary

The assistive tools system is now fully functional with:
- ✅ 24+ pre-seeded tools
- ✅ Personalized recommendations
- ✅ Category organization
- ✅ Platform and cost filtering
- ✅ Direct website links
- ✅ User-friendly interface
- ✅ API endpoints for management

Users can now easily find tools and resources to help them with their disabilities!

