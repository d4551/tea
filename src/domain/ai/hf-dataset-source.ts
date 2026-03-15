import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";

const logger = createLogger("ai.hf-dataset-source");
const DATASET_SERVER_BASE_URL = "https://datasets-server.huggingface.co";

export interface HfDatasetSnippet {
  readonly id: string;
  readonly text: string;
  readonly source: string;
  readonly score: number;
}

interface HfDatasetRowsResponse {
  readonly rows?: readonly {
    readonly row?: Record<string, unknown>;
  }[];
}

const tokenize = (value: string): readonly string[] =>
  value
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fff]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

const scoreSnippet = (query: string, candidate: string): number => {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) {
    return 0;
  }

  const candidateTokens = new Set(tokenize(candidate));
  let overlap = 0;
  for (const token of queryTokens) {
    if (candidateTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / queryTokens.size;
};

const toTextFromRecord = (record: Record<string, unknown>): string => {
  if (
    appConfig.ai.ragHfDatasetTextColumn &&
    typeof record[appConfig.ai.ragHfDatasetTextColumn] === "string"
  ) {
    return (record[appConfig.ai.ragHfDatasetTextColumn] as string).trim();
  }

  let longest = "";
  for (const value of Object.values(record)) {
    if (typeof value !== "string") {
      continue;
    }
    const normalized = value.trim();
    if (normalized.length > longest.length) {
      longest = normalized;
    }
  }
  return longest;
};

const resolveAuthHeaders = (): HeadersInit => {
  const token =
    appConfig.ai.huggingfaceInference.apiKey ||
    appConfig.ai.huggingfaceEndpoints.apiKey ||
    "";
  return token.length > 0 ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchHfDatasetSnippets = async (
  query: string,
  limit: number,
): Promise<readonly HfDatasetSnippet[]> => {
  const dataset = appConfig.ai.ragHfDataset;
  const config = appConfig.ai.ragHfDatasetConfig;
  if (!dataset || !config) {
    return [];
  }

  const normalizedQuery = query.trim();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const split = appConfig.ai.ragHfDatasetSplit.trim() || "train";
  const sampleLength = Math.max(10, Math.min(100, limit * 8));
  const url = new URL(`${DATASET_SERVER_BASE_URL}/rows`);
  url.searchParams.set("dataset", dataset);
  url.searchParams.set("config", config);
  url.searchParams.set("split", split);
  url.searchParams.set("offset", "0");
  url.searchParams.set("length", String(sampleLength));

  try {
    const response = await fetch(url, {
      headers: resolveAuthHeaders(),
      signal: AbortSignal.timeout(appConfig.ai.requestTimeoutMs),
    });
    if (!response.ok) {
      logger.warn("hf.dataset.rows.failed", {
        dataset,
        config,
        split,
        status: response.status,
      });
      return [];
    }

    const payload = (await response.json()) as HfDatasetRowsResponse;
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const snippets = rows
      .map((entry, index) => {
        const row = entry.row;
        if (!row || typeof row !== "object") {
          return null;
        }
        const text = toTextFromRecord(row);
        if (text.length === 0) {
          return null;
        }
        const score = scoreSnippet(normalizedQuery, text);
        if (score <= 0) {
          return null;
        }
        return {
          id: `hf:${dataset}:${config}:${split}:${index}`,
          text,
          source: `hf://${dataset}/${config}/${split}`,
          score,
        } satisfies HfDatasetSnippet;
      })
      .filter((snippet): snippet is HfDatasetSnippet => snippet !== null)
      .sort((left, right) => right.score - left.score)
      .slice(0, Math.max(1, limit));

    return snippets;
  } catch (error) {
    logger.warn("hf.dataset.rows.exception", {
      dataset,
      config,
      split,
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
};

