import React, { useEffect, useState } from 'react'
import Loader from '../../Components/Loader';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Styles from "../../css/Home/index.module.css"
import Menu from './Components/Menu';
import Home from './Components/Home';


export default function Index() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState({})
    const params = useParams();

    useEffect(() => {
        if (!localStorage.getItem("auth-token")) {
            navigate("/i/flow/login")
        }
        else {
            fetchUser()
            document.title = "Home / X"
            setTimeout(() => {
                setLoading(false)
            }, 500);
        }
    }, [params])

    const fetchUser = async()=>{
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/getuserinfo`,{
            method:"post",
            headers:{
                "authtoken":localStorage.getItem("auth-token"),
            }
        })
        const json = await response.json();
        if(json.success){
            setUser(prev=>json.user);
        }
        else{
            localStorage.removeItem("authToken");
            navigate("/i/flow/login")
        }
    }

    return (
        <div className={Styles.container}>
            <div className={Styles.leftPanel}>
                <Menu user={user} fetchUser={fetchUser}/>
            </div>
            <div className={Styles.mainPanel}>
                <Home user={user} fetchUser={fetchUser}/>
            </div>
            <div className={Styles.rightPanel}>
                right
            </div>
        </div>
    )
}
