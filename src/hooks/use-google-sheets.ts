import { useQuery } from '@tanstack/react-query';
import { callMCPTool, type MCPToolResponse } from '@/sdk/core/mcp-client';

// ============================================================================
// MCP Response wrapper interface - MANDATORY for all MCP tool calls
// ============================================================================

/**
 * Standard MCP tool response format that wraps actual tool data.
 * All MCP tools return responses in this format where the actual data
 * is a JSON string in content[0].text that must be parsed.
 */
export interface MCPToolResponseWrapper {
  content: Array<{
    type: "text";
    text: string; // JSON string containing actual tool data
  }>;
}

// ============================================================================
// GOOGLESHEETS_BATCH_GET - Input/Output Interfaces
// ============================================================================

/**
 * Input parameters for GOOGLESHEETS_BATCH_GET tool
 */
export interface BatchGetInput {
  /** The unique identifier of the Google Spreadsheet from which data will be retrieved */
  spreadsheet_id: string;
  /**
   * A list of cell ranges in A1 notation (e.g., 'Sheet1!A1:B2', 'A1:C5') from which to retrieve data.
   * If omitted or empty, all data from the first sheet of the spreadsheet will be fetched.
   */
  ranges?: string[];
}

/**
 * Value range object returned by Google Sheets API
 */
export interface ValueRange {
  range: string;
  majorDimension?: string;
  values?: Array<Array<string | number | boolean>>;
}

/**
 * Output data from GOOGLESHEETS_BATCH_GET tool
 */
export interface BatchGetOutput {
  data: {
    spreadsheet_data: {
      spreadsheetId: string;
      valueRanges?: ValueRange[];
    };
  };
  error?: string | null;
  successful: boolean;
}

// ============================================================================
// GOOGLESHEETS_SEARCH_SPREADSHEETS - Input/Output Interfaces
// ============================================================================

/**
 * Input parameters for GOOGLESHEETS_SEARCH_SPREADSHEETS tool
 */
export interface SearchSpreadsheetsInput {
  /**
   * Search query to filter spreadsheets. Can search by name (name contains 'budget'),
   * full text content (fullText contains 'sales'), or use complex queries with operators.
   * Leave empty to get all spreadsheets.
   */
  query?: string | null;
  /** Maximum number of spreadsheets to return (1-1000). Defaults to 10. */
  max_results?: number | null;
  /** Order results by field. Common options: 'modifiedTime desc', 'name', 'createdTime desc' */
  order_by?: string | null;
  /** Whether to include spreadsheets in trash. Defaults to false. */
  include_trashed?: boolean | null;
  /** Whether to return only starred spreadsheets. Defaults to false. */
  starred_only?: boolean | null;
  /** Whether to return only spreadsheets shared with the current user. Defaults to false. */
  shared_with_me?: boolean | null;
  /** Return spreadsheets created after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'. */
  created_after?: string | null;
  /** Return spreadsheets modified after this date. Use RFC 3339 format like '2024-01-01T00:00:00Z'. */
  modified_after?: string | null;
}

/**
 * Spreadsheet metadata returned by search
 */
export interface SpreadsheetMetadata {
  id: string;
  name: string;
  modifiedTime: string;
  createdTime: string;
  webViewLink: string;
  [key: string]: unknown;
}

/**
 * Output data from GOOGLESHEETS_SEARCH_SPREADSHEETS tool
 */
export interface SearchSpreadsheetsOutput {
  data: {
    spreadsheets: SpreadsheetMetadata[];
    total_found: number;
    next_page_token?: string | null;
  };
  error?: string | null;
  successful: boolean;
}

// ============================================================================
// Application-specific Prompt interfaces
// ============================================================================

/**
 * Prompt object parsed from Google Sheet row data
 *
 * Google Sheet columns:
 * - id: Date in YYYY-MM-DD format (doubles as publish_date)
 * - prompt: The prompt title/concept
 * - description: Full description of the prompt
 * - category: Category (e.g., "Fantasy", "Sci-Fi", "Cozy")
 * - tags: Comma-separated keywords
 */
