# Security Specification - Private Messaging System

## 1. Data Invariants
- A message cannot be sent without both a valid sender and receiver ID.
- A user can only send messages as themselves (`senderId` must match `request.auth.uid`).
- A user can only read messages where they are either the sender or the receiver.
- A conversation index (`conversations` collection) must only be accessible (read/write) if the user is one of the `participantIds`.
- Conversation IDs are derived from the sorted concatenation of participant UIDs (e.g., `uid1_uid2`).

## 2. The "Dirty Dozen" Payloads (Messaging)

1. **Identity Spoofing**: Attempt to send a message with `senderId` belonging to another user.
2. **Eavesdropping**: Attempt to read `direct_messages` where the user is neither `senderId` nor `receiverId`.
3. **Conversation Hijacking**: Attempt to update a `conversations` document where the user is not in `participantIds`.
4. **Metadata Poisoning**: Attempt to inject malicious URLs into `senderPhoto`.
5. **Unauthorized Index Listing**: Attempt to list all `conversations` without being a participant.
6. **Self-Messaging Loop**: Write validation to ensure `senderId != receiverId` (optional but good practice).
7. **Phantom Participant**: Create a conversation index with a participant ID that doesn't exist (relational sync check).
8. **Shadow Field Injection**: Add a `verified: true` field to a message to bypass UI filters.
9. **Spam Overflow**: Send a message with text size exceeding 5000 characters.
10. **State Corruption**: Manually set `isRead: true` on a message the user did not receive.
11. **Relational Disconnect**: Update a conversation summary without an accompanying message write (atomicity check).
12. **ID Poisoning**: Use a 2KB string as a conversation ID.

## 3. Test Runner Results (Expected)
- Tests for all "Dirty Dozen" payloads should return `PERMISSION_DENIED`.
- Authorized read/write for actual participants should return `SUCCESS`.
