
import { GoogleGenAI, Modality } from "@google/genai";
import { FormState, Quality } from '../types';

if (!process.env.API_KEY) {
    // In a real app, you'd want to handle this more gracefully.
    // For this environment, we assume it's set.
    console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

// Helper to detect if text is likely Vietnamese
const isVietnamese = (text: string) => {
    const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    return vietnameseRegex.test(text);
};

// Helper to translate text to English using Gemini
const translateToEnglish = async (text: string): Promise<string> => {
    if (!isVietnamese(text)) return text;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text to English, keeping the core meaning and tone. Only return the translated text, with no extra formatting or explanations:\n\n"${text}"`
        });
        return response.text.trim();
    } catch (error) {
        console.error("Translation failed, using original text.", error);
        return text; // Fallback to original text on error
    }
};

const getInfluencePrompt = (strength: number): string => {
    if (strength <= 20) return "The generated image should be loosely inspired by the character in the reference image.";
    if (strength <= 40) return "The generated image should be inspired by the character in the reference image.";
    if (strength <= 60) return "The generated image should be based on the character in the reference image.";
    if (strength <= 80) return "The generated image should closely match the character in the reference image.";
    return "The generated image should be a photorealistic version of the character in the reference image, maintaining all key features.";
};

export const generateCharacterImages = async (formState: FormState): Promise<string[]> => {
    const referenceImageFile = formState.images[0];
    if (!referenceImageFile) {
        throw new Error("No reference image provided.");
    }
    
    let base64Image = await fileToBase64(referenceImageFile);

    // Note: Background removal is a complex task. For this demo, we'll assume the model
    // can handle it as part of the main prompt. A true implementation might use a separate
    // background removal API or a dedicated Gemini call, which would increase latency.
    
    const characterDesc = await translateToEnglish(formState.characterDesc);
    const sceneDesc = await translateToEnglish(formState.sceneDesc);

    let prompt = `${characterDesc}. ${sceneDesc}.`;

    if (formState.influenceEnabled) {
        prompt += ` ${getInfluencePrompt(formState.influenceStrength)}`;
    }
    
    if (formState.removeBackground) {
        prompt += ` The character should be isolated on a transparent or simple studio background.`
    }

    prompt += " The final image should be highly detailed, photorealistic, with natural daylight, HDR cinematic quality, and a shallow depth of field.";
    
    // The gemini-2.5-flash-image-preview model is best for editing. To get 3 distinct images, 
    // we'll make 3 parallel calls.
    const generationPromises = Array(3).fill(0).map(() => 
        ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: referenceImageFile.type } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        })
    );

    const responses = await Promise.all(generationPromises);
    
    const imageUrls: string[] = [];
    responses.forEach(response => {
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64Bytes = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    imageUrls.push(`data:${mimeType};base64,${base64Bytes}`);
                    break; // Take the first image part from each response
                }
            }
        }
    });

    if (imageUrls.length === 0) {
        throw new Error("The AI failed to generate images. Please try modifying your prompt.");
    }

    return imageUrls;
};
