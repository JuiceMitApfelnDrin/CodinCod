# Feature Implementation Roadmap

### 2. Private Games
**Status**: Not started
**Effort**: Small-Medium
**Impact**: High
**Description**: Allow users to create invite-only games
**Tasks**:
- Add `inviteCode` to Game model
- Generate unique codes for private games
- Add join-by-code UI
- Filter private games from public lobby

**Implementation**:
```typescript
// Backend
should be generated in the waiting room and returned to the frontend to invite people

// Frontend
<Button onclick={copyInviteLink}>Share Invite Link</Button>
```

---

### 3. Reporting System
**Status**: Partially implemented (user bans exist)
**Effort**: Medium
**Impact**: High (user safety)
**Description**: Allow users to report inappropriate content/behavior
**Tasks**:
- Create Report model (reporter, reported, category, description, status)
- Add report button to user profiles, puzzles, comments
- Create admin moderation dashboard
- Implement automated escalation for repeat offenders

**Existing**:
- User ban system already implemented
- Ban types (temporary, permanent)
- Check user ban middleware

**New**:
```typescript
interface Report {
  reporter: ObjectId;
  reported: ObjectId;
  category: "spam" | "harassment" | "cheating" | "inappropriate";
  description: string;
  status: "pending" | "resolved" | "dismissed";
  evidence?: string[];
}
```


---

## 🟡 MEDIUM PRIORITY

### 5. Ranked Matchmaking
**Status**: Mode exists, needs matchmaking
**Effort**: Large
**Impact**: High (engagement)
**Description**: Implement ELO/Glicko2 ranking system with skill-based matchmaking
**Tasks**:
- Implement Glicko2 rating algorithm
- Add rating, ratingDeviation, volatility to User model
- Create matchmaking queue system
- Match players by skill level
- Update ratings after games
- keep the puzzle difficulty in mind in the calculation, can't give beginners an almost impossible puzzle for them...

**Recommended**: check out how lichess does their matchmaking

---

### 6. Community Challenges
**Status**: Puzzle voting exists
**Effort**: Medium
**Impact**: Medium (engagement)
**Description**: User-created challenges with voting
**Tasks**:
- Already have puzzle creation & approval system
- Add challenge categories/tags
- Add automatic difficulty ratings, based on completion rates and puzzle metrics

**Leverage existing**:
- Puzzle approval system
- User voting on puzzles
- Comment system

---

### 4. User Blocking
**Status**: Not started
**Effort**: Small
**Impact**: Medium (user experience)
**Description**: Allow users to block others
**Tasks**:
- Add `blockedUsers` array to User model
- Create block/unblock endpoints
- block blocked users from joining a game created by the creator who blocked them
- Hide blocked users' comments/content

---

### 7. General Chat
**Status**: Not started
**Effort**: Medium
**Impact**: Medium
**Description**: Global chat room for community
**Tasks**:
- Create ChatMessage model
- Implement WebSocket-based chat
- Add message history pagination
- Moderation tools (delete, timeout)
- Rate limiting

**Reuse**:
- Existing WebSocket infrastructure
- ConnectionManager pattern

---

### 8. Events System
**Status**: Not started
**Effort**: Large
**Impact**: High (engagement, but complex)
**Description**: Scheduled competitions with leaderboards
**Tasks**:
- Create Event model (type, startTime, endTime, puzzles, prizes)
- Event registration system
- Event-specific leaderboards
- Automated event scheduling
- Prize distribution

**Event Types**:
- Daily challenges
- Weekly competitions
- Monthly tournaments
- Themed events (Python month, etc.)

---

## 🔵 LOW PRIORITY

### 9. Private Messages
**Status**: Not started
**Effort**: Medium
**Description**: DM system between users
**Tasks**:
- Create Conversation & Message models
- Message thread UI
- Real-time message delivery (WebSocket)
- Read receipts
- Message notifications

---

### 10. Collaborative Puzzles
**Status**: Not started
**Effort**: Large (very complex)
**Description**: Real-time collaborative code editing
**Tasks**:
- Implement operational transformation or CRDT
- Shared code editor state
- Cursor positions for all users
- Team formation system
- Team scoring

**Note**: Very complex, requires careful architecture

---

### 11. Streaming Integration
**Status**: Not started
**Effort**: Medium
**Description**: Twitch/YouTube integration for streamers
**Tasks**:
- OAuth with streaming platforms
- Overlay widgets for streams
- Streamer mode (hide sensitive info)
- Stream chat integration

---

## Implementation Recommendations

### Immediate Next Steps (in order):

1. **Custom Game UI** (1-2 hours)
   - Quick win, backend already done
   - High user value

2. **Private Games** (3-4 hours)
   - Small backend changes
   - Frequently requested feature

3. **Reporting System** (1-2 days)
   - User safety is critical
   - Foundation for healthy community

4. **User Blocking** (3-4 hours)
   - Complements reporting system
   - Low complexity, high UX value

5. **Ranked Matchmaking** (3-5 days)
   - High engagement potential
   - Requires careful testing

### Technical Debt to Address:

- Refactor remaining routes to use service layer
- Add comprehensive error handling
- Implement rate limiting on all endpoints
- Add WebSocket reconnection logic
- Create automated tests for game modes

### Architecture Notes:

- **Services First**: Always use service layer for DB operations
- **WebSocket Patterns**: Reuse existing ConnectionManager pattern
- **Type Safety**: Leverage Zod schemas from types library
- **Game Modes**: Use strategy pattern for new competitive modes
- **Lean Code**: Avoid over-engineering, iterate quickly

---

## Estimated Timeline

**Month 1**:
- Custom Game UI
- Private Games
- Reporting System
- User Blocking

**Month 2**:
- Ranked Matchmaking
- General Chat
- Community Challenges improvements

**Month 3**:
- Events System (MVP)
- Private Messages
- Platform polish

**Long-term**:
- Collaborative Puzzles
- Streaming Integration
- Mobile app
