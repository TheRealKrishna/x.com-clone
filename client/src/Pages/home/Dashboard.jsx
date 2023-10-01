import React, { useEffect, useState } from 'react'
import Loader from '../../Components/Loader';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!localStorage.getItem("auth-token")) {
            navigate("/i/flow/login")
        }
        else {
            setTimeout(() => {
                setLoading(false)
            }, 500);
        }
    }, [])
    return (
        <div>
            this is home
        </div>
    )
}
