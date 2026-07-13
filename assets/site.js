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

/* ---------- vista rapida (modal) ---------- */
function openQuickView(id) {
  const p = PRODUCTOS.find(x => x.id === id);
  const modal = $("#qv-modal");
  if (!p || !modal) return;
  const collab = p.marca !== SHOP.nombre;
  const rare = p.rareza === "unica";
  $("#qv-media").innerHTML = productImg(p);
  $("#qv-info").innerHTML = `
    <div class="flex flex-wrap gap-1.5">
      <span class="chip pointer-events-none">${TIPOS[p.tipo]}</span>
      ${collab ? `<span class="chip pointer-events-none" style="border-color:var(--violet);color:var(--violet)">COLLAB . ${p.marca.toUpperCase()}</span>` : ""}
      ${rare ? `<span class="chip pointer-events-none" style="border-color:var(--pop);color:var(--pop)">PIEZA ÚNICA</span>` : ""}
      ${p.nuevo ? `<span class="chip pointer-events-none" style="border-color:var(--brand);color:var(--brand)">NUEVO</span>` : ""}
    </div>
    <h3 class="font-display text-lg leading-snug mt-2">${p.nombre}</h3>
    <p class="text-sm leading-relaxed mt-1" style="color:var(--muted)">${p.desc}</p>
    <p class="font-pixel text-xl mt-3" style="color:var(--pop)">${money(p.precio)}</p>
    <div class="mt-auto pt-4 flex flex-wrap gap-3">
      <button class="sticker sticker-press px-5 py-2.5 font-display font-bold text-sm"
              style="background:var(--brand); color:var(--bg); border-color:var(--bg)"
              onclick="addToCart('${p.id}')">+ Añadir al carrito</button>
      <a class="chip" href="https://ig.me/m/${SHOP.instagram}" target="_blank" rel="noopener">Preguntar por DM</a>
    </div>`;
  toggleQuickView(true);
}

function toggleQuickView(open) {
  const m = $("#qv-modal");
  if (!m) return;
  m.classList.toggle("hidden", !open);
}

/* ---------- tarjeta de producto compartida (tienda + destacados) ----------
   Cada 5o producto y toda pieza unica ocupa doble ancho (bento), y las
   tarjetas se desplazan un poco arriba/abajo para romper la rejilla. */
function cardSizeClass(p, i) {
  if (p.rareza === "unica") return "bento-lg";
  return (i % 5 === 2) ? "bento-lg" : "";
}
function staggerClass(i) {
  const m = i % 3;
  return m === 1 ? "stagger-down" : m === 2 ? "stagger-up" : "";
}

function productCard(p, i) {
  const collab = p.marca !== SHOP.nombre;
  const rare = p.rareza === "unica";
  const big = cardSizeClass(p, i);
  const tilt = ((i % 3) - 1) * 0.8;
  return `
  <article class="sticker sticker-press holo peel relative flex flex-col overflow-hidden
                  ${rare ? "rarity-unica" : ""} ${collab && !rare ? "rarity-collab" : ""}
                  ${big} ${staggerClass(i)}"
           style="--tilt:${tilt}deg">
    ${rare ? `<span class="ribbon" aria-hidden="true">ÚNICA</span>` : ""}
    <div class="${big ? "aspect-[16/10]" : "aspect-square"} w-full qv-trigger" style="background:var(--surface-2)"
         onclick="openQuickView('${p.id}')">${productImg(p)}</div>
    <div class="p-4 flex flex-col gap-2 flex-1">
      <div class="flex flex-wrap gap-1.5">
        <span class="chip pointer-events-none">${TIPOS[p.tipo]}</span>
        ${collab ? `<span class="chip pointer-events-none" style="border-color:var(--violet);color:var(--violet)">COLLAB . ${p.marca.toUpperCase()}</span>` : ""}
        ${rare ? `<span class="chip pointer-events-none" style="border-color:var(--pop);color:var(--pop)">PIEZA ÚNICA</span>` : ""}
        ${p.nuevo ? `<span class="chip pointer-events-none" style="border-color:var(--brand);color:var(--brand)">NUEVO</span>` : ""}
      </div>
      <h3 class="font-display text-sm leading-snug qv-trigger" onclick="openQuickView('${p.id}')">${p.nombre}</h3>
      <p class="text-xs leading-relaxed" style="color:var(--muted)">${p.desc}</p>
      <div class="mt-auto pt-2 flex items-center justify-between gap-2">
        <span class="font-pixel text-base" style="color:var(--pop)">${money(p.precio)}</span>
        <div class="flex gap-2">
          <a class="chip" href="https://ig.me/m/${SHOP.instagram}" target="_blank" rel="noopener"
             title="Pedir o preguntar por DM">DM</a>
          <button class="chip on" onclick="addToCart('${p.id}')">+ CARRITO</button>
        </div>
      </div>
    </div>
  </article>`;
}

