export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  // 使用固定格式避免 hydration 錯誤（不依賴 locale）
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
