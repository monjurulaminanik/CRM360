const mongoose = require('mongoose');

const hostPart = 'ac-ubjwsyc-shard-00-00.jbl1hdu.mongodb.net:27017,ac-ubjwsyc-shard-00-01.jbl1hdu.mongodb.net:27017,ac-ubjwsyc-shard-00-02.jbl1hdu.mongodb.net:27017/d360?ssl=true&replicaSet=atlas-dgh01y-shard-0&authSource=admin&appName=d360-db';

const usernames = ['anikwitinstitute_db_user', 'anikwillinstitute_db_user'];
const passwordBases = [
  '7VhP33H180IJFczO',
  '7VhP33H180lJFczO',
  '7VhP33H1801JFczO',
  '7VhP33H180iJFczO',
  '7VhP33H18oIJFczO',
  '7VhP33H18olJFczO',
  '7VhP33H18o1JFczO',
  '7VhP33H180IJFczo',
  '7VhP33H180IJFcz0',
  '7VhP33H18olJFcz0',
  '7VhP33H180lJFczo'
];

async function test(username, password) {
  const uri = `mongodb://${username}:${password}@${hostPart}`;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`SUCCESS! username: ${username}, password: ${password}`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.log(`FAILED for ${username}:${password} -> ${err.message}`);
    return false;
  }
}

async function run() {
  for (const username of usernames) {
    for (const password of passwordBases) {
      const ok = await test(username, password);
      if (ok) {
        console.log('FOUND CORRECT CREDENTIALS!');
        process.exit(0);
      }
    }
  }
  console.log('All variations failed.');
  process.exit(1);
}

run();
