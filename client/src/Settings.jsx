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

const nodeBackendUrl = import.meta.env.VITE_NODE_BACKEND_URL





function Settings() {

  const arr = new Array(9).fill(false)

  const [isSelected, setSelected] = useState(arr)

  const [isEnabled, setIsEnabled] = useState(true)

  const [isChecked, setIsChecked] = useState(true)

  

  console.log(isEnabled)


  const { loggedIn, setLoggedIn, logout } = useContext(AuthContext)

  let username = localStorage.getItem("Username")

  let genres = ["Pop", "Rock", "Rap", "Electronic", "Bollywood", "Classical", "Jazz", "Lo-fi", "Devotional"]


  function buttonClass(index)
  {
    if(isEnabled) { 
      if(isSelected[index]) { 
        return "border-blue-300 bg-violet-300/60" }
        else {
        return "border-neutral-200 bg-violet-200/60" } } 
      else { 
      return "bg-gray-300 border-transparent" }
  }
  
  async function getPreferences()
  {
    const response = await axios.get(nodeBackendUrl + "get_preferences", { params: { email: localStorage.getItem("email") } })

    let data = response.data

    let fetchedIsEnabled = data.isEnabled

    setIsEnabled(fetchedIsEnabled)

    let fetchedSelectedGenres = data.genres

    const updatedSelectedArray = fetchedSelectedGenres.map((value, index) => value.isTrue)

    setSelected(updatedSelectedArray)

    console.log("updated selected array", updatedSelectedArray)
    

    

    setSelected(data.genres.map((value, index) => value.isTrue))

  }

  useEffect(() => {
    async function f()
    {
      await getPreferences()
    }

    f()
  }, [])

  useEffect(() => {
    setIsChecked(isEnabled)
  }, [isEnabled])
  
  

  async function updateIsEnabled()
  {
    const enabled = !isEnabled

    setIsEnabled(enabled)

    const response = await axios.put(nodeBackendUrl + "update_preferences_enabled", { email: localStorage.getItem("email"), enabled })

    console.log(response)
  }

  async function updateGenres(index)
  {
    const updatedArray = isSelected.map((val, i) => (i === index) ? !val : val)

    setSelected(updatedArray)

    const response = await axios.put(nodeBackendUrl + "update_selected_genres", { email: localStorage.getItem("email"), arr: updatedArray })

    console.log(response.data)

  }

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
          </div>
      </div>
      <div className="text-center flex flex-col justify-around bg-neutral-100 h-[50vh] mx-auto w-full">
        <div id="title_container" className="text-center mx-auto text-3xl text-bold">
          Settings
        </div>
        <br />
        <div className="text-center text-xl mx-auto">
          Genre preferences (for recommendations)
        </div>
        <br />
        <div id="genre_preferences_container" className="text-center md:w-[60%] w-[80%] gap-y-2 mx-auto flex flex-wrap justify-around items-around">
            { genres.map((genre, index) =>
            <button className={`px-3 py-2 rounded-md text-center border border-2 hover:cursor-pointer ${buttonClass(index)}`}  key={ index } onClick={ async() => { if(isEnabled) { await updateGenres(index) } } } >
              { genre }
            </button>
            )}
        </div>
        <br />
        <div id="bottom_container" className="w-[80%] text-xl mx-auto">
            <div id="checkbox_container" className="flex gap-x-3 justify-center items-center w-[80%] mx-auto">
              <div id="checkbox" className={ `w-[1.2em] rounded-md h-[1.2em] flex justify-center ${isChecked ? "bg-purple-400" : "bg-neutral-300" } items-center ` } onClick={ async() => { await updateIsEnabled() } } style={{ transition: "all 0.5s ease-in-out" }}>
                <svg
                className={ `w-6 h-6 transition-opacity duration-150 ${isChecked ? "opacity-100" : "hidden"  } ` }
                fill="none"
                stroke="white"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>

              </div>
              <div className="text-2xl">
                Use preferences
              </div>
            </div>
        </div>
      </div>
  </div>
  </>
     
  );

}


export default Settings;


