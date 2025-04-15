// Super simplified config with no dynamic access
const config = {
  defaultModel: "stabilityai/stable-diffusion-xl-base-1.0",
  defaultNegativePrompt: "low quality, blurry",
  defaultEnhancement: "High quality, detailed image",
}

// Simple function with no dynamic property access
function enhancePrompt(prompt) {
  return prompt + ", " + config.defaultEnhancement
}

module.exports = {
  config,
  enhancePrompt,
}
