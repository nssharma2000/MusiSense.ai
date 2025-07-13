import { createContext, useState, useEffect } from "react";
import axios from 'axios'
import Playlists from "../Playlists";

let nodeBackendUrl = import.meta.env.VITE_NODE_BACKEND_URL



export const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState(null)
  
  const [playlists, setPlaylists] = useState([])


  async function fetchPlaylists()
   {
       let email = localStorage.getItem("email")
       const result = await axios.post(nodeBackendUrl+"fetch_playlists", { email })
       setPlaylists(result.data)
       console.log(result.data)
   }


   async function updatePlaylist(updatedPlaylist)
   {
    try
    {
      let response = await axios.post(nodeBackendUrl+"update_playlist", { Name: updatedPlaylist.Name, email: localStorage.getItem("email"), updatedPlaylist })
      console.log(response.data)
      await fetchPlaylists()
    }
    catch(err)
    {
      console.error(err)
    }
                                                    
   }

   async function renamePlaylist(playlist, newName)
   {
    try 
    {
      let response = await axios.post(nodeBackendUrl+"rename_playlist", { Name: playlist.Name, email: localStorage.getItem("email"), newName })
      
      console.log("New: ", response.data)
      const updatedPlaylists = playlists.map(p => p._id === response.data._id ? response.data : p)
      setPlaylists(updatedPlaylists)
      setCurrentPlaylist(response.data)
    }
    catch(err)
    {
      console.error(err)
    }
                                                    
   }

  async function deletePlaylist(playlist)
  {
    try
    {
      let response = await axios.delete(nodeBackendUrl+"delete_playlist",  { data: { Name: playlist.Name, email: localStorage.getItem("email") } } )
      console.log(response.data)
      await fetchPlaylists()
    }
    catch(err)
    {
      console.error(err)
    }

  }




return (<PlaylistContext.Provider value={{ currentPlaylist, setCurrentPlaylist, fetchPlaylists, playlists, updatePlaylist, deletePlaylist, renamePlaylist }}>
  { children }
</PlaylistContext.Provider>)
}