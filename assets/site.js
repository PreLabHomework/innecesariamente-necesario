/* ============================================================
   INNECESARIAMENTE NECESARIO . site.js
   Logica compartida: carrito, filtros, pedido por email / IG.
   No hace falta tocar este archivo para el dia a dia.
   ============================================================ */

/* ---------- utilidades ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => n.toFixed(2).replace(".", ",") + " " + SHOP.simbolo;

/* almacenamiento con red de seguridad (si localStorage falla,
   el carrito vive en memoria durante la sesion) */
const store = {
  mem: {},
  get(k, fallback) {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
    catch { return this.mem[k] ?? fallback; }
  },
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch { this.mem[k] = v; }
  }
};

/* ---------- placeholders SVG por tipo de producto ----------
   Mientras no haya fotos (img: "") se dibuja el producto con
   los colores de la marca para que nada se vea roto. */
function placeholderSVG(p) {
  const css = getComputedStyle(document.documentElement);
  const brand = css.getPropertyValue("--brand").trim();
  const violet = css.getPropertyValue("--violet").trim();
  const pop = css.getPropertyValue("--pop").trim();
  const ink = css.getPropertyValue("--ink").trim();
  const bg = css.getPropertyValue("--surface-2").trim();
  const accent = p.marca === SHOP.nombre ? brand : violet;
  const shapes = {
    chapas: `<circle cx="80" cy="80" r="46" fill="${accent}"/>
             <circle cx="80" cy="80" r="46" fill="none" stroke="${ink}" stroke-width="3"/>
             <ellipse cx="64" cy="62" rx="12" ry="7" fill="#fff" opacity=".55" transform="rotate(-32 64 62)"/>`,
    llaveros: `<circle cx="80" cy="46" r="13" fill="none" stroke="${ink}" stroke-width="5"/>
               <rect x="56" y="60" width="48" height="58" rx="12" fill="${accent}" stroke="${ink}" stroke-width="3"/>
               <rect x="66" y="74" width="28" height="6" rx="3" fill="${ink}" opacity=".7"/>
               <rect x="66" y="88" width="20" height="6" rx="3" fill="${ink}" opacity=".45"/>`,
    espejos: `<circle cx="80" cy="78" r="42" fill="${accent}" stroke="${ink}" stroke-width="3"/>
              <circle cx="80" cy="78" r="30" fill="${bg}" stroke="${ink}" stroke-width="2"/>
              <path d="M62 70 L94 96" stroke="#fff" stroke-width="7" opacity=".5" stroke-linecap="round"/>`,
    pegatinas: `<path d="M46 52 q34 -18 68 0 q10 30 -6 58 q-30 14 -56 0 q-16 -28 -6 -58" fill="${accent}" stroke="${ink}" stroke-width="3"/>
                <path d="M100 104 l16 12 l-20 4 z" fill="${bg}" stroke="${ink}" stroke-width="2"/>`,
    figuras3d: `<path d="M80 34 L118 56 L118 100 L80 122 L42 100 L42 56 Z" fill="${accent}" stroke="${ink}" stroke-width="3"/>
                <path d="M80 34 L118 56 L80 78 L42 56 Z" fill="#fff" opacity=".22"/>
                <path d="M80 78 L80 122" stroke="${ink}" stroke-width="2" opacity=".6"/>
                <circle cx="80" cy="56" r="5" fill="${pop}"/>`
  };
  return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.nombre}">
    <rect width="160" height="160" fill="${bg}"/>
    ${shapes[p.tipo] || shapes.pegatinas}
  </svg>`;
}

function productImg(p) {
  return p.img
    ? `<img src="${p.img}" alt="${p.nombre}" class="w-full h-full object-cover" loading="lazy">`
    : placeholderSVG(p);
}

/* ---------- carrito ---------- */
let CART = store.get("in-cart", {});   // { idProducto: cantidad }

const cartCount = () => Object.values(CART).reduce((a, b) => a + b, 0);
const cartTotal = () => Object.entries(CART).reduce((sum, [id, q]) => {
  const p = PRODUCTOS.find(x => x.id === id);
  return p ? sum + p.precio * q : sum;
}, 0);

function saveCart() {
  store.set("in-cart", CART);
  updateCartUI();
}

function addToCart(id) {
  CART[id] = (CART[id] || 0) + 1;
  saveCart();
  toast("Añadido al inventario");
}

function setQty(id, q) {
  if (q <= 0) delete CART[id]; else CART[id] = q;
  saveCart();
}

function updateCartUI() {
  const n = cartCount();
  $$("[data-cart-badge]").forEach(b => {
    b.textContent = n;
    b.classList.toggle("hidden", n === 0);
  });
  renderCartDrawer();
}

/* ---------- drawer del carrito ---------- */
function renderCartDrawer() {
  const box = $("#cart-items");
  if (!box) return;
  const entries = Object.entries(CART);
  if (!entries.length) {
    box.innerHTML = `<p class="text-sm py-10 text-center" style="color:var(--muted)">
      Tu inventario está vacío.<br>Los drops buenos vuelan, no lo pienses mucho.</p>`;
  } else {
    box.innerHTML = entries.map(([id, q]) => {
      const p = PRODUCTOS.find(x => x.id === id);
      if (!p) return "";
      return `
      <div class="flex gap-3 items-center py-3 border-b" style="border-color:var(--line)">
        <div class="w-14 h-14 rounded-lg overflow-hidden shrink-0 sticker sticker-flat">${productImg(p)}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold truncate">${p.nombre}</p>
          <p class="text-xs" style="color:var(--muted)">${money(p.precio)}</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="chip" aria-label="Quitar uno" onclick="setQty('${id}', ${q - 1})">-</button>
          <span class="font-pixel text-xs w-5 text-center">${q}</span>
          <button class="chip" aria-label="Añadir uno" onclick="setQty('${id}', ${q + 1})">+</button>
        </div>
      </div>`;
    }).join("");
  }
  const totalEl = $("#cart-total");
  if (totalEl) totalEl.textContent = money(cartTotal());
  const btn = $("#btn-checkout");
  if (btn) btn.disabled = !entries.length;
}

function toggleCart(open) {
  const drawer = $("#cart-drawer"), backdrop = $("#cart-backdrop");
  if (!drawer) return;
  const show = open ?? drawer.classList.contains("translate-x-full");
  drawer.classList.toggle("translate-x-full", !show);
  backdrop.classList.toggle("hidden", !show);
  document.body.style.overflow = show ? "hidden" : "";
}

/* ---------- pedido ---------- */
function orderText() {
  const lines = Object.entries(CART).map(([id, q]) => {
    const p = PRODUCTOS.find(x => x.id === id);
    return p ? `- ${q} x ${p.nombre} (${p.marca}) ... ${money(p.precio * q)}` : "";
  });
  const nombre = $("#co-nombre")?.value.trim() || "";
  const notas = $("#co-notas")?.value.trim() || "";
  return [
    `PEDIDO . ${SHOP.nombre}`,
    ``,
    ...lines,
    ``,
    `TOTAL: ${money(cartTotal())}`,
    nombre ? `Nombre: ${nombre}` : ``,
    notas ? `Notas: ${notas}` : ``,
    ``,
    `Pago: PayPal (te confirmo por email y te mando la solicitud).`
  ].filter(Boolean).join("\n");
}

function checkoutEmail() {
  if (SHOP.shopify.enabled) return shopifyCheckout();
  const subject = encodeURIComponent(`Pedido web . ${$("#co-nombre")?.value.trim() || "sin nombre"}`);
  const body = encodeURIComponent(orderText());
  window.location.href = `mailto:${SHOP.email}?subject=${subject}&body=${body}`;
  toast("Abriendo tu correo con el pedido listo");
}

async function checkoutIG() {
  try { await navigator.clipboard.writeText(orderText()); toast("Pedido copiado. Pégalo en el DM"); }
  catch { toast("Copia el resumen y pégalo en el DM"); }
  window.open(`https://ig.me/m/${SHOP.instagram}`, "_blank", "noopener");
}

