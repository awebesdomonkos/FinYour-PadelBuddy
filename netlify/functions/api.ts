import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "padelbuddy_super_secret_2026_xK9mQ3nP7rL2wZ8vY4tH6jF1cB5dA0eG";
const SB_URL = "https://hzykbqyeulkxnwynzhkl.supabase.co";
const SB_KEY = process.env.SUPABASE_KEY || "sb_publishable_po9cipQR7-Z_9DtpjJU5lw_uLcSXYcT";

const jsonResponse = (statusCode: number, body: any) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
  },
  body: JSON.stringify(body),
});

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
  const { password, password_hash, ...safe } = u;
  return safe;
}

function rowToObj(row: any): any {
  if (!row) return null;
  const { data, created_at, ...cols } = row;
  return { ...cols, ...(data || {}) };
}

export const handler: Handler = async (event: HandlerEvent, _ctx: HandlerContext) => {
  if (event.httpMethod === "OPTIONS") return jsonResponse(200, { message: "OK" });

  try {
    const { httpMethod: method, body } = event;
    const rawPath = event.path || '';
    const path = rawPath.replace('/.netlify/functions/api', '').replace('/api', '');
    const segments = path.split('/').filter(Boolean);
    const action = segments[0] || '';
    const itemId = segments[1] || '';
    const subAction = segments[2] || '';

    if (path === "/health") return jsonResponse(200, { success: true, message: "API running with Supabase" });

    const verifyAuth = async (tokenStr?: string) => {
      if (!tokenStr) return null;
      try {
        const decoded: any = jwt.verify(tokenStr, JWT_SECRET);
        const rows = await db('users', `id=eq.${decoded.userId}&select=*`);
        return rows[0] || null;
      } catch { return null; }
    };

    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const tokenStr = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const authRow = await verifyAuth(tokenStr);
    const authUser = authRow ? rowToUser(authRow) : null;

    // REGISTER
    if (path === "/register" && method === "POST") {
      const userData = JSON.parse(body || "{}");
      const { name, email, password } = userData;
      if (!name || !email || !password || password.length < 6)
        return jsonResponse(400, { success: false, message: "Invalid input data" });
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await db('users', `email=eq.${encodeURIComponent(normalizedEmail)}&select=id`);
      if (existing.length > 0) return jsonResponse(400, { success: false, message: "Email already exists" });
      const id = Math.random().toString(36).substr(2, 9);
      const password_hash = await bcrypt.hash(password, 10);
      const { password: _p, email: _e, name: _n, ...restData } = userData;
      const row = {
        id, email: normalizedEmail, name, password_hash,
        data: {
          ...restData,
          username: userData.username || name.toLowerCase().replace(/\s+/g, '_'),
          skillLevel: userData.skillLevel || 'Bronze',
          location: userData.location || { lat: 0, lng: 0, city: '' },
          friendIds: [], blockedUserIds: [], favoritePlayerIds: [],
          notificationSettings: { nearGames: true, reminders: true, groups: true, friends: true, requests: true },
          privacySettings: { publicProfile: true, showMatchHistory: true, showSocialLinks: true },
          createdAt: new Date().toISOString(),
        }
      };
      const created = await db('users', '', { method: 'POST', body: row });
      const newRow = Array.isArray(created) ? created[0] : created;
      const token = jwt.sign({ userId: id, email: normalizedEmail }, JWT_SECRET, { expiresIn: "7d" });
      const user = safeUser(newRow);
      return jsonResponse(201, { success: true, token, user, data: user });
    }

    // LOGIN
    if (path === "/login" && method === "POST") {
      const { email, password } = JSON.parse(body || "{}");
      const normalizedEmail = (email || '').toLowerCase().trim();
      const rows = await db('users', `email=eq.${encodeURIComponent(normalizedEmail)}&select=*`);
      const row = rows[0];
      if (!row || !(await bcrypt.compare(password, row.password_hash)))
        return jsonResponse(401, { success: false, message: "Invalid credentials" });
      const token = jwt.sign({ userId: row.id, email: row.email }, JWT_SECRET, { expiresIn: "7d" });
      const user = safeUser(row);
      return jsonResponse(200, { success: true, token, user, data: user });
    }

    // ME
    if (path === "/me" && method === "GET") {
      if (!authUser) return jsonResponse(401, { success: false, message: "Unauthorized" });
      return jsonResponse(200, { success: true, user: safeUser(authRow), data: safeUser(authRow) });
    }

    // USERS
    if (action === "users") {
      if (path === "/users" && method === "GET") {
        const rows = await db('users', 'select=*');
        return jsonResponse(200, { success: true, data: rows.map(safeUser) });
      }
      if (itemId && method === "GET" && !subAction) {
        const rows = await db('users', `id=eq.${itemId}&select=*`);
        if (!rows[0]) return jsonResponse(404, { success: false, message: "User not found" });
        return jsonResponse(200, { success: true, data: safeUser(rows[0]), user: safeUser(rows[0]) });
      }
      if (itemId && method === "PUT") {
        if (!authUser || authUser.id !== itemId) return jsonResponse(403, { success: false, message: "Forbidden" });
        const payload = JSON.parse(body || "{}");
        const rows = await db('users', `id=eq.${itemId}&select=*`);
        if (!rows[0]) return jsonResponse(404, { success: false, message: "User not found" });
        const currentData = rows[0].data || {};
        const { email, password, password_hash, id, name, ...payloadRest } = payload;
        const nameUpdate = name ? { name } : {};
        const updated = await db('users', `id=eq.${itemId}`, { method: 'PATCH', body: { ...nameUpdate, data: { ...currentData, ...payloadRest } } });
        const user = safeUser(Array.isArray(updated) ? updated[0] : updated);
        return jsonResponse(200, { success: true, data: user, user });
      }
      if (itemId && method === "POST" && subAction && authUser) {
        const payload = JSON.parse(body || "{}");
        const rows = await db('users', `id=eq.${authUser.id}&select=*`);
        const currentData = rows[0]?.data || {};
        if (subAction === "block") {
          let ids = currentData.blockedUserIds || [];
          ids = ids.includes(itemId) ? ids.filter((x: string) => x !== itemId) : [...ids, itemId];
          const updated = await db('users', `id=eq.${authUser.id}`, { method: 'PATCH', body: { data: { ...currentData, blockedUserIds: ids } } });
          return jsonResponse(200, { success: true, data: safeUser(Array.isArray(updated) ? updated[0] : updated) });
        }
        if (subAction === "favorite") {
          let ids = currentData.favoritePlayerIds || [];
          const tid = payload.targetUserId;
          ids = ids.includes(tid) ? ids.filter((x: string) => x !== tid) : [...ids, tid];
          const updated = await db('users', `id=eq.${authUser.id}`, { method: 'PATCH', body: { data: { ...currentData, favoritePlayerIds: ids } } });
          return jsonResponse(200, { success: true, data: safeUser(Array.isArray(updated) ? updated[0] : updated) });
        }
      }
    }

    // FRIENDS
    if (action === "friends") {
      if (!authUser) return jsonResponse(401, { success: false, message: "Unauthorized" });
      if (method === "GET") {
        const reqs = await db('friend_requests', `or=(from_user_id.eq.${authUser.id},to_user_id.eq.${authUser.id})&select=*`);
        return jsonResponse(200, { success: true, data: reqs.map((r: any) => ({ id: r.id, fromUserId: r.from_user_id, toUserId: r.to_user_id, status: r.status, createdAt: r.created_at })) });
      }
      if (itemId === "request" && method === "POST") {
        const { toUserId } = JSON.parse(body || "{}");
        const created = await db('friend_requests', '', { method: 'POST', body: { id: Math.random().toString(36).substr(2, 9), from_user_id: authUser.id, to_user_id: toUserId, status: 'pending', created_at: new Date().toISOString() } });
        const req = Array.isArray(created) ? created[0] : created;
        return jsonResponse(201, { success: true, data: { id: req.id, fromUserId: req.from_user_id, toUserId: req.to_user_id, status: req.status, createdAt: req.created_at } });
      }
      if (itemId === "respond" && method === "POST") {
        const { requestId, status } = JSON.parse(body || "{}");
        const reqs = await db('friend_requests', `id=eq.${requestId}&select=*`);
        if (!reqs[0]) return jsonResponse(404, { success: false, message: "Request not found" });
        const req = reqs[0];
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
        }
        const updated = await db('users', `id=eq.${authUser.id}&select=*`);
        return jsonResponse(200, { success: true, data: safeUser(updated[0]), user: safeUser(updated[0]) });
      }
    }

    // GAMES
    if (action === "games") {
      if (path === "/games" && method === "GET") {
        const rows = await db('games', 'select=*&order=created_at.desc');
        return jsonResponse(200, { success: true, data: rows.map(rowToObj) });
      }
      if (itemId && method === "GET" && !subAction) {
        const rows = await db('games', `id=eq.${itemId}&select=*`);
        if (!rows[0]) return jsonResponse(404, { success: false, message: "Game not found" });
        const game = rowToObj(rows[0]);
        return jsonResponse(200, { success: true, data: game, game });
      }
      if (!authUser) return jsonResponse(401, { success: false, message: "Unauthorized" });
      if (method === "POST" && !itemId) {
        const payload = JSON.parse(body || "{}");
        const id = Math.random().toString(36).substr(2, 9);
        const gameData = { ...payload, id, creatorId: authUser.id, joinedPlayers: [authUser.id], requests: [], chat: [], status: payload.status || 'scheduled', createdAt: new Date().toISOString() };
        const created = await db('games', '', { method: 'POST', body: { id, data: gameData } });
        return jsonResponse(201, { success: true, data: rowToObj(Array.isArray(created) ? created[0] : created) });
      }
      if (itemId) {
        const rows = await db('games', `id=eq.${itemId}&select=*`);
        if (!rows[0]) return jsonResponse(404, { success: false, message: "Game not found" });
        const gameData = rowToObj(rows[0]);
        if (method === "PUT") {
          const payload = JSON.parse(body || "{}");
          const updated = await db('games', `id=eq.${itemId}`, { method: 'PATCH', body: { data: { ...gameData, ...payload, id: itemId } } });
          return jsonResponse(200, { success: true, data: rowToObj(Array.isArray(updated) ? updated[0] : updated) });
        }
        if (method === "DELETE") { await db('games', `id=eq.${itemId}`, { method: 'DELETE' }); return jsonResponse(200, { success: true }); }
        if (method === "POST" && subAction) {
          const payload = JSON.parse(body || "{}");
          if (subAction === "request") {
            if (!gameData.requests) gameData.requests = [];
            if (!gameData.requests.find((r: any) => r.userId === authUser.id)) gameData.requests.push({ userId: authUser.id, userName: authUser.name, status: 'pending', timestamp: new Date().toISOString() });
          } else if (subAction === "approve") {
            const { userId, approve } = payload;
            const rIdx = (gameData.requests || []).findIndex((r: any) => r.userId === userId);
            if (rIdx !== -1) { gameData.requests[rIdx].status = approve ? 'approved' : 'rejected'; if (approve && !gameData.joinedPlayers.includes(userId)) gameData.joinedPlayers.push(userId); }
          } else if (subAction === "join") {
            if (!gameData.joinedPlayers.includes(authUser.id)) gameData.joinedPlayers.push(authUser.id);
          } else if (subAction === "chat") {
            if (!gameData.chat) gameData.chat = [];
            gameData.chat.push({ id: Math.random().toString(36).substr(2, 9), userId: authUser.id, userName: authUser.name, text: payload.text, timestamp: new Date().toISOString() });
          } else if (subAction === "attendance") { gameData.attendanceRecords = payload.attendanceRecords; }
            else if (subAction === "result") { gameData.result = payload; }
          const updated = await db('games', `id=eq.${itemId}`, { method: 'PATCH', body: { data: gameData } });
          return jsonResponse(200, { success: true, data: rowToObj(Array.isArray(updated) ? updated[0] : updated) });
        }
      }
    }

    // GROUPS
    if (action === "groups") {
      if (path === "/groups" && method === "GET") {
        const rows = await db('groups', 'select=*&order=created_at.desc');
        return jsonResponse(200, { success: true, data: rows.map(rowToObj) });
      }
      if (itemId && method === "GET" && !subAction) {
        const rows = await db('groups', `id=eq.${itemId}&select=*`);
        if (!rows[0]) return jsonResponse(404, { success: false, message: "Group not found" });
        return jsonResponse(200, { success: true, data: rowToObj(rows[0]), group: rowToObj(rows[0]) });
      }
      if (!authUser) return jsonResponse(401, { success: false, message: "Unauthorized" });
      if (method === "POST" && !itemId) {
        const payload = JSON.parse(body || "{}");
        const id = Math.random().toString(36).substr(2, 9);
        const groupData = { ...payload, id, adminIds: [authUser.id], memberIds: [authUser.id], chat: [], invitedUserIds: [], createdAt: new Date().toISOString() };
        const created = await db('groups', '', { method: 'POST', body: { id, data: groupData } });
        return jsonResponse(201, { success: true, data: rowToObj(Array.isArray(created) ? created[0] : created) });
      }
      if (itemId) {
        const rows = await db('groups', `id=eq.${itemId}&select=*`);
        if (!rows[0]) return jsonResponse(404, { success: false, message: "Group not found" });
        const groupData = rowToObj(rows[0]);
        if (method === "PUT") {
          const payload = JSON.parse(body || "{}");
          const updated = await db('groups', `id=eq.${itemId}`, { method: 'PATCH', body: { data: { ...groupData, ...payload, id: itemId } } });
          return jsonResponse(200, { success: true, data: rowToObj(Array.isArray(updated) ? updated[0] : updated) });
        }
        if (method === "DELETE") { await db('groups', `id=eq.${itemId}`, { method: 'DELETE' }); return jsonResponse(200, { success: true }); }
        if (method === "POST" && subAction) {
          const payload = JSON.parse(body || "{}");
          if (subAction === "join") { if (!groupData.memberIds.includes(authUser.id)) groupData.memberIds.push(authUser.id); }
          else if (subAction === "invite") { if (!groupData.invitedUserIds) groupData.invitedUserIds = []; if (!groupData.invitedUserIds.includes(payload.invitedUserId)) groupData.invitedUserIds.push(payload.invitedUserId); }
          else if (subAction === "chat") { if (!groupData.chat) groupData.chat = []; groupData.chat.push({ id: Math.random().toString(36).substr(2, 9), userId: authUser.id, userName: authUser.name, text: payload.text, timestamp: new Date().toISOString() }); }
          const updated = await db('groups', `id=eq.${itemId}`, { method: 'PATCH', body: { data: groupData } });
          return jsonResponse(200, { success: true, data: rowToObj(Array.isArray(updated) ? updated[0] : updated) });
        }
      }
    }

    // NOTIFICATIONS
    if (action === "notifications") {
      const targetId = itemId === 'me' ? authUser?.id : itemId;
      if (!targetId) return jsonResponse(200, { success: true, data: [] });
      const rows = await db('notifications', `user_id=eq.${targetId}&select=*&order=created_at.desc`);
      return jsonResponse(200, { success: true, data: rows.map((r: any) => ({ ...(r.data || {}), id: r.id, userId: r.user_id })) });
    }

    // CLUBS
    if (action === "clubs" && method === "GET") {
      return jsonResponse(200, { success: true, data: [
        { id: '1', name: 'Elite Padel Club', address: 'Budapest', city: 'Budapest', location: { lat: 47.4979, lng: 19.0402 } },
        { id: '2', name: 'Padel Palace', address: 'Budapest', city: 'Budapest', location: { lat: 47.5100, lng: 19.0620 } }
      ]});
    }

    return jsonResponse(404, { success: false, message: "Route not found", path });

  } catch (error) {
    console.error('API Error:', error);
    return jsonResponse(500, { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
  }
};
