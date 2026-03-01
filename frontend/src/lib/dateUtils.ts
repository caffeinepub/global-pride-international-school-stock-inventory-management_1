/**
 * Returns today's date string in YYYY-MM-DD format using India Standard Time (IST, UTC+5:30).
 */
export function getISTDateString(): string {
  const now = new Date();
  // IST offset is UTC+5:30 = 330 minutes
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);
  // Use UTC methods on the shifted date to get IST calendar date
  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