async function copyOrder() {
  try { await navigator.clipboard.writeText(orderText()); toast("Resumen copiado"); }
  catch { toast("No se pudo copiar automáticamente"); }
}

/* Shopify (futuro): cuando SHOP.shopify.enabled sea true, este es
   el unico punto que hay que implementar con el Buy Button SDK.
   Guia paso a paso en el README, seccion Shopify. */
function shopifyCheckout() {
  alert("Shopify aún no está conectado. Revisa el README, sección Shopify.");
}

function toggleCheckout(open) {
  const m = $("#checkout-modal");
  if (!m) return;
  m.classList.toggle("hidden", !open);
  if (open) $("#co-resumen").textContent = orderText();
}

/* ---------- toasts ---------- */
let toastTimer;
function toast(msg) {
  let t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("opacity-0", "translate-y-3");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("opacity-0", "translate-y-3"), 2400);
}

/* ---------- filtros y grid (solo tienda.html) ---------- */
const FILTER = { tipo: "todos", marca: "todas", q: "", orden: "reciente" };

function marcas() {
  return [...new Set(PRODUCTOS.map(p => p.marca))];
}

function renderFilters() {
  const tipoBox = $("#f-tipos"), marcaBox = $("#f-marcas");
  if (!tipoBox) return;
  tipoBox.innerHTML = ["todos", ...Object.keys(TIPOS)].map(t =>
    `<button class="chip ${FILTER.tipo === t ? "on" : ""}" onclick="setFilter('tipo','${t}')">
      ${t === "todos" ? "Todos" : TIPOS[t]}</button>`).join("");
  marcaBox.innerHTML = ["todas", ...marcas()].map(m =>
    `<button class="chip ${FILTER.marca === m ? "on" : ""}" onclick="setFilter('marca','${m}')">
      ${m === "todas" ? "Todas" : m}</button>`).join("");
}

