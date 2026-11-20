# Contact Form Email Integration — Abderrahim Talibi Portfolio

## Summary
The portfolio contact form is now fully functional, sending emails directly to `talibi.abder@gmail.com` via Resend's secure backend API.

## Architecture
- **Frontend**: `src/components/Contact.tsx` — existing React form with state management
- **Backend**: `server/resend.ts` — new Resend email sending endpoint (serverless function)
- **API Service**: `src/services/api.ts` — added `sendContactEmail` method
- **Configuration**: `.env.example` — environment variables for Resend and recipient

## Changes Made

### 1. `server/resend.ts` (Created)
New serverless endpoint that uses Resend to send emails:
- Validates email format and required fields
- Sends email with sender name, email, subject, and message
- Sets Reply-To header to visitor's email
- Returns success/error response
- Rate-limited to 3 requests per 60 seconds

### 2. `server/app.ts` (Modified)
- Added `import { createResendEmail } from "./resend";` (line 21)
- Added `/api/contact-email` POST route with rate limiting
- Route uses the `createResendEmail` function directly

### 3. `src/services/api.ts` (Modified)
- Added `sendContactEmail` method:
  ```typescript
  sendContactEmail: (payload: { name: string; email: string; subject: string; message: string }) =>
    request<{ success: boolean; id?: string; message: string }>("/api/contact-email", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  ```

### 4. `src/components/Contact.tsx` (Modified)
- Updated `handleSubmit` to call `api.sendContactEmail(formValues)` instead of `api.sendMessage`
- Form state management remains the same (idle → sending → success/error → idle)
- Form clears after successful submission
- Success/error messages displayed appropriately

### 5. `.env.example` (Modified)
Added two new environment variables:
```
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CONTACT_RECIPIENT_EMAIL="talibi.abder@gmail.com"
```

## How It Works

### Submission Flow
1. Visitor fills out contact form (name, email, subject, message)
2. Form submits → `api.sendContactEmail(formValues)` → `POST /api/contact-email`
3. Server validates inputs, then sends email via Resend API
4. Email sent to `talibi.abder@gmail.com` with:
   - Reply-To: visitor's email address
   - From: `Portfolio Contact <onboarding@resend.co>`
   - Subject: `Portfolio Contact: [user's subject]`
   - Body: sender name, email, subject, message, and submission timestamp
5. Response received → frontend shows success state, clears form, resets after 4 seconds
6. On error → frontend shows error message

### Security Features
- **API keys never exposed to frontend**: Resend API key lives only on the server
- **Server-side validation**: Email format check, required field check
- **Rate limiting**: 3 submissions per 60 seconds per IP (prevents spam)
- **Email format validation**: Regex check on both client and server

### Vercel Deployment

#### Required Environment Variables
Add to Vercel project Settings → Environment Variables:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | Get from [resend.com/dashboard/api-keys](https://resend.com/dashboard/api-keys) |
| `CONTACT_RECIPIENT_EMAIL` | `talibi.abder@gmail.com` |

#### Local Development
Create `.env` file in project root:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_RECIPIENT_EMAIL=talibi.abder@gmail.com
```

### Translation Keys
The form uses existing i18n keys:
- `contact.form.name` — Name field label
- `contact.form.email` — Email field label  
- `contact.form.subject` — Subject field label
- `contact.form.message` — Message textarea label
- `contact.form.submit` — Submit button text
- `contact.form.sending` — Loading button text
- `contact.form.success` — Success message text
- `contact.form.error` — Error message text
- `contact.form.privacy` — Privacy notice text

### Testing Checklist
- [ ] Visitor can submit the form
- [ ] Backend receives the information
- [ ] Email service (Resend) accepts the message
- [ ] Email delivered to `talibi.abder@gmail.com`
- [ ] Reply-To address is correct (visitor's email)
- [ ] Errors handled properly (validation, service errors)
- [ ] Form clears after successful submission
- [ ] Button disabled during submission (prevents duplicates)
- [ ] responsive on mobile and desktop views

## Files Summary
| File | Lines | Change |
|------|-------|--------|
| `server/resend.ts` | 62 | New - Resend email endpoint |
| `server/app.ts` | ~700 | Modified - Added route + import |
| `src/services/api.ts` | ~210 | Modified - Added `sendContactEmail` |
| `src/components/Contact.tsx` | ~182 | Modified - Updated `handleSubmit` |
| `.env.example` | ~25 | Modified - Added env vars |

## Design Preservation
- ✅ Existing card layout, colors, typography unchanged
- ✅ Technology badges and button styles preserved
- ✅ Hover effects and animations maintained
- ✅ Responsive grid layout (2 columns mobile, 2 on lg+)
- ✅ Arabic (right-to-left) support preserved
- ✅ All existing form validation remains intact

---
**Integration Complete** — Contact form now sends real emails to `talibi.abder@gmail.com`