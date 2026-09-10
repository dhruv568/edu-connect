import { middleware } from "../middleware";
import { NextRequest } from "next/server";
import { getLiveDomain, LIVE_EVENT_URL } from "../lib/app-url";

async function testLiveSubdomainRouting() {
  console.log("🧪 Testing Live Subdomain Hostname Routing & Middleware...");

  // 1. Verify App URL helpers
  console.log("Checking getLiveDomain()...");
  const resolvedDomain = getLiveDomain();
  if (resolvedDomain !== "https://live.educonnects.co.in") {
    throw new Error(`Expected https://live.educonnects.co.in but got ${resolvedDomain}`);
  }
  console.log("✅ getLiveDomain() resolved to:", resolvedDomain);
  console.log("✅ LIVE_EVENT_URL:", LIVE_EVENT_URL);

  // 2. Test Request to live.educonnects.co.in/ (root path)
  const reqLiveRoot = new NextRequest("https://live.educonnects.co.in/", {
    headers: { host: "live.educonnects.co.in" },
  });
  const resLiveRoot = middleware(reqLiveRoot);
  const rewriteHeader = resLiveRoot?.headers.get("x-middleware-rewrite");
  console.log(" live.educonnects.co.in/ rewrite header:", rewriteHeader);

  if (!rewriteHeader || !rewriteHeader.endsWith("/live")) {
    throw new Error(`Expected rewrite header to end with /live, got: ${rewriteHeader}`);
  }
  console.log("✅ live.educonnects.co.in/ correctly rewrites internally to /live");

  // 3. Test Request to live.educonnects.co.in/live (already /live)
  const reqLivePage = new NextRequest("https://live.educonnects.co.in/live", {
    headers: { host: "live.educonnects.co.in" },
  });
  const resLivePage = middleware(reqLivePage);
  const rewriteHeaderPage = resLivePage?.headers.get("x-middleware-rewrite");
  console.log(" live.educonnects.co.in/live rewrite header:", rewriteHeaderPage);

  if (rewriteHeaderPage && rewriteHeaderPage.endsWith("/live")) {
    // If it's already /live, x-middleware-rewrite should NOT rewrite /live to /live again
    // NextResponse.next() leaves x-middleware-rewrite null or empty.
    throw new Error(`Accidental rewrite loop detected on /live! Header: ${rewriteHeaderPage}`);
  }
  console.log("✅ live.educonnects.co.in/live avoids rewrite loops (passes through cleanly)");

  // 4. Test Request to main domain educonnects.co.in/live
  const reqMainLive = new NextRequest("https://educonnects.co.in/live", {
    headers: { host: "educonnects.co.in" },
  });
  const resMainLive = middleware(reqMainLive);
  const rewriteHeaderMainLive = resMainLive?.headers.get("x-middleware-rewrite");
  if (rewriteHeaderMainLive) {
    throw new Error(`Unexpected rewrite on educonnects.co.in/live: ${rewriteHeaderMainLive}`);
  }
  console.log("✅ educonnects.co.in/live works directly without rewrite");

  // 5. Test Request to main domain educonnects.co.in/
  const reqMainRoot = new NextRequest("https://educonnects.co.in/", {
    headers: { host: "educonnects.co.in" },
  });
  const resMainRoot = middleware(reqMainRoot);
  const rewriteHeaderMainRoot = resMainRoot?.headers.get("x-middleware-rewrite");
  if (rewriteHeaderMainRoot) {
    throw new Error(`Unexpected rewrite on main homepage: ${rewriteHeaderMainRoot}`);
  }
  console.log("✅ educonnects.co.in/ serves main homepage without rewrite");

  // 6. Test Request to students.educonnects.co.in/
  const reqStudentRoot = new NextRequest("https://students.educonnects.co.in/", {
    headers: { host: "students.educonnects.co.in" },
  });
  const resStudentRoot = middleware(reqStudentRoot);
  const rewriteStudent = resStudentRoot?.headers.get("x-middleware-rewrite");
  if (!rewriteStudent || !rewriteStudent.endsWith("/student")) {
    throw new Error(`Expected students.educonnects.co.in to rewrite to /student, got: ${rewriteStudent}`);
  }
  console.log("✅ students.educonnects.co.in/ correctly rewrites to /student");

  // 7. Test Request to educators.educonnects.co.in/
  const reqEducatorRoot = new NextRequest("https://educators.educonnects.co.in/", {
    headers: { host: "educators.educonnects.co.in" },
  });
  const resEducatorRoot = middleware(reqEducatorRoot);
  const rewriteEducator = resEducatorRoot?.headers.get("x-middleware-rewrite");
  if (!rewriteEducator || !rewriteEducator.endsWith("/teacher")) {
    throw new Error(`Expected educators.educonnects.co.in to rewrite to /teacher, got: ${rewriteEducator}`);
  }
  console.log("✅ educators.educonnects.co.in/ correctly rewrites to /teacher");

  // 8. Test static asset request on live subdomain
  const reqAsset = new NextRequest("https://live.educonnects.co.in/images/logo.png", {
    headers: { host: "live.educonnects.co.in" },
  });
  const resAsset = middleware(reqAsset);
  if (resAsset?.headers.get("x-middleware-rewrite")) {
    throw new Error("Static asset was incorrectly rewritten");
  }
  console.log("✅ Static assets on live subdomain pass through cleanly without rewrite");

  // 9. Test API route request on live subdomain
  const reqApi = new NextRequest("https://live.educonnects.co.in/api/events/register", {
    headers: { host: "live.educonnects.co.in" },
  });
  const resApi = middleware(reqApi);
  if (resApi?.headers.get("x-middleware-rewrite")) {
    throw new Error("API route on live subdomain was incorrectly rewritten");
  }
  console.log("✅ API routes on live subdomain pass through cleanly without rewrite");

  console.log("\n🎉 All Live Subdomain Hostname Routing tests passed successfully!");
}

testLiveSubdomainRouting().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
