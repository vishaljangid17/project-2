const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("connected to DB");
}

const initDB = async () => {

    await Listing.deleteMany({});
    console.log("old data deleted");

    const dataWithOwner = initData.data.map((obj) => ({
        ...obj,
        owner: "6a9996bdb28711d35685af93"
    }));

    await Listing.insertMany(dataWithOwner);

    console.log("data was initialized");

    await mongoose.connection.close();
    console.log("connection closed");
};

async function start() {
    try {
        await main();
        await initDB();
    } catch (err) {
        console.log(err);
    }
}

start();