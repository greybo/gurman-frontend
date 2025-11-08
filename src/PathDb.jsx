export const prefixPath = import.meta.env.VITE_FIREBASE_DB_PREFIX || 'release';
// const prefixPath = 'release';

export const usersDbPath = `${prefixPath}/user_db`;
export const usersTgDbPath = `${prefixPath}/tg_user_db`;
export const DB_PATH = `${prefixPath}/scan_threshold_message_db`;