export const prefixPath = import.meta.env.VITE_FIREBASE_DB_PREFIX || 'release';
// const prefixPath = 'release';

export const usersDbPath = `${prefixPath}/user_db`;
export const usersTgDbPath = `${prefixPath}/tg_user_db`;
export const thresholdMessageDBPath = `${prefixPath}/scan_threshold_message_db`;
// export const thresholdDataDBPath = `${formatNow}`;

//   const formatNow = () => {
//     const d = new Date();
//     const pad = (n) => n.toString().padStart(2, '0');
//     const day = pad(d.getDate());
//     const month = pad(d.getMonth() + 1);
//     const year = d.getFullYear();
//     return `${year}/${month}/${day}`;
//   };

export function thresholdDataDBPath() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  return `${prefixPath}/scan_threshold_db/${currentYear}/${currentMonth}/${currentDay}`;
}