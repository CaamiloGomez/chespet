let productos = [
  {
    id: 1,
    nombre: "Alimento Nutrecan Cachorro Raza Mediana Y Grande X 800gr",
    descripcion: "– Fácil digestión – Marca: Nutrecan – Contenido: 800gr – Crecimiento saludable – Proteínas y grasas de alta calidad – Con vitaminas y minerales esenciales – Especial para cachorros de raza mediana y grande.",
    precio: 11050,
    stock: 6,
    descuento: 0,
    imagen: "https://dysnutricion.vtexassets.com/arquivos/ids/156591-800-auto?v=638340538852500000&width=800&height=auto&aspect=true",
    categoria: "Alimentos",
    marca: "Nutrecan",
    sku: "NUT800GR"
  }
];

let carrito = JSON.parse(localStorage.getItem("chespet_carrito") || "[]");
if (!Array.isArray(carrito)) carrito = [];

function guardarCarrito() {
  localStorage.setItem("chespet_carrito", JSON.stringify(carrito));
}
function calcDescuento(precio, desc) {
  return Math.floor(precio * (1 - (desc / 100 || 0)));
}

const cartBadge = document.getElementById("cartBadge");
const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const cartPanelOverlay = document.getElementById("cartPanelOverlay");

function updateCartBadge() {
  let total = carrito.reduce((a, c) => a + c.cantidad, 0);
  cartBadge.style.display = total > 0 ? "flex" : "none";
  cartBadge.textContent = total;
}

cartBtn.onclick = function () {
  cartPanel.classList.add("cart-panel-abierto");
  cartPanelOverlay.style.display = "block";
  renderCartPanel();
};
document.getElementById("cerrarCartPanel").onclick = function () {
  cartPanel.classList.remove("cart-panel-abierto");
  cartPanelOverlay.style.display = "none";
};
cartPanelOverlay.onclick = function () {
  cartPanel.classList.remove("cart-panel-abierto");
  cartPanelOverlay.style.display = "none";
};

function renderCartPanel() {
  const cont = document.getElementById("cartProducts");
  const subtotal = document.getElementById("cartSubTotal");
  cont.innerHTML = "";
  let total = 0;

  if (carrito.length === 0) {
    cont.innerHTML = '<div class="vacio">Tu carrito está vacío.</div>';
    subtotal.textContent = "$0";
    return;
  }
  carrito.forEach((item) => {
    const prod = productos.find((p) => p.id === item.productoId);
    if (!prod) return;
    let itemDiv = document.createElement("div");
    itemDiv.className = "cart-product-item";
    itemDiv.innerHTML = `
      <img src="${prod.imagen}" class="cart-thumb" />
      <div style="flex:1">
        <div class="cart-prodname">${prod.nombre}</div>
        <div class="cart-cant-controls">
          <button class="cart-cant-btn" data-id="${prod.id}" data-op="menos">–</button>
          <input class="cart-cant-input" type="number" min="0" max="${prod.stock}" value="${item.cantidad}" data-id="${prod.id}" />
          <button class="cart-cant-btn" data-id="${prod.id}" data-op="mas">+</button>
        </div>
        <div class="cart-price">$${(calcDescuento(prod.precio, prod.descuento) * item.cantidad).toLocaleString()}</div>
      </div>`;
    cont.appendChild(itemDiv);
    total += calcDescuento(prod.precio, prod.descuento) * item.cantidad;
  });
  subtotal.textContent = "$" + total.toLocaleString();

  document.querySelectorAll(".cart-cant-btn").forEach((btn) => {
    btn.onclick = function () {
      const id = Number(this.getAttribute("data-id"));
      const op = this.getAttribute("data-op");
      let prod = carrito.find((i) => i.productoId === id);
      if (!prod) return;
      const stock = productos.find((p) => p.id === id).stock;
      if (op === "mas" && prod.cantidad < stock) {
        prod.cantidad++;
      } else if (op === "menos" && prod.cantidad > 0) {
        prod.cantidad--;
        if (prod.cantidad === 0) carrito = carrito.filter((x) => x.productoId !== id);
      }
      guardarCarrito();
      updateCartBadge();
      renderCartPanel();
      mostrarProductos();
    };
  });
  document.querySelectorAll(".cart-cant-input").forEach((input) => {
    input.onchange = function () {
      const id = Number(this.getAttribute("data-id"));
      let prod = carrito.find((i) => i.productoId === id);
      if (!prod) return;
      let v = Math.max(0, Math.round(Number(this.value)));
      let stock = productos.find((x) => x.id === id).stock;
      if (v > stock) v = stock;
      if (v === 0) carrito = carrito.filter((x) => x.productoId !== id);
      else prod.cantidad = v;
      guardarCarrito();
      updateCartBadge();
      renderCartPanel();
      mostrarProductos();
    };
  });
}

