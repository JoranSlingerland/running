db = db.getSiblingDB('running');

const collections = ['activities', 'users', 'notifications', 'streams'];

for (let i = 0; i < collections.length; i++) {
  db.createCollection(collections[i]);
}

const adminUser = process.env.MONGO_DB_USER;
const password = process.env.MONGO_DB_USER_PASSWORD;

// Create a new user
db.createUser({
  user: adminUser,
  pwd: password,
  roles: [
    {
      role: 'readWrite',
      db: 'running',
    },
  ],
});
