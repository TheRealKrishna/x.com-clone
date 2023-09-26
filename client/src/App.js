import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Home from "./Pages/Home";

function App() {
  return (
  <BrowserRouter>
    <Routes>
      <Route exact path="/" element={<><Home/></>}/>
      <Route exact path="/i/flow/signup" element={<><Home/></>}/>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
