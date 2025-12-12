import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "scss",
  "json",
  "yaml",
  "xml",
  "markdown",
  "bash",
  "shell",
  "powershell",
  "dockerfile",
  "plaintext",
];

export const getHighlighter = async (): Promise<Highlighter> => {
  if (highlighter) return highlighter;

  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: SUPPORTED_LANGUAGES,
    });
  }

  highlighter = await highlighterPromise;
  return highlighter;
};

export const highlightCode = async (
  code: string,
  language: string,
  theme: "light" | "dark" = "light"
): Promise<string> => {
  try {
    const hl = await getHighlighter();
    const lang = SUPPORTED_LANGUAGES.includes(language.toLowerCase())
      ? language.toLowerCase()
      : "plaintext";

    return hl.codeToHtml(code, {
      lang,
      theme: theme === "dark" ? "github-dark" : "github-light",
    });
  } catch {
    return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
  }
};

const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
