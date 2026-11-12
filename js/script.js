// 1. REQUISITO JSON: Datos estructurados (con respaldo directo por si abres el HTML sin servidor)
const jsonRespaldo = `[
  {"id":1,"nombre":"napolitana de carne","precio":40,"categoria":"Platos","desc":"Porción para 1 persona"},
  {"id":2,"nombre":"napolitana de pollo","precio":40,"categoria":"Platos","desc":"Porción para 1 persona"},
  {"id":3,"nombre":"parmesana de carne","precio":40,"categoria":"Platos","desc":"Con queso parmesano gratinado"},
  {"id":4,"nombre":"parmesana de pollo","precio":40,"categoria":"Platos","desc":"Con queso parmesano gratinado"},
  {"id":5,"nombre":"Hamburguesa","precio":25,"categoria":"Platos","desc":"Clásica artesanal con papas"},
  {"id":6,"nombre":"Lomito","precio":25,"categoria":"Platos","desc":"Lomito jugoso completo"},
  {"id":7,"nombre":"Limonada o lima en vaso","precio":5,"categoria":"Bebidas","desc":"Vaso personal refrescante"},
  {"id":8,"nombre":"Jarra chica","precio":10,"categoria":"Bebidas","desc":"Limonada o lima"},
  {"id":9,"nombre":"Jarra grande","precio":15,"categoria":"Bebidas","desc":"Ideal para compartir"},
  {"id":10,"nombre":"Tropi","precio":15,"categoria":"Bebidas","desc":"Bebida frutal"},
  {"id":11,"nombre":"Coca-Cola","precio":20,"categoria":"Bebidas","desc":"Botella familiar"},
  {"id":12,"nombre":"Fanta","precio":20,"categoria":"Bebidas","desc":"Botella familiar"},
  {"id":13,"nombre":"Guaraná","precio":20,"categoria":"Bebidas","desc":"Botella familiar"},
  {"id":14,"nombre":"Coca-Cola Zero","precio":20,"categoria":"Bebidas","desc":"Sin azúcar"},
  {"id":15,"nombre":"Agua personal con gas","precio":7,"categoria":"Bebidas","desc":"Botella 500ml"},
  {"id":16,"nombre":"Agua personal sin gas","precio":7,"categoria":"Bebidas","desc":"Botella 500ml"}
]`;

// 🔥 MODIFICACIÓN: Leer de localStorage al cargar la página o iniciar vacío
let productos = JSON.parse(jsonRespaldo);
let carrito = JSON.parse(localStorage.getItem('miCarrito')) || [];
let comandasCocina = JSON.parse(localStorage.getItem('misComandas')) || [];
let categoriaActual = "todos";

// Intentar cargar desde data/productos.json si está en servidor
fetch("data/productos.json")
  .then(res => res.json())
  .then(datos => { productos = datos; mostrarProductos(); })
  .catch(() => mostrarProductos());

// 🔥 MODIFICACIÓN: Renderizar lo guardado inmediatamente al abrir la página
actualizarCarritoDOM();
renderizarCocinaYCaja();

// 2. REQUISITO DOM y COLECCIONES
function mostrarProductos(textoBusqueda = "") {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "";

  const filtrados = productos.filter(p => {
    const coincideCat = categoriaActual === "todos" || p.categoria === categoriaActual;
    const coincideTexto = p.nombre.toLowerCase().includes(textoBusqueda.toLowerCase());
    return coincideCat && coincideTexto;
  });

  filtrados.forEach(prod => {
    contenedor.innerHTML += `
      <div class="tarjeta animacion-aparicion">
        <div>
          <span class="badge">${prod.categoria}</span>
          <h4>${prod.nombre}</h4>
          <small>${prod.desc}</small>
        </div>
        <div>
          <p class="precio">Bs ${prod.precio}</p>
          <button class="btn-agregar" onclick="agregarAlCarrito(${prod.id})">+ Agregar al pedido</button>
        </div>
      </div>`;
  });
}

// 🔥 NUEVA FUNCIÓN: Guarda las colecciones en la memoria del navegador
function guardarDatosLocales() {
  localStorage.setItem('miCarrito', JSON.stringify(carrito));
  localStorage.setItem('misComandas', JSON.stringify(comandasCocina));
}

// 3. COLECCIONES: find() y push()
function agregarAlCarrito(id) {
  const productoEncontrado = productos.find(p => p.id === id);
  if (productoEncontrado) {
    carrito.push(productoEncontrado);
    guardarDatosLocales(); // 🔥 Se guarda al agregar
    actualizarCarritoDOM();
  }
}

function quitarDelCarrito(indice) {
  carrito.splice(indice, 1);
  guardarDatosLocales(); // 🔥 Se guarda al quitar
  actualizarCarritoDOM();
}

function actualizarCarritoDOM() {
  const lista = document.getElementById("lista-carrito");
  lista.innerHTML = "";
  let sumaTotal = 0;

  carrito.forEach((item, index) => {
    sumaTotal += item.precio;
    lista.innerHTML += `
      <li class="item-carrito">
        <span>${item.nombre} (Bs ${item.precio})</span>
        <button class="btn-quitar" onclick="quitarDelCarrito(${index})">✕</button>
      </li>`;
  });
  document.getElementById("total-carrito").textContent = sumaTotal;
}

// 4. REQUISITO LISTENERS Y EVENTOS
document.getElementById("buscador").addEventListener("input", (e) => {
  mostrarProductos(e.target.value);
});

document.querySelectorAll(".btn-filtro").forEach(boton => {
  boton.addEventListener("click", () => {
    document.querySelectorAll(".btn-filtro").forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");
    categoriaActual = boton.dataset.categoria;
    mostrarProductos(document.getElementById("buscador").value);
  });
});

document.getElementById("btnEstadoLocal").addEventListener("click", (e) => {
  const abierto = e.target.textContent.includes("Abierto");
  e.target.textContent = abierto ? "🔴 Local Cerrado" : "🟢 Local Abierto";
  e.target.style.background = abierto ? "#991b1b" : "#065f46";
});

document.getElementById("form-pedido").addEventListener("submit", (e) => {
  e.preventDefault();
  if (carrito.length === 0) return alert("Agrega al menos un producto del menú al carrito.");

  const totalPedido = carrito.reduce((acc, item) => acc + item.precio, 0);
  const nombresPlatos = carrito.map(i => i.nombre).join(", ");

  comandasCocina.push({
    cliente: document.getElementById("cliente").value,
    mesa: document.getElementById("mesa").value,
    detalle: nombresPlatos,
    nota: document.getElementById("observaciones").value || "Sin observaciones",
    total: totalPedido
  });

  carrito = [];
  guardarDatosLocales(); // 🔥 Se guarda al enviar el formulario (vacía carrito y añade comanda)
  e.target.reset();
  actualizarCarritoDOM();
  renderizarCocinaYCaja();
});

function renderizarCocinaYCaja() {
  const divCocina = document.getElementById("lista-cocina");
  divCocina.innerHTML = "";
  let totalCaja = 0;

  comandasCocina.forEach(c => {
    totalCaja += c.total;
    divCocina.innerHTML += `
      <div class="comanda animacion-aparicion">
        <strong>${c.mesa} - Cliente: ${c.cliente}</strong>
        <p>🍽️ ${c.detalle}</p>
        <small>📝 ${c.nota} | <strong>Pagado: Bs ${c.total}</strong></small>
      </div>`;
  });

  document.getElementById("cant-pedidos").textContent = comandasCocina.length;
  document.getElementById("total-caja").textContent = totalCaja;
}
