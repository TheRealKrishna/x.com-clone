import React from 'react'
import loader from "../Images/Loader.svg"

export default function Loader() {
  return (
    <div style={{height:"100vh", width:"100vw", display:"flex", justifyContent:"center", alignItems:"center", position:"absolute", zIndex:"99", backgroundColor:"black"}}>
      <img src={loader} alt="X" />
    </div>
  )
}
