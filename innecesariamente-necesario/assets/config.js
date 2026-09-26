/* ============================================================
   CONFIGURACION DE LA TIENDA
   Rellena estos datos y no toques nada mas.
   ============================================================ */
const SHOP = {
  nombre: "Innecesariamente Necesario",

  // Correo donde llegan los pedidos de la web
  email: "CAMBIA-ESTO@gmail.com",

  // Usuario de Instagram SIN la arroba
  instagram: "innecesariamente.necesario",

  // Usuario de PayPal.Me (paypal.me/TU-USUARIO). Dejar "" si aun no hay.
  paypalMe: "",

  // Moneda
  moneda: "EUR",
  simbolo: "€",

  /* ----------------------------------------------------------
     SHOPIFY (futuro). Cuando haya ingresos y cuenta de Shopify:
     1) enabled: true
     2) domain: "tu-tienda.myshopify.com"
     3) token: el Storefront access token
     El boton de compra de cada producto pasara a usar el
     checkout real de Shopify (ver seccion Shopify del README).
     ---------------------------------------------------------- */
  shopify: {
    enabled: false,
    domain: "",
    token: ""
  }
};
