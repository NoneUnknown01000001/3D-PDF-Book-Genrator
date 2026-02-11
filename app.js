const input = document.getElementById("pdfInput");
const book = document.getElementById("book");
let papers = [];
let current = 0;

input.addEventListener("change", async (e) => {
  book.innerHTML = "";
  papers = [];
  current = 0;

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function () {
    const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;
    let canvases = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      canvases.push(canvas);
    }

    // ساخت ورق ها
    let zIndexCounter = canvases.length; // بالاترین z-index برای اولین ورق
    for (let i = 0; i < canvases.length; i += 2) {
      const paper = document.createElement("div");
      paper.className = "paper";
      paper.style.zIndex = zIndexCounter--;

      const front = document.createElement("div");
      front.className = "page front";

      const back = document.createElement("div");
      back.className = "page back";

      // ترتیب صفحات
      if (canvases[i]) front.appendChild(canvases[i]); // صفحه چپ
      if (canvases[i + 1]) back.appendChild(canvases[i + 1]); // صفحه راست

      paper.appendChild(front);
      paper.appendChild(back);
      book.appendChild(paper);
      papers.push(paper);
    }
  };
  reader.readAsArrayBuffer(file);
});

// نکست و قبلی
let zIndexCounter = 1; // شروع از 1

function nextPage() {
  if (current >= papers.length) return;
  papers[current].classList.add("flipped");
  papers[current].style.zIndex = zIndexCounter++; // هر بار z-index افزایش
  current++;
}

function prevPage() {
  if (current <= 0) return;
  current--;
  papers[current].classList.remove("flipped");
  papers[current].style.zIndex = zIndexCounter++; // برای اینکه ورق باز شده دوباره روی بقیه برود
}
