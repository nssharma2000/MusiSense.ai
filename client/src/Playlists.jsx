import { Helmet } from "react-helmet";
import logo from './images/MusiSense.png';
import settings_icon from './images/settings (white).svg';
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import close_button from './images/close-button.svg';
import home from "./images/home (white).svg"
import threeDots from "./images/three-dots.svg"
import blankImage from './images/blank.png'
import { AuthContext } from "./context/AuthContext";
import NewPlaylist from "./dialogBoxes/NewPlaylist";
import { PlaylistContext } from './context/PlaylistContext'
import './Playlists.css'
import { useRef } from "react";
import logo2 from './images/MusiSense (transparent).png'
import EditPlaylist from './dialogBoxes/EditPlaylist'
import DeleteDialog from './dialogBoxes/DeleteDialog'

axios.defaults.withCredentials = true





function Playlists() {

  
  let nodeBackendUrl = import.meta.env.VITE_NODE_BACKEND_URL

  const [videos, setVideos] = useState([]);

  const { currentPlaylist, setCurrentPlaylist, fetchPlaylists, playlists } = useContext(PlaylistContext);

  const [isCreated, setIsCreated] = useState(false)

  const [isPnbShown, setIsPnbShown] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(null)

  const [isEpbShown, setIsEpbShown] = useState(false)

  const [epbProps, setEpbProps] = useState(null)

  const [isDdShown, setIsDdShown] = useState(false)

  const [ddProps, setDdProps] = useState()

  const [playlistVideos, setPlaylistVideos] = useState([])

  const [currentVideo, setCurrentVideo] = useState(null)

  const [activePlaylistIndex, setActivePlaylistIndex] = useState(null)

  const [isLiked, setIsLiked] = useState(false)

  const [isDisliked, setIsDisliked] = useState(false)

  const menuRef = useRef(null)

  const playlistRef = useRef(null)

  const playlistVideoRef = useRef(null)

  const NewPlaylistProps = {isShown: isPnbShown, setIsShown: setIsPnbShown, isCreated: isCreated, setIsCreated: setIsCreated}

  
  useEffect(() => {

    if(isCreated) 
    {
      async function handleFetch() {
        await fetchPlaylists()
        }
        
        handleFetch() 
        setIsCreated(false);
        successAnimation()
    }
    }, [isCreated])

  useEffect(() => {async function handleFetch() {
    await fetchPlaylists()
    }

    handleFetch()
  }, [])

    useEffect(() => {
    if(currentVideo)
    {
      if (!window.YT) {
        const tag = document.createElement('script')
        tag.src = "https://www.youtube.com/iframe_api"
        document.body.appendChild(tag)
        window.onYouTubeIframeAPIReady = loadPlayer
        } else {
          loadPlayer()
        }
    }
    }, [currentVideo])

    

    useEffect(() => {
      function handleClickOutside(event) {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setCurrentIndex(null);
        }
        if(playlistRef.current && !playlistRef.current.contains(event.target))
        {
          setActivePlaylistIndex(null)
        }
      }
    
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);


  useEffect(() => {
  async function f(currentVideo)
  {
    if(currentVideo)
    {
      await getLikedOrDisliked(currentVideo)
    }
  }

  f(currentVideo)
}, [currentVideo])

  async function handleLike(currentVideo)
  {
    let video = currentVideo

    if(isLiked)
    {
      setIsLiked(!isLiked)
      console.log("abc: ", video)
      const response = await axios.delete(nodeBackendUrl + "unlike", { data: { email, video }})
    }
    else
    {
      if(isDisliked)
      {
        setIsDisliked(!isDisliked)
      }
      
        setIsLiked(true)

        const response = await axios.post(nodeBackendUrl + "add_like", { video, email })

        console.log(response.data)
    
      }
  }

  async function handleDislike(currentVideo)
  {
    let video = currentVideo

    if(isDisliked)
    {
      setIsDisliked(!isDisliked)
      const response = await axios.delete(nodeBackendUrl + "undislike", { data: { email, video }})
    }
    else
    {
      if(isLiked)
      {
        setIsLiked(!isLiked)
      }
      
        setIsDisliked(true)

        const response = await axios.post(nodeBackendUrl + "add_dislike", { video, email })

        console.log(response.data)
    
      }
  }
     
  async function getLikedOrDisliked(video)
  {
    const response = await axios.post(nodeBackendUrl + "get_liked_or_disliked", { video, email })
    console.log("get:", response.data)
    if(response.data.liked === true)
    {
      setIsLiked(true)
    }
    else
    {
      setIsLiked(false)
    }

    if(response.data.disliked === true)
    {
      setIsDisliked(true)
    }
    else 
    {
      setIsDisliked(false)
    }
  }

  const { loggedIn, setLoggedIn, logout } = useContext(AuthContext)
  
  let email = localStorage.getItem("email")

  let welcome_name = email.split('@')[0].split('.').join('')
   

  

   function successAnimation()
   {
       const successBox = document.getElementById("newPlaylistSuccessBox")
       successBox.classList.add("show")

       setTimeout(() => { successBox.classList.remove("show") }, 3000)
   }

   async function openEpb(playlist)
   {
      setCurrentPlaylist(playlist)
      setEpbProps({
        isEpbShown,
        setIsShown: setIsEpbShown,
      })

      setIsEpbShown(true)
       console.log("current playlist: ", currentPlaylist)
   }

   async function openDd(playlist)
   {
      setCurrentPlaylist(playlist)
      setIsDdShown(true)

      setDdProps({
        isShown: isDdShown,
        setIsShown: setIsDdShown,
      })

     
   }

   let player;

const playerRef = useRef(null);

function loadPlayer() {
  if (playerRef.current) {
    playerRef.current.destroy();
  }

  playerRef.current = new window.YT.Player('yt-player', {
    height: '500',
    width: '889',
    videoId: currentVideo?.id,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
    },
  });
}

