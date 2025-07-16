#!/usr/bin/env tsx

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getInvitationCounts() {
  // Count invitations
  const { count: invitationCount } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true });

  // Get tracked usage
  const { data: usageData } = await supabase
    .from('user_invite_usage')
    .select('total_invites')
    .gte('total_invites', 0);

  const totalTracked = usageData?.reduce((sum, row) => sum + (row.total_invites || 0), 0) || 0;

  return {
    invitations: invitationCount || 0,
    tracked: totalTracked
  };
}

async function getLatestInvitation() {
  const { data: invitation } = await supabase
    .from('invitations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return invitation;
}

async function testInvitationDeletion() {
  console.log('🧪 Testing Invitation Deletion...\n');

  // Get the latest invitation to delete
  console.log('🔍 Finding latest invitation to delete...');
  const invitation = await getLatestInvitation();
  
  if (!invitation) {
    console.log('❌ No invitations found to delete');
    return;
  }

  console.log(`📧 Found invitation: ${invitation.id}`);
  console.log(`   👤 Inviter: ${invitation.inviter_id}`);
  console.log(`   📧 Invitee: ${invitation.invitee_identifier}`);

  // Get the app's auth header
  const { data: app } = await supabase
    .from('apps')
    .select('auth_header')
    .eq('id', invitation.app_id)
    .single();

  if (!app?.auth_header) {
    console.log('❌ No auth header found for app');
    return;
  }

  // Get initial state
  console.log('\n📊 Current state before deletion:');
  const beforeState = await getInvitationCounts();
  console.log(`   💌 Invitations in DB: ${beforeState.invitations}`);
  console.log(`   📈 Tracked count: ${beforeState.tracked}`);

  // Delete the invitation via API
  console.log('\n🗑️ Deleting invitation via API...');
  console.log(`   📍 API URL: ${API_BASE_URL}/api/apps/${invitation.app_id}/inviters/${encodeURIComponent(invitation.inviter_id)}`);
  
  const response = await fetch(`${API_BASE_URL}/api/apps/${invitation.app_id}/inviters/${encodeURIComponent(invitation.inviter_id)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${app.auth_header}`
    }
  });

  console.log(`   🌐 Response status: ${response.status}`);
  
  if (response.ok) {
    const result = await response.json();
    console.log('   ✅ API Response: Success');
    console.log(`   🗑️ Deleted ${result.deletedCount || 0} invitation(s)`);
  } else {
    const error = await response.text();
    console.log('❌ API request failed:', response.status);
    console.log('   Response:', error);
    return;
  }

  // Wait a moment for triggers to process
  await new Promise(resolve => setTimeout(resolve, 100));

  // Get state after deletion
  console.log('\n📊 State after deletion:');
  const afterState = await getInvitationCounts();
  console.log(`   💌 Invitations in DB: ${afterState.invitations} (was ${beforeState.invitations})`);
  console.log(`   📈 Tracked count: ${afterState.tracked} (was ${beforeState.tracked})`);

  // Analyze the changes
  console.log('\n🔍 Analysis:');
  const invitationDelta = afterState.invitations - beforeState.invitations;
  const trackedDelta = afterState.tracked - beforeState.tracked;
  
  console.log(`   📈 Invitations table change: ${invitationDelta > 0 ? '+' : ''}${invitationDelta}`);
  console.log(`   📊 Usage counter change: ${trackedDelta > 0 ? '+' : ''}${trackedDelta}`);

  if (invitationDelta === -1 && trackedDelta === -1) {
    console.log('   ✅ SUCCESS: Both tables decremented correctly!');
  } else if (invitationDelta === -1 && trackedDelta === 0) {
    console.log('   ❌ ISSUE: Invitation deleted but counter not decremented');
  } else if (invitationDelta === 0 && trackedDelta === 0) {
    console.log('   ❌ ISSUE: No changes detected - deletion might have failed');
  } else {
    console.log('   ⚠️ UNEXPECTED: Unexpected state changes detected');
  }

  console.log('\n✨ Test completed');
}

testInvitationDeletion().catch(console.error); 