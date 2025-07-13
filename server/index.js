const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const UserModel = require('./models/Users')
const PreferenceModel = require('./models/UserPreferences')
const PlaylistModel = require('./models/Playlists')
const WatchedVideosModel = require('./models/WatchedVideos')
const LikesDislikesModel = require('./models/LikesAndDislikes')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()

let frontend_path = "https://musisenseai.vercel.app"

app.use(cors({
  origin: frontend_path,
  credentials: true
}
))
app.use(express.json())
app.use(cookieParser())




  mongoose.connect("mongodb+srv://nssharma2000:nama1234@cluster0.oelsdrp.mongodb.net/MusiSense?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("Connected to MongoDB")
  })
.catch( (error) => {
  console.log(error)
})


app.get('/verify_token', async (req, res) => {

  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ loggedIn: false })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("Decoded: ", decoded)
    res.json({ loggedIn: true, user: decoded })
  }
  catch (error) {
    res.status(401).json({ loggedIn: false, error: "Invalid token" })
  }
})


async function checkExists(username, email) {
  try {
    const user = await UserModel.findOne({ $or: [{ username }, { email }] })
    if (user) {
      return true;
    }
    else {
      return false
    }
  } catch (error) {
    console.error('Error checking user existence: ', error);
  }
}

app.post('/register', async (req, res) => {
  console.log(req.body)


  const hashedPassword = await hashPassword(req.body.password);

  let Existence = await checkExists(req.body.username, req.body.email)

  if (!Existence) {
    const newUser = new UserModel({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const user = await UserModel.findOne({ email: req.body.email })

    const user_id = newUser._id

    const newP = new PreferenceModel({
      user_id: user_id,
      rSetting: 0,
      genres: Array.from({ length: 9 }, (_, i) => ({
        number: i,
        isTrue: false
      }
      ))
    })

    try {
      const savedUser = await newUser.save();
      const savedP = await newP.save()
      res.json({ savedUser, savedP });
    } catch (err) {
      res.json({ message: err.message });
    }
  }

  else {
    res.json({ message: "User already exists.", already: "Yes" })
  }
})

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("It's hashed!")
  return hashedPassword;
}


app.post('/login', async (req, res) => {

  const { email, password } = req.body;
  console.log(req.body);

  try {
    const user = await UserModel.findOne({ email });
    console.log("Found user: ", user)

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    const storedHashedPassword = user.password.trim()

    const hashedPassword = await bcrypt.hash(password, 10); // Adjust salt rounds as needed
    console.log("Hashed input password:", hashedPassword);

    console.log("storedHashedPassword: ", storedHashedPassword)

    const isMatch = await bcrypt.compare(password, storedHashedPassword);
    console.log(isMatch)

    if (isMatch) {
      const payload = { userId: user._id };
      token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 5 * 60 * 60 * 1000
      })

      res.json({ message: "Logged in" })





    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
})


app.post('/logout', (req, res) => {
  res.clearCookie("token", {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 5 * 60 * 60 * 1000
  })
  res.json({ message: "Logged out" })
})



app.get('/getRSetting', async (req, res) => {

  const email = req.query.em
  console.log("email: ", email)

  const user = await UserModel.findOne({ email })

  const user_id = user._id

  const doc = await PreferenceModel.findOne({ user_id })
  const RS = doc.rSetting
  console.log(RS)
  res.json(RS)

}
)


app.post('/sendRSetting', async (req, res) => {
  const r_setting = req.body.rSetting
  const email = req.body.email

  const user = await UserModel.findOne({ email })

  const user_id = user._id

  console.log(r_setting)
  console.log(email)

  const updatedRecord = await PreferenceModel.updateOne({ user_id }, { $set: { rSetting: r_setting } })

  res.json()
})


app.post('/new_playlist', async (req, res) => {
  console.log(req.body)

  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  const playlist = await PlaylistModel.findOne({ Name: req.body.name, user_id: user_id })

  if (playlist) {
    res.json({ playlist_already: "Yes" })
  }
  else {




    const newPlaylist = new PlaylistModel({
      user_id: user_id,
      Name: req.body.name,
      videos: [],
    });

    try {

      const savedPlaylist = await newPlaylist.save();
      res.json({ savedPlaylist });
    } catch (err) {
      res.json({ message: err.message });
    }
  }
})

app.post('/update_playlist', async (req, res) => {
  console.log(req.body)

  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  let playlist = await PlaylistModel.findOne({ Name: req.body.Name, user_id: user_id })

  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }

  const updatedPlaylist = req.body.updatedPlaylist

  const updated = await PlaylistModel.findOneAndUpdate(
    { Name: req.body.Name, user_id: user_id },
    { $set: updatedPlaylist },
    { new: true }
  );

  res.json(playlist)
})

app.post('/rename_playlist', async (req, res) => {
  console.log(req.body)

  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  let playlist = await PlaylistModel.findOne({ Name: req.body.Name, user_id: user_id })

  console.log("Playlist: ", playlist)

  const newName = req.body.newName

  let a = await PlaylistModel.findOneAndUpdate(
    { Name: req.body.Name, user_id: user_id },
    { $set: { Name: newName } },
    { new: true }
  )

  console.log("a:", a)

  await res.json(a)




})

