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

-- Function to get weekly usage
CREATE OR REPLACE FUNCTION get_weekly_usage(user_id_param UUID)
RETURNS TABLE (
  day_of_week TEXT,
  operations BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(timestamp, 'Dy') as day_of_week,
    count(*) as operations
  FROM
    ai_operations
  WHERE
    user_id = user_id_param
    AND timestamp >= current_date - interval '7 days'
  GROUP BY
    day_of_week
  ORDER BY
    min(extract(isodow from timestamp));
END;
$$ LANGUAGE plpgsql;

-- Function to get monthly usage
CREATE OR REPLACE FUNCTION get_monthly_usage(user_id_param UUID)
RETURNS TABLE (
  month TEXT,
  operations BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(timestamp, 'Mon') as month,
    count(*) as operations
  FROM
    ai_operations
  WHERE
    user_id = user_id_param
    AND timestamp >= current_date - interval '6 months'
  GROUP BY
    month, extract(month from timestamp)
  ORDER BY
    min(extract(month from timestamp));
END;
$$ LANGUAGE plpgsql;

-- Function to get time of day usage
CREATE OR REPLACE FUNCTION get_time_of_day_usage(user_id_param UUID)
RETURNS TABLE (
  hour_of_day TEXT,
  operations BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN extract(hour from timestamp) BETWEEN 0 AND 5 THEN '12am-6am'
      WHEN extract(hour from timestamp) BETWEEN 6 AND 11 THEN '6am-12pm'
      WHEN extract(hour from timestamp) BETWEEN 12 AND 17 THEN '12pm-6pm'
      ELSE '6pm-12am'
    END as hour_of_day,
    count(*) as operations
  FROM
    ai_operations
  WHERE
    user_id = user_id_param
  GROUP BY
    hour_of_day
  ORDER BY
    min(extract(hour from timestamp));
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

-- Function to get user active days
CREATE OR REPLACE FUNCTION get_user_active_days(user_id_param UUID)
RETURNS TABLE (
  date DATE,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      current_date - interval '6 days',
      current_date,
      interval '1 day'
    )::date as date
  ),
  active_days AS (
    SELECT
      date(timestamp) as active_date,
      true as is_active
    FROM
      ai_operations
    WHERE
      user_id = user_id_param
      AND timestamp >= current_date - interval '6 days'
    GROUP BY
      active_date
  )
  SELECT
    ds.date,
    COALESCE(ad.is_active, false) as is_active
  FROM
    date_series ds
  LEFT JOIN
    active_days ad ON ds.date = ad.active_date
  ORDER BY
    ds.date;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily operations
CREATE OR REPLACE FUNCTION get_daily_operations(user_id_param UUID)
RETURNS TABLE (
  date DATE,
  operations BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      current_date - interval '14 days',
      current_date,
      interval '1 day'
    )::date as date
  ),
  daily_ops AS (
    SELECT
      date(timestamp) as op_date,
      count(*) as op_count
    FROM
      ai_operations
    WHERE
      user_id = user_id_param
      AND timestamp >= current_date - interval '14 days'
    GROUP BY
      op_date
  )
  SELECT
    ds.date,
    COALESCE(do.op_count, 0) as operations
  FROM
    date_series ds
  LEFT JOIN
    daily_ops do ON ds.date = do.op_date
  ORDER BY
    ds.date;
END;
$$ LANGUAGE plpgsql;
