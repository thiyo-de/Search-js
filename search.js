(async function () {
  // 1. Create the container
  const container = document.createElement("div");
  container.id = "container_search";
  Object.assign(container.style, {
    position: "fixed",
    top: "20px",
    left: "20px",
    zIndex: 9999,
    background: "#ffffff",
    padding: "5px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    width: "280px",
    fontFamily: "system-ui, sans-serif",
    fontSize: "14px",
    border: "1px solid #e5e7eb",
  });
  document.body.appendChild(container);

  // 2. Create input
  const input = document.createElement("input");
  input.type = "search";
  input.id = "searchInput";
  input.placeholder = "Search panoramas or links...";
  Object.assign(input.style, {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border 0.2s",
  });
  input.addEventListener(
    "focus",
    () => (input.style.border = "1px solid #6366f1")
  );
  input.addEventListener(
    "blur",
    () => (input.style.border = "1px solid #d1d5db")
  );
  container.appendChild(input);

  // 3. Create result list
  const ul = document.createElement("ul");
  ul.id = "itemList";
  Object.assign(ul.style, {
    listStyle: "none",
    padding: "0",
    marginTop: "10px",
    maxHeight: "240px",
    overflowY: "auto",
    display: "none",
    background: "#ffffff",
    borderRadius: "8px",
  });
  container.appendChild(ul);

  // Title Case
  function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

  // 4. Load panorama titles
  let panoTitles = [];
  try {
    const res = await fetch("locale/en.txt");
    const text = await res.text();
    panoTitles = text
      .split("\n")
      .map((line) => {
        const m = line.match(/^panorama_[A-Z0-9_]+\.label\s*=\s*(.+)$/);
        return m ? m[1].trim() : null;
      })
      .filter(Boolean);
  } catch (e) {
    console.error("Error loading pano titles:", e);
  }

  // 5. Load project links
  let ProjectLinks = [];
  try {
    const res = await fetch("Links.txt");
    const text = await res.text();
    ProjectLinks = text
      .split("\n")
      .map((line) => {
        const parts = line.split("=");
        if (parts.length === 2) {
          return {
            title: parts[0].trim(),
            url: parts[1].trim(),
          };
        }
        return null;
      })
      .filter(Boolean);
  } catch (e) {
    console.error("Error loading project links:", e);
  }

  // 6. Unified list renderer
  function populateCombinedList(items) {
    ul.innerHTML = "";

    items.forEach((item) => {
      const li = document.createElement("li");

      Object.assign(li.style, {
        padding: "10px 14px",
        marginBottom: "4px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background 0.2s",
      });

      if (item.type === "pano") {
        li.style.background = "#f0fdf4";
        li.style.color = "#16a34a";
        li.textContent = toTitleCase(item.title);
        li.addEventListener(
          "mouseenter",
          () => (li.style.background = "#dcfce7")
        );
        li.addEventListener(
          "mouseleave",
          () => (li.style.background = "#f0fdf4")
        );

        li.addEventListener("click", () => {
          input.value = item.title;
          ul.style.display = "none";
          if (
            typeof tour !== "undefined" &&
            typeof tour.setMediaByName === "function"
          ) {
            tour.setMediaByName(item.title);
          } else {
            alert("Panorama selected: " + item.title);
          }
        });
      } else if (item.type === "link") {
        li.style.background = "#f0fdf4";
        li.style.color = "#16a34a";
        li.textContent = toTitleCase(item.title);
        li.addEventListener(
          "mouseenter",
          () => (li.style.background = "#dcfce7")
        );
        li.addEventListener(
          "mouseleave",
          () => (li.style.background = "#f0fdf4")
        );

        li.addEventListener("click", () => {
          input.value = item.title;
          window.open(item.url, "_blank");
          ul.style.display = "none";
        });
      }

      ul.appendChild(li);
    });

    ul.style.display = items.length ? "block" : "none";
  }

  // 7. Filter on input
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();

    const panoResults = panoTitles
      .filter((t) => t.toLowerCase().includes(q))
      .map((title) => ({ type: "pano", title }));

    const linkResults = ProjectLinks.filter((link) =>
      link.title.toLowerCase().includes(q)
    ).map((link) => ({ type: "link", title: link.title, url: link.url }));

    const combined = [...panoResults, ...linkResults];
    populateCombinedList(combined);
  });

  // 8. Show all on focus
  input.addEventListener("focus", () => {
    const combined = [
      ...panoTitles.map((title) => ({ type: "pano", title })),
      ...ProjectLinks.map((link) => ({
        type: "link",
        title: link.title,
        url: link.url,
      })),
    ];
    populateCombinedList(combined);
  });

  // 9. Hide list on outside click
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      ul.style.display = "none";
    }
  });
})();