/* ---------- destacados (solo index.html) ---------- */
function featuredProducts(n = 6) {
  const nuevo = PRODUCTOS.filter(p => p.nuevo);
  const unica = PRODUCTOS.filter(p => p.rareza === "unica" && !p.nuevo);
  const resto = PRODUCTOS.filter(p => !p.nuevo && p.rareza !== "unica");
  return [...nuevo, ...unica, ...resto].slice(0, n);
}

function renderFeatured() {
  const grid = $("#featured-grid");
  if (!grid) return;
  grid.innerHTML = featuredProducts(6).map((p, i) => productCard(p, i)).join("");
}

/* ---------- carrusel enlazado (portada) ----------
   Se genera solo: una tarjeta por tipo de producto (lleva a la tienda
   ya filtrada por ese tipo), una por cada artista collab (lleva a la
   tienda ya filtrada por esa marca), y accesos directos a reseñas
   y contacto. Así "tocar una tarjeta" te lleva a esa parte de la web. */
function renderCarousel() {
  const rail = $("#rail-track");
  if (!rail) return;
  const cards = [];
  Object.keys(TIPOS).forEach(t => {
    const p = PRODUCTOS.find(x => x.tipo === t);
    cards.push({ href: `tienda.html?tipo=${t}`, tag: "TIENDA", label: TIPOS[t], media: p ? productImg(p) : null });
  });
  marcas().filter(m => m !== SHOP.nombre).forEach(m => {
    const p = PRODUCTOS.find(x => x.marca === m);
    cards.push({ href: `tienda.html?marca=${encodeURIComponent(m)}`, tag: "ARTISTA", label: `Collab . ${m}`, media: p ? productImg(p) : null, violet: true });
  });
  cards.push({ href: "#pedidos", tag: "RESEÑAS", label: "Pedidos realizados", txt: "★★★★★" });
  cards.push({ href: "#contacto", tag: "DM", label: "Encargos a medida", txt: "HOLA :)" });
  const html = cards.map((c, i) => `
    <a href="${c.href}" class="sticker sticker-press ${c.violet ? "sticker-violet" : ""} shrink-0 w-40 overflow-hidden"
       style="--tilt:${((i % 3) - 1) * 0.7}deg">
      <div class="h-24 grid place-items-center" style="background:var(--surface-2)">
        ${c.media ? `<div class="w-20 h-20">${c.media}</div>`
                  : `<span class="font-pixel text-sm" style="color:var(--pop)">${c.txt}</span>`}
      </div>
      <div class="p-3">
        <p class="font-pixel text-[9px]" style="color:var(--muted)">${c.tag}</p>
        <p class="font-display text-xs font-bold mt-1 leading-snug">${c.label}</p>
      </div>
    </a>`).join("");
  rail.innerHTML = html + html; /* duplicado para el bucle infinito */
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

  grid.innerHTML = list.map((p, i) => productCard(p, i)).join("");
}

/* ---------- arranque ---------- */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
  $$("[data-ig]").forEach(a => a.href = `https://instagram.com/${SHOP.instagram}`);
  $$("[data-igdm]").forEach(a => a.href = `https://ig.me/m/${SHOP.instagram}`);
  updateCartUI();

  /* enlaces profundos desde el carrusel: tienda.html?tipo=chapas o ?marca=Sama */
  const params = new URLSearchParams(location.search);
  const pt = params.get("tipo"), pm = params.get("marca");
  if (pt && TIPOS[pt]) FILTER.tipo = pt;
  if (pm && marcas().includes(pm)) FILTER.marca = pm;

  renderFilters();
  renderGrid();
  renderFeatured();
  renderCarousel();
  const q = $("#f-buscar");
  if (q) q.addEventListener("input", e => { FILTER.q = e.target.value.toLowerCase(); renderGrid(); });
  const o = $("#f-orden");
  if (o) o.addEventListener("change", e => { FILTER.orden = e.target.value; renderGrid(); });
});
