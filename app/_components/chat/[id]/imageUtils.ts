// 圖片壓縮工具函數

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB 原始大小限制
const MAX_WIDTH = 1024; // 壓縮後最大寬度
const MAX_HEIGHT = 1024; // 壓縮後最大高度
const JPEG_QUALITY = 0.8; // JPEG 壓縮品質

/**
 * 壓縮圖片並轉換為 base64 data URL
 * @param file 圖片檔案
 * @returns Promise<string> base64 data URL
 */
export function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // 驗證檔案大小
    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error(`圖片大小不能超過 ${MAX_IMAGE_SIZE / 1024 / 1024}MB`));
      return;
    }

    // 驗證檔案類型
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      reject(new Error("只支援 JPG、PNG 或 WebP 格式的圖片"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 計算縮放比例
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // 創建 canvas 繪製壓縮後的圖片
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("無法創建 canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

        const base64Size = base64.length * 0.75;
        const maxBase64Size = 5 * 1024 * 1024;

        if (base64Size > maxBase64Size) {
          reject(new Error("壓縮後圖片仍然太大，請選擇較小的圖片"));
          return;
        }

        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error("無法載入圖片"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("無法讀取檔案"));
    };

    reader.readAsDataURL(file);
  });
}
