-- Check if the CSV Converter tool exists
INSERT INTO ai_tools (name, description, tool_slug, category, is_active)
SELECT 'CSV Converter', 'Convert CSV data to various formats', 'converter', 'Data Processing', true
WHERE NOT EXISTS (
    SELECT 1 FROM ai_tools WHERE tool_slug = 'converter'
);
