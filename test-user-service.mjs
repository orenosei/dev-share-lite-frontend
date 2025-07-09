// Test script for user service
import { userService } from './src/services/userService.js';

// Set up mock localStorage for testing
global.localStorage = {
  getItem: () => JSON.stringify({ id: 7, token: '7', username: 'devuser' }),
  setItem: () => {},
  removeItem: () => {}
};

global.window = { localStorage: global.localStorage };

async function testUserService() {
  console.log('🧪 Testing User Service...\n');

  // Test 1: Get all users
  console.log('1. Testing getAll users...');
  const allUsers = await userService.getAll();
  console.log('✅ Success:', allUsers.success);
  console.log('📊 Users count:', allUsers.users?.length || 0);

  // Test 2: Get user by ID
  console.log('\n2. Testing getById...');
  const userById = await userService.getById(7);
  console.log('✅ Success:', userById.success);
  console.log('👤 User:', userById.user?.username || 'Not found');

  // Test 3: Get user by username
  console.log('\n3. Testing getByUsername...');
  const userByUsername = await userService.getByUsername('devuser');
  console.log('✅ Success:', userByUsername.success);
  console.log('👤 User:', userByUsername.user?.email || 'Not found');

  // Test 4: Get user stats
  console.log('\n4. Testing getStats...');
  const userStats = await userService.getStats(7);
  console.log('✅ Success:', userStats.success);
  console.log('📈 Stats:', userStats.stats || 'Not found');

  // Test 5: Search users
  console.log('\n5. Testing search...');
  const searchResults = await userService.search('dev');
  console.log('✅ Success:', searchResults.success);
  console.log('🔍 Search results:', searchResults.users?.length || 0);

  // Test 6: Get current user
  console.log('\n6. Testing getCurrentUser...');
  const currentUser = await userService.getCurrentUser();
  console.log('✅ Success:', currentUser.success);
  console.log('👤 Current user:', currentUser.user?.username || 'Not found');

  console.log('\n🎉 All tests completed!');
}

testUserService().catch(console.error);
