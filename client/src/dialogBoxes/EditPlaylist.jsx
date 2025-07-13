import { useState, useEffect, useContext, useRef } from "react";
import './EditPlaylist.css'
import close_button from '../images/close.png'
import axios from 'axios'
import VideoSearch from './VideoSearch'
import RenameDialog from './RenameDialog'
import delete_button from '../images/delete.svg'
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { PlaylistContext } from "../context/PlaylistContext";

function EditPlaylist({ props })
{
    const { currentPlaylist, setCurrentPlaylist, fetchPlaylists, playlists, updatePlaylist } = useContext(PlaylistContext);

    const [isVsbShown, setIsVsbShown ] = useState(false)

    const [isRenameDialogBoxShown, setIsRenameDialogBoxShown] = useState(false)
    

    async function updateFunction(videos)
    {
        const updatedPlaylist = { ...currentPlaylist, videos: videos}
        setCurrentPlaylist(updatedPlaylist)
    }

    let vsbProps = {
        isShown: isVsbShown,
        setIsShown: setIsVsbShown,
        updateFunction
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 8,
          },
        })
      );


      async function changeOrder(updatedPlaylist)
      {
         setCurrentPlaylist(updatedPlaylist)
         await updatePlaylist(updatedPlaylist)
      }
      
    function VideoItem({video})
    {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            } = useSortable({ id: video.id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            };
        
        return (
            <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style} 
            className="bg-slate-200 rounded-md h-[22vh] lg:h-[calc(0.08*(100vw+100vh))] w-[100%] flex justify-around">
            <div
            className="w-[90%] h-[95%] rounded"
            >
            <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} className="h-[40%] md:h-[60%] lg:h-[50%] w-[60%] inline-block">
            </img>
            <p className="text-black text-xs lg:text-sm text-center">{video.title.replaceAll("&quot;", "\"").replaceAll("&amp;", "&")}</p>
            </div>
            <img src={ delete_button } className="w-[10%] hover:cursor-pointer" onClick={async () => await deleteVideo(video) }></img>
          </div>
        );
    }

    async function deleteVideo(video)
    {

        const updatedVideos = currentPlaylist.videos.filter(v => v.id !== video.id);
        console.log(updatedVideos.length)
        
        const updatedPlaylist = { ...currentPlaylist, videos: updatedVideos };
        setCurrentPlaylist(updatedPlaylist);
        
        await updatePlaylist(updatedPlaylist);
        

    }

    return (
        <>
        { isRenameDialogBoxShown &&
        <RenameDialog props={{ isShown: isRenameDialogBoxShown, setIsShown: setIsRenameDialogBoxShown }}></RenameDialog>
        }
        <div id="epb_main_container" className="w-[80%] z-[999] rounded-md bottom-[20%] lg:bottom-[5vh] left-[10%] mx-auto h-[70vh] lg:h-[90vh] shadow-lg bg-gradient-to-b from-fuchsia-500/90 to-fuchsia-600/90 fixed">
            { isVsbShown ?
            <VideoSearch props={vsbProps} />
            :
            <>
            </>
            }
            <div id="top_container" className="w-[100%] flex justify-center">
                <div id="epb_title" className="text-center justify-self-center pt-2 lg:pt-6 text-white text-md lg:text-3xl w-[40%]">
                    Edit Playlist
                </div>
                <img id="close_button_edit" className="lg:w-[5%] h-[8%] h-[8%] lg:h-[7%] xl:h-[8%]" src={close_button} onClick={ () => props.setIsShown(false) }></img>
            </div>
            <div id="playlist_name_box" className="w-[100%] text-center text-sm lg:text-xl text-white pt-1 lg:pt-3 mx-auto">
                { currentPlaylist?.Name }
            </div>
                <div id="video_container" className="mt-[0.5%] w-[90%] h-[70%] mx-auto bg-slate-100 rounded-md shadow-inner shadow-inner-lg shadow-slate-300">
                <DndContext sensors={sensors} collisionDetection={closestCenter}
                onDragEnd={ async (event) => {
                    const { active, over } = event;
                    if (active.id !== over?.id) {
                    const oldIndex = currentPlaylist.videos.findIndex((v) => v.id === active.id);
                    const newIndex = currentPlaylist.videos.findIndex((v) => v.id === over?.id);
                    const newVideos = arrayMove(currentPlaylist.videos, oldIndex, newIndex);
                    const updatedPlaylist = { ...currentPlaylist, videos: newVideos}
                    await changeOrder(updatedPlaylist);
                    }
                }}>
                    <SortableContext items={currentPlaylist.videos.map((video) => video.id)} strategy={rectSortingStrategy} >
                        <div id="video_grid" className="h-full grid grid-cols-2 lg:grid-cols-4 gap-2 p-2 overflow-y-auto">
                           { currentPlaylist.videos.map((video) =>
                            <VideoItem video={video} key={video.id}>

                            </VideoItem>



                           
                           )
                           }
                        </div>

                    </SortableContext>

                </DndContext>
                </div>
                <div id="bottom_container" className="w-[100%] h-[12%] flex items-center justify-around">
                    <button id="add_videos" onClick={ () => setIsVsbShown(true) } className="w-[30%] h-[90%] text-white text-xs md:text-md lg:text-xl py-1 rounded-md bg-gradient-to-br from-40% from-indigo-500 to-fuchsia-700 hover:cursor-pointer">Add Videos</button>
                    <button id="rename" onClick={ () => setIsRenameDialogBoxShown(true) } className="w-[30%] h-[90%] text-white text-xs md:text-md lg:text-xl py-1 rounded-md bg-gradient-to-br from-40% from-red-400 to-red-700 hover:cursor-pointer">Rename playlist</button>
                </div>


            
            
                                                                      
        </div>
        <div id="overlay"></div>
        </>
    )
   
}

export default EditPlaylist;



