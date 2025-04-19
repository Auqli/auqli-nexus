-- Function to create the pending_tasks table
CREATE OR REPLACE FUNCTION create_pending_tasks_table()
RETURNS void AS $$
BEGIN
  -- Create the pending_tasks table if it doesn't exist
  CREATE TABLE IF NOT EXISTS pending_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL REFERENCES ai_operations(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    result JSONB,
    error TEXT
  );
  
  -- Create an index on operation_id for faster lookups
  CREATE INDEX IF NOT EXISTS idx_pending_tasks_operation_id ON pending_tasks(operation_id);
  
  -- Create an index on status for filtering
  CREATE INDEX IF NOT EXISTS idx_pending_tasks_status ON pending_tasks(status);
END;
$$ LANGUAGE plpgsql;
