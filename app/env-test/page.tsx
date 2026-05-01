export default function EnvTestPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>Env Test</h1>
      <p>
        <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{" "}
        {url ? (
          <span style={{ color: "green" }}>{url}</span>
        ) : (
          <span style={{ color: "red" }}>NOT SET</span>
        )}
      </p>
    </div>
  );
}
