import * as pdfjsLib from "./vendor/pdf.min.mjs";
import { getProjectFromLocation } from "./projects.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "./vendor/pdf.worker.min.mjs",
  import.meta.url,
).href;

const project = getProjectFromLocation();
const elements = {
  app: document.querySelector("#viewer-app"),
  stage: document.querySelector(".document-stage"),
  title: document.querySelector("#project-title"),
  canvas: document.querySelector("#pdf-canvas"),
  canvasWrap: document.querySelector("#canvas-wrap"),
  loading: document.querySelector("#loading-state"),
  error: document.querySelector("#error-state"),
  errorMessage: document.querySelector("#error-message"),
  pageCurrent: document.querySelector("#page-current"),
  pageTotal: document.querySelector("#page-total"),
  previous: document.querySelectorAll("[data-action='previous']"),
  next: document.querySelectorAll("[data-action='next']"),
  fullscreen: document.querySelector("#fullscreen-button"),
  thumbnails: document.querySelector("#thumbnail-list"),
  thumbnailToggle: document.querySelector("#thumbnail-toggle"),
  sidebar: document.querySelector("#thumbnail-sidebar"),
  progress: document.querySelector("#loading-progress"),
};

let pdfDocument = null;
let currentPage = 1;
let activeRenderTask = null;
let resizeTimer = null;

function setError(message) {
  elements.loading.hidden = true;
  elements.canvasWrap.hidden = true;
  elements.error.hidden = false;
  elements.errorMessage.textContent = message;
}

function buildThumbnails() {
  const fragment = document.createDocumentFragment();
  for (let page = 1; page <= project.pages; page += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumbnail-button";
    button.dataset.page = String(page);
    button.setAttribute("aria-label", `跳转到第 ${page} 页`);

    const image = document.createElement("img");
    image.src = `${project.thumbnailBase}/page-${String(page).padStart(3, "0")}.webp`;
    image.alt = `第 ${page} 页缩略图`;
    image.loading = page <= 4 ? "eager" : "lazy";
    image.decoding = "async";

    const number = document.createElement("span");
    number.textContent = String(page).padStart(2, "0");
    button.append(image, number);
    button.addEventListener("click", () => showPage(page));
    fragment.append(button);
  }
  elements.thumbnails.append(fragment);
}

function syncControls() {
  elements.pageCurrent.textContent = String(currentPage);
  elements.previous.forEach((button) => {
    button.disabled = currentPage <= 1;
  });
  elements.next.forEach((button) => {
    button.disabled = currentPage >= project.pages;
  });

  document.querySelectorAll(".thumbnail-button").forEach((button) => {
    const isCurrent = Number(button.dataset.page) === currentPage;
    button.classList.toggle("is-current", isCurrent);
    button.setAttribute("aria-current", isCurrent ? "page" : "false");
    if (isCurrent) {
      button.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }
  });
}

async function renderPage(pageNumber) {
  const page = await pdfDocument.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const availableWidth = Math.max(280, elements.stage.clientWidth - 152);
  const availableHeight = Math.max(320, elements.stage.clientHeight - 48);
  const fitScale = Math.min(
    availableWidth / baseViewport.width,
    availableHeight / baseViewport.height,
  );
  const outputScale = Math.min(window.devicePixelRatio || 1, 2);
  const cssViewport = page.getViewport({ scale: fitScale });
  const renderViewport = page.getViewport({ scale: fitScale * outputScale });

  if (activeRenderTask) {
    activeRenderTask.cancel();
  }

  const context = elements.canvas.getContext("2d", { alpha: false });
  elements.canvas.width = Math.floor(renderViewport.width);
  elements.canvas.height = Math.floor(renderViewport.height);
  elements.canvas.style.width = `${Math.floor(cssViewport.width)}px`;
  elements.canvas.style.height = `${Math.floor(cssViewport.height)}px`;

  activeRenderTask = page.render({ canvasContext: context, viewport: renderViewport });
  try {
    await activeRenderTask.promise;
  } catch (error) {
    if (error?.name !== "RenderingCancelledException") throw error;
  } finally {
    activeRenderTask = null;
  }
}

async function showPage(pageNumber) {
  if (!pdfDocument) return;
  const target = Math.min(Math.max(pageNumber, 1), pdfDocument.numPages);
  currentPage = target;
  elements.loading.hidden = false;
  elements.canvasWrap.setAttribute("aria-busy", "true");
  syncControls();

  try {
    await renderPage(target);
    elements.canvasWrap.hidden = false;
    elements.loading.hidden = true;
    elements.canvasWrap.setAttribute("aria-busy", "false");

    for (const nearby of [target - 1, target + 1]) {
      if (nearby >= 1 && nearby <= pdfDocument.numPages) {
        pdfDocument.getPage(nearby).catch(() => {});
      }
    }
  } catch (error) {
    console.error(error);
    setError("这一页暂时无法显示，请稍后重试。 ");
  }
}

async function loadProject() {
  if (!project) {
    setError("没有找到这个项目，请返回作品集重新选择。 ");
    return;
  }

  document.title = `${project.shortTitle} | Portfolio`;
  elements.title.textContent = project.title;
  elements.pageTotal.textContent = String(project.pages);
  buildThumbnails();

  try {
    const loadingTask = pdfjsLib.getDocument({ url: project.pdf });
    loadingTask.onProgress = ({ loaded, total }) => {
      if (total > 0) elements.progress.value = loaded / total;
    };
    pdfDocument = await loadingTask.promise;
    elements.pageTotal.textContent = String(pdfDocument.numPages);
    await showPage(1);
  } catch (error) {
    console.error(error);
    setError("项目加载失败。请确认通过网页服务器访问后重试。 ");
  }
}

elements.previous.forEach((button) => {
  button.addEventListener("click", () => showPage(currentPage - 1));
});
elements.next.forEach((button) => {
  button.addEventListener("click", () => showPage(currentPage + 1));
});

elements.thumbnailToggle.addEventListener("click", () => {
  const isOpen = elements.sidebar.classList.toggle("is-open");
  elements.thumbnailToggle.setAttribute("aria-expanded", String(isOpen));
});

elements.fullscreen.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await elements.app.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showPage(currentPage - 1);
  if (event.key === "ArrowRight") showPage(currentPage + 1);
  if (event.key === "Home") showPage(1);
  if (event.key === "End" && pdfDocument) showPage(pdfDocument.numPages);
});

window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (pdfDocument) renderPage(currentPage);
  }, 160);
});

loadProject();
