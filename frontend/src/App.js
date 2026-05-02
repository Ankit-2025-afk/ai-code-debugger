import React, { useState } from "react";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      alert("Please enter some code");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://localhost:8000/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: code,
          language: language
        })
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse("Error connecting to server");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1>AI Code Debugger & Reviewer</h1>

      {/* Language Selector */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={styles.select}
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="c++">C++</option>
      </select>

      {/* Code Input */}
      <textarea
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={styles.textarea}
      />

      {/* Button */}
      <button onClick={handleAnalyze} style={styles.button}>
        {loading ? "Analyzing..." : "Analyze Code"}
      </button>

      {/* Output */}
      <div style={styles.output}>
        <h3>AI Response:</h3>
        <pre>{response}</pre>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial"
  },
  textarea: {
    width: "100%",
    height: "200px",
    marginTop: "10px",
    padding: "10px",
    fontSize: "14px"
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer"
  },
  output: {
    marginTop: "20px",
    background: "#f4f4f4",
    padding: "10px",
    borderRadius: "5px"
  },
  select: {
    padding: "8px",
    marginBottom: "10px"
  }
};

export default App;