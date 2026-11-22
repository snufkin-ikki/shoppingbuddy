import type { Metadata } from "next";
import Home from "../page";

export const metadata: Metadata = {
  openGraph: {
    title: "Shopping Buddy | 街歩きの相方を探そう",
    description: "好きな街や興味から、ウインドウショッピングや街歩きの相方を探そう。",
    url: "https://myshopping-buddy.com/line",
    type: "website",
    images: [{
      url: "https://myshopping-buddy.com/shopping-buddy-line-preview.jpg",
      width: 1200,
      height: 675,
      alt: "Shopping Buddyのロゴとタグライン",
    }],
  },
  alternates: { canonical: "https://myshopping-buddy.com/" },
};

export default Home;
