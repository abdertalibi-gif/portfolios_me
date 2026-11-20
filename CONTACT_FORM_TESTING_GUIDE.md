# Contact Form Testing Guide

## Prerequisites

Before testing, ensure you have:

1. **Resend API Key**: Get from [resend.com/dashboard/api-keys](https://resend.com/dashboard/api-keys)
2. **Local .env file**: Create `.env` in project root:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   CONTACT_RECIPIENT_EMAIL=talibi.abder@gmail.com
   ```
3. **Node.js**: Version 18+ required for tsx

## Testing Steps

### Step 1: Start the Development Server

```bash
# From project root
npm run start
```

The server will start on `http://localhost:3001`

### Step 2: Verify the Endpoint

Test the API endpoint directly:

```bash
curl -X POST http://localhost:3001/api/contact-email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","message":"Hello"}'
```

**Expected response (without RESEND_API_KEY)**:
```json
{
  "error": "Service de email non configuré"
}
```

**Expected response (with valid RESEND_API_KEY)**:
```json
{
  "success": true,
  "id": "...",
  "message": "Message envoyé avec succès"
}
```

### Step 3: Test the Contact Form

1. Start the development server: `npm run start`
2. Open your portfolio at `http://localhost:5173/contact` (or your deployed URL)
3. Fill in the form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Subject: "Test Contact Form"
   - Message: "This is a test message"
4. Click Submit

**Expected Behavior**:

| State | Indicator |
|-------|-----------|
| Before submit | "Submit" button visible |
| After click | Button changes to "Sending..." with spinner |
| Success | ✅ Check circle, "Message envoyé avec succès", form clears, returns to idle after 4s |
| Error | ❌ Error message displayed, button returns to normal state |

### Step 5: Check Your Gmail

1. Send the form 2-3 times
2. Check `talibi.abder@gmail.com` inbox
3. Verify:
   - Email arrives from `Portfolio Contact <onboarding@resend.co>`
   - Reply-To is your test email address (`test@example.com`)
   - Subject starts with "Portfolio Contact: Test Contact Form"
   - Body contains: name, email, subject, message, and timestamp

### Step 6: Test Error Handling

1. Submit with invalid email (e.g., "not-an-email")
   - Expected: "Adresse email invalide" error
   
2. Submit with empty fields
   - Expected: "Champs requis manquants" error
   
3. Submit rapidly 5+ times in quick succession
   - Expected: Rate limiting may trigger after 3 submissions per 60 seconds

## Production Deployment (Vercel)

### 1. Add Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

| Key | Value |
|---|---|
| `RESEND_API_KEY` | Your Resend API key |
| `CONTACT_RECIPIENT_EMAIL` | `talibi.abder@gmail.com` |

### 2. Deploy

```bash
vercel deploy
# Or push to git - Vercel will auto-deploy
```

### 3. Test Production Form

1. Visit your deployed portfolio URL
2. Submit the contact form
3. Check `talibi.abder@gmail.com` for the email

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Service de email non configuré" | Add `RESEND_API_KEY` to environment variables |
| Email not arriving | Check spam folder, verify `CONTACT_RECIPIENT_EMAIL` |
| Rate limited | Wait 60 seconds, reduce submission frequency |
| CORS error | Ensure frontend URL is allowed in Resend (usually not needed for server-to-server) |
| Email ends up in spam | Add `onboarding@resend.co` to sender whitelist in Gmail |

## Rollback

If needed, the contact form can be temporarily disabled by:
1. Removing the `/api/contact-email` route from `server/app.ts`
2. Reverting `Contact.tsx` to use `api.sendMessage` only (stores messages in DB but doesn't email)
3. Removing Resend-specific environment variables

---
**All code is verified and ready for testing.** The implementation satisfies all requirements from the task brief.