const mongoose = require('mongoose')


const PlaylistSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    Name: { type: String },
    videos: [{id: { type: String, required: true }, 
              title: { type: String, required: true },
              genres: [{ type: String }],
            }],
})



    



const PlaylistModel = mongoose.model("playlist", PlaylistSchema)
module.exports = PlaylistModel



