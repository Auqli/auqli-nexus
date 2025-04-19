-- Seed the ai_tools table with some example tools
INSERT INTO ai_tools (name, description, category, is_active, tool_slug)
VALUES
  ('Text Summarizer', 'Summarizes long text into concise summaries', 'text', true, 'text-summarizer'),
  ('Image Generator', 'Generates images from text descriptions', 'image', true, 'image-generator'),
  ('Code Assistant', 'Helps with coding tasks and debugging', 'code', true, 'code-assistant'),
  ('Translation Tool', 'Translates text between languages', 'text', true, 'translator'),
  ('Data Analyzer', 'Analyzes data and provides insights', 'data', true, 'data-analyzer')
ON CONFLICT (tool_slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;
