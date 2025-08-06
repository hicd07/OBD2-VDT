export const AI_DIAGNOSTIC_PROMPT = `List the top 5 most likely causes for the <dtc_code> dtc code(s) on a <car_year> <car_brand> <car_model> also list the procedure to diagnose what is the exact cause of the issue for my vehicle, only answer in <language> Language. Only answer the question`;

export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// You can edit this prompt to customize the AI diagnostic response
export const getAIDiagnosticPrompt = (dtcCode: string, year: string, brand: string, model: string) => {
  return AI_DIAGNOSTIC_PROMPT
    .replace('<dtc_code>', dtcCode)
    .replace('<car_year>', year)
    .replace('<car_brand>', brand)
    .replace('<car_model>', model)
    .replace('<language>', 'spanish');
};