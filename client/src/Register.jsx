import { Helmet } from "react-helmet";
import logo from './images/MusiSense.png';
import { useState, useEffect } from "react";
import axios from "axios";
import home from './images/home.svg'





function Register() {


  let nodeBackendUrl = import.meta.env.VITE_NODE_BACKEND_URL

  
  async function EL()
  {
    await document.addEventListener("keyup", handleSubmit) 
  }
async function handleSubmit(e)
{
  if(e.key === "Enter")
  {
    await submit()
  }
}

setTimeout(() => EL(), 2000)


  function submit()
  {
    let username = document.getElementById("u_box").value;
    let email = document.getElementById("e_box").value;
    let password = document.getElementById("p_box").value;

    
    if(username.trim().length != 0 && email.trim().length != 0 && password.trim().length != 0)
    {  
      axios.post(nodeBackendUrl+"register", {username, email, password})
      .then(result => {
        console.log(result);
        if(result.status == 200 && !result.data.already)
        {
          alert("Registered successfully.")
          window.location.assign('/')
        }
        if(result.data.already === "Yes")
        {
          let error_box = document.getElementById("error_box")
          error_box.innerText="User already exists."
          error_box.className+=" py-4"
          
        }
      })

    .catch(err => console.log(err))

    
    console.log(username);
    console.log(email);
    console.log(password);
}
else
{
  let error_box = document.getElementById("error_box")
  error_box.innerText="Please enter username, email and password."
  error_box.className+=" py-4"
}
}

  return (<>
    <Helmet>
      <title>MusiSense</title>
      <link rel="icon" href="images/MusiSense.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
    </Helmet>

    <div id="main_container" className="container text-center mx-auto">
      <div id="bg" className="container text-center bg-slate-50 h-full">
        <div id="home_container">
          <img src={ home } onClick={() => { window.location.assign("/") } } className="inline-block float-left ms-4 hover:cursor-pointer" style={{ width: "3%"}}/>
        </div>
        <img src={ logo } className="mx-auto" style={{ width: "20%" }}/>
        <p className="text-center text-pink-500 font-medium text-4xl">Register</p>
        <br />
        <br />
        <form className="text-center bg-slate-100 mx-auto w-4/5 rounded-md">
        <br />
        <label className="text-center md:text-xl mx-auto inline-block">Username: </label>
        <input id="u_box" type="text" className="rounded-full px-3 py-2 shadow-inner bg-white no-outline ms-3 focus:outline-none inline-block"></input>
        <br />
        <br />
        <label className="text-center md:text-xl mx-auto">E-mail: </label>
        <input id="e_box"type="text" className="rounded-full lg:w-[40%] px-3 py-2 shadow-inner bg-white no-outline ms-3 focus:outline-none inline-block"></input>
        <br />
        <br />
        <label className="text-center md:text-xl mx-auto inline-block">Password: </label>
        <input id="p_box" type="password" className="rounded-full px-3 py-2 shadow-inner bg-white no-outline ms-3 focus:outline-none inline-block"></input>
        <div id="error_box"className="bg-red-400 mx-auto mt-10 text-white text-center w-3/5 lg:w-2/5 text-xl rounded-md"></div>
        <div id="register_button" onClick={ () => submit() }className="bg-red-500 mt-16 mx-auto inline-block text-white font-medium text-2xl rounded-xl px-6 py-2 hover:cursor-pointer">Register</div>
        <br />
        <br />


        </form>

        
      </div>
    </div>



        

    
    </>
    
  );

}



export default Register
