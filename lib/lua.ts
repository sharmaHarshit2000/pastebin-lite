export const FETCH_AND_DECR_LUA = `
-- KEYS[1] = paste key
-- ARGV[1] = now_ms
local key = KEYS[1]
local now = tonumber(ARGV[1])

-- not found
if redis.call("EXISTS", key) == 0 then
  return { 0 }
end

-- expired
local expires_at = redis.call("HGET", key, "expires_at_ms")
if expires_at and tonumber(expires_at) <= now then
  redis.call("DEL", key)
  return { 0 }
end

local content = redis.call("HGET", key, "content") or ""

-- view-limited?
local rv = redis.call("HGET", key, "remaining_views")
if rv then
  local remaining = tonumber(rv) or 0
  if remaining <= 0 then
    redis.call("DEL", key)
    return { 0 }
  end

  remaining = remaining - 1

  if remaining <= 0 then
    redis.call("DEL", key)
  else
    redis.call("HSET", key, "remaining_views", tostring(remaining))
  end

  return { 1, content, tostring(remaining), expires_at or "" }
end

-- unlimited views
return { 1, content, "", expires_at or "" }
`;

export const READ_NO_DECR_LUA = `
-- KEYS[1] = paste key
-- ARGV[1] = now_ms
local key = KEYS[1]
local now = tonumber(ARGV[1])

if redis.call("EXISTS", key) == 0 then
  return { 0 }
end

local expires_at = redis.call("HGET", key, "expires_at_ms")
if expires_at and tonumber(expires_at) <= now then
  redis.call("DEL", key)
  return { 0 }
end

local rv = redis.call("HGET", key, "remaining_views")
if rv and (tonumber(rv) or 0) <= 0 then
  redis.call("DEL", key)
  return { 0 }
end

local content = redis.call("HGET", key, "content") or ""
return { 1, content, rv or "", expires_at or "" }
`;
