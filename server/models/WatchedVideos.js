const mongoose = require('mongoose')


const WatchedVideosSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    videos: [{id: { type: String, required: true }, 
              title: { type: String, required: true },
              genres: [{ type: String }], 
            }],
})




  



const WatchedVideosModel = mongoose.model("watched-videos", WatchedVideosSchema)
module.exports = WatchedVideosModel



