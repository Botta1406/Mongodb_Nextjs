import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

// Extend the global type to include our custom field
declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Prevent re-creating client on hot reloads in development
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise!;

export default clientPromise;
