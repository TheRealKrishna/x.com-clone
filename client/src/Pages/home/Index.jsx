import React, { useEffect, useState } from 'react'
import Loader from '../../Components/Loader';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Styles from "../../css/Home/index.module.css"
import Menu from './Components/Menu';
import Home from './Components/Home';
import Profile from './Components/Profile';
import Messages from './Components/Messages';
import ProfileEditModal from '../../Layout/ProfileEditModal';
import MobileMenu from "./Components/MobileMenu"


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

    const fetchUser = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/getuserinfo`, {
            method: "post",
            headers: {
                "authtoken": localStorage.getItem("auth-token"),
            }
        })
        const json = await response.json();
        if (json.success) {
            setUser(prev => json.user);
            return json.user
        }
        else {
            localStorage.removeItem("auth-token");
            navigate("/i/flow/login")
        }
    }

    return (
        <div className={Styles.container}>
            <div className={Styles.leftPanel}>
                <Menu user={user} fetchUser={fetchUser} />
            </div>
            <div className={window.location.pathname.startsWith("/messages") ? Styles.mainPanelFull : Styles.mainPanelLarge}>
                {
                    window.location.pathname === "/home" ?
                        <>
                            <MobileMenu user={user} fetchUser={fetchUser} />
                            <Home user={user} fetchUser={fetchUser} />
                        </>

                        :

                        window.location.pathname.startsWith("/messages") ?
                            <>
                                <Messages contactId={window.location.pathname.replace("/messages/", "")} user={user} fetchUser={fetchUser} setUser={setUser} />
                                {
                                    window.location.pathname === "/messages" ? <MobileMenu user={user} fetchUser={fetchUser} /> : null
                                }
                            </>

                            :

                            window.location.pathname === "/settings/profile" ?
                                <>
                                    <Profile user={user} fetchUser={fetchUser} setUser={setUser} />
                                    <MobileMenu user={user} fetchUser={fetchUser} />
                                </>

                                :
                                <>
                                    <MobileMenu user={user} fetchUser={fetchUser} />
                                    <Profile user={user} fetchUser={fetchUser} setUser={setUser} />
                                </>
                }
            </div>
            {
                window.location.pathname.startsWith("/messages") ? null :
                    <div className={Styles.rightPanelSmall}>
                    </div>
            }
        </div >
    )
}
