/* ============================================================
   CATALOGO DE PRODUCTOS
   Para anadir un producto: copia un bloque { ... }, pegalo al
   final de la lista y cambia los datos. La tienda, los filtros
   y las marcas se generan solos a partir de esta lista.

   tipo:   "chapas" | "llaveros" | "espejos" | "pegatinas" | "figuras3d"
   marca:  "Innecesariamente Necesario" o el nombre del collab (ej: "Sama")
   rareza: "normal" | "unica" (pieza unica, no se repite) 
   img:    ruta a la foto ("img/chapa-gato.jpg"). Si esta vacia ""
           se dibuja un placeholder automatico con el color de la marca.
   ============================================================ */
const PRODUCTOS = [
  {
    id: "chapa-corazon-pixel",
    nombre: "Chapa corazon pixel",
    tipo: "chapas",
    marca: "Innecesariamente Necesario",
    precio: 3.50,
    rareza: "normal",
    nuevo: true,
    img: "",
    desc: "Chapa de 58 mm pintada a mano capa a capa. Ningún corazón sale igual que otro."
  },
  {
    id: "chapa-gata-fantasma",
    nombre: "Chapa gata fantasma",
    tipo: "chapas",
    marca: "Innecesariamente Necesario",
    precio: 3.50,
    rareza: "normal",
    nuevo: false,
    img: "",
    desc: "Ilustración original escaneada y rematada a mano con rotulador posca."
  },
  {
    id: "llavero-mando-retro",
    nombre: "Llavero mando retro",
    tipo: "llaveros",
    marca: "Innecesariamente Necesario",
    precio: 6.00,
    rareza: "normal",
    nuevo: true,
    img: "",
    desc: "Acrílico con charm metálico. Montado, lijado y sellado en casa, no solo impreso."
  },
  {
    id: "llavero-sama-ojo",
    nombre: "Llavero ojo que todo lo ve",
    tipo: "llaveros",
    marca: "Sama",
    precio: 6.50,
    rareza: "normal",
    nuevo: false,
    img: "",
    desc: "Diseño collab de Sama, producción artesanal de la casa."
  },
  {
    id: "espejo-bolso-estrella",
    nombre: "Espejo de bolso estrella",
    tipo: "espejos",
    marca: "Innecesariamente Necesario",
    precio: 5.00,
    rareza: "normal",
    nuevo: false,
    img: "",
    desc: "Espejo de 75 mm con arte propio y acabado brillante hecho a mano."
  },
  {
    id: "pegatina-pack-nivel1",
    nombre: "Pack pegatinas nivel 1",
    tipo: "pegatinas",
    marca: "Innecesariamente Necesario",
    precio: 4.00,
    rareza: "normal",
    nuevo: false,
    img: "",
    desc: "5 pegatinas troqueladas a mano, resistentes al agua. El pack de inicio."
  },
  {
    id: "pegatina-sama-holo",
    nombre: "Pegatina holo Sama",
    tipo: "pegatinas",
    marca: "Sama",
    precio: 2.50,
    rareza: "normal",
    nuevo: true,
    img: "",
    desc: "Acabado holográfico, cortada una a una. Brilla como un drop legendario."
  },
  {
    id: "figura-slime-coleccion",
    nombre: "Figura 3D slime",
    tipo: "figuras3d",
    marca: "Innecesariamente Necesario",
    precio: 12.00,
    rareza: "unica",
    nuevo: false,
    img: "",
    desc: "Impresa en 3D y después lijada, imprimada y pintada a mano. Pieza única: cuando vuela, vuela."
  },
  {
    id: "figura-dragon-mini",
    nombre: "Mini dragon articulado",
    tipo: "figuras3d",
    marca: "Innecesariamente Necesario",
    precio: 15.00,
    rareza: "unica",
    nuevo: true,
    img: "",
    desc: "Articulado, pintado a pincel con detalle metalizado. Solo existe este."
  }
];

/* Nombres bonitos para los tipos (se usan en filtros y tarjetas) */
const TIPOS = {
  chapas: "Chapas",
  llaveros: "Llaveros",
  espejos: "Espejos",
  pegatinas: "Pegatinas",
  figuras3d: "Figuras 3D"
};
