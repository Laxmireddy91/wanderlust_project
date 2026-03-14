const Listing = require("../models/listing.js");
const axios = require("axios");
const { cloudinary } = require("../cloudConfig.js");

module.exports.index = async (req, res) => {

  const { category, location } = req.query;

  let filter = {};

  if (category) {
    filter.category = category;
  }


if (location && location.trim() !== "") {
filter.location = { $regex: location, $options: "i" };
  }

  let allListings = await Listing.find(filter);

  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.json(allListings);
  }

  return res.render("listings/index.ejs", {
    allListings,
    selectedCategory: category || null,
    location: location || ""
  });
};


module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author"
      }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing requested does not exist!");
    console.log("redirecting...");
    return res.redirect("/listings");
  }

 console.log(listing);

return res.render("listings/show.ejs", {
  listing,
  maptilerKey: process.env.MAPTILER_KEY

});

};
module.exports.renderNewForm = (req, res) => {
return res.render("listings/new.ejs");
};
module.exports.createListing = async (req, res) => {

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.file) {
    const url = req.file.path;
    const filename = req.file.filename;
    newListing.image = { url, filename };
  }

  const location = `${req.body.listing.location}, ${req.body.listing.country}`;

  const response = await axios.get(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${process.env.MAPTILER_KEY}`
  );

  if (response.data.features.length === 0) {
    req.flash("error", "Invalid location");
    return res.redirect("/listings/new");
  }

  const coordinates = response.data.features[0].center;

  newListing.geometry = {
    type: "Point",
    coordinates: coordinates,
  };

  await newListing.save();

  req.flash("success", "Listing created successfully!");
  return res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing requested does not exist!");
    return res.redirect("/listings");
  }
let originalimageUrl = "";
if (listing.image && listing.image.url) {
  originalimageUrl = listing.image.url.replace("/upload", "/upload/h_300,w_250");
}


 return res.render("listings/edit.ejs", { listing, originalimageUrl });
};

module.exports.updateListing = async (req, res) => {

  let { id } = req.params;

  let listing = await Listing.findById(id);

  if (!listing) {
  req.flash("error", "Listing not found");
  return res.redirect("/listings");
}

  // update basic fields
  Object.assign(listing, req.body.listing);

  // update geometry if location changed
  const location = `${req.body.listing.location}, ${req.body.listing.country}`;

  const response = await axios.get(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${process.env.MAPTILER_KEY}`
  );

  const feature = response.data.features[0];

  if (feature) {
    listing.geometry = {
      type: "Point",
      coordinates: feature.center
    };
  }

  // update image if uploaded
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }

  await listing.save();

  req.flash("success", "Listing updated successfully!");
  console.log("redirecting...");
  return res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // delete image from Cloudinary
  if (listing.image && listing.image.filename) {
    await cloudinary.uploader.destroy(listing.image.filename);
  }

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted successfully");
  console.log("redirecting...");
  return res.redirect("/listings");
};