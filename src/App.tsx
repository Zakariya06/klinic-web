import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import AOS from "aos";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);
  return (
    <>
      <AppRouter />
      
    </>
  );
}

export default App;
