import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  const getBackendMessage = async () => {
    const res = await fetch("http://127.0.0.1:8000/");
    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>AI Study Arena</h1>

      <button onClick={getBackendMessage}>
        Connect Backend
      </button>

      <p>{message}</p>
    </div>
  );
}

export default App;