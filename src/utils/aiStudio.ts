/**
 * AI STUDIO UTILITY (PHOTOROOM INTEGRATION)
 * -----------------------------------------
 * Orchestrates the "Diamond Studio" transformation logic.
 * 1. Background Removal: Precision isolation of the product.
 * 2. Studio Background: Pure white (#FFFFFF) professional backdrop.
 * 3. AI Shadows: Generates "ai.soft" realistic contact shadows.
 * 4. Normalization: Center alignment with 10% safety padding.
 */

const PHOTOROOM_API_ENDPOINT = 'https://image-api.photoroom.com/v2/edit';

export interface AIStudioResponse {
  blob: Blob;
  creditsUsed: number;
}

/**
 * processProductInDiamondStudio: High-end visual cleanup via Photoroom API.
 */
export async function processProductInDiamondStudio(
  imageFile: File | Blob, 
  apiKey: string
): Promise<Blob> {
  if (!apiKey) throw new Error('Photoroom API anahtarı eksik.');

  const formPayload = new FormData();
  formPayload.append('imageFile', imageFile);
  
  // DIAMOND STUDIO RECIPE (Parameters optimized for B2B Catalog)
  formPayload.append('background.prompt', 'Professional product photography in a clean white studio, centered, front view, sharp focus, soft lighting');
  formPayload.append('background.color', '#ffffff');
  formPayload.append('shadow.mode', 'ai.soft'); // High-end contact shadow
  formPayload.append('padding', '0.1');       // 10% safe zone for consistent grid
  formPayload.append('center', 'true');        // Perfect optical centering

  const apiResponse = await fetch(PHOTOROOM_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
    },
    body: formPayload,
  });

  if (!apiResponse.ok) {
    const errorBody = await apiResponse.json().catch(() => ({}));
    console.error('AI Studio API Error:', errorBody);
    throw new Error(errorBody.message || `AI Studio servisi şu an yanıt vermiyor (${apiResponse.status})`);
  }

  return await apiResponse.blob();
}

/**
 * isPhotoroomConfigured: Utility to check if Diamond Studio is ready to fire.
 */
export const isAIStudioReady = (apiKey?: string): boolean => {
  return !!apiKey && apiKey.length > 10;
};
