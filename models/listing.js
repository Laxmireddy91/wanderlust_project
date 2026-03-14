const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { required } = require("joi");

const listingSchema = new Schema({
    title:{
      type:String,
      required:true,
    },
    description:String,
    image:{
      url:String,
      filename:String,
    },
    price:Number,
    location:String,
    country:String,
      geometry:{
    type:{
      type:String,
      enum:["Point"],
      required:true
    },
    coordinates:{
      type:[Number],
      required:true
    }
  },

    reviews :[
      {
        type:Schema.Types.ObjectId,
        ref:"Review",
      },
    ],
    owner: {
      type : Schema.Types.ObjectId,
      ref : "User",
    },
    
    category :{
    type:String,
    enum:["trending",
        "rooms",
        "iconic cities",
        "mountains",
        "castles",
        "amazing pools",
        "camping",
        "farms",
        "arctic"
    ],
    required: true
    }
 
}); 

//middleware
listingSchema.post("findOneAndDelete",async (listing)=>{
  if(listing){
  await Review.deleteMany({_id:{$in:listing.reviews}});
  }
});

listingSchema.index({ geometry: "2dsphere" });

//model
const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;