function setFilter(k, v) {
  FILTER[k] = v;
  renderFilters();
  renderGrid();
}

function renderGrid() {
  const grid = $("#grid");
  if (!grid) return;
  let list = PRODUCTOS.filter(p =>
    (FILTER.tipo === "todos" || p.tipo === FILTER.tipo) &&
    (FILTER.marca === "todas" || p.marca === FILTER.marca) &&
    (!FILTER.q || (p.nombre + " " + p.desc + " " + p.marca).toLowerCase().includes(FILTER.q))
  );
  if (FILTER.orden === "precio-asc") list.sort((a, b) => a.precio - b.precio);
  if (FILTER.orden === "precio-desc") list.sort((a, b) => b.precio - a.precio);
  if (FILTER.orden === "reciente") list.sort((a, b) => (b.nuevo === true) - (a.nuevo === true));

  $("#grid-count").textContent = list.length
    ? `${list.length} drop${list.length === 1 ? "" : "s"} en el inventario`
    : "";

  if (!list.length) {
    grid.innerHTML = `<div class="col-span-full text-center py-16">
      <p class="font-pixel text-sm mb-2" style="color:var(--pop)">INVENTARIO VACÍO</p>
      <p style="color:var(--muted)">Con esos filtros no queda nada. Prueba a quitar alguno,
      o escríbeme por Instagram y te lo hago por encargo.</p></div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <button type="button" class="tile" onclick="openProduct('${p.id}')" aria-label="Ver ${p.nombre}">
      <div class="tile-media">${productImg(p)}</div>
      <div class="absolute top-2 left-2 right-2 flex flex-wrap gap-1">${productBadges(p)}</div>
      <div class="tile-label">
        <span class="truncate font-medium">${p.nombre}</span>
        <span class="shrink-0 font-bold" style="color:var(--brand-deep)">${money(p.precio)}</span>
      </div>
    </button>`).join("");
}

function productBadges(p) {
  return [
    p.nuevo ? `<span class="badge badge-new">Nuevo</span>` : "",
    p.rareza === "unica" ? `<span class="badge badge-rare">Pieza única</span>` : "",
    p.marca !== SHOP.nombre ? `<span class="badge badge-collab">${p.marca}</span>` : ""
  ].join("");
}

