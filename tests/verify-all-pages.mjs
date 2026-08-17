async function verifyAll() {
  const routes = ["/", "/coa", "/scenario", "/analytics"];
  for (const route of routes) {
    const res = await fetch(`http://localhost:3000${route}`);
    const text = await res.text();
    console.log(`Route ${route} -> Status: ${res.status}, Length: ${text.length}, Has dark theme: ${text.includes('class="dark"')}`);
  }
}

verifyAll().catch(console.error);
