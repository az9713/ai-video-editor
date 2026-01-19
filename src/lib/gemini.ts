import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { AIEditResult } from '@/types/transcript';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Function declaration for selecting clips
const selectClipsFunction: FunctionDeclaration = {
  name: 'select_clips',
  description: 'Select video clips based on the transcript analysis. Each clip should have a start time, end time, and reason for selection.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      clips: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            start: {
              type: SchemaType.NUMBER,
              description: 'Start time of the clip in seconds',
            },
            end: {
              type: SchemaType.NUMBER,
              description: 'End time of the clip in seconds',
            },
            reason: {
              type: SchemaType.STRING,
              description: 'Brief explanation of why this clip was selected',
            },
          },
          required: ['start', 'end', 'reason'],
        },
        description: 'Array of selected video clips with timestamps',
      },
    },
    required: ['clips'],
  },
};

export async function analyzeTranscriptForEditing(
  transcript: string,
  prompt: string,
  segments: { start: number; end: number; text: string }[]
): Promise<AIEditResult> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    tools: [{ functionDeclarations: [selectClipsFunction] }],
  });

  // Format the transcript with timestamps for the model
  const formattedTranscript = segments
    .map(seg => `[${seg.start.toFixed(2)}s - ${seg.end.toFixed(2)}s]: ${seg.text}`)
    .join('\n');

  const systemPrompt = `You are a video editor assistant. Analyze the following transcript and select clips based on the user's editing instructions.

TRANSCRIPT:
${formattedTranscript}

USER INSTRUCTIONS: ${prompt}

Based on the instructions, identify the relevant segments from the transcript and call the select_clips function with the appropriate timestamps. Be precise with the start and end times. If no relevant clips are found, return an empty clips array.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = result.response;

    // Check for function call
    const functionCall = response.candidates?.[0]?.content?.parts?.find(
      part => 'functionCall' in part
    );

    if (functionCall && 'functionCall' in functionCall && functionCall.functionCall) {
      const args = functionCall.functionCall.args as { clips: AIEditResult['clips'] } | undefined;
      return { clips: args?.clips || [] };
    }

    // If no function call, try to parse from text response
    const text = response.text();
    console.log('Gemini response (no function call):', text);

    return { clips: [] };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
