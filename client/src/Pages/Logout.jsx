import React, { useEffect, useRef, useState } from 'react'
import Styles from "../css/Logout.module.css"
import Spinner from '../Components/Spinner';
import { useNavigate } from 'react-router-dom';
import logo from '../Images/logo.svg';
import ClickAwayListener from 'react-click-away-listener';

export default function Logout() {
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();
    const modalOpenButton = useRef()

    useEffect(() => {
        modalOpenButton.current.click();
        document.title = "X";
    },)

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 500);
    }, [])

    const handleLogout = async () => {
        localStorage.removeItem("auth-token");
        navigate("/")
    }

    const handleCancel = async()=>{
        navigate("/home")
    }

    return (
        <>
            <div className={`modal ${Styles.fade}`} id="logoutModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true">
            <ClickAwayListener onClickAway={handleCancel}>
                <div className={`modal-dialog ${Styles.modalDialog}`}>
                    <div className={`modal-content ${Styles.modalBox}`}>
                        {loading ? <Spinner /> :
                            <>
                                <div className={`${Styles.modalHeader}`}>
                                    <img src={logo} className={Styles.logo} alt="x.com Logo" />
                                </div>
                                <div className={`modal-body ${Styles.modalBody}`}>
                                    <div>
                                    <h5>Log out of Twitter?</h5>
                                    <p className={Styles.agreementText}>You can always log back in at any time. If you just want to switch accounts, you can do that by adding an existing account. </p>
                                    </div>
                                    <div className={Styles.buttons}>
                                    <button onClick={handleLogout} className={`btn btn-light rounded-pill ${Styles.logoutButton}`}>Log out</button>
                                    <button onClick={handleCancel} className={`btn rounded-pill ${Styles.cancelButton}`}>Cancel</button>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                    <button ref={modalOpenButton} data-bs-toggle="modal" data-bs-target="#logoutModal" style={{ display: "none" }}></button>
                </div>
            </ClickAwayListener>
            </div>
        </>
    )
}
