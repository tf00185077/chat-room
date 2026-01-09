export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "剛剛";
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} 小時前`;

  const diffDays = Math.floor(diffMins / 1440);
  if (diffDays < 7) return `${diffDays} 天前`;

  // 使用固定格式避免 hydration error
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  return `${monthNames[month - 1]}${day}日`;
}
