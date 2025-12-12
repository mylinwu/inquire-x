import MarkdownIt from "markdown-it";
import taskLists from "markdown-it-task-lists";
import katex from "katex";

// 创建 markdown-it 实例
const createMarkdownRenderer = (safetyLevel: "strict" | "normal" | "loose" = "normal") => {
  const md = new MarkdownIt({
    html: safetyLevel === "loose",
    linkify: true,
    typographer: true,
    breaks: true,
  });

  // 添加任务列表支持
  md.use(taskLists, { enabled: true });

  // 添加 KaTeX 数学公式支持
  const mathInlineRule = (state: any, silent: boolean) => {
    const start = state.pos;
    const marker = state.src.charAt(start);

    if (marker !== "$") return false;

    const match = state.src.slice(start).match(/^\$([^\$]+)\$/);
    if (!match) return false;

    if (!silent) {
      const token = state.push("math_inline", "math", 0);
      token.markup = "$";
      token.content = match[1];
    }

    state.pos += match[0].length;
    return true;
  };

  const mathBlockRule = (state: any, startLine: number, endLine: number, silent: boolean) => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine];
    const maxPos = state.eMarks[startLine];

    if (startPos + 2 > maxPos) return false;
    if (state.src.slice(startPos, startPos + 2) !== "$$") return false;

    if (silent) return true;

    let nextLine = startLine;
    let found = false;

    while (nextLine < endLine) {
      nextLine++;
      if (nextLine >= endLine) break;

      const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
      const lineMax = state.eMarks[nextLine];

      if (state.src.slice(lineStart, lineMax).trim() === "$$") {
        found = true;
        break;
      }
    }

    if (!found) return false;

    const token = state.push("math_block", "math", 0);
    token.block = true;
    token.content = state.src
      .slice(state.bMarks[startLine + 1], state.bMarks[nextLine])
      .trim();
    token.map = [startLine, nextLine + 1];
    token.markup = "$$";

    state.line = nextLine + 1;
    return true;
  };

  md.inline.ruler.after("escape", "math_inline", mathInlineRule);
  md.block.ruler.after("fence", "math_block", mathBlockRule);

  md.renderer.rules.math_inline = (tokens: any[], idx: number) => {
    try {
      return katex.renderToString(tokens[idx].content, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return `<code>${tokens[idx].content}</code>`;
    }
  };

  md.renderer.rules.math_block = (tokens: any[], idx: number) => {
    try {
      return `<div class="katex-display">${katex.renderToString(tokens[idx].content, {
        throwOnError: false,
        displayMode: true,
      })}</div>`;
    } catch {
      return `<pre><code>${tokens[idx].content}</code></pre>`;
    }
  };

  return md;
};

let mdInstance: MarkdownIt | null = null;
let currentSafetyLevel: "strict" | "normal" | "loose" = "normal";

export const getMarkdownRenderer = (safetyLevel: "strict" | "normal" | "loose" = "normal") => {
  if (!mdInstance || currentSafetyLevel !== safetyLevel) {
    mdInstance = createMarkdownRenderer(safetyLevel);
    currentSafetyLevel = safetyLevel;
  }
  return mdInstance;
};

export const renderMarkdown = (
  content: string,
  safetyLevel: "strict" | "normal" | "loose" = "normal"
): string => {
  const md = getMarkdownRenderer(safetyLevel);
  return md.render(content);
};

// 流式渲染辅助 - 处理不完整的 Markdown
export const renderStreamingMarkdown = (
  content: string,
  safetyLevel: "strict" | "normal" | "loose" = "normal"
): { html: string; isIncomplete: boolean } => {
  let processedContent = content;
  let isIncomplete = false;

  // 检测未闭合的代码块
  const codeBlockMatches = content.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    isIncomplete = true;
    processedContent += "\n∿∿\n```";
  }

  // 检测未闭合的行内代码
  const inlineCodeMatches = content.match(/`[^`]*$/);
  if (inlineCodeMatches) {
    isIncomplete = true;
    processedContent += "`";
  }

  // 检测未闭合的数学公式
  const mathBlockMatches = content.match(/\$\$/g);
  if (mathBlockMatches && mathBlockMatches.length % 2 !== 0) {
    isIncomplete = true;
    processedContent += "\n$$";
  }

  const html = renderMarkdown(processedContent, safetyLevel);

  return { html, isIncomplete };
};
