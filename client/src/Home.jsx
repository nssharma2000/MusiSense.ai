import { Helmet } from "react-helmet";
import logo from './images/MusiSense.png';
import './Home.css';
import settings_icon from './images/settings (white).svg';
import { useState, useEffect, useContext, useLayoutEffect, useRef } from "react";
import axios from "axios";
import close_button from './images/close-button.svg'
import logo2 from './images/MusiSense (transparent).png'
import sparkle from './images/sparkle.svg'
import { AuthContext } from "./context/AuthContext";
import Webcam from "react-webcam"


function Home() {

  const nodeBackendUrl = import.meta.env.VITE_NODE_BACKEND_URL

  const pythonBackendUrl = import.meta.env.VITE_PYTHON_BACKEND_URL

  const [videos, setVideos] = useState([]);
  
  const [currentVideo, setCurrentVideo] = useState(null)

  const [rSetting, setRSetting] = useState(0)

  const [recommendedVideos, setRecommendedVideos] = useState([])


  const [isLoading, setIsLoading] = useState(false)

  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false)

  const [isLiked, setIsLiked] = useState(false)

  const [isDisliked, setIsDisliked] = useState(false)

  const [textPrompt, setTextPrompt] = useState("")

  const [isRecommendationBoxShown, setIsRecommendationBoxShown] = useState(false)

  const [modelsLoaded, setModelsLoaded] = useState(false)

  const { loggedIn, setLoggedIn, logout } = useContext(AuthContext)

  const [email, setEmail] = useState(localStorage.getItem("email"))

  const [username, setUsername] = useState("")

  let isManuallyPaused = false

  const webcamRef = useRef(null)





  useEffect(() => {
    if(loggedIn)
    {
      setEmail(localStorage.getItem("email"))
      setSwitch()
      setUsername(email.split('@')[0].split('.').join(''))
    }
  }, [loggedIn])

  useEffect(() => {
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = loadPlayer;
  } else {
    loadPlayer();
  }
}, [currentVideo]);

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

useEffect(() => {
  setEmail(localStorage.getItem("email"))
}, [])






const playerRef = useRef(null);

function loadPlayer() {
  if (!currentVideo) return;

  if (playerRef.current) {
    playerRef.current.destroy();
  }

  playerRef.current = new window.YT.Player('yt-player', {
    videoId: currentVideo.id.videoId,
    events: {
      'onStateChange': onPlayerStateChange,
    },
  });
}

