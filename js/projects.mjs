export const projects = {
  skateboard: {
    id: "skateboard",
    title: "滑板新手智能可穿戴护具",
    shortTitle: "滑板新手智能可穿戴护具",
    pdf: "assets/pdfs/web/skateboard.pdf",
    pages: 32,
    thumbnailBase: "assets/thumbnails/skateboard",
  },
  fitness: {
    id: "fitness",
    title: "针对大学生健身群体设计的健身日程管理平台",
    shortTitle: "校园健身日程管理平台",
    pdf: "assets/pdfs/web/fitness-platform.pdf",
    pages: 46,
    thumbnailBase: "assets/thumbnails/fitness",
  },
  trpg: {
    id: "trpg",
    title: "基于 AI 的 TRPG 跑团游戏",
    shortTitle: "AI TRPG 跑团游戏",
    pdf: "assets/pdfs/web/ai-trpg.pdf",
    pages: 24,
    thumbnailBase: "assets/thumbnails/trpg",
  },
  wristband: {
    id: "wristband",
    title: "安旅 - 三方协同的老年跟团游服务手环与 App 设计",
    shortTitle: "安旅服务手环与 App",
    pdf: "assets/pdfs/web/anlv-wristband.pdf",
    pages: 5,
    thumbnailBase: "assets/thumbnails/wristband",
  },
};

export function getProjectFromLocation(search = window.location.search) {
  const id = new URLSearchParams(search).get("project") || "skateboard";
  return projects[id] || null;
}
