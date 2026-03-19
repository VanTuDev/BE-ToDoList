/**
 * Script: fix-indexes.js
 * Drop các index cũ non-sparse trên collection `users`
 * Chạy: node scripts/fix-indexes.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('❌ Không tìm thấy MONGODB_URI'); process.exit(1); }

  const client = new MongoClient(uri);
  await client.connect();
  console.log('✅ Kết nối MongoDB thành công');

  // Log lỗi trong terminal BE cho thấy collection là `test.users`
  // → database mặc định khi URI không khai báo tên DB là `test`
  const db = client.db('test');
  const col = db.collection('users');

  // Liệt kê index hiện tại
  const before = await col.indexes();
  console.log('\n📋 Index hiện tại:');
  before.forEach(i => console.log(' ', i.name, '→ sparse:', i.sparse, '| unique:', i.unique, '| key:', JSON.stringify(i.key)));

  // Drop phone_1 (cũ, không sparse)
  for (const name of ['phone_1', 'googleId_1']) {
    try {
      await col.dropIndex(name);
      console.log(`\n✅ Dropped: ${name}`);
    } catch {
      console.log(`⚠️  Skip ${name} (không tồn tại hoặc không drop được)`);
    }
  }

  // Confirm
  const after = await col.indexes();
  console.log('\n📋 Index sau khi fix:');
  after.forEach(i => console.log(' ', i.name, '→ sparse:', i.sparse, '| unique:', i.unique));

  await client.close();
  console.log('\n✅ Done. Restart BE để Mongoose tạo lại index đúng (sparse).');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
