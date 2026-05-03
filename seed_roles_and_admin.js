const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE'
);

async function main() {
  const email = 'admin@jongtour.com';
  
  // 1. Seed Roles
  const rolesToCreate = ['ADMIN', 'AGENT_ADMIN', 'AGENT_USER', 'CUSTOMER'];
  const roleIds = {};

  console.log("Checking and seeding roles...");
  for (const roleName of rolesToCreate) {
    let { data: role } = await supabase.from('roles').select('id, name').eq('name', roleName).single();
    if (!role) {
      console.log(`Role ${roleName} not found. Creating...`);
      const { data: newRole, error: insertError } = await supabase.from('roles').insert({ name: roleName }).select('id, name').single();
      if (insertError) {
        console.error(`Failed to create role ${roleName}:`, insertError);
      } else {
        role = newRole;
      }
    }
    if (role) {
      roleIds[role.name] = role.id;
    }
  }

  if (!roleIds['ADMIN']) {
    console.error("ADMIN role could not be created/found.");
    return;
  }

  // 2. Check and Create/Update User
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (user) {
    console.log(`User found: ${user.id}. Updating roleId to ADMIN...`);
    const { error: updateError } = await supabase
      .from('users')
      .update({ roleId: roleIds['ADMIN'] })
      .eq('email', email);
      
    if (updateError) {
      console.error("Update failed:", updateError);
    } else {
      console.log("Successfully updated to ADMIN.");
    }
  } else {
    console.log("User not found. Creating...");
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        passwordHash: 'OAUTH_USER',
        roleId: roleIds['ADMIN']
      });
      
    if (insertError) {
      console.error("Insert failed:", insertError);
    } else {
      console.log("Successfully created user with ADMIN role.");
    }
  }
}

main();
