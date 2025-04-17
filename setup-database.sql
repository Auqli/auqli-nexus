-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    company_name TEXT,
    job_title TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    features JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create user_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- Insert a free plan if it doesn't exist
INSERT INTO public.subscription_plans (id, name, description, price_monthly, price_yearly, features)
VALUES (1, 'Free', 'Basic access to Auqli tools', 0, 0, '{"tools": ["converter"], "limits": {"conversions": 10}}')
ON CONFLICT (id) DO NOTHING;

-- Set up RLS (Row Level Security) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON public.user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, full_name, email)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
    
    INSERT INTO public.user_subscriptions (user_id, plan_id, status, start_date)
    VALUES (new.id, 1, 'active', NOW());
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
