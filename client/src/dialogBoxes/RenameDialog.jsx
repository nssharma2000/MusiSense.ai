import { useState, useEffect, useContext, useRef } from "react";
import './RenameDialog.css'
import close_button from '../images/close.png'
import axios from 'axios'
import { PlaylistContext } from '../context/PlaylistContext'


function RenameDialog({ props })
{

    const { currentPlaylist, setCurrentPlaylist, fetchPlaylists, playlists, updatePlaylist, deletePlaylist, renamePlaylist } = useContext(PlaylistContext);  
    
    const [newName, setNewName] = useState("")
    
    const [isBlankErrorBoxVisible, setIsBlankErrorBoxVisible] = useState(false)

    const [isNameAlreadyErrorBoxVisible, setIsNameAlreadyErrorBoxVisible] = useState(false)

    function BlankErrorBox()
    {
        return(
          <div id="blank_error" className="bg-green-500 mx-auto w-[80%] h-[20%] text-lg text-white">
            Playlist name cannot be blank!
          </div>
        )
    }

    function NameAlreadyErrorBox()
    {
      return(
        <div id="name_already_error" className="bg-green-500 mx-auto w-[80%] h-[20%] text-lg text-white">
            A playlist with this name already exists!
        </div>
      )
    }
    

    async function handleRename(newName)
    {
      setIsBlankErrorBoxVisible(false)
      setIsNameAlreadyErrorBoxVisible(false)

      if(!newName || newName.trim() === "")
      {
        setIsBlankErrorBoxVisible(true)
      }
      else
      {
        for(let i = 0; i < playlists.length; i++)
        {
          if((playlists[i].Name.trim() === newName.trim()) && (newName.trim() !== currentPlaylist.Name.trim()))
          {
            setIsNameAlreadyErrorBoxVisible(true)
            return
          }
        }
        
        await renamePlaylist(currentPlaylist, newName)
        props.setIsShown(false)
        
      }

    }

    return(
      <>
      <div id="main_container" className="w-[50%] h-[30%] left-[25%] z-[1006] fixed bg-red-500 rounded-md">
        <img id="close_button_rename" className="lg:w-[5%] w-[5%] lg:h-[15%] me-10%" src={close_button} onClick={ () => props.setIsShown(false) }></img>
      <br />
      <div className="text-white text-lg m-auto mt-[2%]">
        Rename playlist { currentPlaylist.Name }
      </div>
      <br />
      <input type="text" onChange={ (e) => setNewName(e.target.value) } className="bg-white text-sm lg:text-lg w-[80%] outline-none border-2 p-2 rounded-full border-slate-100"></input>
      {
        isBlankErrorBoxVisible &&
        <BlankErrorBox></BlankErrorBox>
      }
      {
        isNameAlreadyErrorBoxVisible &&
        <NameAlreadyErrorBox></NameAlreadyErrorBox>
      }
      <div id="bottom_container" className="w-[80%] h-[20%] mt-[10%] mx-auto flex justify-around">
         <button id="ok_button" className="w-[30%] text-white p-2 bg-gradient-to-b from-blue-400 to-blue-600 rounded-md hover:cursor-pointer" onClick={ async() => { await handleRename(newName) } }>OK</button>   
      </div>  
      </div>
      <div id="overlay_2"></div>
      </>
    )
 
    
}

export default RenameDialog;



