-- Create the pending_tasks table
CREATE TABLE IF NOT EXISTS pending_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES ai_operations(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  result JSONB,
  error TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_tasks_operation_id ON pending_tasks(operation_id);
CREATE INDEX IF NOT EXISTS idx_pending_tasks_status ON pending_tasks(status);
