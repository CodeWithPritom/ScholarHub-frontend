import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dqtpxgydhgjranchvptx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdHB4Z3lkaGdqcmFuY2h2cHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTg1NTAsImV4cCI6MjA5MzkzNDU1MH0.SD0t2dX3zIZEaFdkRq-sX2FxSZjfHzZZUceZKjSwUDU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);