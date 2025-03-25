import {useEffect,useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {LogOut} from "lucide-react";

const Home = () => {
  const [user,setUser] = useState();
  const navigate = useNavigate();

  useEffect(()=>{
    const fuser=async ()=>{
    try{
    const res=await axios.get("http://localhost:5080/api/auth/user",{withCredentials:true})
    setUser(res.data)
    }
    catch(error){
      navigate("/login")
    }
  };
  fuser();
  },[navigate])

  const handleLogout = async() => {
    try{
    const res=await axios.post("http://localhost:5080/api/auth/logout", {}, {withCredentials:true})
    setUser(null)
    navigate("/login")
    }
      catch(err){
       console.error("Logout failed:", err)
      };
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm flex justify-center items-center flex-col">
        {user?(
          <>
            <img
              src={user.profilepic}
              alt="Profile"
              className="w-50 h-50 mx-auto mb-4 border-4 border-gray-400 rounded-md"
            />
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-red-600"
            >
              <LogOut size={18}/>Logout
            </button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Home;
