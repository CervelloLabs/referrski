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

async function testInvitationAPI() {
  console.log('🧪 Testing Invitation API...\n');

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

    console.log(`📱 Found ${apps.length} app(s):`);
    apps.forEach((app: App, index: number) => {
      console.log(`   ${index + 1}. ${app.name} (${app.id})`);
    });

    // Use the first app for testing
    const testApp = apps[0] as App;
    console.log(`\n🎯 Using app: ${testApp.name} (${testApp.id})`);

    // 2. Check current state before test
    console.log('\n📊 Current state before test:');
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

    // 3. Create test invitation via API
    console.log('\n🚀 Creating test invitation via API...');
    
    const testPayload = {
      inviterId: 'test-inviter@example.com',
      inviteeIdentifier: `test-${Date.now()}@example.com`,
      metadata: {
        source: 'api-test',
        timestamp: new Date().toISOString()
      },
      email: {
        fromName: 'API Test',
        subject: 'Test Invitation from API',
        content: 'This is a test invitation created via the API.'
      }
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    console.log(`   📍 API URL: ${apiUrl}/api/apps/${testApp.id}/invitations`);
    console.log(`   📧 Invitee: ${testPayload.inviteeIdentifier}`);
    console.log(`   👤 Inviter: ${testPayload.inviterId}`);

    const response = await fetch(`${apiUrl}/api/apps/${testApp.id}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testApp.auth_header}`,
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`   🌐 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API request failed: ${response.status}`);
      console.error(`   Response: ${errorText}`);
      return;
    }

    const result = await response.json();
    console.log(`   ✅ API Response: ${result.success ? 'Success' : 'Failed'}`);
    
    if (result.success && result.data?.invitation) {
      console.log(`   🆔 Invitation ID: ${result.data.invitation.id}`);
    }

    // 4. Check state after test
    console.log('\n📊 State after test:');
    
    // Wait a moment for triggers to process
    await new Promise(resolve => setTimeout(resolve, 1000));

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

    // 5. Analyze results
    console.log('\n🔍 Analysis:');
    const invitationsDelta = (afterInvitations || 0) - (beforeInvitations || 0);
    const usageDelta = (afterUsage?.total_invites || 0) - (beforeUsage?.total_invites || 0);

    console.log(`   📈 Invitations table change: +${invitationsDelta}`);
    console.log(`   📊 Usage counter change: +${usageDelta}`);

    if (invitationsDelta === 1 && usageDelta === 1) {
      console.log('   ✅ SUCCESS: Both tables updated correctly!');
    } else if (invitationsDelta === 0 && usageDelta === 0) {
      console.log('   ⚠️  No changes detected - API call may have failed');
    } else if (invitationsDelta !== usageDelta) {
      console.log('   ❌ MISMATCH: Tables are not synchronized!');
    } else {
      console.log('   ✅ Tables are synchronized');
    }

    // 6. Show the created invitation details
    if (invitationsDelta > 0) {
      console.log('\n💌 Latest invitation details:');
      const { data: latestInvitation } = await supabaseAdmin
        .from('invitations')
        .select('*')
        .eq('app_id', testApp.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestInvitation) {
        console.log(`   🆔 ID: ${latestInvitation.id}`);
        console.log(`   👤 Inviter: ${latestInvitation.inviter_id}`);
        console.log(`   📧 Invitee: ${latestInvitation.invitee_identifier}`);
        console.log(`   📅 Status: ${latestInvitation.status}`);
        console.log(`   ⏰ Created: ${latestInvitation.created_at}`);
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }
}

// Execute the test if this script is run directly
if (require.main === module) {
  testInvitationAPI()
    .then(() => {
      console.log('\n✨ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

export { testInvitationAPI }; 