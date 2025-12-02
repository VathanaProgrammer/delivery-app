import { reactive } from "vue";
import langDataJson from "@/lang.json" with { type: "json" };
import type { LangData, LangStrings } from "@/types/lang.ts";
import { useLangStore } from "@/store/langStore.ts";

const langData = langDataJson as LangData;

interface AlertOptions {
  type?: "success" | "error" | "info";
  messageKey?: string; // key in lang JSON like "welcomeBack"
  messageParams?: Record<string, string>; // dynamic replacements
  title?: string;
}

export const alertState = reactive({
  visible: false,
  type: "success" as "success" | "error" | "info",
  message: "",
  title: "",
  isKhmer: false,
});

function replaceParams(text: string, params?: Record<string, string>) {
  if (!params) return text;
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replace(`{${key}}`, value),
    text
  );
}

export function showAlert(options: AlertOptions) {
  const langStore = useLangStore();
  const currentLang = langStore.currentLang as keyof LangData;

  const defaultTitles = {
    success: langData[currentLang].success,
    error: langData[currentLang].error,
    info: langData[currentLang].info,
  };

  alertState.type = options.type || "success";
  alertState.title = options.title || defaultTitles[alertState.type];

if (options.messageKey) {
  const key = options.messageKey as keyof LangStrings; // ✅ tell TS this is valid
  const msgTemplate = langData[currentLang][key] || "";
  alertState.message = replaceParams(msgTemplate, options.messageParams);
} else {
  alertState.message = "";
}


  alertState.isKhmer = currentLang === "kh";
  alertState.visible = true;
}

export function closeAlert() {
  alertState.visible = false;
}
