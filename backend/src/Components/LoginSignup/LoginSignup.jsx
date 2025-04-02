import React, {useRef, useState} from "react";
import "./LoginSignup.css"

import user_icon from "../Assets/person.png"
import email_icon from "../Assets/email.png"
import password_icon from "../Assets/password.png"

const LoginSignup = () => {

    const [action, setAction] = useState("Sign Up")
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [matchingPassword, setMatchingpassword] = useState("");
    const hasSubmitted = useRef(true);

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("hasSubmitted:", hasSubmitted.current)


        if (!hasSubmitted.current) {
            console.log("setting hasSubmitted to true");
            hasSubmitted.current = true;
            return;
        }

        if (hasSubmitted.current && action === "Sign Up") {
            console.log("fecthing register api")
            const registerRequest = {username,email,password,matchingPassword}
            fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(registerRequest)
            })
        } else if (hasSubmitted.current && action === "Sign Up"){
            console.log("fecthing login api")
            const loginRequest = {username,password}
            fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(loginRequest)
            })
        }
    }

    const switchAction = (newAction) => {
        if (action !== newAction) {
            setAction(newAction);
            hasSubmitted.current = false;
            console.log(`switched to ${newAction}`)
        }
    };

    return (

        <div className={"container"}>
            <div className="header">
                <div className="text">{action}</div>
                <div className="underline"></div>
            </div>

            <form className="inputs" onSubmit={handleSubmit}>
                {action === "Login" ? <div></div> : <div className="input">
                    <img src={user_icon} alt=""/>
                    <input
                        type="text"
                        value={username}
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>}

                <div className="input">
                    <img src={email_icon} alt=""/>
                    <input
                        type="email"
                        value={email}
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="input">
                    <img src={password_icon} alt=""/>
                    <input
                        type="password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}/>
                </div>

                {action === "Sign Up" ? <div className="input">
                    <img src={password_icon} alt=""/>
                    <input
                        type="password"
                        value={matchingPassword}
                        placeholder="Repeat Password"
                        onChange={(e) => setMatchingpassword(e.target.value)}/>
                </div> : <div></div>}

                {action === "Sign Up" ? <div></div> :
                    <div className="forgot-password">Forgot Password? <span>Click here!</span></div>}

                <div className="submit-container">
                    <button
                        className={action === "Login" ? "submit gray" : "submit"}
                        onClick={() => { switchAction("Sign Up")}}
                    >Sign Up
                    </button>
                    <button
                        className={action === "Sign Up" ? "submit gray" : "submit"}
                        onClick={() => { switchAction("Login")}}
                    >Login
                    </button>
                </div>
            </form>
        </div>
    )
}

export default LoginSignup