async function verify() {
  const res = await fetch("http://localhost:3000");
  const html = await res.text();
  
  console.log("Status:", res.status);
  
  const cssMatches = html.match(/href="(\/_next\/static\/css\/[^"]+)"/g);
  console.log("CSS files linked:", cssMatches);
  
  if (cssMatches && cssMatches.length > 0) {
    const cssPath = cssMatches[0].replace('href="', '').replace('"', '');
    const cssRes = await fetch(`http://localhost:3000${cssPath}`);
    const cssText = await cssRes.text();
    console.log("CSS status:", cssRes.status);
    console.log("CSS length:", cssText.length, "bytes");
    console.log("Has #0B0F14 bg:", cssText.includes("#0B0F14") || cssText.includes("tactical"));
    console.log("Has tactical-green (#00D9A3):", cssText.includes("00d9a3") || cssText.includes("00D9A3"));
    console.log("Has tactical-panel:", cssText.includes("tactical-panel"));
  }
  
  console.log("HTML has dark class on html tag:", html.includes('<html lang="en" class="dark">'));
  console.log("HTML has tactical-grid-bg on body:", html.includes("tactical-grid-bg"));
  console.log("HTML has WelcomeModal:", html.includes("CONTROLLED SIMULATION ENVIRONMENT"));
}

verify().catch(console.error);
