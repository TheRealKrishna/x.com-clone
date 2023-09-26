import React from 'react'
import spinner from "../Images/Spinner.svg"
import Styles from ".././css/Spinner.module.css"

export default function Spinner() {
  return (
    <div className={Styles.spinnerContainer}>
      <img src={spinner} alt="O" className={Styles.spinner}/>
    </div>
  )
}
