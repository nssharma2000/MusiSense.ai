import { createContext, useState, useEffect } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

let nodeBackendUrl = import.meta.env.VITE_NODE_BACKEND_URL

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(null);

  const [loading, setLoading] = useState(true);


  const navigate = useNavigate();

  useEffect(() => { const verifyToken = async () => {
    try 
    {
      const res = await axios.get(nodeBackendUrl+'verify_token', { withCredentials: true })
        console.log("loggedIn: ", res.data.loggedIn)
        console.log("Done, ", res.data.loggedIn)
        setLoggedIn(res.data.loggedIn === true);
      }
      catch (error) {
        setLoggedIn(false);
        console.log("loggedIn: ", loggedIn)
      }
      finally {
        setLoading(false); 
      }
    }

    verifyToken()
  }, []);

  const logout = async () => {
    try
    { 
      await axios.post(nodeBackendUrl+'logout', {}, { withCredentials: true })
      setLoggedIn(false);
      navigate('/')
  }
  catch (error) {
      console.error("Logout failed:", error);
  }
  };

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
