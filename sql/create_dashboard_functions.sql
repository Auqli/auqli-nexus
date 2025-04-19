-- Function for category distribution
CREATE OR REPLACE FUNCTION get_category_distribution()
RETURNS TABLE (category TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ai_tools.category,
    COUNT(ai_operations.id) AS count
  FROM 
    ai_operations
  JOIN
    ai_tools ON ai_operations.tool_id = ai_tools.id
  WHERE
    ai_tools.category IS NOT NULL
  GROUP BY 
    ai_tools.category
  ORDER BY 
    count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function for weekly usage trends
CREATE OR REPLACE FUNCTION get_weekly_usage()
RETURNS TABLE (day_of_week TEXT, operations BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(timestamp, 'Dy') AS day_of_week,
    COUNT(*) AS operations
  FROM 
    ai_operations
  WHERE
    timestamp >= current_date - interval '7 days'
  GROUP BY 
    day_of_week, extract(dow from timestamp)
  ORDER BY 
    extract(dow from timestamp);
END;
$$ LANGUAGE plpgsql;

-- Function for monthly usage trends
CREATE OR REPLACE FUNCTION get_monthly_usage()
RETURNS TABLE (month TEXT, operations BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(timestamp, 'Mon') AS month,
    COUNT(*) AS operations
  FROM 
    ai_operations
  WHERE
    timestamp >= current_date - interval '6 months'
  GROUP BY 
    month, extract(month from timestamp)
  ORDER BY 
    extract(month from timestamp);
END;
$$ LANGUAGE plpgsql;

-- Function for time of day usage
CREATE OR REPLACE FUNCTION get_time_of_day_usage()
RETURNS TABLE (hour_of_day TEXT, operations BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN extract(hour from timestamp) = 0 THEN '12am'
      WHEN extract(hour from timestamp) < 12 THEN extract(hour from timestamp) || 'am'
      WHEN extract(hour from timestamp) = 12 THEN '12pm'
      ELSE (extract(hour from timestamp) - 12) || 'pm'
    END AS hour_of_day,
    COUNT(*) AS operations
  FROM 
    ai_operations
  GROUP BY 
    hour_of_day, extract(hour from timestamp)
  ORDER BY 
    extract(hour from timestamp);
END;
$$ LANGUAGE plpgsql;

-- Function for user active days
CREATE OR REPLACE FUNCTION get_user_active_days(user_id_param UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (date DATE, is_active BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      current_date - (days_back - 1) * interval '1 day',
      current_date,
      interval '1 day'
    )::date AS series_date
  ),
  active_days AS (
    SELECT DISTINCT DATE(timestamp) AS active_date
    FROM ai_operations
    WHERE user_id = user_id_param
    AND timestamp >= current_date - (days_back - 1) * interval '1 day'
  )
  SELECT 
    ds.series_date AS date,
    CASE WHEN ad.active_date IS NOT NULL THEN TRUE ELSE FALSE END AS is_active
  FROM 
    date_series ds
  LEFT JOIN
    active_days ad ON ds.series_date = ad.active_date
  ORDER BY 
    ds.series_date;
END;
$$ LANGUAGE plpgsql;

-- Function for recent activities with tool details
CREATE OR REPLACE FUNCTION get_recent_activities(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  tool_name TEXT,
  timestamp TIMESTAMPTZ,
  input_meta JSONB,
  user_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ao.id,
    at.name AS tool_name,
    ao.timestamp,
    ao.input_meta,
    ao.user_id
  FROM 
    ai_operations ao
  JOIN
    ai_tools at ON ao.tool_id = at.id
  ORDER BY 
    ao.timestamp DESC
  LIMIT 
    limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function for daily operations
CREATE OR REPLACE FUNCTION get_daily_operations()
RETURNS TABLE (date TEXT, operations BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(timestamp, 'YYYY-MM-DD') AS date,
    COUNT(*) AS operations
  FROM 
    ai_operations
  WHERE
    timestamp >= current_date - interval '30 days'
  GROUP BY 
    date
  ORDER BY 
    date;
END;
$$ LANGUAGE plpgsql;
