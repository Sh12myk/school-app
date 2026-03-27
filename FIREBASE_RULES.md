# Firestore rules for school-app

This repository now includes `firestore.rules` with security rules for:

- `users/{uid}` profiles
- `users/{uid}/acks/{announcementId}`
- `announcements/{announcementId}`
- `substitutions/{subId}`

## Deploy

```bash
firebase deploy --only firestore:rules
```

If your Firebase project alias is configured, you can target it with:

```bash
firebase use <alias>
firebase deploy --only firestore:rules
```

## Current access model (high-level)

- Any authenticated user can read `announcements`, `substitutions`, and `users`.
- Only users with role `admin` (from `users/{uid}.roles`) can create/update/delete announcements and substitutions.
- User profile bootstrap is self-service on first login with role `teacher` only.
- Users can update their own basic profile fields, but cannot change their own roles.
- `acks` are writable only by the owning user.