async function onPlayerStateChange(event) {
  if (event.data === window.YT.PlayerState.ENDED) {
    const index = currentPlaylist.videos.findIndex(v => v.id === currentVideo.id);
    if (index < currentPlaylist.videos.length - 1) {
      setCurrentVideo(currentPlaylist.videos[index + 1])
    }
  }
}

async function onPlayerReady(event) {
  event.target.playVideo();
  console.log(currentVideo)
  const video = await getVideo(currentVideo.id)
  await addToHistory(video)
}

async function addToHistory(video)
  {
    try
    {
      let response = await axios.post(nodeBackendUrl + "add_to_history", { video, email })
      console.log(response)
    }

    catch (err)
    {
      console.error(err)
    }
  }

  async function getVideo(videoId)
  {
    const api_key = 'AIzaSyDVQlBzMxAJpztiQBlzW2iUVKnl_Edq4QE'
    const url = `https://www.googleapis.com/youtube/v3/videos?part=topicDetails,snippet&id=${videoId}&key=${api_key}`

    const response = await axios.get(url, { withCredentials: false })

    const items = response.data.items

    console.log(response.data)

    console.log("items: ", items)

    const categoriesArray = items[0].topicDetails.topicCategories

    console.log("categoriesArray:", categoriesArray)
    
    let finalArray = []

    for(let i = 0; i < categoriesArray.length; i++)
    {
      const categories = categoriesArray[i].split('/').at(-1)
      finalArray.push(categories)
      
    }

    console.log(finalArray)

    const final = { id: items[0].id, title: items[0].snippet.title, genres: finalArray}

    return final
  }

  async function onVideoStart()
  {
    const video = await getVideo(currentVideo.id.videoId)
    await addToHistory(video)
  }



    
  let username = localStorage.getItem("Username")

  

  return (<>
    <Helmet>
      <title>MusiSense</title>
      <link rel="icon" href="images/MusiSense.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
    </Helmet>

    <div id="main_container" className="container text-center mx-auto">
      <div id="top" className="w-[100%] h-[100px]">
      <div id="navbar" className="w-full h-[40%] md:h-[100%] lg:h-[74%] xl:h-[60%] bg-gradient-to-r from-purple-500 to-indigo-600 flex justify-between">
            <div id="logo_container_n" href="/" className="rounded-full w-[10%] flex justify-center items-center">
              <img src={ logo2 } onClick={ () => window.location.assign("/") } className="w-[80%] lg:w-[40%] mt-[5%] h-[80%] lg:h-[90%] hover:cursor-pointer"></img>
            </div>
            { loggedIn &&
            <div className="text-center flex w-[30%] justify-center mx-auto items-center">
                <h3 className="text-sm text-white md:text-xl text-nowrap">Welcome, { username }</h3>
            </div>
            }


            <div className="text-center w-[30%] ml-auto flex items-center justify-center">
            { loggedIn ? 
            <a onClick={ () => logout() } id="log_out_button" className="lg:w-[35%] me-[2%] text-nowrap text-white text-xs md:text-lg font-medium rounded-full lg:px-4 py-2 bg-blue-500 shadow-lg hover:cursor-pointer hover:shadow-blue-500/50 duration-300">Log out</a>
            
            : <a id="login_button" href="login" className="lg:w-[25%] me-[2%] text-white text-xs md:text-lg font-medium rounded-full px-4 py-2 bg-blue-500 shadow-lg hover:shadow-blue-500/50 duration-300">Login</a>
            }

            { !loggedIn &&
            <a id="register_button" href="registration" className="lg:w-[40%] text-white text-xs md:text-lg font-medium rounded-full px-4 py-2 bg-red-500 shadow-lg hover:shadow-red-500/50 duration-300">Register</a>
            }
            </div>
          <div className="w-[15%] flex flex-col text-center items-center">
            <a href="settings" className="flex flex-col items-center">
            <img id="settings" src={ settings_icon } className="h-[12%] mt-[2%] hover:cursor-pointer" />
            <div className="font-medium text-white text-[0.6rem] md:text-lg text-center">Settings</div>
            </a>
          </div>
          </div>
      </div>
      <div id="newPlaylistSuccessBox" className="w-[30%] lg:w-[12%] rounded-md lg:text-xl ml-[60%] lg:ml-[70%] text-center fixed h-[20%] md:h-[calc((10vw+10vh)/2)] lg:h-[20%] p-2 text-white bg-gradient-to-b from-green-500/75 to-green-600/75">Playlist created successfully!</div>
      <div id="bg" className="container text-center bg-slate-50 h-full">
        <div id="logo_container" className="text-center mx-auto w-4/5 h-2/5">
        <img src={ logo } className="mx-auto" style={{ width: "25%"}} />
        </div>
        
        { 
          isPnbShown ? 
          <NewPlaylist props={NewPlaylistProps} />
          :
          <></>
        }

        {
          isEpbShown &&

          <EditPlaylist props={epbProps} />
        }

        {
          isDdShown &&

          <DeleteDialog props={ddProps} />
        }
        <div id="playlist_container" className="text-center mx-auto flex-auto bg-gradient-to-b from-slate-50 to-slate-100 rounded-md border border-slate-100 w-4/5">
        {
          (playlists.length > 0) ? 
          
          (<div id="playlists_box" className="text-center mx-auto bg-slate-100 overflow-auto">
              {  playlists.map((playlist, index) =>
                
                 <div key={ playlist.Name }>

                <div ref={playlistRef} className={`h-[9vw] w-[95%] hover:cursor-pointer ${currentPlaylist === playlist ? "bg-slate-300" : "bg-slate-200"} mx-auto px-2 flex items-center justify-between rounded-md text-black`} onClick={ async () => { if(currentPlaylist !== playlist) { setCurrentPlaylist(playlist); setCurrentVideo(playlist.videos[0]); } } }>
                  <img src={ playlist.videos.length > 0 ?
                  
                    `https://i.ytimg.com/vi/${playlist.videos[0].id}/hqdefault.jpg`
                  
                  :

                  blankImage

                  
                  } className="w-[13%] h-[90%] rounded-md" />

                  <div id="playlist_name_container" className="text-center text-sm lg:text-xl">
                  { playlist.Name }
                  </div>
                  <div className="w-[calc(0.3*9vw)] h-[30%] flex items-center hover:bg-gray-100 hover:cursor-pointer rounded-full" onClick={ () => setCurrentIndex(index) }>
                    <img src={ threeDots } className="w-[60%] mx-auto" />
                  </div>
                  { currentIndex === index && (
                  <div ref={menuRef} className="rounded-md absolute w-[15%] lg:w-[10%] mt-[4%] md:ml-[60%] ml-[65%] lg:ml-[72%]">
                    <div className="bg-gray-100 rounded-md px-1 py-2">
                       <ul>
                        <li className="mb-[2%] hover:bg-gradient-to-b hover:from-blue-500 hover:to-blue-600 hover:cursor-pointer hover:text-white rounded-md text-sm lg:text-xl text-start px-[10%] py-1" onClick={ async() => await openEpb(playlist) }>Edit</li>
                        <li className="mb-[2%] hover:bg-gradient-to-b hover:from-blue-500 hover:to-blue-600 hover:cursor-pointer hover:text-white rounded-md text-sm lg:text-xl text-start px-[10%] py-1" onClick={ async() => await openDd(playlist) }>Delete</li>
                       </ul>
                    </div>
                  </div>
                  )
                  } 
                </div>
                <br />
                </div>
                )
              }
            </div>) 
            :
            <div className="text-xl p-8 text-center">
            You don't have any playlists.
            </div>
        }
        </div>
        <br />
        <br />
        <div id="button_container" className="mx-auto flex-auto items-center justify-around">
        <button className="text-2xl text-white p-4 rounded-lg text-center bg-gradient-to-b from-blue-500 from-50% via-violet-500 via-80% to-purple-500 shadow-lg cursor-pointer hover:shadow-blue-600/70 duration-300" onClick={ () => setIsPnbShown(true) }>
          Create new playlist
        </button>
        <br />
        <br />
        </div>
        <div id="playlist_videos_box" className="w-[90%] h-[15vh] mx-auto items-center whitespace-nowrap overflow-x-auto justify-start flex gap-4 flex-row rounded-md shadow-inner md:h-[40vh] bg-purple-100">
        {
            
            
            currentPlaylist &&
                
                currentPlaylist.videos.map((video) => (
                    <div className={`inline-block w-[15vw] min-w-[15vw] ms-[3vw] flex flex-col justify-start ${currentVideo === video ? "bg-neutral-100" : "bg-white" } items-center text-center text-md h-[90%] hover:cursor-pointer rounded-md shadow-xl`} key={ video.id } onClick={ (e) => setCurrentVideo(video) } >
                      <div className="w-[88.8%] h-[50%] mx-auto">
                        <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} className="w-full h-full rounded-md"></img>
                      </div>
                      <div className="w-[95%] text-[0.35rem] text-wrap md:text-xs xl:text-base">
                      {video.title}
                      </div>
                    </div>
                )
              )
                
            
          
        }  
        </div>
        <br />
        <div className="bg-neutral-200 py-[5%] w-[90vw] mx-auto rounded-sm h-[60%]">
        <div className="mx-auto rounded-sm w-[50vw] h-[28vw]" id="yt-player"></div>
        { currentVideo &&
        <div className="mt-[5vh] mx-auto flex justify-around">
          <div id="like_button" className={`text-center text-white text-sm ${isLiked ? "bg-blue-700" : "bg-blue-500" } md:text-xl md:w-[7%] py-1 rounded-md bg-blue-500 hover:cursor-pointer inline-block`} onClick={ () => handleLike(currentVideo) }>Like</div>
          <div id="dislike_button" className={`text-center text-white text-sm md:text-xl md:w-[10%] py-1 ${isDisliked ? "bg-red-700" : "bg-red-500"} rounded-md hover:cursor-pointer inline-block` } onClick={ () => handleDislike(currentVideo) }>Dislike</div>
        </div>
        }
        </div>
       </div>
  </div>
  </>
     
  );

}


export default Playlists;


