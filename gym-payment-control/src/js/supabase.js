const SUPABASE_URL = 'https://oiscvkfsyjyqbogfhnyo.supabase.co'; // <-- Pega aquí tu URL de Supabase
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pc2N2a2ZzeWp5cWJvZ2ZobnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NTI3NTksImV4cCI6MjA2MjQyODc1OX0.Uky_As7XMy9o37eIacRH8qp9mzpv0FZu6qgGcTqbniI'; // <-- Pega aquí tu API KEY

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);