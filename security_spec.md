# Security Specification — PROJECT REBIRTH Firestore Rules

## 1. Data Invariants
1. Every document lives strictly under `/users/{userId}` or a user-owned subcollection `/users/{userId}/<collection>/{docId}`, and every document embeds `uid` / `userId == request.auth.uid`.
2. Users can never read, list, create, update, or delete any document belonging to another user.
3. All write operations require a signed-in user with a verified email (`request.auth.token.email_verified == true`).
4. Every document ID must satisfy `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).
5. Creation timestamps (`createdAt`) must equal `request.time` and remain immutable on update; `updatedAt` must equal `request.time` on both create and update.
6. All strings have explicit `.size()` bounds; all arrays have explicit `.size()` bounds (`<= 366` for `completedDates`, `<= 50` for `completedLessons`, `<= 25` for `milestones`, `<= 10` for `tags`).
7. XP events (`xpHistory`) are append-only (`allow update: if false;`) and bounded (`amount >= 1 && amount <= 5000`). Profile `xp` cannot decrease via client mutation (`incoming().xp >= existing().xp`, honoring "never punish relapse with XP deductions").
8. Every `allow list` rule enforces `isOwner(userId) && resource.data.userId == request.auth.uid` without `get()` or `exists()` lookups.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Cross-Tenant Profile Read**: User B attempts `get(/users/userA)`.
2. **Cross-Tenant Vault List**: User B attempts `list(/users/userA/vaultNotes)` without matching `userId`.
3. **Identity Spoofing on Create**: User A creates `/users/userA/projects/p1` with `userId: "userB"`.
4. **Shadow Field Injection**: User A creates `/users/userA/vaultNotes/n1` including an undeclared field `isAdmin: true`.
5. **Unverified Email Spoof**: Signed-in user with `email_verified: false` attempts to write `/users/userA`.
6. **ID Poisoning**: User A writes `/users/userA/projects/../../../etc/passwd` or a 200-char ID.
7. **Timestamp Forgery**: User A creates `/users/userA/missions/m1` with `createdAt` set to a past date instead of `request.time`.
8. **Immutable Field Mutation**: User A updates `/users/userA/projects/p1` and alters `createdAt` or `userId`.
9. **Unbounded Array / Denial-of-Wallet**: User A updates `/users/userA/vaultNotes/n1` with 25 tags (exceeds max 10) or a 100KB title.
10. **Negative XP / XP Tampering**: User A updates `/users/userA` lowering `xp` or writes `xpHistory` with `amount: 999999` or tries to `update` an immutable `xpHistory` record.
11. **Orphaned Mentor Message**: User A creates `/users/userA/mentorChats/nonexistentChat/messages/m1` when parent `mentorChats/nonexistentChat` does not exist.
12. **Blanket List Without Query Guard**: Attempting to list `/users` collection at root.
