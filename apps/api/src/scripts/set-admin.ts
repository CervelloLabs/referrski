import { supabaseAdmin } from '../lib/supabase';

async function setAdmin(email: string) {
  try {
    // First get the user's ID from auth.users
    const { data: users, error: authError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (authError || !users) {
      console.error('Error finding user:', authError?.message);
      process.exit(1);
    }

    // Update the user's role in public.users
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role: 'admin' })
      .eq('id', users.id);

    if (updateError) {
      console.error('Error updating user role:', updateError.message);
      process.exit(1);
    }

    console.log(`Successfully set ${email} as admin`);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

setAdmin(email); 