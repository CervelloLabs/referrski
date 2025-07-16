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

interface App {
  id: string;
  name: string;
  auth_header: string;
  user_id: string;
}

async function testBulkInvitations(count: number = 5) {
  console.log(`🧪 Testing Bulk Invitation API (${count} invitations)...\n`);

  let supabaseAdmin;
  try {
    supabaseAdmin = createSupabaseAdmin();
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:');
    console.error('   ', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  try {
    // 1. Get available apps to test with
    console.log('🔍 Finding available apps...');
    const { data: apps, error: appsError } = await supabaseAdmin
      .from('apps')
      .select('id, name, auth_header, user_id')
      .not('auth_header', 'is', null);

    if (appsError) {
      throw new Error(`Failed to fetch apps: ${appsError.message}`);
    }

    if (!apps || apps.length === 0) {
      console.log('❌ No apps found with auth headers. Please create an app first.');
      process.exit(1);
    }

    const testApp = apps[0] as App;
    console.log(`🎯 Using app: ${testApp.name} (${testApp.id})\n`);

    // 2. Check current state before test
    console.log('📊 Current state before bulk test:');
    const { count: beforeInvitations } = await supabaseAdmin
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', testApp.id);

    const { data: beforeUsage } = await supabaseAdmin
      .from('user_invite_usage')
      .select('total_invites')
      .eq('user_id', testApp.user_id)
      .single();

    console.log(`   💌 Invitations in DB: ${beforeInvitations || 0}`);
    console.log(`   📈 Tracked count: ${beforeUsage?.total_invites || 0}`);

    // 3. Create multiple invitations
    console.log(`\n🚀 Creating ${count} invitations via API...`);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const results = [];
    const errors = [];

    for (let i = 1; i <= count; i++) {
      const testPayload = {
        inviterId: `bulk-inviter-${i}@example.com`,
        inviteeIdentifier: `bulk-test-${Date.now()}-${i}@example.com`,
        metadata: {
          source: 'bulk-api-test',
          batch: Date.now(),
          index: i
        }
      };

      console.log(`   📧 Creating invitation ${i}/${count}: ${testPayload.inviteeIdentifier}`);

      try {
        const response = await fetch(`${apiUrl}/api/apps/${testApp.id}/invitations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testApp.auth_header}`,
          },
          body: JSON.stringify(testPayload),
        });

        if (response.ok) {
          const result = await response.json();
          results.push(result);
          console.log(`      ✅ Success: ${result.data?.invitation?.id || 'No ID'}`);
        } else {
          const errorText = await response.text();
          errors.push({ index: i, status: response.status, error: errorText });
          console.log(`      ❌ Failed: ${response.status}`);
        }
      } catch (error) {
        errors.push({ index: i, error: error instanceof Error ? error.message : String(error) });
        console.log(`      ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Small delay to avoid overwhelming the API
      if (i < count) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // 4. Wait for all triggers to process
    console.log('\n⏳ Waiting for database triggers to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Check state after test
    console.log('\n📊 State after bulk test:');
    const { count: afterInvitations } = await supabaseAdmin
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', testApp.id);

    const { data: afterUsage } = await supabaseAdmin
      .from('user_invite_usage')
      .select('total_invites')
      .eq('user_id', testApp.user_id)
      .single();

    console.log(`   💌 Invitations in DB: ${afterInvitations || 0} (was ${beforeInvitations || 0})`);
    console.log(`   📈 Tracked count: ${afterUsage?.total_invites || 0} (was ${beforeUsage?.total_invites || 0})`);

    // 6. Analyze results
    console.log('\n🔍 Bulk Test Analysis:');
    const successfulCreations = results.length;
    const failedCreations = errors.length;
    const invitationsDelta = (afterInvitations || 0) - (beforeInvitations || 0);
    const usageDelta = (afterUsage?.total_invites || 0) - (beforeUsage?.total_invites || 0);

    console.log(`   🎯 Attempted: ${count}`);
    console.log(`   ✅ Successful API calls: ${successfulCreations}`);
    console.log(`   ❌ Failed API calls: ${failedCreations}`);
    console.log(`   📈 Invitations table change: +${invitationsDelta}`);
    console.log(`   📊 Usage counter change: +${usageDelta}`);

    // Check synchronization
    if (invitationsDelta === usageDelta && invitationsDelta === successfulCreations) {
      console.log('   🎉 PERFECT: All tables synchronized and match successful API calls!');
    } else if (invitationsDelta === usageDelta) {
      console.log('   ✅ GOOD: Tables are synchronized, but some API calls may have failed');
    } else {
      console.log('   ❌ PROBLEM: Tables are NOT synchronized!');
      console.log(`      Expected both to change by ${successfulCreations}, but got:`);
      console.log(`      Invitations: +${invitationsDelta}, Usage: +${usageDelta}`);
    }

    // 7. Show error details if any
    if (errors.length > 0) {
      console.log('\n❌ Error details:');
      errors.forEach(error => {
        console.log(`   ${error.index}: ${error.status || 'Network Error'} - ${error.error}`);
      });
    }

    // 8. Show some recent invitations
    if (invitationsDelta > 0) {
      console.log('\n💌 Recent invitations created:');
      const { data: recentInvitations } = await supabaseAdmin
        .from('invitations')
        .select('id, inviter_id, invitee_identifier, status, created_at')
        .eq('app_id', testApp.id)
        .order('created_at', { ascending: false })
        .limit(Math.min(5, invitationsDelta));

      if (recentInvitations) {
        recentInvitations.forEach((invitation, index) => {
          console.log(`   ${index + 1}. ${invitation.invitee_identifier} (${invitation.status}) - ${invitation.id}`);
        });
      }
    }

    // 9. Performance summary
    console.log('\n⚡ Performance Summary:');
    console.log(`   📊 Success rate: ${Math.round((successfulCreations / count) * 100)}%`);
    console.log(`   🔄 Database consistency: ${invitationsDelta === usageDelta ? 'Perfect' : 'Issues detected'}`);
    console.log(`   🎯 Trigger accuracy: ${invitationsDelta === successfulCreations ? 'Perfect' : 'Some discrepancy'}`);

  } catch (error) {
    console.error('💥 Bulk test failed:', error);
    process.exit(1);
  }
}

// Execute the test if this script is run directly
if (require.main === module) {
  // Get count from command line args or default to 5
  const count = process.argv[2] ? parseInt(process.argv[2], 10) : 5;
  
  if (isNaN(count) || count < 1 || count > 50) {
    console.error('❌ Please provide a valid count between 1 and 50');
    console.log('Usage: npm run test-bulk [count]');
    console.log('Example: npm run test-bulk 10');
    process.exit(1);
  }

  testBulkInvitations(count)
    .then(() => {
      console.log('\n✨ Bulk test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Bulk test failed:', error);
      process.exit(1);
    });
}

export { testBulkInvitations }; 