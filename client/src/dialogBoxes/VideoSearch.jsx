import { useState, useEffect, useContext, useRef } from "react";
import './EditPlaylist.css'
import close_button from '../images/close.png'
import axios from 'axios'
import { PlaylistContext } from '../context/PlaylistContext'
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";


function VideoSearch({ props })
{

    const { currentPlaylist, setCurrentPlaylist, fetchPlaylists, playlists, updatePlaylist } = useContext(PlaylistContext);  

    const [currentVideo, setCurrentVideo] = useState()

    const [videos, setVideos] = useState([])

    const [counter, setCounter] = useState(0)

    const [playlistVideos, setPlaylistVideos] = useState([])

    const [isLoading, setIsLoading] = useState(false)

    const [currentIndex, setCurrentIndex] = useState(null)

    const [addedVideos, setAddedVideos] = useState([])

    const [isAlreadyErrorBoxShown, setIsAlreadyErrorBoxShown] = useState(false)
    
    const [isNothingErrorBoxShown, setIsNothingErrorBoxShown] = useState(false) 

    const [isNumberVideosBoxShown, setIsNumberVideosBoxShown] = useState(false)

    const api_key = import.meta.env.VITE_API_KEY

    console.log(currentPlaylist)

    useEffect(() => {
        document.getElementById("overlay").style.zIndex = 999
        
        setAddedVideos([])

        return function(){
            document.getElementById("overlay").style.zIndex = 998
        }
    }, [])

    function AlreadyErrorBox()
    {
      return(
        <div id="already_error" className="bg-red-500 mt-[1%] text-sm lg:text-xl rounded-md mx-auto text-white w-[80%] h-[10%]">You cannot add the same video more than once!</div>
      )
    }

    function NothingSelectedErrorBox()
    {
      return(
            <div id="nothing_error" className="bg-red-500 mt-[1%] text-sm lg:text-xl rounded-md mx-auto text-white w-[80%] h-[5%] lg:h-[10%]">Please select a video.</div>
      )
    }

    function NumberVideosBox()
    {
      return(
        <div id="number_videos" className="mt-[1%] text-sm lg:text-xl rounded-md mx-auto text-white w-[80%] h-[6%]">Number of videos to add: { counter }</div>
      )
    }

    async function search() {
        setCurrentVideo(null)
        setCurrentIndex(null)
        let searchQuery=""
        searchQuery = document.getElementById("vs_box").value;
        
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&type=video&videoCategoryId=10&q=${searchQuery}&key=${api_key}`;
    
          try {
            setVideos([])
            setIsLoading(true)
            const response = await axios.get(url, { withCredentials: false });
            setVideos(response.data.items);
            console.log(response.data)
            //let response2 = await axios.get(url1, { withCredentials: false })
            //console.log(response2.data.items)
    
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

        async function handleSearch(e)
        {
          if(e.key === "Enter")
          {
            await search()
          }
        }

        async function handleSave()
        {
          const videoIdArray = addedVideos.map((video) => video.id)
          const videoIds = videoIdArray.join(',')
          console.log(videoIds)


          let url1 = `https://www.googleapis.com/youtube/v3/videos?part=snippet,topicDetails&id=${videoIds}&key=${api_key}`
          let topicResponse = await axios.get(url1, { withCredentials: false })


          let items = await topicResponse.data.items

    

          let genreArray = []


          console.log(items)

          for(let i = 0; i < items.length; i++)
          {
            const videoGenreArray = []
            

            
            let categories = items[i].topicDetails.topicCategories

            for(let j = 0; j < categories.length; j++)
            {
              let videoCategories = categories[j].split('/').at(-1)
              videoGenreArray.push(videoCategories)
              
            }
            
            genreArray.push(videoGenreArray)
          }

          const updatedAddedVideos = [ ...addedVideos]

          console.log(genreArray)

          for(let i = 0; i < genreArray.length; i++)
          {
            const videoId = items[i].id

            const videoIndex = updatedAddedVideos.findIndex(v => v.id === videoId);

            if (videoIndex !== -1) {
              updatedAddedVideos[videoIndex].genres = genreArray[i];
            }
          }

          console.log("Final: ", updatedAddedVideos)


          await addVideos(updatedAddedVideos)
          
        }

        

        async function handleSelect(video, index)
        {
            const selectedVideo = video
            setCurrentVideo(selectedVideo)
            setCurrentIndex(index)

            setIsAlreadyErrorBoxShown(false)
            setIsNothingErrorBoxShown(false)

            console.log("Selected video: ", selectedVideo)
            
            
        }

      async function addVideos(addedVideos)
      {
      if(!currentPlaylist)
      {
        console.error("currentPlaylist is undefined.")
        return 
      }

      console.log("Current playlist is: ", currentPlaylist)
      const updatedVideos = [ ...currentPlaylist.videos, ...addedVideos]
      setPlaylistVideos(updatedVideos)
      

      console.log(updatedVideos)

      const updatedPlaylist = { ...currentPlaylist, videos: updatedVideos }

      setCurrentPlaylist(updatedPlaylist)
      

      console.log(currentPlaylist)

      await updatePlaylist(updatedPlaylist)
      
      await props.updateFunction(updatedPlaylist.videos) 

      await fetchPlaylists()

   }

        async function addVideo()
        {
          if(!currentVideo)
          {
            setIsNothingErrorBoxShown(true)
            return
          }

          setIsNothingErrorBoxShown(false)

          for(let i = 0; i < currentPlaylist.videos.length; i++)
          {
            if(currentVideo.id.videoId === currentPlaylist.videos[i].id)
            {
              setIsAlreadyErrorBoxShown(true)
              return
            }
          }

          for(let i = 0; i < addedVideos.length; i++)
          {
            if(currentVideo.id.videoId === addedVideos[i].id)
            {
              setIsAlreadyErrorBoxShown(true)
              return
            }
          }

          setIsNumberVideosBoxShown(true)

          setCounter(counter + 1)

          console.log("Current video before adding: ", currentVideo)
          const updatedAddedVideos = [ ...addedVideos, { id: currentVideo.id.videoId, title: currentVideo.snippet.title, genres: "" }]
          setAddedVideos(updatedAddedVideos)
        }

    
    
    return createPortal(
        <div id="vsb_main_container" className="text-center bg-green-500/80 z-[1000] h-[80%] fixed top-[10%] left-[10%] lg:left-[20%] w-4/5 lg:w-3/5 rounded-lg" >
          <div id="vsb_top_container" className="w-[100%] flex justify-start items-center">
            <br />
            <br />
            <input type="text" id="vs_box" className="outline-none ms-[10%] py-2 px-3 my-10 bg-white border-2 border-slate-200 rounded-md lg:rounded-full w-2/5 focus:border-sky-500" placeholder="Search for music" onKeyDown={ handleSearch }/>
            <div id="search_button" onClick={ () => search() } className="ms-[5%] mt-1 bg-gradient-to-br from-blue-500 from-10% to-purple-600 rounded-lg text-sm lg:text-lg text-center px-3 py-2 text-white hover:cursor-pointer">Search</div>
            <img src={ close_button } id="close_button_edit" className="w-[7%] ms-[25%]" onClick={ () => { props.setIsShown(false) } } />
          </div>
            <div className="bg-white w-4/5 h-[50%] mx-auto overflow-auto rounded-md">
            { videos ? (isLoading ? 
                 Array(10).fill(0).map((_, idx) => (
                  <div key={idx} className="animate-pulse bg-white w-4/5 mx-auto rounded-md p-4 mb-4">
                    <div className="bg-gray-300 h-[10vh] lg:h-[20vh] w-[40%] mx-auto rounded"></div>
                    <div className="mt-4 h-4 bg-gray-300 rounded w-[60%] mx-auto"></div>
                  </div>))
                  :
                  
            
            videos.map((video, index) => 
                  <>
                  <div className={`${currentIndex === index ? 'bg-slate-200 hover:bg-slate-300' : 'bg-white hover:bg-slate-100' } w-[80%] mx-auto rounded-md`} onClick={ async () => await handleSelect(video, index) }>
                    <img src={ video.snippet.thumbnails.high.url } style={ { width: "40%", margin: "auto" } } className="border-md rounded-md"  />
                    <h3 className="hover:cursor-pointer">{ video.snippet.title.replaceAll('&quot;', '"') }</h3>
                  </div>
                  <br />
                  </>)
            )
            :
            <></>
          }
          </div>
          { isAlreadyErrorBoxShown &&
          <AlreadyErrorBox></AlreadyErrorBox>
          }

          {
            isNothingErrorBoxShown &&
            <NothingSelectedErrorBox></NothingSelectedErrorBox>
          }

          {
            isNumberVideosBoxShown &&
            <NumberVideosBox></NumberVideosBox>
          }
          
          <div id="bottom_container" className="w-[100%] pt-[1%] flex w-4/5 justify-evenly">
            
            <button id="add_button" className="w-[30%] text-white text-sm lg:text-xl py-[1%] bg-gradient-to-b from-blue-500 to-blue-700 rounded-md hover:cursor-pointer" onClick={ async() => await addVideo() }>
              Add
            </button>
            <button id="save_button" className="w-[30%] text-white text-sm lg:text-xl py-3 bg-gradient-to-b from-purple-500 to-purple-700 rounded-md hover:cursor-pointer" onClick={async () => { await handleSave(); props.setIsShown(false) } } >
            Save
            </button>
          </div>
              
          <br />
          <br />
          </div>,
          document.getElementById("portal-root")
    )
   
}

export default VideoSearch;



