"use client";

import { useState, useCallback } from "react";
import { useAppStore, useCurrentConversation } from "@/store";
import type { ThinkingPhase } from "@/types";

export function useChat() {
  const {
    settings,
    isStreaming,
    currentPhase,
    streamingContent,
    setStreaming,
    setCurrentPhase,
    setStreamingContent,
    addMessage,
    updateMessage,
    createConversation,
    currentConversationId,
  } = useAppStore();

  const conversation = useCurrentConversation();
  const [error, setError] = useState<string | null>(null);

  const runThreePhaseChat = useCallback(
    async (
      convId: string,
      messageId: string,
      messages: { role: "user" | "assistant"; content: string }[]
    ) => {
      const phases: ThinkingPhase[] = ["thinking", "questioning", "polishing"];
      let accumulatedContent = "";
      let finalContent = "";

      for (const phase of phases) {
        setCurrentPhase(phase);
        updateMessage(convId, messageId, { thinkingPhase: phase });

        const phaseMessages =
          phase === "thinking"
            ? messages
            : [
                ...messages,
                { role: "assistant" as const, content: accumulatedContent },
                {
                  role: "user" as const,
                  content:
                    phase === "questioning"
                      ? "请审视你的回答，找出不足之处"
                      : "请基于反思给出最终答复",
                },
              ];

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: phaseMessages,
            apiKey: settings.apiKey,
            model: settings.model,
            systemPrompt: settings.systemPrompt,
            phase,
            username: settings.username,
          }),
        });

        if (!response.ok) {
          throw new Error("API 请求失败");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("无法读取响应流");

        const decoder = new TextDecoder();
        let phaseContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                phaseContent += text;
                
                if (phase === "polishing") {
                  finalContent = phaseContent;
                  setStreamingContent(finalContent);
                  updateMessage(convId, messageId, { content: finalContent });
                }
              } catch {
                // 忽略解析错误
              }
            }
          }
        }

        accumulatedContent += `\n\n---\n\n${phaseContent}`;
      }

      updateMessage(convId, messageId, {
        content: finalContent,
        thinkingPhase: "complete",
      });
    },
    [settings, setCurrentPhase, updateMessage, setStreamingContent]
  );

  const runSingleChat = useCallback(
    async (
      convId: string,
      messageId: string,
      messages: { role: "user" | "assistant"; content: string }[]
    ) => {
      setCurrentPhase("polishing");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          apiKey: settings.apiKey,
          model: settings.model,
          systemPrompt: settings.systemPrompt,
          phase: "polishing",
          username: settings.username,
        }),
      });

      if (!response.ok) {
        throw new Error("API 请求失败");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              content += text;
              setStreamingContent(content);
              updateMessage(convId, messageId, { content });
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      updateMessage(convId, messageId, {
        content,
        thinkingPhase: "complete",
      });
    },
    [settings, setCurrentPhase, setStreamingContent, updateMessage]
  );

  const generateFollowUp = useCallback(
    async (convId: string, messageId: string) => {
      try {
        const conv = useAppStore.getState().conversations.find((c) => c.id === convId);
        if (!conv) return;

        const context = conv.messages
          .slice(-4)
          .map((m) => `${m.role === "user" ? "用户" : "AI"}: ${m.content}`)
          .join("\n\n");

        const response = await fetch("/api/followup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context,
            apiKey: settings.apiKey,
            model: settings.model,
            followUpPrompt: settings.followUpPrompt,
          }),
        });

        if (response.ok) {
          const { questions } = await response.json();
          if (questions && questions.length > 0) {
            updateMessage(convId, messageId, { followUpQuestions: questions });
          }
        }
      } catch {
        // 追问生成失败不影响主流程
      }
    },
    [settings, updateMessage]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!settings.apiKey) {
        setError("请先在设置中配置 API Key");
        return;
      }

      setError(null);
      setStreaming(true);

      let convId = currentConversationId;
      if (!convId) {
        convId = createConversation();
      }

      // 添加用户消息
      addMessage(convId, { role: "user", content });

      const messages = [
        ...(conversation?.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user" as const, content },
      ];

      // 添加 AI 消息占位
      const aiMessageId = `msg_${Date.now()}_ai`;
      addMessage(convId, {
        role: "assistant",
        content: "",
        thinkingPhase: "thinking",
      });

      // 获取刚添加的消息 ID
      const currentConv = useAppStore.getState().conversations.find((c) => c.id === convId);
      const lastMessage = currentConv?.messages[currentConv.messages.length - 1];
      const messageId = lastMessage?.id || aiMessageId;

      try {
        if (settings.enableThreePhase) {
          // 三段式回复
          await runThreePhaseChat(convId, messageId, messages);
        } else {
          // 单次回复
          await runSingleChat(convId, messageId, messages);
        }

        // 生成追问
        await generateFollowUp(convId, messageId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "请求失败");
        updateMessage(convId, messageId, {
          content: "抱歉，请求失败。请检查网络和 API Key 设置。",
          thinkingPhase: "complete",
        });
      } finally {
        setStreaming(false);
        setCurrentPhase(null);
        setStreamingContent("");
      }
    },
    [
      settings,
      conversation,
      currentConversationId,
      setStreaming,
      setCurrentPhase,
      setStreamingContent,
      addMessage,
      updateMessage,
      createConversation,
      runThreePhaseChat,
      runSingleChat,
      generateFollowUp,
    ]
  );

  return {
    sendMessage,
    isStreaming,
    currentPhase,
    streamingContent,
    error,
  };
}