app.delete('/delete_playlist', async (req, res) => {
  console.log(req.body)



  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  let playlist = await PlaylistModel.findOne({ Name: req.body.Name, user_id: user_id })

  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }

  await PlaylistModel.deleteOne({ _id: playlist._id })

  res.json("Playlist has been deleted.")


})

app.post('/add_to_history', async (req, res) => {

  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  const video = req.body.video

  try {
    let doc = await WatchedVideosModel.findOne({ user_id })

    if (!doc) {
      doc = new WatchedVideosModel({
        user_id,
        videos: video
      })
    }
    else {
      if (doc.videos.length === 500) {
        doc.videos.shift()
      }

      doc.videos.push(video)
    }

    await doc.save()
    await res.json(doc)
  }
  catch (err) {
    console.error(err)
  }

})

app.post('/get_liked_or_disliked', async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  const video = req.body.video

  let doc = await LikesDislikesModel.findOne({ user_id })

  let attemptLiked = false

  let attemptDisliked = false

  console.log(video)

  if (!doc) {
    await res.json({ liked: false, disliked: false })
    return
  }
  else {
    for (let i = 0; i < doc.likedVideos.length; i++) {
      if (doc.likedVideos[i].id === video.id) {
        attemptLiked = true
      }
    }

    for (let i = 0; i < doc.dislikedVideos.length; i++) {
      if (doc.dislikedVideos[i].id === video.id) {
        attemptDisliked = true
      }
    }
  }

  await res.json({ liked: attemptLiked, disliked: attemptDisliked })
})

app.post('/add_like', async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  const video = req.body.video

  console.log(video)

  let doc = await LikesDislikesModel.findOne({ user_id })

  if (!doc) {
    doc = new LikesDislikesModel({
      user_id,
      likedVideos: [],
      dislikedVideos: [],
    })
  }
  else {
    if (doc.likedVideos.length === 500) {
      doc.likedVideos.shift()
    }
  }

  doc.dislikedVideos = doc.dislikedVideos.filter(v => v.id !== video.id)



  doc.likedVideos.push(video)
  await doc.save()

  res.json(doc)
})

app.delete('/unlike', async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  const video = req.body.video

  console.log("video (unlike):", video)

  const doc = await LikesDislikesModel.findOne({ user_id })

  doc.likedVideos = doc.likedVideos.filter(v => v.id !== video.id)

  await doc.save()

  console.log()
})

app.post('/add_dislike', async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  const video = req.body.video

  console.log(video)

  let doc = await LikesDislikesModel.findOne({ user_id })

  if (!doc) {
    doc = new LikesDislikesModel({
      user_id,
      likedVideos: [],
      dislikedVideos: [],
    })
  }
  else {
    if (doc.dislikedVideos.length === 500) {
      doc.dislikedVideos.shift()
    }

    doc.likedVideos = doc.likedVideos.filter(v => v.id !== video.id)

  }

  doc.dislikedVideos.push(video)
  await doc.save()

  res.json(doc)
})

app.delete('/undislike', async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  const video = req.body.video

  const doc = await LikesDislikesModel.findOne({ user_id })

  doc.dislikedVideos = doc.dislikedVideos.filter(v => v.id !== video.id)

  await doc.save()

  console.log()
})

app.get('/get_preferences', async (req, res) => {
  console.log(req.query.email)
  const user = await UserModel.findOne({ email: req.query.email })
  const user_id = user._id

  let doc = await PreferenceModel.findOne({ user_id })

  if (!doc) {
    const genres = Array.from({ length: 9 }, (_, i) => ({
      number: i,
      isTrue: false
    }))

    doc = new PreferenceModel({
      user_id,
      rSetting: 0,
      genres,
      isEnabled: true
    })

    await doc.save()

  }

  await res.json(doc)


})

app.put('/update_preferences_enabled', async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  console.log(req.body)

  let doc = await PreferenceModel.findOne({ user_id })

  doc.isEnabled = req.body.enabled

  await doc.save()

  console.log("enabled: ", req.body.enabled)

})

app.put("/update_selected_genres", async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email })
  const user_id = user._id

  let doc = await PreferenceModel.findOne({ user_id })

  let arr = req.body.arr

  doc.genres = arr.map((value, index) => ({ number: index, isTrue: value }))

  await doc.save()

})


app.post('/fetch_playlists', async (req, res) => {
  const email = req.body.email
  const user = await UserModel.findOne({ email: email })
  const user_id = await user._id

  const playlists = await PlaylistModel.find({ user_id: user_id })
  console.log(playlists)
  res.json(playlists)
})

app.all('/ping', async (req, res) => {
  try {
    res.json({ message: "Pong!" })
  } catch (error) {
    console.error("Error in ping route:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
} 
)


app.listen(process.env.PORT || 3001, () => {
  console.log("Server is running. ")
})  