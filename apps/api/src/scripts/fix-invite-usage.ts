import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from multiple possible locations
const envPaths = [
  resolve(__dirname, '../../.env.local'),
  resolve(__dirname, '../../.env'),
  resolve(__dirname, '../../../.env.local'),
  resolve(__dirname, '../../../.env'),
];

for (const envPath of envPaths) {
  config({ path: envPath });
}

function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
  }
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

async function fixInviteUsage() {
  console.log('🔄 Starting invite usage data fix...');

  let supabaseAdmin;
  try {
    supabaseAdmin = createSupabaseAdmin();
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:');
    console.error('   ', error instanceof Error ? error.message : String(error));
    console.log('\n💡 Make sure you have the following environment variables set:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    console.log('\n📁 You can create a .env.local file in the apps/api directory with these values.');
    process.exit(1);
  }

  try {
    // Get all users who have apps (filter out null user_ids)
    const { data: apps, error: appsError } = await supabaseAdmin
      .from('apps')
      .select('user_id')
      .not('user_id', 'is', null);

    if (appsError) {
      throw new Error(`Failed to fetch apps: ${appsError.message}`);
    }

    // Filter out any null or undefined user_ids
    const validUserIds = apps.filter(app => app.user_id != null).map(app => app.user_id);
    const uniqueUserIds = Array.from(new Set(validUserIds));
    
    console.log(`📊 Found ${apps.length} apps total`);
    console.log(`📊 Found ${uniqueUserIds.length} users with valid apps`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const userId of uniqueUserIds) {
      try {
        // Skip if userId is null or invalid
        if (!userId) {
          console.log(`⚠️  Skipping invalid user ID: ${userId}`);
          continue;
        }

        // Get all apps for this user
        const { data: userApps, error: userAppsError } = await supabaseAdmin
          .from('apps')
          .select('id')
          .eq('user_id', userId);

        if (userAppsError) {
          console.error(`❌ Error fetching apps for user ${userId}:`, userAppsError);
          errorCount++;
          continue;
        }

        const appIds = userApps.map(app => app.id);

        // Count actual invitations for this user across all their apps
        const { count: actualInviteCount, error: countError } = await supabaseAdmin
          .from('invitations')
          .select('*', { count: 'exact', head: true })
          .in('app_id', appIds);

        if (countError) {
          console.error(`❌ Error counting invitations for user ${userId}:`, countError);
          errorCount++;
          continue;
        }

        const correctCount = actualInviteCount || 0;

        // Update user_invite_usage with the correct count
        const { error: updateError } = await supabaseAdmin
          .from('user_invite_usage')
          .upsert({
            user_id: userId,
            total_invites: correctCount,
            updated_at: new Date().toISOString()
          });

        if (updateError) {
          console.error(`❌ Error updating usage for user ${userId}:`, updateError);
          errorCount++;
          continue;
        }

        console.log(`✅ Fixed user ${userId}: ${correctCount} invites`);
        fixedCount++;

      } catch (userError) {
        console.error(`❌ Error processing user ${userId}:`, userError);
        errorCount++;
      }
    }

    console.log('\n📈 Fix completed!');
    console.log(`✅ Successfully fixed: ${fixedCount} users`);
    console.log(`❌ Errors encountered: ${errorCount} users`);

    if (errorCount === 0) {
      console.log('🎉 All invite usage data has been successfully synchronized!');
    } else {
      console.log('⚠️  Some errors occurred. Please review the logs above.');
    }

  } catch (error) {
    console.error('💥 Critical error during fix:', error);
    process.exit(1);
  }
}

// Execute the fix if this script is run directly
if (require.main === module) {
  fixInviteUsage()
    .then(() => {
      console.log('✨ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { fixInviteUsage }; 