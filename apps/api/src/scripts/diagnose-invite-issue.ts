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

async function diagnoseInviteIssue() {
  console.log('🔍 Diagnosing invite tracking issue...\n');

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
    // 1. Check total invitations in the database (admin view)
    const { count: totalInvitations, error: invitationsError } = await supabaseAdmin
      .from('invitations')
      .select('*', { count: 'exact', head: true });

    if (invitationsError) {
      console.error('❌ Error counting invitations:', invitationsError);
      return;
    }

    console.log(`📊 Total invitations in database: ${totalInvitations || 0}`);

    // 2. Check total user_invite_usage records
    const { data: usageRecords, error: usageError } = await supabaseAdmin
      .from('user_invite_usage')
      .select('user_id, total_invites');

    if (usageError) {
      console.error('❌ Error fetching usage records:', usageError);
      return;
    }

    const totalTrackedInvites = usageRecords?.reduce((sum, record) => sum + record.total_invites, 0) || 0;
    console.log(`📈 Total tracked invites: ${totalTrackedInvites}`);
    console.log(`👥 Users with tracked invites: ${usageRecords?.length || 0}\n`);

    // 3. Compare per-user actual vs tracked
    console.log('🔍 Per-user analysis:');
    console.log('=====================================');

    if (usageRecords && usageRecords.length > 0) {
      for (const usage of usageRecords) {
        // Get user's apps
        const { data: userApps } = await supabaseAdmin
          .from('apps')
          .select('id')
          .eq('user_id', usage.user_id);

        if (!userApps || userApps.length === 0) {
          console.log(`👤 User ${usage.user_id}: No apps found`);
          continue;
        }

        const appIds = userApps.map(app => app.id);

        // Count actual invitations for this user
        const { count: actualCount } = await supabaseAdmin
          .from('invitations')
          .select('*', { count: 'exact', head: true })
          .in('app_id', appIds);

        const trackedCount = usage.total_invites;
        const actualInviteCount = actualCount || 0;

        console.log(`👤 User ${usage.user_id}:`);
        console.log(`   📱 Apps: ${userApps.length}`);
        console.log(`   📊 Tracked invites: ${trackedCount}`);
        console.log(`   ✅ Actual invites: ${actualInviteCount}`);
        
        if (trackedCount !== actualInviteCount) {
          console.log(`   ⚠️  MISMATCH: Difference of ${trackedCount - actualInviteCount}`);
        } else {
          console.log(`   ✅ MATCH: Data is consistent`);
        }
        console.log('');
      }
    }

    // 4. Check for orphaned invitations (invitations without corresponding apps)
    const { data: orphanedInvites, error: orphanError } = await supabaseAdmin
      .from('invitations')
      .select('id, app_id')
      .not('app_id', 'in', `(SELECT id FROM apps)`);

    if (orphanError) {
      console.error('❌ Error checking orphaned invites:', orphanError);
    } else {
      console.log(`🔗 Orphaned invitations: ${orphanedInvites?.length || 0}`);
    }

    // 5. Summary
    console.log('\n📋 SUMMARY:');
    console.log('=====================================');
    console.log(`🎯 Total actual invitations: ${totalInvitations || 0}`);
    console.log(`📊 Total tracked invites: ${totalTrackedInvites}`);
    
    if ((totalInvitations || 0) === totalTrackedInvites) {
      console.log('✅ Global totals match - tracking is working correctly!');
    } else {
      console.log(`⚠️  Global mismatch: ${totalTrackedInvites - (totalInvitations || 0)} difference`);
      console.log('💡 Recommendation: Run the fix-invite-usage script');
    }

    // 6. Check triggers
    console.log('\n🔧 Checking database triggers...');
    const { data: triggers, error: triggerError } = await supabaseAdmin
      .rpc('check_invite_triggers');

    if (triggerError && triggerError.code !== '42883') { // Function doesn't exist is OK
      console.error('❌ Error checking triggers:', triggerError);
    } else if (triggerError?.code === '42883') {
      console.log('⚠️  Trigger check function not available (this is OK)');
    } else {
      console.log('✅ Triggers checked successfully');
    }

  } catch (error) {
    console.error('💥 Critical error during diagnosis:', error);
  }
}

// Execute the diagnosis if this script is run directly
if (require.main === module) {
  diagnoseInviteIssue()
    .then(() => {
      console.log('\n✨ Diagnosis completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Diagnosis failed:', error);
      process.exit(1);
    });
}

export { diagnoseInviteIssue }; 