"use client";

import { useState, useCallback } from "react";
import { useAppStore, useCurrentConversation } from "@/store";
import { PHASE_USER_MESSAGES } from "@/config";
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
    deleteMessage,
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
      const phases: ThinkingPhase[] = ["drafting", "questioning", "polishing"];
      let accumulatedContent = "";
      let finalContent = "";

      for (const phase of phases) {
        setCurrentPhase(phase);
        updateMessage(convId, messageId, { thinkingPhase: phase });

        const phaseMessages =
          phase === "drafting"
            ? messages
            : [
                ...messages,
                { role: "assistant" as const, content: accumulatedContent },
                {
                  role: "user" as const,
                  content: PHASE_USER_MESSAGES[phase as keyof typeof PHASE_USER_MESSAGES],
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
            temperature: settings.temperature,
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
            } else if (line.startsWith("g:")) {
              // 思考模型的 reasoning 数据，显示"思考中"状态
              setCurrentPhase("thinking");
              updateMessage(convId, messageId, { thinkingPhase: "thinking" });
            }
          }
        }

        accumulatedContent += `

---

${phaseContent}`;
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
          temperature: settings.temperature,
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

        let isReasoning = false;
        for (const line of lines) {
          if (line.startsWith("g:")) {
            // 思考模型的 reasoning 数据，显示"思考中"状态
            if (!isReasoning) {
              isReasoning = true;
              setCurrentPhase("thinking");
              updateMessage(convId, messageId, { thinkingPhase: "thinking" });
            }
          } else if (line.startsWith("0:")) {
            try {
              // 当开始输出文本时，切换到 polishing 状态
              if (isReasoning) {
                isReasoning = false;
                setCurrentPhase("polishing");
                updateMessage(convId, messageId, { thinkingPhase: "polishing" });
              }
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
      const initialPhase = settings.enableThreePhase ? "drafting" : "polishing";
      addMessage(convId, {
        role: "assistant",
        content: "",
        thinkingPhase: initialPhase,
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

  const regenerateMessage = useCallback(
    async (messageId: string) => {
      if (!settings.apiKey || !currentConversationId) {
        setError("请先在设置中配置 API Key");
        return;
      }

      const conv = useAppStore.getState().conversations.find((c) => c.id === currentConversationId);
      if (!conv) return;

      // 找到要重新生成的消息的索引
      const messageIndex = conv.messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) return;

      // 找到这条 AI 消息之前的用户消息
      let userMessageIndex = messageIndex - 1;
      while (userMessageIndex >= 0 && conv.messages[userMessageIndex].role !== "user") {
        userMessageIndex--;
      }
      if (userMessageIndex < 0) return;

      const userMessage = conv.messages[userMessageIndex];

      // 删除当前 AI 消息
      deleteMessage(currentConversationId, messageId);

      setError(null);
      setStreaming(true);

      // 构建消息历史（不包含被删除的消息）
      const messages = conv.messages
        .slice(0, messageIndex)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // 添加新的 AI 消息占位
      const initialPhase = settings.enableThreePhase ? "drafting" : "polishing";
      addMessage(currentConversationId, {
        role: "assistant",
        content: "",
        thinkingPhase: initialPhase,
      });

      // 获取新消息 ID
      const updatedConv = useAppStore.getState().conversations.find((c) => c.id === currentConversationId);
      const newMessage = updatedConv?.messages[updatedConv.messages.length - 1];
      const newMessageId = newMessage?.id || `msg_${Date.now()}_ai`;

      try {
        if (settings.enableThreePhase) {
          await runThreePhaseChat(currentConversationId, newMessageId, messages);
        } else {
          await runSingleChat(currentConversationId, newMessageId, messages);
        }
        await generateFollowUp(currentConversationId, newMessageId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "请求失败");
        updateMessage(currentConversationId, newMessageId, {
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
      currentConversationId,
      setStreaming,
      setCurrentPhase,
      setStreamingContent,
      addMessage,
      updateMessage,
      deleteMessage,
    ]
  );

  return {
    sendMessage,
    regenerateMessage,
    isStreaming,
    currentPhase,
    streamingContent,
    error,
  };
}
