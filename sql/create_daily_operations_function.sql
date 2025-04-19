-- Function to get daily operations count
CREATE OR REPLACE FUNCTION get_daily_operations()
RETURNS TABLE (date DATE, operations BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(timestamp) AS date,
    COUNT(*) AS operations
  FROM 
    ai_operations
  GROUP BY 
    DATE(timestamp)
  ORDER BY 
    DATE(timestamp);
END;
$$ LANGUAGE plpgsql;