/* ---------- ficha de producto (se abre al hacer clic) ---------- */
function openProduct(id) {
  const p = PRODUCTOS.find(x => x.id === id);
  if (!p) return;
  let m = $("#product-modal");
  if (!m) {
    m = document.createElement("div");
    m.id = "product-modal";
    m.className = "hidden fixed inset-0 z-drawer grid place-items-center p-4";
    m.style.background = "rgba(40,20,18,.45)";
    m.addEventListener("click", e => { if (e.target === m) closeProduct(); });
    document.body.appendChild(m);
  }
  m.innerHTML = `
    <div class="w-full max-w-3xl rounded-2xl overflow-hidden grid md:grid-cols-2 max-h-[90vh] overflow-y-auto cart-scroll"
         style="background:var(--surface); box-shadow:0 30px 60px -20px rgba(80,30,25,.5)"
         role="dialog" aria-modal="true" aria-label="${p.nombre}">
      <div class="tile-media aspect-square" style="background:var(--surface-2)">${productImg(p)}</div>
      <div class="p-6 flex flex-col gap-3">
        <div class="flex justify-between items-start gap-3">
          <p class="font-pixel text-[10px]" style="color:var(--muted)">${TIPOS[p.tipo]} . ${p.marca}</p>
          <button class="chip" onclick="closeProduct()" aria-label="Cerrar">X</button>
        </div>
        <h2 class="font-display font-bold text-2xl leading-tight">${p.nombre}</h2>
        <div class="flex flex-wrap gap-1">${productBadges(p)}</div>
        <p class="text-sm leading-relaxed" style="color:var(--muted)">${p.desc}</p>
        <p class="font-display font-bold text-3xl mt-auto pt-4" style="color:var(--brand-deep)">${money(p.precio)}</p>
        <div class="grid gap-2">
          <button class="btn-primary" onclick="addToCart('${p.id}'); closeProduct()">Añadir al carrito</button>
          <a class="btn-ghost" href="https://ig.me/m/${SHOP.instagram}" target="_blank" rel="noopener">Preguntar por DM</a>
        </div>
      </div>
    </div>`;
  m.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  m.querySelector("button.chip").focus();
}

function closeProduct() {
  const m = $("#product-modal");
  if (!m) return;
  m.classList.add("hidden");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  closeProduct();
  toggleCheckout(false);
  toggleCart(false);
});

/* ---------- carrusel enlazado (portada) ----------
   Se genera solo: una tarjeta por tipo de producto (lleva a la
   tienda ya filtrada), una por cada artista collab, y reseñas. */
function renderCarousel() {
  const rail = $("#rail-track");
  if (!rail) return;
  const cards = [];
  Object.keys(TIPOS).forEach(t => {
    const p = PRODUCTOS.find(x => x.tipo === t);
    cards.push({ href: `tienda.html?tipo=${t}`, tag: "TIENDA", label: TIPOS[t], svg: p ? placeholderSVG(p) : null });
  });
  marcas().filter(m => m !== SHOP.nombre).forEach(m => {
    const p = PRODUCTOS.find(x => x.marca === m);
    cards.push({ href: `tienda.html?marca=${encodeURIComponent(m)}`, tag: "ARTISTA", label: `Collab . ${m}`, svg: p ? placeholderSVG(p) : null, violet: true });
  });
  cards.push({ href: "#pedidos", tag: "RESEÑAS", label: "Pedidos realizados", txt: "★★★★★" });
  cards.push({ href: "#contacto", tag: "DM", label: "Encargos a medida", txt: "HOLA :)" });
  const html = cards.map(c => `
    <a href="${c.href}" class="sticker sticker-press ${c.violet ? "sticker-violet" : ""} shrink-0 w-40 overflow-hidden">
      <div class="h-24 grid place-items-center" style="background:var(--surface-2)">
        ${c.svg ? `<div class="w-20 h-20">${c.svg}</div>`
                : `<span class="font-pixel text-sm" style="color:var(--pop)">${c.txt}</span>`}
      </div>
      <div class="p-3">
        <p class="font-pixel text-[9px]" style="color:var(--muted)">${c.tag}</p>
        <p class="font-display text-xs font-bold mt-1 leading-snug">${c.label}</p>
      </div>
    </a>`).join("");
  rail.innerHTML = html + html; /* duplicado para el bucle infinito */
}

/* ---------- arranque ---------- */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
  $$("[data-ig]").forEach(a => a.href = `https://instagram.com/${SHOP.instagram}`);
  $$("[data-igdm]").forEach(a => a.href = `https://ig.me/m/${SHOP.instagram}`);
  /* enlaces profundos: tienda.html?tipo=chapas o ?marca=Sama */
  const params = new URLSearchParams(location.search);
  const pt = params.get("tipo"), pm = params.get("marca");
  if (pt && TIPOS[pt]) FILTER.tipo = pt;
  if (pm && marcas().includes(pm)) FILTER.marca = pm;
  updateCartUI();
  renderFilters();
  renderGrid();
  renderCarousel();
  const q = $("#f-buscar");
  if (q) q.addEventListener("input", e => { FILTER.q = e.target.value.toLowerCase(); renderGrid(); });
  const o = $("#f-orden");
  if (o) o.addEventListener("change", e => { FILTER.orden = e.target.value; renderGrid(); });
});