async function onPlayerStateChange(event) {


  
  const playerState = event.data;

  if (playerState === window.YT.PlayerState.PAUSED) {
    isManuallyPaused = true;
  }

  if (playerState === window.YT.PlayerState.PLAYING) {
    if (isManuallyPaused) {
      isManuallyPaused = false;
      return;
    }

    await onVideoStart();
  }
}




  async function onVideoStart()
  {
    const video = await getVideo(currentVideo.id.videoId)
    await addToHistory(video)
  }

  const [isShown, setIsShown] = useState(false)

  
  let [videoIdArray, setVideoIdArray] = useState([])

  async function handleSearchD(e)
  {
    if(e.key === "Enter")
    {
      await search(0)
    }
  }

  async function handleSearchM(e)
  {
    if(e.key === "Enter")
    {
      await search(1)
    }
  }

  async function handleLike(videoId)
  {
    let video = await getVideo(videoId)

    if(isLiked)
    {
      setIsLiked(!isLiked)
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

  async function handleDislike(videoId)
  {
    let video = await getVideo(videoId)

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

  async function getGenres()
  {
    let response = null
    try 
    {
      response = await axios.get(pythonBackendUrl + `get_genres/${email}`)
    }
    finally 
    {
      console.log(response)
    }
  }
    

  async function getLikedOrDisliked(video)
  {
    const final = await getVideo(video.id.videoId)
    const response = await axios.post(nodeBackendUrl + "get_liked_or_disliked", { video: final, email })
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


  async function search(a) {
    let searchQuery=""
    if(a === 0)
    {
      searchQuery = document.getElementById("vs_box").value;
    }
    else
    {
      searchQuery = document.getElementById("vs_m_box").value;
    }
    
    const api_key = 'AIzaSyDVQlBzMxAJpztiQBlzW2iUVKnl_Edq4QE';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&type=video&videoCategoryId=10&q=${searchQuery}&key=${api_key}`;

      try {
        setVideos([])
        setIsLoading(true)
        const response = await axios.get(url, { withCredentials: false });
        setVideos(response.data.items);
        console.log(response.data)
      }
      catch(err)
      {
        console.error(err)
      }
      finally
      {
        setIsLoading(false)
      }
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

    const items = await response.data.items

    console.log("items: ", items[0])

    const categoriesArray = items[0].topicDetails.topicCategories

    console.log(categoriesArray)
    
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


  async function setSwitch()
  {
    let fetchedRSetting = await getRSetting();
    setRSetting(fetchedRSetting)

    if(fetchedRSetting == 0)
    {
      document.getElementById("switch").style.marginLeft="0"
      document.getElementById("switch_capsule").style.backgroundColor="#8b32ff"
    }
    else
    {
      document.getElementById("switch").style.marginLeft="61%"
      document.getElementById("switch_capsule").style.backgroundColor="orange"
    }
  }

  async function toggleSwitch()
  {
    let fetchedRSetting = await getRSetting();

    console.log("RSetting: ", rSetting)

    if(fetchedRSetting == 0)
    {
      setRSetting(1)
      axios.post(nodeBackendUrl+"sendRSetting", { rSetting: 1, email })
      .then(result => {
        console.log(result)
      })
      .catch(error =>
      {
        console.log(error)
      }
      )
      document.getElementById("switch_capsule").style.animation="bg_switch_to_r 1s ease-in-out forwards"
      document.getElementById("switch").style.animation="switch_to_r 1s ease-in-out forwards"
    }
    else
    {
      setRSetting(0)
      axios.post(nodeBackendUrl+"sendRSetting", { rSetting: 0, email })
      .then(result => {
        console.log(result)
      })
      .catch(error =>
      {
        console.log(error)
      }
      )
      document.getElementById("switch_capsule").style.animation="bg_switch_to_l 1s ease-in-out forwards"
      document.getElementById("switch").style.animation="switch_to_l 1s ease-in-out forwards"
    }
  }

  async function getRSetting()
  {
    if(email)
    {
      const response = await axios.get(nodeBackendUrl+"getRSetting", { params: { em: email } });
      let fetchedRSetting = response.data
      setRSetting(fetchedRSetting)
      return fetchedRSetting
    }
  }
  
  
  async function recommend(rSetting)
  {
    let prompt = textPrompt.trim()
    if(rSetting == 0)
    {
      
      try
      {
        setRecommendedVideos([])
        setIsRecommendedLoading(true)
        let response = await axios.post(pythonBackendUrl + `recommend_0/${email}`, { prompt })
        let searchQuery = response.data
       

        console.log(searchQuery)

        const api_key = 'AIzaSyDVQlBzMxAJpztiQBlzW2iUVKnl_Edq4QE';
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&type=video&videoCategoryId=10&q=${searchQuery}&key=${api_key}`;

        
        const response2 = await axios.get(url, { withCredentials: false });
        setRecommendedVideos(response2.data.items);
        console.log(response2.data)
        setIsRecommendationBoxShown(true)
      }
      catch(err)
      {
        console.error(err)
      }
      finally
      {
        setIsRecommendedLoading(false)
      }
    }
    else
    {
      try
      {
        setRecommendedVideos([])
        setIsRecommendedLoading(true)

        const imageSrc = webcamRef.current.getScreenshot()

        

        let response = await axios.post(pythonBackendUrl + `recommend_1/${email}`, { image: imageSrc })

        let searchQuery = response.data
        console.log(searchQuery) 

        const api_key = 'AIzaSyDVQlBzMxAJpztiQBlzW2iUVKnl_Edq4QE';
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&type=video&videoCategoryId=10&q=${searchQuery}&key=${api_key}`;

        
        const response2 = await axios.get(url, { withCredentials: false });
        setRecommendedVideos(response2.data.items);
        console.log(response2.data)
        setIsRecommendationBoxShown(true)
      }
      catch(err)
      {
        console.error(err)
      }
      finally
      {
        setIsRecommendedLoading(false)
      }


    }
  }

  function RecommendationBox()
  {
  return (
  <>
  <div className="bg-slate-900/60 z-1000 fixed w-full h-[100vh]"></div>
  <div id="main_container" className="mx-auto mt-[10vh] w-[80%] z-1001 fixed text-center rounded-lg bg-purple-500">
    <div id="top_container" className="mx-auto w-[100%] p-2 flex justify-around text-center">
      <div className="text-center text-white mx-auto">Recommendations</div>
      <img src={close_button} className="w-[5%] hover:cursor-pointer" onClick={ () => setIsRecommendationBoxShown(false) } /> 
    </div>
    <div id="video_box" className="bg-white w-[80%] h-[50vh] overflow-y-auto lg:h-[70vh] rounded-lg text-center mx-auto shadow-inner">
       { recommendedVideos && (isRecommendedLoading ?
            Array(10).fill(0).map((_, idx) => (
              <div key={idx} className="animate-pulse bg-white w-4/5 mx-auto rounded-md p-4 mb-4">
                <div className="bg-gray-300 h-20 w-1/2 mx-auto rounded"></div>
                <div className="mt-4 h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
              </div>
            ))
            
            :  
            recommendedVideos.map((video) => 
            <>
            <div className="bg-white w-4/5 mx-auto rounded-md" >
              <img src={ video.snippet.thumbnails.high.url } style={ { width: "50%", margin: "auto" } } onClick={ () => setCurrentVideo(video) } className="border-md rounded-md hover:cursor-pointer"  />
              <h3 onClick={() => setCurrentVideo(video) } className="text-slate-600 hover:cursor-pointer">{ video.snippet.title.replaceAll('&quot;', '"').replaceAll('&#39;', '\'') }</h3>
            </div>
            <br />
            </>       
            )) 
       }
      
    </div>
    <br />
    <br />
  </div>
  </>
  )
  }

  async function sendScreenshot()
  {
    

  }

  function FaceMoodDetector() {

  

  return (
    <Webcam
      audio={false}
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      width={1600}
      height={900}
      className="rounded-md"
      videoConstraints={{
        width: 1600,
        height: 900,
        facingMode: "user",
      }}
    />
  );
};

  
  

//
{/* <div className="col-start-1 text-center row-start-1 col-end-6 row-end-2">
            <div className="text-center mx-auto h-full">
            <img src={ logo } id="logo_img" className="lg:w-[40%] sm:w-[80%]" style={{margin: "auto"}} />
            </div>
          </div> */}

  return ( 
    <>
    <Helmet>
      <title>MusiSense</title>
      <link rel="icon" href="images/MusiSense.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
    </Helmet>

    <div id="main_container" className="container text-center mx-auto">
      <div id="bg" className="container text-center bg-slate-50 h-full">
        <div id="main_grid" className="grid grid-cols-8 grid-rows-5 gap-1.5">
          <div className="w-full row-start-1 row-end-2 flex flex-col h-[80%] col-start-1 col-end-9 justify-between items-center">
          <div id="navbar" className="w-full h-[30%] md:h-[20%] lg:h-[15%] xl:h-[12%] bg-gradient-to-r from-purple-500 to-indigo-600 flex justify-between col-start-1 col-end-9">
            <div id="logo_container_n" href="/" className="rounded-full w-[20%] lg:w-[10%] flex justify-center items-center">
              <img src={ logo2 } onClick={ () => window.location.assign("/") } className="w-[80%] mt-[5%] h-[80%] hover:cursor-pointer"></img>
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
            <a href="settings">
            <img id="settings" src={ settings_icon } className="h-[12%] mx-auto mt-[2%] hover:cursor-pointer" />
            <div className="font-medium text-white text-[0.6rem] md:text-lg text-center">Settings</div>
            </a>
          </div>
          </div>
          { isRecommendationBoxShown &&
          <RecommendationBox></RecommendationBox> 
          }
          <div id="logo_container" className="w-full flex h-[140%] text-center mx-auto justify-center items-center">
            <img id="logo" src={ logo } className="mx-auto w-[30%]"></img>
          </div>
          </div>
          <div id="search_m_container" className="text-center hidden fixed top-[30%] left-[10%] md:hidden w-4/5 rounded-lg" >
          <img src={ close_button } id="close_button" onClick={ () => { document.getElementById("search_m_container").style.display="none" } } />
            <br />
            <br />
            <input type="text" id="vs_m_box" className="inline-block outline-none py-2 px-3 my-10 mx-auto bg-white border-2 rounded-md lg:rounded-full w-4/5 lg:w-3/5 focus:outline-sky-500" placeholder="Search for music" onKeyDown={ handleSearchM }/>
            <div className="bg-white w-4/5 h-36 mx-auto overflow-auto rounded-md">
            { videos ? (isLoading ? 
                 Array(10).fill(0).map((_, idx) => (
                  <div key={idx} className="animate-pulse bg-white w-4/5 mx-auto rounded-md p-4 mb-4">
                    <div className="bg-gray-300 h-20 w-1/2 mx-auto rounded"></div>
                    <div className="mt-4 h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                  </div>))
                  :
                  
            
            videos.map((video) => 
                  <>
                  <div className="bg-white w-4/5 mx-auto rounded-md">
                    <img src={ video.snippet.thumbnails.high.url } style={ { width: "50%", margin: "auto" } } onClick={ () => setCurrentVideo(video) } className="border-md rounded-md hover:cursor-pointer"  />
                    <h3 onClick={ () => setCurrentVideo(video) } className="text-slate-600 hover:cursor-pointer">{ video.snippet.title.replaceAll('&quot;', '"') }</h3>
                  </div>
                  <br />
                  </>)
            )
            :
            <></>
          }
          </div>
          <br />
          <div id="search_mobile_button" onClick={ () => search(1) } className="inline-block lg:w-1/5 ms-2 bg-gradient-to-br from-blue-500 from-10% to-purple-600 rounded-lg text-sm lg:text-lg text-center px-3 py-2 text-white hover:cursor-pointer">Search</div>    
          <br />
          <br />
          </div>
          <br />
          <div id="video_box" className="text-center hidden md:block col-start-1 col-end-3 row-start-2 row-end-5 bg-slate-100 rounded-lg border-lg h-[180vh]">
            <div id="vs_container" className="text-center w-[100%] mx-auto">
              { loggedIn ?
              <>
              <input type="text" id="vs_box" className="inline-block w-[70%] py-2 px-3 my-10 mx-auto bg-white border-2 border-slate-200 rounded-md lg:rounded-full xl:w-3/5 focus:outline-sky-500" placeholder="Search for music" onKeyDown={ handleSearchD } />
              <div id="search_button" onClick={ () => search(0) } className="inline-block lg:w-[25%] ms-2 bg-gradient-to-br from-blue-500 from-10% to-purple-600 rounded-lg text-sm lg:text-lg text-center py-2 text-white hover:cursor-pointer shadow-lg hover:shadow-purple-500/50 duration-300">Search</div>
            </> :  <p className="text-center text-md"> Login to use this feature </p> }
            </div>
            
            <div id="video_search_container" className="flex-1 w-5/6 bg-slate-200 shadow-inner rounded-lg overflow-y-auto mx-auto text-center" style={{ height: "70%" }}>
            { videos ? (isLoading ?
            Array(10).fill(0).map((_, idx) => (
              <div key={idx} className="animate-pulse bg-white w-4/5 mx-auto rounded-md p-4 mb-4">
                <div className="bg-gray-300 h-20 w-1/2 mx-auto rounded"></div>
                <div className="mt-4 h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
              </div>
            ))
            
            :  
            videos.map((video) => 
            <>
            <div className="bg-white w-4/5 mx-auto rounded-md" >
              <img src={ video.snippet.thumbnails.high.url } style={ { width: "50%", margin: "auto" } } onClick={ () => setCurrentVideo(video) } className="border-md rounded-md hover:cursor-pointer"  />
              <h3 onClick={() => setCurrentVideo(video) } className="text-slate-600 hover:cursor-pointer">{ video.snippet.title.replaceAll('&quot;', '"').replaceAll('&#39;', '\'').replaceAll('&amp;', "&") }</h3>
            </div>
            <br />
            </>       
            )) :
            (
               <></>  
            )
            }
            </div>
          </div>
          <div id="main_box" className="text-center mx-auto w-[99%] h-[180vh] col-start-1 col-end-9 md:col-start-3 md:col-end-9 row-start-2 row-end-5 rounded-lg bg-blue-50">
          <br />
          <div id="recommendation_box" className="text-center mx-auto w-4/5 bg-sky-50">
            { loggedIn ?
            <>
            <h3 className="text-center text-2xl">Get recommendations based on</h3>
            <br />
            <div id="recommendation_top" className="mx-auto text-center w-[90%]">
            <h3 className="text-sm mx-auto lg:text-lg xl:text-2xl inline-block">Text Prompt</h3>
            <div id="switch_capsule" onClick={ () => { toggleSwitch() } } className="ms-4 text-center inline-block mx-auto w-[40px] lg:w-[80px] rounded-full hover:cursor-pointer">
              <div id="switch" onClick={ () => { toggleSwitch() } } className="bg-white rounded-full w-4 h-4 lg:h-8 lg:w-8 hover:cursor-pointer"></div>
            </div>
            <h3 className="text-sm mx-auto lg:text-lg xl:text-2xl ms-4 inline-block">Face/Mood</h3>
            <br />
            <br />
            { rSetting == 0 ? 
            <textarea id="prompt_box" value={ textPrompt } className="mx-auto w-4/5 bg-white text-sm md:text-lg h-32 no-outline shadow-inner rounded-lg focus:outline-none p-4" onChange={ (e) => setTextPrompt(e.target.value) } name="prompt" />
            :
            <>
            <FaceMoodDetector></FaceMoodDetector>
            </>
            }
            <br />
            <br />
            <button id="recommend_button" className={ `w-[60%] lg:w-[30%] p-4 rounded-lg lg:text-2xl flex justify-center items-center text-white mx-auto shadow transition duration-300 hover:cursor-pointer hover:shadow-violet-500/60 hover:shadow-lg bg-gradient-to-b from-blue-600 from-30% to-purple-700` } onClick={ async () => await recommend(rSetting) }>
            { isRecommendedLoading ? 
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent mx-auto border-sky-200"></div> :
            <img src={sparkle} className="w-[15%] mx-auto"></img> 
            }
            <div className="mx-auto text-center">Recommend</div>
            </button>
            </div>
            </>
            :
            <div id="recommendation_top" className="mx-auto text-center w-[90%]">
            <h3 className="text-center text-2xl">Login to get recommendations.</h3>
            </div>
            }

          
          </div>
          <br />
          { loggedIn ? 
          <div id="search_m_button" onClick={ () =>  { document.getElementById("search_m_container").style.display="block" } } className="text-center text-white rounded-md w-1/5 mx-auto md:hidden bg-blue-500">Search</div>
          : 
          <>
          </>
          }
          <br />
          <br />
          { loggedIn ?
          <a href="/playlists" id="playlists_button" className="text-center mx-auto px-8 py-3 text-white bg-purple-500 w-2/5 md:w-1/5 shadow-lg shadow-white-100/0 hover:shadow-purple-500/40 hover:cursor-pointer rounded-lg text-md md:text-3xl duration-300">My Playlists</a>
          :
          <>
          </>
          }
          <br />
          <br />
          <div id="video_play_box" className="text-center mt-4 mx-auto w-[90%] flex items-center lg:h-1/2 md:h-[40%] h-[30%] rounded-lg border-2 border-sky-200 bg-sky-50">
            <div className="mx-auto rounded-sm w-[70vw] h-[39.4vw]" id="yt-player"></div>
          </div>
          <br />
          { loggedIn && currentVideo ?
          <div className="mx-auto flex justify-around">
            <div id="like_button" className={`text-center text-white text-sm ${isLiked ? "bg-blue-700" : "bg-blue-500" } md:text-xl md:w-[7%] py-1 rounded-md bg-blue-500 hover:cursor-pointer inline-block`} onClick={ () => handleLike(currentVideo.id.videoId) }>Like</div>
            <div id="dislike_button" className={`text-center text-white text-sm md:text-xl md:w-[10%] py-1 ${isDisliked ? "bg-red-700" : "bg-red-500"} rounded-md hover:cursor-pointer inline-block` } onClick={ () => handleDislike(currentVideo.id.videoId) }>Dislike</div>
          </div>
          :
          <>
          </>
          }
          </div>
          <br />
          

        </div>

      </div>

    </div>
    </>
    
  )
}



export default Home;


