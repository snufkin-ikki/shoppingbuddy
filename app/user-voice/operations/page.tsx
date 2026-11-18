import { chatGPTSignInPath, getChatGPTUser } from "../../chatgpt-auth";
import Operations from "./Operations";

export const dynamic = "force-dynamic";

export default async function VoiceOperationsPage() {
  const user = await getChatGPTUser();
  return <main lang="ja" className="vintage-entry buddy-finder">
    <section className="buddy-finder-panel">
      <h1>User Voice 運営</h1>
      {user ? <Operations /> : <p className="buddy-finder-lead">
        <a href={chatGPTSignInPath("/user-voice/operations")} target="_top">運営用ChatGPTアカウントでログイン</a>
      </p>}
    </section>
  </main>;
}
