import { Home } from "./pages";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Home />
      <ToastContainer position="bottom-right" autoClose={2000} newestOnTop closeOnClick pauseOnHover theme="colored" />
    </>
  );
}

export default App;
