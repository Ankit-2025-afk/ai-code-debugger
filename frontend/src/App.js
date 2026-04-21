import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://ai-code-debugger-m9w8.onrender.com";

  const runDebug = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/debug`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "python" })
      });

      const data = await res.json();
      console.log("API RESPONSE:", data); // 🔍 DEBUG
      setOutput(data);
    } catch (err) {
      console.log(err);
      setOutput({ error: "Backend error" });
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>🧠 AI Code Debugger</h2>
      </header>

      <div style={styles.main}>

        {/* LEFT SIDE */}
        <div style={styles.left}>
          <h3>Code Editor</h3>

          <CodeMirror
            value={code}
            height="300px"
            theme={oneDark}
            onChange={(value) => setCode(value)}
          />

          <button style={styles.button} onClick={runDebug}>
            {loading ? "⏳ Analyzing..." : "🚀 Debug Code"}
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div style={styles.right}>
          {output && (
            <>
              {/* SCORE */}
              <div style={styles.scoreCard}>
                <h3>Code Score</h3>
                <h1>{output.score || 0}</h1>
              </div>

              {/* METRICS */}
              <Section title="Metrics">
                Bugs: {output.metrics?.bugs || 0} <br />
                Issues: {output.metrics?.issues || 0} <br />
                Security: {output.metrics?.security || 0}
              </Section>

              {/* OUTPUT */}
              <Section title="Output">
                {output.runtime_output || "No output"}
              </Section>

              {/* SUGGESTIONS */}
              <div style={styles.card}>
                <h4>Suggestions</h4>
                {output.suggestions?.length ? (
                  output.suggestions.map((item, i) => (
                    <p key={i}>💡 {item}</p>
                  ))
                ) : (
                  <p>No suggestions</p>
                )}
              </div>

              {/* ERRORS */}
              {output.syntax_error && (
                <Section title="Error">
                  {output.syntax_error}
                </Section>
              )}

              {/* AI EXPLANATION */}
              <Section title="AI Explanation">
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {output.ai_explanation}
                </pre>
              </Section>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

/* COMPONENT */
const Section = ({ title, children }) => (
  <div style={styles.card}>
    <h4>{title}</h4>
    <div>{children}</div>
  </div>
);

/* STYLES */
const styles = {
  container: {
    fontFamily: "Arial",
    background: "#f5f7fb",
    minHeight: "100vh"
  },
  header: {
    background: "#fff",
    padding: "15px 30px",
    borderBottom: "1px solid #ddd"
  },
  main: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
    padding: "20px"
  },
  left: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px"
  },
  right: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  button: {
    marginTop: "15px",
    padding: "10px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  card: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  scoreCard: {
    background: "#eef2ff",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center"
  }
};

export default App;