export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publish_date: string;
}

// ============================================================================
// GOOGLESHEETS_BATCH_GET Hook
// ============================================================================

/**
 * Hook to fetch data from Google Sheets using GOOGLESHEETS_BATCH_GET tool.
 *
 * @param params - Input parameters including spreadsheet_id and optional ranges
 * @param enabled - Whether the query should run. Defaults to true.
 * @returns TanStack Query result with spreadsheet data
 *
 * @example
 * ```ts
 * const { data, isLoading, error } = useGoogleSheetsBatchGet({
 *   spreadsheet_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
 *   ranges: ['Sheet1!A1:H100']
 * });
 * ```
 */
export function useGoogleSheetsBatchGet(
  params?: BatchGetInput,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['google-sheets-batch-get', params],
    queryFn: async () => {
      if (!params?.spreadsheet_id) {
        throw new Error('spreadsheet_id is required for GOOGLESHEETS_BATCH_GET');
      }

      // CRITICAL: Use MCPToolResponseWrapper and parse JSON response
      const mcpResponse = await callMCPTool<MCPToolResponseWrapper, BatchGetInput>(
        '686de48c6fd1cae1afbb55ba',
        'GOOGLESHEETS_BATCH_GET',
        params
      );

      if (!mcpResponse.content?.[0]?.text) {
        throw new Error('Invalid MCP response format: missing content[0].text');
      }

      try {
        const toolData: BatchGetOutput = JSON.parse(mcpResponse.content[0].text);

        if (!toolData.successful) {
          throw new Error(toolData.error || 'GOOGLESHEETS_BATCH_GET failed');
        }

        return toolData;
      } catch (parseError) {
        throw new Error(
          `Failed to parse MCP response JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
        );
      }
    },
    enabled: enabled && !!params?.spreadsheet_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// GOOGLESHEETS_SEARCH_SPREADSHEETS Hook
// ============================================================================

/**
 * Hook to search for spreadsheets using GOOGLESHEETS_SEARCH_SPREADSHEETS tool.
 *
 * @param params - Search parameters including query, max_results, order_by, etc.
 * @param enabled - Whether the query should run. Defaults to true.
 * @returns TanStack Query result with matching spreadsheets
 *
 * @example
 * ```ts
 * const { data, isLoading, error } = useGoogleSheetsSearchSpreadsheets({
 *   query: "name contains 'prompts'",
 *   max_results: 10,
 *   order_by: 'modifiedTime desc'
 * });
 * ```
 */
export function useGoogleSheetsSearchSpreadsheets(
  params?: SearchSpreadsheetsInput,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['google-sheets-search-spreadsheets', params],
    queryFn: async () => {
      // CRITICAL: Use MCPToolResponseWrapper and parse JSON response
      const mcpResponse = await callMCPTool<MCPToolResponseWrapper, SearchSpreadsheetsInput>(
        '686de48c6fd1cae1afbb55ba',
        'GOOGLESHEETS_SEARCH_SPREADSHEETS',
        params || {}
      );

      if (!mcpResponse.content?.[0]?.text) {
        throw new Error('Invalid MCP response format: missing content[0].text');
      }

      try {
        const toolData: SearchSpreadsheetsOutput = JSON.parse(mcpResponse.content[0].text);

        if (!toolData.successful) {
          throw new Error(toolData.error || 'GOOGLESHEETS_SEARCH_SPREADSHEETS failed');
        }

        return toolData;
      } catch (parseError) {
        throw new Error(
          `Failed to parse MCP response JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
        );
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ============================================================================
// Application-specific Hook: useGoogleSheetsPrompts
// ============================================================================

/**
 * Parameters for useGoogleSheetsPrompts hook
 */
export interface GoogleSheetsPromptsParams {
  /** The spreadsheet ID containing prompt data */
  spreadsheet_id: string;
  /** Optional range in A1 notation. Defaults to fetching all data from first sheet. */
  range?: string;
}

/**
 * Hook to fetch and parse prompt data from a Google Sheet.
 *
 * This hook fetches data from a Google Sheet and automatically parses it into
 * Prompt objects. The sheet should have columns for:
 * - id (YYYY-MM-DD date string, doubles as publish_date)
 * - prompt (full description text)
 * - theme (category string)
 * - difficulty ('Beginner' | 'Intermediate' | 'Advanced')
 * - tags (semicolon-separated string)
 * - constraints (optional artistic restrictions)
 *
 * @param params - Parameters including spreadsheet_id and optional range
 * @param enabled - Whether the query should run. Defaults to true.
 * @returns TanStack Query result with parsed Prompt array
 *
 * @example
 * ```ts
 * const { data: prompts, isLoading, error } = useGoogleSheetsPrompts({
 *   spreadsheet_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
 *   range: 'Sheet1!A1:H100'
 * });
 * ```
 */
export function useGoogleSheetsPrompts(
  params?: GoogleSheetsPromptsParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['google-sheets-prompts', params],
    queryFn: async () => {
      if (!params?.spreadsheet_id) {
        throw new Error('spreadsheet_id is required for useGoogleSheetsPrompts');
      }

      // Build batch get params
      const batchGetParams: BatchGetInput = {
        spreadsheet_id: params.spreadsheet_id,
        ...(params.range && { ranges: [params.range] }),
      };

      // CRITICAL: Use MCPToolResponseWrapper and parse JSON response
      const mcpResponse = await callMCPTool<MCPToolResponseWrapper, BatchGetInput>(
        '686de48c6fd1cae1afbb55ba',
        'GOOGLESHEETS_BATCH_GET',
        batchGetParams
      );

      if (!mcpResponse.content?.[0]?.text) {
        throw new Error('Invalid MCP response format: missing content[0].text');
      }

      let toolData: BatchGetOutput;
      try {
        toolData = JSON.parse(mcpResponse.content[0].text);
      } catch (parseError) {
        throw new Error(
          `Failed to parse MCP response JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
        );
      }

      if (!toolData.successful) {
        throw new Error(toolData.error || 'Failed to fetch Google Sheets data');
      }

      // Extract values from the response
      const spreadsheetData = toolData.data.spreadsheet_data;
      let rows: Array<Array<string | number | boolean>> = [];

      if (spreadsheetData.valueRanges && spreadsheetData.valueRanges.length > 0) {
        // If ranges were specified, use the first value range
        rows = spreadsheetData.valueRanges[0].values || [];
      }

      if (rows.length === 0) {
        return [];
      }

      // First row is header
      const headers = rows[0].map(h => String(h).toLowerCase());
      const dataRows = rows.slice(1);

      // Parse rows into Prompt objects
      const prompts: Prompt[] = dataRows
        .filter(row => row && row.length > 0)
        .map((row): Prompt => {
          const getCell = (columnName: string): string => {
            const index = headers.indexOf(columnName.toLowerCase());
            if (index === -1) return '';
            const value = row[index];
            return value !== undefined && value !== null ? String(value) : '';
          };

          // Google Sheet format: id is the date (YYYY-MM-DD)
          const id = getCell('id');
          // The 'prompt' column contains the title
          const title = getCell('prompt') || 'Untitled Prompt';
          // The 'description' column contains the full description
          const description = getCell('description');
          // Category (e.g., "Fantasy", "Sci-Fi", "Cozy")
          const category = getCell('category');
          // Tags are comma-separated
          const tagsRaw = getCell('tags');
          // In this sheet format, 'id' IS the publish_date
          const publish_date = id;

          // Parse tags (comma-separated)
          let tags: string[] = [];
          if (tagsRaw) {
            tags = tagsRaw.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
          }

          return {
            id,
            title,
            description,
            category,
            tags,
            publish_date,
          };
        })
        .filter(prompt => prompt.id && prompt.description); // Filter out invalid rows (need id and description)

      return prompts;
    },
    enabled: enabled && !!params?.spreadsheet_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
