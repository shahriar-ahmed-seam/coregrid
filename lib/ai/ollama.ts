/**
 * Ollama AI Service for CoreGrid ERP
 * 
 * This service provides a privacy-first AI integration using local Ollama models.
 * All data processing happens on-premises, ensuring sensitive business data never
 * leaves the organization's infrastructure.
 */

import prisma from "@/lib/prisma";

// ==========================================
// CONFIGURATION
// ==========================================

const OLLAMA_BASE_URL = process.env.OLLAMA_API_URL || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const DEFAULT_TIMEOUT = 120000; // 2 minutes

// ==========================================
// TYPES
// ==========================================

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  stream?: boolean;
  context?: number[];
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
  };
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response?: string;
  message?: OllamaMessage;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

export interface AIAnalysisResult {
  success: boolean;
  data?: unknown;
  error?: string;
  tokensUsed?: number;
  duration?: number;
}

// ==========================================
// ERROR CLASSES
// ==========================================

export class OllamaError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = "OllamaError";
  }
}

export class OllamaConnectionError extends OllamaError {
  constructor(message: string = "Cannot connect to Ollama server") {
    super(message);
    this.name = "OllamaConnectionError";
  }
}

export class OllamaModelError extends OllamaError {
  constructor(model: string) {
    super(`Model '${model}' not found. Please pull it with: ollama pull ${model}`);
    this.name = "OllamaModelError";
  }
}

// ==========================================
// CORE OLLAMA CLIENT
// ==========================================

class OllamaClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = OLLAMA_BASE_URL, timeout: number = DEFAULT_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Check if Ollama server is running and accessible
   */
  async isHealthy(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new OllamaError("Failed to list models", response.status);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      if (error instanceof OllamaError) throw error;
      throw new OllamaConnectionError();
    }
  }

  /**
   * Check if a specific model is available
   */
  async hasModel(modelName: string): Promise<boolean> {
    const models = await this.listModels();
    return models.some((m) => m.name === modelName || m.name === `${modelName}:latest`);
  }

  /**
   * Generate a completion (simple prompt/response)
   */
  async generate(request: OllamaGenerateRequest): Promise<OllamaResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, stream: false }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes("model") && errorText.includes("not found")) {
          throw new OllamaModelError(request.model);
        }
        throw new OllamaError(`Generation failed: ${errorText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof OllamaError) throw error;
      if ((error as Error).name === "AbortError") {
        throw new OllamaError("Request timed out");
      }
      throw new OllamaConnectionError();
    }
  }

  /**
   * Chat completion with message history
   */
  async chat(request: OllamaChatRequest): Promise<OllamaResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, stream: false }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes("model") && errorText.includes("not found")) {
          throw new OllamaModelError(request.model);
        }
        throw new OllamaError(`Chat failed: ${errorText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof OllamaError) throw error;
      if ((error as Error).name === "AbortError") {
        throw new OllamaError("Request timed out");
      }
      throw new OllamaConnectionError();
    }
  }

  /**
   * Streaming chat for real-time responses
   */
  async *streamChat(
    request: OllamaChatRequest
  ): AsyncGenerator<OllamaResponse, void, unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, stream: true }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new OllamaError(`Stream failed: ${errorText}`, response.status);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new OllamaError("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              yield JSON.parse(line);
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof OllamaError) throw error;
      throw new OllamaConnectionError();
    }
  }
}

// ==========================================
// SINGLETON INSTANCE
// ==========================================

export const ollamaClient = new OllamaClient();

// ==========================================
// AI ASSISTANT SERVICE
// ==========================================

export class AIAssistant {
  private client: OllamaClient;
  private model: string;

  constructor(client: OllamaClient = ollamaClient, model: string = DEFAULT_MODEL) {
    this.client = client;
    this.model = model;
  }

  /**
   * Log an AI conversation to the database
   */
  private async logConversation(
    _userId: string,
    module: string,
    prompt: string,
    response: string,
    tokensUsed?: number
  ) {
    try {
      await prisma.aIConversation.create({
        data: {
          module,
          query: prompt,
          response,
          tokensUsed,
        },
      });
    } catch (error) {
      console.error("Failed to log AI conversation:", error);
    }
  }

