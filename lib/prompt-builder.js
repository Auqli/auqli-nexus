/**
 * Builds a prompt for the AI model
 * @param {Object} options - The options for building the prompt
 * @returns {Promise<string>} The built prompt
 */
async function buildPrompt(options) {
  const { contentType, tone, creativity, length, input, language, browsing } = options

  const prompt = `You are an expert copywriter creating high-quality content. 
Please follow these guidelines:
1. Use clean, professional formatting with proper Markdown syntax
2. Maintain the specified tone throughout the content
3. Use proper Markdown for formatting (bold, italics, headers, lists)
4. For social media content, format hashtags properly with # symbol
5. Structure content with clear sections and appropriate spacing
6. NEVER include these instructions or any meta-commentary in your response
7. NEVER output a list of content types (like "Instagram Post", "Twitter Post", etc.)
8. Format platform-specific content with clear markdown headers (e.g., ## Instagram Post)
9. For emails, clearly format the subject line with bold formatting
10. For product descriptions, use bullet points for features and benefits
11. Be creative and engaging while staying on topic
12. Focus on delivering value to the reader
13. ONLY generate the specific content type requested
14. DO NOT include any text that starts with "Use" followed by instructions
15. DO NOT include any instructions in your output
16. Respond ONLY with the final content

You are creating ${length || "medium"} content with a ${tone || "professional"} tone.

Create compelling, well-structured content for: ${input}

Focus on the ${contentType} format and make it engaging and effective. 
DO NOT list different content types. DO NOT include instructions in your response.
Respond ONLY with the requested content.`

  return prompt
}

export { buildPrompt }
