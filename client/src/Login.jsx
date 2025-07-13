import { Helmet } from "react-helmet";
import logo from './images/MusiSense.png';
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import home from "./images/home.svg"
import { AuthContext } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";






function Login() {

  
  let nodeBackendUrl = import.meta.env.VITE_NODE_BACKEND_URL

  const { loggedIn, setLoggedIn } = useContext(AuthContext)

  const navigate = useNavigate()

  
useEffect(() => {
  async function handleSubmit(e)
  {
    if(e.key === "Enter")
    {
      await submit()
    }
  }
  
  document.addEventListener("keyup", handleSubmit) 
  
}, [])


async function submit()
{
  let email = document.getElementById("e_box").value
  let password = document.getElementById("p_box").value 

  if(email.trim().length == 0 || password.trim().length == 0)
  {
    let error_box = document.getElementById("error_box")
    error_box.innerText="Please enter e-mail and password."
    error_box.className+=" py-4"
  }
  else
  {
    try
    {
      const result = await axios.post(nodeBackendUrl+"login", {email, password} ,{ withCredentials: true })
      console.log(result);
    
      if(result.data === "Success!" || result.status == 200 )
      {
       
       let username = (email.split("@")[0]).split(".").join("")
       localStorage.setItem("Username", String(username))
       setLoggedIn(true)
       alert("Logged In!");
       console.log(result)
       localStorage.setItem("email", email)


        
       
       
       
       
       
       navigate("/")

 

        


        

        

      }
    }
    catch(error) 
    {
      let error_box = document.getElementById("error_box")
      error_box.innerText="Incorrect e-mail or password."
      error_box.className+=" py-4"

    }
  }



  }
  


  

  return (<>
    <Helmet>
      <title>MusiSense - Login</title>
      <link rel="icon" href="images/MusiSense.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
    </Helmet>

    <div id="main_container" className="container text-center mx-auto">
      <div id="bg" className="container text-center bg-slate-50 h-full">
        <div id="home_container">
          <img src={ home } onClick={() => { window.location.assign("/") } } className="mt-4 ms-4 hover:cursor-pointer" style={{ width: "3%"}}/>
        </div>
        <img src={ logo } className="mx-auto" style={{ width: "20%" }}/>
        <p className="text-center text-pink-500 font-medium text-4xl">Login</p>
        <br />
        <br />
        <form className="text-center bg-slate-100 mx-auto w-4/5 rounded-md">
        <br />
        <label className="text-center md:text-xl mx-auto">E-mail: </label>
        <input id="e_box"type="text" className="rounded-full lg:w-[40%] px-3 bg-white py-2 shadow-inner no-outline ms-3 focus:outline-none inline-block"></input>
        <br />
        <br />
        <label className="text-center md:text-xl mx-auto inline-block">Password: </label>
        <input id="p_box" type="password" className="rounded-full px-3 py-2 bg-white shadow-inner no-outline ms-3 focus:outline-none inline-block"></input>
        <div id="error_box"className="bg-red-400 mx-auto mt-10 text-white text-center w-3/5 lg:w-2/5 text-xl rounded-md"></div>
        <div onClick={ () => submit() } className="bg-sky-500 mt-16 mx-auto inline-block text-white font-medium text-2xl rounded-xl px-6 py-2 hover:cursor-pointer">Login</div>
        <br />
        <br />
        </form>

        
      </div>
    </div>



        

    
    </>
    
  );

}



export default Login
