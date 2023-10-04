import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Home from "./Pages/Home";
import { Toaster } from "react-hot-toast"
import { GoogleOAuthProvider } from '@react-oauth/google';
import Index from "./Pages/home/Index";
import Logout from "./Pages/Logout";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-center"
        reverseOrder={true}
      />
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <Routes>
          <Route exact path="/" element={<><Home /></>} />
          <Route exact path="/i/flow/signup" element={<><Home /></>} />
          <Route exact path="/i/flow/login" element={<><Home /></>} />
          <Route exact path="/home" element={<><Index/></>} />
          <Route exact path="/logout" element={<><Logout/></>} />
        </Routes>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;
