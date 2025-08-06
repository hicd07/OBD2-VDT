import { GEMINI_API_URL, getAIDiagnosticPrompt } from '@/constants/config';
import { DTCCode, Vehicle } from '@/types/obd2';

export interface AIDiagnosticResponse {
  success: boolean;
  content?: string;
  error?: string;
}

class AIService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
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
}

export const aiService = new AIService();