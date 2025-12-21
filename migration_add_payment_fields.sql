-- Migration: Add payment fields to live_orders and sales tables
-- Run this SQL in your Supabase SQL Editor

-- Add payment columns to live_orders table
ALTER TABLE live_orders 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;

-- Add payment columns to sales table
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT;