document.getElementById("cartGoPay").onclick = function () {
  alert("Aquí iría el paso de compra :)");
};
document.getElementById("cartVolverComprar").onclick = function () {
  cartPanel.classList.remove("cart-panel-abierto");
  cartPanelOverlay.style.display = "none";
};

function mostrarProductos() {
  const lista = document.getElementById("productos-lista");
  lista.innerHTML = "";
  productos.forEach((p) => {
    const precioFinal = calcDescuento(p.precio, p.descuento).toLocaleString();
    let div = document.createElement("div");
    div.className = "producto";
    div.title = "Click para ver detalles ampliados";
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" />
      <h3>${p.nombre}</h3>
      <p><strong>Precio:</strong> $${precioFinal}</p>
      <p><strong>Stock:</strong> ${p.stock}</p>
      <div class="cantidad-area">
        <input type="number" min="1" max="${p.stock}" value="1" style="margin-right:6px;" />
        <button ${p.stock === 0 ? "disabled" : ""}>Agregar</button>
        <div class="descripcion-popover">${p.descripcion}</div>
      </div>
    `;
    let inputCantidad = div.querySelector('input[type="number"]');
    let btnAgregar = div.querySelector("button");
    btnAgregar.onclick = (e) => {
      e.stopPropagation();
      let cantidad = Math.min(Math.max(1, Number(inputCantidad.value)), p.stock);
      agregarAlCarrito(p.id, cantidad);
    };
    div.onclick = (e) => {
      if (e.target === btnAgregar || e.target === inputCantidad) return;
      mostrarDetalle(p.id);
    };
    lista.appendChild(div);
  });
}

function agregarAlCarrito(id, cantidad = 1) {
  const producto = productos.find((p) => p.id === id);
  if (!producto || producto.stock === 0) return;
  let item = carrito.find((i) => i.productoId === id);
  let totalDeseado = cantidad + (item?.cantidad || 0);
  if (totalDeseado > producto.stock) cantidad = producto.stock - (item?.cantidad || 0);
  if (cantidad <= 0) return alert("No hay más stock disponible.");
  if (item) item.cantidad += cantidad;
  else carrito.push({ productoId: id, cantidad });
  guardarCarrito();
  updateCartBadge();
  renderCartPanel();
  mostrarProductos();
}

let modalProductoActual = null;
function mostrarDetalle(id) {
  const p = productos.find((p) => p.id === id);
  if (!p) return;
  modalProductoActual = p;
  document.getElementById("modalNombre").textContent = p.nombre;
  document.getElementById("modalDescripcionTexto").textContent = p.descripcion;
  document.getElementById("modalPrecio").textContent = calcDescuento(p.precio, p.descuento).toLocaleString();
  document.getElementById("modalStock").textContent = p.stock;
  document.getElementById("modalImagen").src = p.imagen;
  document.getElementById("modalImagen").className = "modal-big-img";
  document.getElementById("modalCantidad").max = p.stock;
  document.getElementById("modalCantidad").value = 1;
  document.getElementById("modalAgregarArea").style.display = p.stock > 0 ? "block" : "none";
  abrirModal();
}
function abrirModal() {
  document.getElementById("modalDescripcion").style.display = "block";
}
function cerrarModal() {
  document.getElementById("modalDescripcion").style.display = "none";
}
document.querySelector(".cerrar").onclick = cerrarModal;
window.onclick = (e) => {
  if (e.target === document.getElementById("modalDescripcion")) cerrarModal();
};
document.getElementById("modalAgregarBtn").onclick = function () {
  let val = Math.min(
    Math.max(1, Number(document.getElementById("modalCantidad").value)),
    modalProductoActual ? modalProductoActual.stock : 1
  );
  agregarAlCarrito(modalProductoActual.id, val);
  cerrarModal();
};

document.getElementById("btnAdminLogin").onclick = () => {
  document.getElementById("loginModal").classList.add("open");
};
document.querySelector(".cerrar-login").onclick = () => {
  document.getElementById("loginModal").classList.remove("open");
  document.getElementById("errorLogin").style.display = "none";
};
document.getElementById("formLogin").onsubmit = function (e) {
  e.preventDefault();
  const u = document.getElementById("usuario").value.trim();
  const c = document.getElementById("clave").value.trim();
  if (u === "chespet" && c === "1234") {
    document.getElementById("panel-cliente").style.display = "none";
    document.getElementById("panel-admin").style.display = "block";
    document.getElementById("loginModal").classList.remove("open");
    document.getElementById("errorLogin").style.display = "none";
    mostrarAdmin();
  } else {
    document.getElementById("errorLogin").style.display = "block";
  }
};
document.getElementById("btnLogoutAdmin").onclick = function () {
  document.getElementById("panel-admin").style.display = "none";
  document.getElementById("panel-cliente").style.display = "block";
  mostrarProductos();
  updateCartBadge();
  renderCartPanel();
};
document.getElementById("menu-cliente").onclick = () => {
  document.getElementById("panel-cliente").style.display = "block";
  document.getElementById("panel-admin").style.display = "none";
  mostrarProductos();
  updateCartBadge();
  renderCartPanel();
};

let idEdicion = null;
document.getElementById("excelInput").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;
  let ext = file.name.split(".").pop().toLowerCase();
  let msg = document.getElementById("importMessage");
  msg.textContent = "Importando...";
  const reader = new FileReader();
  reader.onload = function (e) {
    let data = e.target.result;
    let rows;
    try {
      let sep = /;/.test(data) ? ";" : ",";
      let lines = data.split("\n");
      let headers = lines[0].replace(/\r/g, "").split(sep);
      rows = lines
        .slice(1)
        .filter((x) => x.trim())
        .map((l) => {
          const vals = l.replace(/\r/g, "").split(sep);
          let obj = {};
          headers.forEach((h, i) => (obj[h.trim()] = vals[i]));
          return obj;
        });
    } catch (error) {
      msg.textContent = "Error leyendo archivo: " + error.message;
      console.error("Error leyendo Excel/CSV", error);
      document.getElementById("excelInput").value = "";
      return;
    }
    if (!rows.length || !rows[0].nombre) {
      msg.textContent = "Archivo vacío o formato incorrecto";
      document.getElementById("excelInput").value = "";
      return;
    }
    let nuevos = rows.map((obj) => ({
      id: Math.max(0, ...productos.map((p) => p.id)) + 1 + Math.floor(Math.random() * 1e6),
      nombre: obj.nombre || "",
      descripcion: obj.descripcion || "",
      precio: Number(obj.precio) || 0,
      stock: Number(obj.stock) || 0,
      descuento: Number(obj.descuento) || 0,
      imagen: obj.imagen || "",
      categoria: obj.categoria || "",
      marca: obj.marca || "",
      sku: obj.sku || ""
    }));
    productos.push(...nuevos);
    msg.textContent = "Importados: " + nuevos.length;
    mostrarAdmin();
    mostrarProductos();
    document.getElementById("excelInput").value = "";
  };
  reader.readAsText(file);
});

function mostrarAdmin() {
  const tbody = document.getElementById("admin-tbody");
  tbody.innerHTML = productos
    .map((p) => {
      return `
    <tr>
      <td><img src="${p.imagen}" alt="img" /></td>
      <td>${p.nombre}</td>
      <td style="max-width:160px; white-space: pre-wrap;">${p.descripcion}</td>
      <td>${p.stock}</td>
      <td>${p.precio}</td>
      <td>${p.descuento || 0}</td>
      <td>${p.categoria || ""}</td>
      <td>${p.marca || ""}</td>
      <td>${p.sku || ""}</td>
      <td>$${calcDescuento(p.precio, p.descuento).toLocaleString()}</td>
      <td>
        <button class="icon-btn" onclick="editarProducto(${p.id})">&#9998;</button>
        <button class="icon-btn" onclick="eliminarProducto(${p.id})">&#128465;</button>
      </td>
    </tr>
  `;
    })
    .join("");
}

window.editarProducto = function (id) {
  idEdicion = id;
  const p = productos.find((x) => x.id === id);
  document.getElementById("modalEditar").style.display = "block";
  document.getElementById("editImagen").value = p.imagen || "";
  document.getElementById("editPreviewImg").src = p.imagen || "";
  document.getElementById("editNombre").value = p.nombre || "";
  document.getElementById("editDescripcion").value = p.descripcion || "";
  document.getElementById("editStock").value = p.stock || 0;
  document.getElementById("editPrecio").value = p.precio || 0;
  document.getElementById("editDescuento").value = p.descuento || 0;
  document.getElementById("editCategoria").value = p.categoria || "";
  document.getElementById("editMarca").value = p.marca || "";
  document.getElementById("editSKU").value = p.sku || "";
  document.getElementById("editValorDescuento").value = "$" + calcDescuento(p.precio, p.descuento).toLocaleString();
};

document.querySelector(".cerrar-editar").onclick = function () {
  document.getElementById("modalEditar").style.display = "none";
};

document.getElementById("editImagen").oninput = function () {
  document.getElementById("editPreviewImg").src = document.getElementById("editImagen").value;
};

document.getElementById("editDescuento").oninput = document.getElementById("editPrecio").oninput = function () {
  let precio = Number(document.getElementById("editPrecio").value);
  let desc = Number(document.getElementById("editDescuento").value);
  document.getElementById("editValorDescuento").value = "$" + calcDescuento(precio, desc).toLocaleString();
};

document.getElementById("formEditarProducto").onsubmit = function (e) {
  e.preventDefault();
  const obj = {
    imagen: document.getElementById("editImagen").value,
    nombre: document.getElementById("editNombre").value,
    descripcion: document.getElementById("editDescripcion").value,
    stock: Number(document.getElementById("editStock").value),
    precio: Number(document.getElementById("editPrecio").value),
    descuento: Number(document.getElementById("editDescuento").value),
    categoria: document.getElementById("editCategoria").value,
    marca: document.getElementById("editMarca").value,
    sku: document.getElementById("editSKU").value,
  };
  if (idEdicion) {
    const p = productos.find((x) => x.id === idEdicion);
    Object.assign(p, obj);
  } else {
    obj.id = productos.length > 0 ? Math.max(...productos.map((x) => x.id)) + 1 : 1;
    productos.push(obj);
  }
  idEdicion = null;
  document.getElementById("modalEditar").style.display = "none";
  mostrarAdmin();
  mostrarProductos();
  updateCartBadge();
  renderCartPanel();
};

window.eliminarProducto = function (id) {
  if (confirm("¿Eliminar producto?")) {
    carrito = carrito.filter((i) => i.productoId !== id);
    let idx = productos.findIndex((p) => p.id === id);
    if (idx > -1) productos.splice(idx, 1);
    mostrarAdmin();
    mostrarProductos();
    updateCartBadge();
    renderCartPanel();
  }
};

document.getElementById("btnAgregar").onclick = function () {
  idEdicion = null;
  document.getElementById("modalEditar").style.display = "block";
  document.getElementById("editImagen").value = "";
  document.getElementById("editPreviewImg").src = "";
  document.getElementById("editNombre").value = "";
  document.getElementById("editDescripcion").value = "";
  document.getElementById("editStock").value = 0;
  document.getElementById("editPrecio").value = 0;
  document.getElementById("editDescuento").value = 0;
  document.getElementById("editCategoria").value = "";
  document.getElementById("editMarca").value = "";
  document.getElementById("editSKU").value = "";
  document.getElementById("editValorDescuento").value = "$0";
};

mostrarProductos();
updateCartBadge();
renderCartPanel();
