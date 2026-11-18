import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import Queue from "./Queue";

export const dynamic = "force-dynamic";
export const metadata = { title: "運営の対応待ち | Shopping Buddy", robots: { index: false } };

export default async function OperationsPage() {
  const user = await getChatGPTUser();
  return <main lang="ja" className="vintage-entry buddy-finder">
    <section className="buddy-finder-panel">
      <h1>運営の対応待ち</h1>
      {user ? <Queue /> : <p className="buddy-finder-lead">
        <a href={chatGPTSignInPath("/operations")} target="_top">運営用ChatGPTアカウントでログイン</a>
      </p>}
    </section>
  </main>;
}
