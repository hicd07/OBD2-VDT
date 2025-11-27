import { GEMINI_API_URL, getAIDiagnosticPrompt } from '@/constants/config';
import { DTCCode, Vehicle } from '@/types/obd2';

export interface AIDiagnosticResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface ServiceProcedureResponse {
  success: boolean;
  procedure?: string;
  error?: string;
}

export interface LikelyCausesResponse {
  success: boolean;
  causes?: string[];
  error?: string;
}

class AIService {
  private apiKey: string | null = null;
  private supabaseUrl: string | null = null;
  private supabaseAnonKey: string | null = null;

  constructor() {
    this.supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || null;
    this.supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || null;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async getLikelyCauses(dtcCode: string): Promise<LikelyCausesResponse> {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      return {
        success: false,
        error: 'Database connection not configured'
      };
    }

    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/dtc_likely_causes?dtc_code=eq.${dtcCode}`,
        {
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Database query failed: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0 && data[0].causes) {
        return {
          success: true,
          causes: data[0].causes
        };
      }

      return {
        success: true,
        causes: []
      };
    } catch (error) {
      console.error('Error fetching likely causes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch likely causes'
      };
    }
  }

  async getDiagnosticAnalysis(dtcCode: DTCCode, vehicle: Vehicle): Promise<AIDiagnosticResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Gemini API key not configured. Please set your API key in Settings.'
      };
    }

    try {
      const prompt = getAIDiagnosticPrompt(
        dtcCode.code,
        vehicle.year,
        vehicle.brand,
        vehicle.model
      );

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content.parts[0].text;
        return {
          success: true,
          content
        };
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('AI diagnostic error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get AI analysis'
      };
    }
  }

  async getServiceProcedure(dtcCode: string, vehicle: Vehicle, language: string = 'English'): Promise<ServiceProcedureResponse> {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      return {
        success: false,
        error: 'Database connection not configured'
      };
    }

    try {
      const edgeFunctionUrl = `${this.supabaseUrl}/functions/v1/generate-service-procedure`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify({
          dtcCode,
          year: vehicle.year,
          brand: vehicle.brand,
          model: vehicle.model,
          language
        })
      });

      if (!response.ok) {
        throw new Error(`Edge function failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.procedure) {
        return {
          success: true,
          procedure: data.procedure
        };
      } else {
        throw new Error(data.error || 'Failed to generate procedure');
      }
    } catch (error) {
      console.error('Service procedure error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate service procedure'
      };
    }
  }
}

export const aiService = new AIService();