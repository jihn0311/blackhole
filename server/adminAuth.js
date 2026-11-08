import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
export function passwordRecord(password) {
  const salt = randomBytes(32).toString("hex");
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}
export function passwordMatches(password, record) {
  if (
    typeof password !== "string" ||
    password.length > 256 ||
    !record?.salt ||
    !/^[a-f0-9]{128}$/.test(record.hash || "")
  )
    return false;
  return timingSafeEqual(
    scryptSync(password, record.salt, 64),
    Buffer.from(record.hash, "hex"),
  );
}
export function createSessions() {
  const sessions = new Map();
  return {
    create() {
      const token = randomBytes(32).toString("hex");
      sessions.set(token, Date.now() + 8 * 60 * 60 * 1000);
      return token;
    },
    valid(token) {
      for (const [id, expires] of sessions)
        if (expires <= Date.now()) sessions.delete(id);
      return sessions.has(token);
    },
    remove(token) {
      sessions.delete(token);
    },
  };
}
