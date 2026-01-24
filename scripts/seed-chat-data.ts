import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ortjjekmexmyvkkotioo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydGpqZWttZXhteXZra290aW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ3MzQ2NiwiZXhwIjoyMDUxMDQ5NDY2fQ.xSdxOKuQHCqMkU5eTMjWZBz0P7CQFV_1qgE-8UPYmLs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedChatData() {
  console.log('🌱 Seeding chat demo data...\n');

  try {
    // Get existing users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!users || users.users.length < 2) {
      console.log('⚠️  Need at least 2 users to create chat data. Creating demo users...\n');
      
      // Create demo users
      const demoUsers = [
        {
          email: 'alice@student.com',
          password: 'password123!',
          user_metadata: {
            full_name: 'Alice Johnson',
            institution_name: 'University of Cape Town',
            course_program: 'Computer Science',
            year_of_study: '3rd Year'
          }
        },
        {
          email: 'bob@student.com',
          password: 'password123!',
          user_metadata: {
            full_name: 'Bob Smith',
            institution_name: 'Stellenbosch University',
            course_program: 'Business Administration',
            year_of_study: '2nd Year'
          }
        },
        {
          email: 'carol@student.com',
          password: 'password123!',
          user_metadata: {
            full_name: 'Carol Williams',
            institution_name: 'University of Pretoria',
            course_program: 'Engineering',
            year_of_study: '4th Year'
          }
        }
      ];

      const createdUsers = [];
      for (const user of demoUsers) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: user.user_metadata
        });

        if (error) {
          console.log(`⚠️  User ${user.email} might already exist`);
        } else if (data.user) {
          createdUsers.push(data.user);
          console.log(`✅ Created user: ${user.user_metadata.full_name} (${user.email})`);
        }
      }

      // Refresh users list
      const { data: refreshedUsers } = await supabase.auth.admin.listUsers();
      if (refreshedUsers) {
        users.users = refreshedUsers.users;
      }
    }

    const userList = users.users;
    console.log(`\n📊 Found ${userList.length} users\n`);

    if (userList.length < 2) {
      console.error('❌ Still not enough users. Please create users manually.');
      return;
    }

    // Create connections between users
    console.log('🔗 Creating connections...');
    const connections = [];
    
    for (let i = 0; i < userList.length - 1; i++) {
      const user1 = userList[i].id;
      const user2 = userList[i + 1].id;
      
      const ordered = user1 < user2 ? [user1, user2] : [user2, user1];
      
      const { data, error } = await supabase
        .from('connections')
        .insert({
          user1_id: ordered[0],
          user2_id: ordered[1],
          status: 'accepted'
        })
        .select()
        .single();

      if (!error && data) {
        connections.push(data);
        console.log(`✅ Connected: User ${i + 1} ↔ User ${i + 2}`);
      }
    }

    // Create conversations and messages
    console.log('\n💬 Creating conversations and messages...');
    
    for (const connection of connections) {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          participant1_id: connection.user1_id,
          participant2_id: connection.user2_id
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        continue;
      }

      // Add some messages
      const messages = [
        { sender: connection.user1_id, content: 'Hey! How are you doing?' },
        { sender: connection.user2_id, content: 'Hi! I\'m good, thanks! How about you?' },
        { sender: connection.user1_id, content: 'Doing great! Are you going to the study group later?' },
        { sender: connection.user2_id, content: 'Yes! See you at 3pm in the library?' },
        { sender: connection.user1_id, content: 'Perfect! See you there 👍' }
      ];

      for (const msg of messages) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: msg.sender,
            content: msg.content,
            message_type: 'text'
          });
      }

      console.log(`✅ Created conversation with ${messages.length} messages`);
    }

    // Create a group
    console.log('\n👥 Creating demo group...');
    
    const { data: group, error: groupError } = await supabase
      .from('chat_groups')
      .insert({
        name: 'Study Group - Computer Science',
        description: 'Group for CS students to discuss assignments and projects',
        created_by: userList[0].id,
        is_public: true
      })
      .select()
      .single();

    if (!groupError && group) {
      console.log(`✅ Created group: ${group.name}`);

      // Add members
      for (let i = 0; i < Math.min(3, userList.length); i++) {
        await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: userList[i].id,
            role: i === 0 ? 'admin' : 'member'
          });
      }

      console.log(`✅ Added ${Math.min(3, userList.length)} members to group`);

      // Add group messages
      const groupMessages = [
        { sender: userList[0].id, content: 'Welcome everyone to the study group!' },
        { sender: userList[1 % userList.length].id, content: 'Thanks for creating this!' },
        { sender: userList[2 % userList.length].id, content: 'Looking forward to studying together 📚' }
      ];

      for (const msg of groupMessages) {
        await supabase
          .from('group_messages')
          .insert({
            group_id: group.id,
            sender_id: msg.sender,
            content: msg.content,
            message_type: 'text'
          });
      }

      console.log(`✅ Added ${groupMessages.length} messages to group`);
    }

    // Create call logs
    console.log('\n📞 Creating call logs...');
    
    const callLogs = [
      {
        caller_id: userList[0].id,
        receiver_id: userList[1 % userList.length].id,
        call_type: 'voice',
        call_status: 'answered',
        duration: 245,
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        caller_id: userList[1 % userList.length].id,
        receiver_id: userList[0].id,
        call_type: 'video',
        call_status: 'answered',
        duration: 1820,
        started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        caller_id: userList[0].id,
        receiver_id: userList[2 % userList.length].id,
        call_type: 'voice',
        call_status: 'missed',
        duration: 0,
        started_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const call of callLogs) {
      await supabase.from('call_logs').insert(call);
    }

    console.log(`✅ Created ${callLogs.length} call logs`);

    // Create user statuses
    console.log('\n📸 Creating user statuses...');
    
    for (let i = 0; i < Math.min(2, userList.length); i++) {
      await supabase
        .from('user_statuses')
        .insert({
          user_id: userList[i].id,
          content: i === 0 ? 'Studying for finals! 📚' : 'Just finished my project! 🎉',
          media_type: 'text'
        });
    }

    console.log(`✅ Created ${Math.min(2, userList.length)} user statuses`);

    console.log('\n✅ Demo chat data seeded successfully!\n');
    console.log('📝 Summary:');
    console.log(`   - ${userList.length} users`);
    console.log(`   - ${connections.length} connections`);
    console.log(`   - ${connections.length} conversations with messages`);
    console.log(`   - 1 group with members and messages`);
    console.log(`   - ${callLogs.length} call logs`);
    console.log(`   - ${Math.min(2, userList.length)} user statuses`);
    console.log('\n🚀 Your chat system is ready to use!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedChatData();
