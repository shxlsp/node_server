import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
const App = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("hello");
    setCount(1);
  }, []);
  return <div onClick={() => setCount((c) => c + 1)}>{count}</div>;
};
createRoot(document.querySelector("#app")).render(<App />);
