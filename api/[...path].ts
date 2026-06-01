type VercelRequest = { method?: string; url?: string; headers: Record<string, any>; body?: any; query?: Record<string, string> };
type VercelResponse = { status: (code: number) => VercelResponse; setHeader: (k: string, v: string) => VercelResponse; json: (data: any) => void; end: (data?: any) => void };

// C-3: Supabase URL from env var
const SB_URL = process.env.SUPABASE_URL || "https://hzykbqyeulkxnwynzhkl.supabase.co";
const SB_KEY = process.env.SUPABASE_KEY || "";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://find-your-padel-buddy.vercel.app";

// M-2: UUID validation helper
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Also accept short IDs used in the app (e.g. "e4imwo7z3")
const SAFE_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;
function isSafeId(id: string): boolean { return SAFE_ID_RE.test(id); }

// H-2: Email validation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pre-generated dummy hash for timing-safe login (H-3)
const DUMMY_HASH = "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345";

const jsonResponse = (res: VercelResponse, statusCode: number, body: any) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  return res.status(statusCode).json(body);
};

async function db(table: string, query: string = '', options: { method?: string; body?: any } = {}) {
  const { method = 'GET', body } = options;
  const url = `${SB_URL}/rest/v1/${table}${query ? '?' + query : ''}`;
  const headers: Record<string, string> = {
    'apikey': SB_KEY,
    'Authorization': `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
  const res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DB ${method} /${table}: ${res.status} ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

function rowToUser(row: any): any {
  if (!row) return null;
  const { password_hash, data, created_at, ...cols } = row;
  return { ...cols, ...(data || {}) };
}

function safeUser(row: any): any {
  const u = rowToUser(row);
  if (!u) return null;
  // M-1: Strip all sensitive fields
  const { password, password_hash, phone, ...safe } = u;
  return safe;
}

function rowToObj(row: any): any {
  if (!row) return null;
  const { data, created_at, ...cols } = row;
  return { ...cols, ...(data || {}) };
}

// M-8: Allowlist for user registration fields
const ALLOWED_REG_FIELDS = ['username', 'phone', 'skillLevel', 'languagePreference', 'location'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return jsonResponse(res, 200, { message: "OK" });

  try {
    const method = req.method || 'GET';
    const rawPath = req.url || '';
    const path = rawPath.replace(/^\/api/, '').split('?')[0];
    const segments = path.split('/').filter(Boolean);
    const action = segments[0] || '';
    const itemId = segments[1] || '';
    const subAction = segments[2] || '';

    // M-2: Validate itemId before use
    if (itemId && !isSafeId(itemId)) {
      return jsonResponse(res, 400, { success: false, message: "Invalid ID format" });
    }

    const body = req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : '{}';

    // H-1: Body size guard (rough check)
    if (body.length > 100_000) {
      return jsonResponse(res, 413, { success: false, message: "Request too large" });
    }

    if (path === "/health") return jsonResponse(res, 200, { success: true, message: "API running" });

    // C-4: /debug endpoint removed entirely

    // verifyAuth — validates Supabase access token, then loads user row
    const verifyAuth = async (tokenStr?: string) => {
      if (!tokenStr) return null;
      try {
        // Ask Supabase Auth to validate the token and return the user
        const resp = await fetch(`${SB_URL}/auth/v1/user`, {
          headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${tokenStr}` },
        });
        if (!resp.ok) return null;
        const authUser = await resp.json();
        const userId = authUser?.id;
        if (!userId) return null;
        const rows = await db('users', `id=eq.${userId}&select=*`);
        if (rows && rows.length > 0) return rows[0];
        // User authenticated but no profile row yet — return minimal row
        return { id: userId, email: authUser.email || '', name: authUser.user_metadata?.name || '', data: {} };
      } catch {
        return null;
      }
    };

    const authHeader = (req.headers.authorization || req.headers.Authorization || '') as string;
    const tokenStr = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const authRow = await verifyAuth(tokenStr);
    const authUser = authRow ? rowToUser(authRow) : null;

    // REGISTER and LOGIN are now handled client-side via Supabase Auth
    if (path === "/register" || path === "/login") {
      return jsonResponse(res, 410, { success: false, message: "Auth is now handled via Supabase Auth client-side" });
    }

    // Public config for frontend Supabase client init — ONLY exposes anon key
    if (path === "/config" && method === "GET") {
      const anonKey = process.env.SUPABASE_ANON_KEY || '';
      // Safety check: never expose service_role key. Decode JWT role claim (no sig needed).
      let isSafe = true;
      try {
        const payload = JSON.parse(Buffer.from((anonKey.split('.')[1] || ''), 'base64').toString());
        if (payload.role === 'service_role') isSafe = false;
      } catch { isSafe = false; }
      if (!isSafe || !anonKey) {
        return jsonResponse(res, 503, { error: 'SUPABASE_ANON_KEY not configured. Add it to Vercel env vars.' });
      }
      return jsonResponse(res, 200, { supabaseUrl: SB_URL, supabaseAnonKey: anonKey });
    }

    // ME
    if (path === "/me" && method === "GET") {
      if (!authUser) return jsonResponse(res, 401, { success: false, message: "Unauthorized" });
      return jsonResponse(res, 200, { success: true, user: safeUser(authRow), data: safeUser(authRow) });
    }

    // USERS
    if (action === "users") {
      // C-10: Require auth for user list
      if (path === "/users" && method === "GET") {
        if (!authUser) return jsonResponse(res, 401, { success: false, message: "Unauthorized" });
        const rows = await db('users', 'select=*');
        return jsonResponse(res, 200, { success: true, data: rows.map(safeUser) });
      }
      // M-5: Require auth for individual user lookup
      if (itemId && method === "GET" && !subAction) {
        if (!authUser) return jsonResponse(res, 401, { success: false, message: "Unauthorized" });
        const rows = await db('users', `id=eq.${itemId}&select=*`);
        if (!rows[0]) return jsonResponse(res, 404, { success: false, message: "User not found" });
        return jsonResponse(res, 200, { success: true, data: safeUser(rows[0]), user: safeUser(rows[0]) });
      }
      if (itemId && method === "PUT") {
        if (!authUser || authUser.id !== itemId) return jsonResponse(res, 403, { success: false, message: "Forbidden" });
        const payload = JSON.parse(body);
        const rows = await db('users', `id=eq.${itemId}&select=*`);
        const currentData = rows[0]?.data || {};
        const { email, password, password_hash, id, name, ...payloadRest } = payload;
        const nameUpdate = name ? { name } : {};
        if (!rows[0]) {
          // Profile row doesn't exist yet (email-confirm registration flow) — create it
          const upserted = await db('users', '', {
            method: 'POST',
            body: {
              id: itemId,
              email: authUser.email || '',
              name: name || authUser.name || '',
              data: { ...payloadRest, lastActive: new Date().toISOString() },
            },
          });
          const user = safeUser(Array.isArray(upserted) ? upserted[0] : upserted);
          return jsonResponse(res, 200, { success: true, data: user, user });
        }
        const updated = await db('users', `id=eq.${itemId}`, { method: 'PATCH', body: { ...nameUpdate, data: { ...currentData, ...payloadRest, lastActive: new Date().toISOString() } } });
        const user = safeUser(Array.isArray(updated) ? updated[0] : updated);
        return jsonResponse(res, 200, { success: true, data: user, user });
      }
      if (itemId && method === "POST" && subAction && authUser) {
        const payload = JSON.parse(body);
        const rows = await db('users', `id=eq.${authUser.id}&select=*`);
        const currentData = rows[0]?.data || {};
        if (subAction === "block") {
          let ids = currentData.blockedUserIds || [];
          ids = ids.includes(itemId) ? ids.filter((x: string) => x !== itemId) : [...ids, itemId];
          const updated = await db('users', `id=eq.${authUser.id}`, { method: 'PATCH', body: { data: { ...currentData, blockedUserIds: ids } } });
          return jsonResponse(res, 200, { success: true, data: safeUser(Array.isArray(updated) ? updated[0] : updated) });
        }
        if (subAction === "favorite") {
          let ids = currentData.favoritePlayerIds || [];
          const tid = payload.targetUserId;
          if (!tid || !isSafeId(tid)) return jsonResponse(res, 400, { success: false, message: "Invalid targetUserId" });
          ids = ids.includes(tid) ? ids.filter((x: string) => x !== tid) : [...ids, tid];
          const updated = await db('users', `id=eq.${authUser.id}`, { method: 'PATCH', body: { data: { ...currentData, favoritePlayerIds: ids } } });
          return jsonResponse(res, 200, { success: true, data: safeUser(Array.isArray(updated) ? updated[0] : updated) });
        }
      }
    }

    // FRIENDS
    if (action === "friends") {
      if (!authUser) return jsonResponse(res, 401, { success: false, message: "Unauthorized" });
      if (method === "GET") {
        const reqs = await db('friend_requests', `or=(from_user_id.eq.${authUser.id},to_user_id.eq.${authUser.id})&select=*`);
        return jsonResponse(res, 200, { success: true, data: reqs.map((r: any) => ({ id: r.id, fromUserId: r.from_user_id, toUserId: r.to_user_id, status: r.status, createdAt: r.created_at })) });
      }
      if (itemId === "request" && method === "POST") {
        const { toUserId } = JSON.parse(body);
        if (!toUserId || !isSafeId(toUserId)) return jsonResponse(res, 400, { success: false, message: "Invalid toUserId" });
        if (toUserId === authUser.id) return jsonResponse(res, 400, { success: false, message: "Cannot send friend request to yourself" });
        const existing = await db('friend_requests',
          `or=(and(from_user_id.eq.${authUser.id},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${authUser.id}))&status=eq.pending&select=id`
        );
        if (existing.length > 0) return jsonResponse(res, 400, { success: false, message: 'Friend request already pending' });
        const reqId = crypto.randomUUID();
        const created = await db('friend_requests', '', { method: 'POST', body: { id: reqId, from_user_id: authUser.id, to_user_id: toUserId, status: 'pending', created_at: new Date().toISOString() } });
        const req = Array.isArray(created) ? created[0] : created;
        const notifId = crypto.randomUUID();
        await db('notifications', '', { method: 'POST', body: {
          id: notifId, user_id: toUserId,
          data: { type: 'new_request', title: 'Új barátkérés', message: `${authUser.name} barátnak jelölt`, fromUserId: authUser.id, requestId: reqId, read: false },
          created_at: new Date().toISOString()
        }}).catch(() => {});
        return jsonResponse(res, 201, { success: true, data: { id: req.id, fromUserId: req.from_user_id, toUserId: req.to_user_id, status: req.status, createdAt: req.created_at } });
      }
      if (itemId === "remove" && method === "POST") {
        const { friendId } = JSON.parse(body);
        if (!friendId || !isSafeId(friendId)) return jsonResponse(res, 400, { success: false, message: "Invalid friendId" });
        const [u1rows, u2rows] = await Promise.all([
          db('users', `id=eq.${authUser.id}&select=*`),
          db('users', `id=eq.${friendId}&select=*`)
        ]);
        if (u1rows[0]) {
          const d1 = u1rows[0].data || {};
          await db('users', `id=eq.${authUser.id}`, { method: 'PATCH', body: { data: { ...d1, friendIds: (d1.friendIds || []).filter((id: string) => id !== friendId) } } });
        }
        if (u2rows[0]) {
          const d2 = u2rows[0].data || {};
          await db('users', `id=eq.${friendId}`, { method: 'PATCH', body: { data: { ...d2, friendIds: (d2.friendIds || []).filter((id: string) => id !== authUser.id) } } });
        }
        await db('friend_requests', `or=(and(from_user_id.eq.${authUser.id},to_user_id.eq.${friendId}),and(from_user_id.eq.${friendId},to_user_id.eq.${authUser.id}))`, { method: 'DELETE' }).catch(() => {});
        return jsonResponse(res, 200, { success: true });
      }
      if (itemId === "respond" && method === "POST") {
        const { requestId, status } = JSON.parse(body);
        if (!requestId || !isSafeId(requestId)) return jsonResponse(res, 400, { success: false, message: "Invalid requestId" });
        // H-4: Validate status value
        if (!['accepted', 'rejected'].includes(status))
          return jsonResponse(res, 400, { success: false, message: "Invalid status value" });
        const reqs = await db('friend_requests', `id=eq.${requestId}&select=*`);
        if (!reqs[0]) return jsonResponse(res, 404, { success: false, message: "Request not found" });
        const req = reqs[0];
        // C-7: Only the recipient can respond
        if (req.to_user_id !== authUser.id)
          return jsonResponse(res, 403, { success: false, message: "Forbidden" });
        await db('friend_requests', `id=eq.${requestId}`, { method: 'PATCH', body: { status } });
        if (status === 'accepted') {
          const [u1r, u2r] = await Promise.all([db('users', `id=eq.${req.from_user_id}&select=*`), db('users', `id=eq.${req.to_user_id}&select=*`)]);
          if (u1r[0] && u2r[0]) {
            const d1 = u1r[0].data || {}, d2 = u2r[0].data || {};
            const f1 = d1.friendIds || [], f2 = d2.friendIds || [];
            if (!f1.includes(req.to_user_id)) f1.push(req.to_user_id);
            if (!f2.includes(req.from_user_id)) f2.push(req.from_user_id);
            await Promise.all([
              db('users', `id=eq.${req.from_user_id}`, { method: 'PATCH', body: { data: { ...d1, friendIds: f1 } } }),
              db('users', `id=eq.${req.to_user_id}`, { method: 'PATCH', body: { data: { ...d2, friendIds: f2 } } })
            ]);
          }
          const notifId = crypto.randomUUID();
          await db('notifications', '', { method: 'POST', body: {
            id: notifId, user_id: req.from_user_id,
            data: { type: 'request_status', title: 'Barátkérés elfogadva', message: `${authUser.name} elfogadta a barátkérésedet`, fromUserId: authUser.id, read: false },
            created_at: new Date().toISOString()
          }}).catch(() => {});
        }
        const updated = await db('users', `id=eq.${authUser.id}&select=*`);
        return jsonResponse(res, 200, { success: true, data: safeUser(updated[0]), user: safeUser(updated[0]) });
      }
    }

    // GAMES
    if (action === "games") {
      if (path === "/games" && method === "GET") {
        const rows = await db('games', 'select=*&order=created_at.desc');
        return jsonResponse(res, 200, { success: true, data: rows.map(rowToObj) });
      }
      if (itemId && method === "GET" && !subAction) {
        const rows = await db('games', `id=eq.${itemId}&select=*`);
        if (!rows[0]) return jsonResponse(res, 404, { success: false, message: "Game not found" });
        return jsonResponse(res, 200, { success: true, data: rowToObj(rows[0]), game: rowToObj(rows[0]) });
      }
      if (!authUser) return jsonResponse(res, 401, { success: false, message: "Unauthorized" });
      if (method === "POST" && !itemId) {
        const payload = JSON.parse(body);
        if (!payload.location || String(payload.location).length > 200)
          return jsonResponse(res, 400, { success: false, message: "Helyszín megadása kötelező (max 200 karakter)" });
        const id = crypto.randomUUID();
        const gameData = {
          ...payload, id,
          creatorId: authUser.id,
          creatorName: authUser.name,
          joinedPlayers: [authUser.id],
          requests: [],
          chat: [],
          requiredPlayers: Number(payload.requiredPlayers) || 4,
          status: 'scheduled',
          createdAt: new Date().toISOString()
        };
        const created = await db('games', '', { method: 'POST', body: { id, data: gameData } });
        if (gameData.visibility === 'public' || !gameData.visibility) {
          const allUsersRows = await db('users', 'select=id,data').catch(() => []);
          const notifPromises = allUsersRows
            .filter((u: any) => {
              const uData = u.data || {};
              return u.id !== authUser.id &&
                uData.skillLevel === gameData.recommendedLevel &&
                uData.notificationSettings?.nearGames !== false;
            })
            .slice(0, 20)
            .map(async (u: any) => {
              const nid = crypto.randomUUID();
              return db('notifications', '', { method: 'POST', body: {
                id: nid, user_id: u.id,
                data: { type: 'game_near', title: 'Új meccs a közeledben!', message: `${authUser.name} új ${gameData.recommendedLevel} szintű meccset hirdetett: ${gameData.location}`, gameId: id, fromUserId: authUser.id, read: false },
                created_at: new Date().toISOString()
              }}).catch(() => {});
            });
          await Promise.all(notifPromises).catch(() => {});
        }
        // H-8: Hard cap on invites
        const invitedUserIds = (payload.invitedUserIds || []).slice(0, 20);
        if (invitedUserIds.length > 0) {
          await Promise.all(invitedUserIds.map(async (uid: string) => {
            if (!isSafeId(uid)) return;
            const notifId = crypto.randomUUID();
            await db('notifications', '', { method: 'POST', body: {
              id: notifId, user_id: uid,
              data: { type: 'gameInvite', title: 'Játékmeghívás', message: `${authUser.name} meghívott egy meccsre: ${payload.location}`, gameId: id, fromUserId: authUser.id, read: false },
              created_at: new Date().toISOString()
            }}).catch(() => {});
          }));
        }
        return jsonResponse(res, 201, { success: true, data: rowToObj(Array.isArray(created) ? created[0] : created) });
      }
      if (itemId) {
        const rows = await db('games', `id=eq.${itemId}&select=*`);
        if (!rows[0]) return jsonResponse(res, 404, { success: false, message: "Game not found" });
        const gameData = rowToObj(rows[0]);
        if (method === "PUT") {
          if (!authUser || authUser.id !== gameData.creatorId) return jsonResponse(res, 403, { success: false, message: 'Only the creator can edit this game' });
          const payload = JSON.parse(body);
          const updated = await db('games', `id=eq.${itemId}`, { method: 'PATCH', body: { data: { ...gameData, ...payload, id: itemId } } });
          return jsonResponse(res, 200, { success: true, data: rowToObj(Array.isArray(updated) ? updated[0] : updated) });
        }
        if (method === "DELETE") {
          if (!authUser || authUser.id !== gameData.creatorId) return jsonResponse(res, 403, { success: false, message: 'Only the creator can delete this game' });
          await db('games', `id=eq.${itemId}`, { method: 'DELETE' });
          return jsonResponse(res, 200, { success: true });
        }
        if (method === "POST" && subAction) {
          const payload = JSON.parse(body);
          if (subAction === "request") {
            const maxPlayers = Number(gameData.requiredPlayers) || 4;
            if (gameData.joinedPlayers.length >= maxPlayers)
              return jsonResponse(res, 400, { success: false, message: 'Game is full' });
            if (gameData.visibility === 'public' || !gameData.visibility) {
              if (!gameData.joinedPlayers.includes(authUser.id)) {
                gameData.joinedPlayers.push(authUser.id);
                if (gameData.creatorId !== authUser.id) {
                  const nid = crypto.randomUUID();
                  await db('notifications', '', { method: 'POST', body: {
                    id: nid, user_id: gameData.creatorId,
                    data: { type: 'new_request', title: 'Új résztvevő', message: `${authUser.name} csatlakozott a meccsedhez: ${gameData.location}`, gameId: itemId, fromUserId: authUser.id, read: false },
                    created_at: new Date().toISOString()
                  }}).catch(() => {});
                }
              }
            } else {
              if (!gameData.requests) gameData.requests = [];
              if (!gameData.requests.find((r: any) => r.userId === authUser.id)) {
                gameData.requests.push({ userId: authUser.id, userName: authUser.name, status: 'pending', timestamp: new Date().toISOString() });
                const notifId = crypto.randomUUID();
                await db('notifications', '', { method: 'POST', body: {
                  id: notifId, user_id: gameData.creatorId,
                  data: { type: 'new_request', title: 'Csatlakozási kérelem', message: `${authUser.name} csatlakozni szeretne a meccsedhez`, gameId: itemId, fromUserId: authUser.id, read: false },
                  created_at: new Date().toISOString()
                }}).catch(() => {});
              }
            }
          } else if (subAction === "approve") {
            // C-9: Only creator can approve
            if (authUser.id !== gameData.creatorId)
              return jsonResponse(res, 403, { success: false, message: "Only the creator can approve requests" });
            const { userId, approve } = payload;
            if (!userId || !isSafeId(userId)) return jsonResponse(res, 400, { success: false, message: "Invalid userId" });
            const rIdx = (gameData.requests || []).findIndex((r: any) => r.userId === userId);
            if (rIdx !== -1) {
              gameData.requests[rIdx].status = approve ? 'approved' : 'rejected';
              if (approve && !gameData.joinedPlayers.includes(userId)) {
                gameData.joinedPlayers.push(userId);
                const notifId = crypto.randomUUID();
                await db('notifications', '', { method: 'POST', body: {
                  id: notifId, user_id: userId,
                  data: { type: 'request_status', title: 'Kérelem elfogadva', message: `Csatlakozhatsz a meccshez: ${gameData.location}`, gameId: itemId, read: false },
                  created_at: new Date().toISOString()
                }}).catch(() => {});
              } else if (!approve) {
                const notifId = crypto.randomUUID();
                await db('notifications', '', { method: 'POST', body: {
                  id: notifId, user_id: userId,
                  data: { type: 'request_status', title: 'Kérelem elutasítva', message: `A meccsre való csatlakozási kérelmed elutasításra került: ${gameData.location}`, gameId: itemId, read: false },
                  created_at: new Date().toISOString()
                }}).catch(() => {});
              }
            }
          } else if (subAction === "rate") {
            const { ratings } = payload;
            if (!Array.isArray(ratings)) return jsonResponse(res, 400, { success: false, message: 'Invalid ratings' });
            if (!gameData.ratedBy) gameData.ratedBy = [];
            if (gameData.ratedBy.includes(authUser.id)) return jsonResponse(res, 400, { success: false, message: 'Already rated' });
            gameData.ratedBy.push(authUser.id);
            await Promise.all(ratings.slice(0, 20).map(async (r: any) => {
              if (!r.userId || r.userId === authUser.id || !isSafeId(r.userId)) return;
              const uRows = await db('users', `id=eq.${r.userId}&select=*`);
              if (!uRows[0]) return;
              const uData = uRows[0].data || {};
              const reliabilityScore = (uData.reliabilityScore || 0) + (r.reliable ? 1 : 0);
              const goodPlayerScore = (uData.goodPlayerScore || 0) + (r.goodPlayer ? 1 : 0);
              const totalRatings = (uData.totalRatings || 0) + 1;
              const posRatio = totalRatings > 0 ? reliabilityScore / totalRatings : 0;
              let reliabilityStatus = 'New Player';
              if (totalRatings >= 5 && posRatio >= 0.85) reliabilityStatus = 'Very Reliable';
              else if (totalRatings >= 3 && posRatio >= 0.7) reliabilityStatus = 'Regularly Appears';
              else if (totalRatings >= 1 && posRatio < 0.4) reliabilityStatus = 'Unreliable';
              await db('users', `id=eq.${r.userId}`, { method: 'PATCH', body: { data: { ...uData, reliabilityScore, goodPlayerScore, totalRatings, reliabilityStatus } } });
              const nid = crypto.randomUUID();
              const badges = [r.reliable ? '👍' : '', r.goodPlayer ? '🎾' : ''].filter(Boolean).join(' ');
              await db('notifications', '', { method: 'POST', body: {
                id: nid, user_id: r.userId,
                data: { type: 'request_status', title: 'Új értékelés érkezett!', message: `${authUser.name} értékelt téged: ${badges}`, read: false },
                created_at: new Date().toISOString()
              }}).catch(() => {});
            }));
          } else if (subAction === "leave") {
            gameData.joinedPlayers = (gameData.joinedPlayers || []).filter((id: string) => id !== authUser.id);
            if (gameData.creatorId !== authUser.id) {
              const nid = crypto.randomUUID();
              await db('notifications', '', { method: 'POST', body: {
                id: nid, user_id: gameData.creatorId,
                data: { type: 'request_status', title: 'Játékos kilépett', message: `${authUser.name} kilépett a meccsedből: ${gameData.location}`, gameId: itemId, read: false },
                created_at: new Date().toISOString()
              }}).catch(() => {});
            }
          } else if (subAction === "join") {
            if (!gameData.joinedPlayers.includes(authUser.id)) gameData.joinedPlayers.push(authUser.id);
          } else if (subAction === "chat") {
            if (!gameData.chat) gameData.chat = [];
            // M-4: Limit chat message length
            const text = (payload.text || '').slice(0, 1000).trim();
            if (!text) return jsonResponse(res, 400, { success: false, message: "Üzenet nem lehet üres" });
            gameData.chat.push({ id: crypto.randomUUID(), userId: authUser.id, userName: authUser.name, text, timestamp: new Date().toISOString() });
          } else if (subAction === "attendance") {
            // H-5: Only creator can set attendance
            if (authUser.id !== gameData.creatorId)
              return jsonResponse(res, 403, { success: false, message: "Only the creator can record attendance" });
            gameData.attendanceRecords = payload.attendanceRecords;
            if (payload.status) gameData.status = payload.status;
            if (payload.isCompleted !== undefined) gameData.isCompleted = payload.isCompleted;
          } else if (subAction === "result") {
            // H-5: Only creator can set result
            if (authUser.id !== gameData.creatorId)
              return jsonResponse(res, 403, { success: false, message: "Only the creator can record results" });
            gameData.result = payload;
          }
          const updated = await db('games', `id=eq.${itemId}`, { method: 'PATCH', body: { data: gameData } });
          return jsonResponse(res, 200, { success: true, data: rowToObj(Array.isArray(updated) ? updated[0] : updated) });
        }
      }
    }

    // GROUPS
    if (action === "groups") {
      if (path === "/groups" && method === "GET") {
        const rows = await db('groups', 'select=*&order=created_at.desc');
        return jsonResponse(res, 200, { success: true, data: rows.map(rowToObj) });
      }
      if (itemId && method === "GET" && !subAction) {
        const rows = await db('groups', `id=eq.${itemId}&select=*`);
        if (!rows[0]) return jsonResponse(res, 404, { success: false, message: "Group not found" });
        return jsonResponse(res, 200, { success: true, data: rowToObj(rows[0]), group: rowToObj(rows[0]) });
      }
      if (!authUser) return jsonResponse(res, 401, { success: false, message: "Unauthorized" });
      if (method === "POST" && !itemId) {
        const payload = JSON.parse(body);
        const id = crypto.randomUUID();
        const groupData = { ...payload, id, adminIds: [authUser.id], memberIds: [authUser.id], chat: [], invitedUserIds: [], createdAt: new Date().toISOString() };
        const created = await db('groups', '', { method: 'POST', body: { id, data: groupData } });
        return jsonResponse(res, 201, { success: true, data: rowToObj(Array.isArray(created) ? created[0] : created) });
      }
      if (itemId) {
        const rows = await db('groups', `id=eq.${itemId}&select=*`);
        if (!rows[0]) return jsonResponse(res, 404, { success: false, message: "Group not found" });
        const groupData = rowToObj(rows[0]);
        if (method === "PUT") {
          // H-7: Only admin can edit group
          if (!(groupData.adminIds || []).includes(authUser.id))
            return jsonResponse(res, 403, { success: false, message: "Only admins can edit this group" });
          const payload = JSON.parse(body);
          const updated = await db('groups', `id=eq.${itemId}`, { method: 'PATCH', body: { data: { ...groupData, ...payload, id: itemId } } });
          return jsonResponse(res, 200, { success: true, data: rowToObj(Array.isArray(updated) ? updated[0] : updated) });
        }
        if (method === "DELETE") {
          // H-7: Only admin can delete group
          if (!(groupData.adminIds || []).includes(authUser.id))
            return jsonResponse(res, 403, { success: false, message: "Only admins can delete this group" });
          await db('groups', `id=eq.${itemId}`, { method: 'DELETE' });
          return jsonResponse(res, 200, { success: true });
        }
        if (method === "POST" && subAction) {
          const payload = JSON.parse(body);
          if (subAction === "join") {
            if (!groupData.memberIds) groupData.memberIds = [];
            if (!groupData.memberIds.includes(authUser.id)) groupData.memberIds.push(authUser.id);
          } else if (subAction === "leave") {
            if (!groupData.memberIds) groupData.memberIds = [];
            groupData.memberIds = groupData.memberIds.filter((id: string) => id !== authUser.id);
            if (groupData.adminIds) groupData.adminIds = groupData.adminIds.filter((id: string) => id !== authUser.id);
          } else if (subAction === "invite") {
            const invitedUserId = payload.invitedUserId;
            if (!invitedUserId || !isSafeId(invitedUserId)) return jsonResponse(res, 400, { success: false, message: "Invalid invitedUserId" });
            if (!groupData.invitedUserIds) groupData.invitedUserIds = [];
            if (!groupData.invitedUserIds.includes(invitedUserId)) groupData.invitedUserIds.push(invitedUserId);
          } else if (subAction === "chat") {
            if (!groupData.chat) groupData.chat = [];
            // M-4: Limit chat message length
            const text = (payload.text || '').slice(0, 1000).trim();
            if (!text) return jsonResponse(res, 400, { success: false, message: "Üzenet nem lehet üres" });
            groupData.chat.push({ id: crypto.randomUUID(), userId: authUser.id, userName: authUser.name, text, timestamp: new Date().toISOString() });
          }
          const updated = await db('groups', `id=eq.${itemId}`, { method: 'PATCH', body: { data: groupData } });
          return jsonResponse(res, 200, { success: true, data: rowToObj(Array.isArray(updated) ? updated[0] : updated) });
        }
      }
    }

    // NOTIFICATIONS
    // C-6: Require auth, only own notifications
    if (action === "notifications" && subAction !== "read") {
      if (!authUser) return jsonResponse(res, 401, { success: false, message: "Unauthorized" });
      // Always use authenticated user's ID — ignore itemId for security
      const targetId = authUser.id;
      const rows = await db('notifications', `user_id=eq.${targetId}&select=*&order=created_at.desc`);
      return jsonResponse(res, 200, { success: true, data: rows.map((r: any) => ({ ...(r.data || {}), id: r.id, userId: r.user_id, createdAt: r.created_at })) });
    }

    if (action === "notifications" && itemId && subAction === "read" && method === "POST") {
      if (!authUser) return jsonResponse(res, 401, { success: false, message: "Unauthorized" });
      try {
        const rows = await db('notifications', `id=eq.${itemId}&select=*`);
        if (rows[0]) {
          // Only allow marking own notifications as read
          if (rows[0].user_id !== authUser.id) return jsonResponse(res, 403, { success: false, message: "Forbidden" });
          const existing = rows[0].data || {};
          await db('notifications', `id=eq.${itemId}`, { method: 'PATCH', body: { data: { ...existing, read: true } } });
        }
      } catch { /* silent */ }
      return jsonResponse(res, 200, { success: true });
    }

    // CLUBS
    if (action === "clubs" && method === "GET") {
      return jsonResponse(res, 200, { success: true, data: [
        { id: '1', name: 'Elite Padel Club', address: 'Budapest', city: 'Budapest', location: { lat: 47.4979, lng: 19.0402 } },
        { id: '2', name: 'Padel Palace', address: 'Budapest', city: 'Budapest', location: { lat: 47.5100, lng: 19.0620 } }
      ]});
    }

    return jsonResponse(res, 404, { success: false, message: "Route not found" });

  } catch (error) {
    console.error('API Error:', error);
    // C-5: Never expose error details to client
    return jsonResponse(res, 500, { success: false, message: 'Internal server error' });
  }
}
