-- Check if the ai_tools table exists, if not create it
CREATE TABLE IF NOT EXISTS ai_tools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tool_slug VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the CSV Converter tool if it doesn't exist
INSERT INTO ai_tools (name, description, tool_slug, category)
SELECT 'CSV Converter', 'Convert and process CSV files', 'converter', 'Data Processing'
WHERE NOT EXISTS (
  SELECT 1 FROM ai_tools WHERE tool_slug = 'converter'
);

-- Insert other tools if they don't exist
INSERT INTO ai_tools (name, description, tool_slug, category)
SELECT 'CopyGen AI', 'Generate marketing copy', 'copygen', 'Content'
WHERE NOT EXISTS (
  SELECT 1 FROM ai_tools WHERE tool_slug = 'copygen'
);

INSERT INTO ai_tools (name, description, tool_slug, category)
SELECT 'ImageGen AI', 'Generate images', 'imagegen', 'Media'
WHERE NOT EXISTS (
  SELECT 1 FROM ai_tools WHERE tool_slug = 'imagegen'
);

INSERT INTO ai_tools (name, description, tool_slug, category)
SELECT 'BlogGen AI', 'Generate blog posts', 'bloggen', 'Content'
WHERE NOT EXISTS (
  SELECT 1 FROM ai_tools WHERE tool_slug = 'bloggen'
);

-- Ensure the ai_operations table exists
CREATE TABLE IF NOT EXISTS ai_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_id INTEGER NOT NULL REFERENCES ai_tools(id),
  input_meta JSONB,
  output_meta JSONB,
  status VARCHAR(50) DEFAULT 'success',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS ai_operations_user_id_idx ON ai_operations(user_id);
