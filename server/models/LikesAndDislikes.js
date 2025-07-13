const mongoose = require('mongoose')


const LikesDislikesSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    likedVideos: [{id: { type: String, required: true }, 
              title: { type: String, required: true },
              genres: [{ type: String }], 
            }],
    dislikedVideos: [{id: { type: String, required: true }, 
              title: { type: String, required: true },
              genres: [{ type: String }], 
            }],
})




  



const LikesDislikesModel = mongoose.model("likes_dislikes", LikesDislikesSchema)
module.exports = LikesDislikesModel



