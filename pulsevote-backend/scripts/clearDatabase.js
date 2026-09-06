const mongoose = require("mongoose");
require("dotenv").config();

const mongo = process.env.MONGO_URI;

const allowClear =
  String(process.env.ALLOW_DB_CLEAR || "").toLowerCase() === "true";

async function clearDatabase() {
  if (!mongo) {
    throw new Error("Missing MONGO_URI");
  }

  if (!allowClear) {
    throw new Error(
      "Database clear blocked. Set ALLOW_DB_CLEAR=true only in the CI test job."
    );
  }

  await mongoose.connect(mongo);

  const dbName = mongoose.connection.name;

  if (!/(test|ci)/i.test(dbName)) {
    throw new Error(
      `Refusing to drop database '${dbName}'. The CI database name must contain test or ci.`
    );
  }

  await mongoose.connection.db.dropDatabase();

  console.log(`Cleared MongoDB database: ${dbName}`);

  await mongoose.disconnect();
}

clearDatabase().catch(async (err) => {
  console.error(err.message);

  try {
    await mongoose.disconnect();
  } catch {
    // Ignore disconnect errors during cleanup
  }

  process.exit(1);
});