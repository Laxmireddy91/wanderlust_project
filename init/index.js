const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dburl = "mongodb+srv://laxmireddy91:Reddy121%23.com@cluster0.e2oxmgf.mongodb.net/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dburl);
}

const initDB = async () => {
  await Listing.deleteMany({});

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "69a59e46e0028ed05eb4770c",
    category: "trending",   // add category
  }));

  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();