  /**
   * Analyze sales data and provide insights
   */
  async analyzeSales(
    userId: string,
    data: {
      totalRevenue: number;
      salesCount: number;
      averageOrderValue: number;
      topProducts: Array<{ name: string; revenue: number }>;
      recentTrend: "up" | "down" | "stable";
    }
  ): Promise<AIAnalysisResult> {
    const prompt = `You are a sales analyst AI assistant for an enterprise ERP system. Analyze the following sales data and provide actionable insights:

Sales Summary:
- Total Revenue: $${data.totalRevenue.toLocaleString()}
- Number of Sales: ${data.salesCount}
- Average Order Value: $${data.averageOrderValue.toFixed(2)}
- Recent Trend: ${data.recentTrend}

Top Products by Revenue:
${data.topProducts.map((p, i) => `${i + 1}. ${p.name}: $${p.revenue.toLocaleString()}`).join("\n")}

Provide:
1. Key observations (2-3 bullet points)
2. Recommendations for improvement (2-3 actionable items)
3. Risk assessment (any concerns or red flags)

Keep your response concise and professional.`;

    try {
      const response = await this.client.generate({
        model: this.model,
        prompt,
        options: { temperature: 0.7, num_predict: 500 },
      });

      await this.logConversation(
        userId,
        "CRM",
        prompt,
        response.response || "",
        response.eval_count
      );

      return {
        success: true,
        data: response.response,
        tokensUsed: response.eval_count,
        duration: response.total_duration,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Analyze inventory and suggest optimizations
   */
  async analyzeInventory(
    userId: string,
    data: {
      totalProducts: number;
      lowStockItems: Array<{ name: string; quantity: number; reorderPoint: number }>;
      overStockItems: Array<{ name: string; quantity: number; avgMonthlySales: number }>;
      inventoryValue: number;
    }
  ): Promise<AIAnalysisResult> {
    const prompt = `You are an inventory management AI assistant for an enterprise ERP system. Analyze the following inventory data:

Inventory Overview:
- Total Products: ${data.totalProducts}
- Total Inventory Value: $${data.inventoryValue.toLocaleString()}

Low Stock Items (needs attention):
${data.lowStockItems.length === 0 ? "None" : data.lowStockItems.map((i) => `- ${i.name}: ${i.quantity} units (reorder at ${i.reorderPoint})`).join("\n")}

Overstock Items (excess inventory):
${data.overStockItems.length === 0 ? "None" : data.overStockItems.map((i) => `- ${i.name}: ${i.quantity} units (avg. monthly sales: ${i.avgMonthlySales})`).join("\n")}

Provide:
1. Immediate actions needed (prioritized list)
2. Reorder recommendations
3. Cost optimization suggestions
4. Predicted stockout risks

Be specific with product names and quantities.`;

    try {
      const response = await this.client.generate({
        model: this.model,
        prompt,
        options: { temperature: 0.5, num_predict: 600 },
      });

      await this.logConversation(
        userId,
        "INVENTORY",
        prompt,
        response.response || "",
        response.eval_count
      );

      return {
        success: true,
        data: response.response,
        tokensUsed: response.eval_count,
        duration: response.total_duration,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Analyze HR data and provide workforce insights
   */
  async analyzeHR(
    userId: string,
    data: {
      totalEmployees: number;
      departmentDistribution: Record<string, number>;
      pendingLeaveRequests: number;
      employeesByStatus: Record<string, number>;
      avgTenure: number;
    }
  ): Promise<AIAnalysisResult> {
    const prompt = `You are an HR analytics AI assistant for an enterprise ERP system. Analyze the following workforce data:

Workforce Overview:
- Total Employees: ${data.totalEmployees}
- Average Tenure: ${data.avgTenure.toFixed(1)} years
- Pending Leave Requests: ${data.pendingLeaveRequests}

Department Distribution:
${Object.entries(data.departmentDistribution).map(([dept, count]) => `- ${dept}: ${count} employees`).join("\n")}

Employee Status:
${Object.entries(data.employeesByStatus).map(([status, count]) => `- ${status}: ${count}`).join("\n")}

Provide:
1. Workforce health assessment
2. Potential staffing concerns
3. Recommendations for employee engagement
4. Department balance analysis

Focus on actionable HR insights.`;

    try {
      const response = await this.client.generate({
        model: this.model,
        prompt,
        options: { temperature: 0.6, num_predict: 500 },
      });

      await this.logConversation(
        userId,
        "HR",
        prompt,
        response.response || "",
        response.eval_count
      );

      return {
        success: true,
        data: response.response,
        tokensUsed: response.eval_count,
        duration: response.total_duration,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Analyze financial data and provide insights
   */
  async analyzeFinance(
    userId: string,
    data: {
      totalRevenue: number;
      totalExpenses: number;
      netProfit: number;
      outstandingInvoices: number;
      overdueAmount: number;
      expensesByCategory: Record<string, number>;
    }
  ): Promise<AIAnalysisResult> {
    const profitMargin = data.totalRevenue > 0 
      ? ((data.netProfit / data.totalRevenue) * 100).toFixed(1)
      : "0";

    const prompt = `You are a financial analyst AI assistant for an enterprise ERP system. Analyze the following financial data:

Financial Summary:
- Total Revenue: $${data.totalRevenue.toLocaleString()}
- Total Expenses: $${data.totalExpenses.toLocaleString()}
- Net Profit: $${data.netProfit.toLocaleString()}
- Profit Margin: ${profitMargin}%

Accounts Receivable:
- Outstanding Invoices: ${data.outstandingInvoices}
- Overdue Amount: $${data.overdueAmount.toLocaleString()}

Expense Breakdown:
${Object.entries(data.expensesByCategory).map(([cat, amount]) => `- ${cat}: $${amount.toLocaleString()}`).join("\n")}

Provide:
1. Financial health assessment
2. Cash flow concerns or opportunities
3. Cost reduction recommendations
4. Collection strategy for overdue invoices
5. Budget optimization suggestions

Use specific numbers and percentages.`;

    try {
      const response = await this.client.generate({
        model: this.model,
        prompt,
        options: { temperature: 0.5, num_predict: 600 },
      });

      await this.logConversation(
        userId,
        "FINANCE",
        prompt,
        response.response || "",
        response.eval_count
      );

      return {
        success: true,
        data: response.response,
        tokensUsed: response.eval_count,
        duration: response.total_duration,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Analyze project data and provide insights
   */
  async analyzeProjects(
    userId: string,
    data: {
      totalProjects: number;
      projectsByStatus: Record<string, number>;
      overdueTasks: number;
      avgProjectProgress: number;
      teamUtilization: number;
    }
  ): Promise<AIAnalysisResult> {
    const prompt = `You are a project management AI assistant for an enterprise ERP system. Analyze the following project portfolio data:

Project Portfolio:
- Total Projects: ${data.totalProjects}
- Average Progress: ${data.avgProjectProgress.toFixed(0)}%
- Team Utilization: ${data.teamUtilization.toFixed(0)}%
- Overdue Tasks: ${data.overdueTasks}

Projects by Status:
${Object.entries(data.projectsByStatus).map(([status, count]) => `- ${status}: ${count} projects`).join("\n")}

Provide:
1. Portfolio health assessment
2. Resource allocation recommendations
3. Risk identification (overdue/at-risk projects)
4. Capacity planning suggestions
5. Process improvement ideas

Focus on practical PM insights.`;

    try {
      const response = await this.client.generate({
        model: this.model,
        prompt,
        options: { temperature: 0.6, num_predict: 500 },
      });

      await this.logConversation(
        userId,
        "PROJECTS",
        prompt,
        response.response || "",
        response.eval_count
      );

      return {
        success: true,
        data: response.response,
        tokensUsed: response.eval_count,
        duration: response.total_duration,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * General chat for any module context
   */
  async chat(
    userId: string,
    module: string,
    messages: OllamaMessage[],
    systemPrompt?: string
  ): Promise<AIAnalysisResult> {
    const defaultSystem = `You are an AI assistant for CoreGrid ERP system, helping with the ${module} module. 
Be concise, professional, and provide actionable insights. 
When analyzing data, use specific numbers and percentages.
If you don't have enough information, ask clarifying questions.`;

    const allMessages: OllamaMessage[] = [
      { role: "system", content: systemPrompt || defaultSystem },
      ...messages,
    ];

    try {
      const response = await this.client.chat({
        model: this.model,
        messages: allMessages,
        options: { temperature: 0.7, num_predict: 800 },
      });

      const assistantMessage = response.message?.content || "";

      await this.logConversation(
        userId,
        module,
        messages[messages.length - 1]?.content || "",
        assistantMessage,
        response.eval_count
      );

      return {
        success: true,
        data: assistantMessage,
        tokensUsed: response.eval_count,
        duration: response.total_duration,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// ==========================================
// SINGLETON ASSISTANT
// ==========================================

export const aiAssistant = new AIAssistant();

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get AI service status
 */
export async function getAIStatus(): Promise<{
  available: boolean;
  models: OllamaModel[];
  defaultModel: string;
  hasDefaultModel: boolean;
}> {
  try {
    const isHealthy = await ollamaClient.isHealthy();
    if (!isHealthy) {
      return {
        available: false,
        models: [],
        defaultModel: DEFAULT_MODEL,
        hasDefaultModel: false,
      };
    }

    const models = await ollamaClient.listModels();
    const hasDefaultModel = models.some(
      (m) => m.name === DEFAULT_MODEL || m.name === `${DEFAULT_MODEL}:latest`
    );

    return {
      available: true,
      models,
      defaultModel: DEFAULT_MODEL,
      hasDefaultModel,
    };
  } catch {
    return {
      available: false,
      models: [],
      defaultModel: DEFAULT_MODEL,
      hasDefaultModel: false,
    };
  }
}
