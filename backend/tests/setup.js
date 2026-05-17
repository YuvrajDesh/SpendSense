const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

jest.setTimeout(120000); // Increase timeout for CI environments

let mongod;

// Start in-memory MongoDB before all tests
beforeAll(async () => {
    mongod = await MongoMemoryServer.create({
        instance: {
            launchTimeout: 60000 // 60 seconds startup timeout for resource-constrained CI
        }
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);
});

// Clean all collections between tests
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// Stop and disconnect after all tests
afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
});
