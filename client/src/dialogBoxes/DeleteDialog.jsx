import { useState, useEffect, useContext, useRef } from "react";
import './DeleteDialog.css'
import close_button from '../images/close.png'
import axios from 'axios'
import { PlaylistContext } from '../context/PlaylistContext'


function DeleteDialog({ props })
{

    const { currentPlaylist, setCurrentPlaylist, fetchPlaylists, playlists, updatePlaylist, deletePlaylist } = useContext(PlaylistContext);  

    return(
      <>
      <div id="main_container_delete" className="w-[50%] h-[30%] left-[25%] z-1000 fixed bg-red-600 rounded-md">
        <img id="close_button_delete" className="lg:w-[5%] w-[5%] lg:h-[15%] me-10%" src={close_button} onClick={ () => props.setIsShown(false) }></img>
      <br />
      <div className="text-white text-lg m-auto mt-[5%]">
        Are you sure you want to delete this playlist?
      </div>
      <div id="bottom_container" className="w-[80%] h-[20%] mt-[10%] mx-auto flex justify-around">
         <button id="yes_button" className="w-[30%] text-white p-2 bg-gradient-to-b from-blue-400 to-blue-600 rounded-md hover:cursor-pointer" onClick={ () => { deletePlaylist(currentPlaylist); props.setIsShown(false) } }>Yes</button> 
         <button id="no_button" className="w-[30%] text-white p-2 bg-gradient-to-b from-blue-400 to-blue-600 rounded-md hover:cursor-pointer" onClick={ () => props.setIsShown(false) }>No</button>  
      </div>  
      </div>
      <div id="overlay"></div>
      </>
    )
 
    
}

export default DeleteDialog;



