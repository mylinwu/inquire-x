import type { Settings } from "@/types";

/**
 * 导出设置为 JSON 文件
 */
export function exportSettingsToJSON(settings: Settings): void {
  const dataStr = JSON.stringify(settings, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `inquire-x-settings-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 从 JSON 文件导入设置
 */
export function importSettingsFromJSON(file: File): Promise<Settings> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const settings = JSON.parse(content) as Settings;
        
        // 基础验证
        if (!settings.apiKey || !settings.model) {
          throw new Error("设置文件格式不正确或缺少必要字段");
        }
        
        resolve(settings);
      } catch (error) {
        reject(new Error(`导入失败: ${error instanceof Error ? error.message : "未知错误"}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("文件读取失败"));
    };
    
    reader.readAsText(file);
  });
}
