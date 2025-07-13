import { useState, useEffect, useContext, useRef } from "react";
import './NewPlaylist.css'
import close_button from '../images/close.png'
import axios from 'axios'

function NewPlaylist({ props })
{
    
    const soundRef =  useRef(null)

    useEffect(() => {
        soundRef.current = new Audio("/sounds/new_playlist.mp3")        
    }, [])



    function createNewPlaylist()
    {
        let a = document.getElementById("pnb_already_error_box")
        let b = document.getElementById("pnb_blank_error_box")
        
        a.style.display = "none"
        b.style.display = "none"

        let name = document.getElementById("playlist_name_input").value

        if(name.trim() === "")
        {
            document.getElementById("pnb_already_error_box").style.display = "none"
            document.getElementById("pnb_blank_error_box").style.display = "block"
        }
        else
        {

        let email = localStorage.getItem("email")

    
    
                axios.post(nodeBackendUrl+"new_playlist", { email, name })
                .then(result => 
                    {
                        console.log(result);

            
                        if(result.data.playlist_already)
                        {
                            b.style.display = "none"
                            a.style.display = "block" 
                        }
                        else
                        {
                            a.style.display = "none"
                            b.style.display = "none"

                            props.setIsCreated(true)
                            props.setIsShown(false)
                            playSound()
                        }
        })
        
        .catch(err => console.log(err))
            }
        
    }

    function playSound()
    {
        soundRef.current.play()
    }
    const nodeBackendUrl = import.meta.env.VITE_NODE_BACKEND_URL

    return (<>
    <div id="playlist_name_box" className="bg-gradient-to-b rounded-lg from-purple-500/90 to-purple-700/90 mx-auto left-[10%] w-[80%] lg:w-[40%] fixed top-[20%] lg:left-[30%] text-center">
            <img id="close_button_new" src={close_button} onClick={ () => props.setIsShown(false) }></img>
            <br />
            <br />
            <br />
            <div id="pnb_title" className="mt-12 w-[80%] mx-auto text-white text-center text-2xl">
            Name the playlist
            </div>
            <br />
            <br />
            <input type="text" id="playlist_name_input" className="mx-auto bg-white shadow-inner text-xl px-8 py-2 rounded-full w-5/6 outline-none" onKeyDown={(e) => { if(e.key === "Enter") { createNewPlaylist() }}} />
            <br />
            <br />
            <br />
            <div id="pnb_blank_error_box" className="text-center text-white text-lg py-2 rounded-md hidden w-5/6 mx-auto bg-red-500">Please enter a name.</div>
            <div id="pnb_already_error_box" className="text-center text-white text-lg py-2 rounded-md hidden w-5/6 mx-auto bg-red-500">A playlist with this name already exists!</div>
            <br />
            <br />
            <button className="mx-auto my-4 bg-blue-500 lg:my-auto text-2xl text-white px-6 py-2 rounded-lg text-center hover:cursor-pointer" onClick={ () => createNewPlaylist() }>OK</button>
            <br />
            <br />    
    </div>
    <div id="overlay"></div>
    </>
    )
}

export default NewPlaylist;



