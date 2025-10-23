const productos = [
  { id: 1, nombre: "Collar para perro", precio: 25000, imagen: "https://via.placeholder.com/200" },
  { id: 2, nombre: "Juguete de goma", precio: 15000, imagen: "https://via.placeholder.com/200" },
  { id: 3, nombre: "Comida para gato", precio: 30000, imagen: "https://via.placeholder.com/200" },
  { id: 4, nombre: "Cama para mascota", precio: 55000, imagen: "https://via.placeholder.com/200" }
];

const listaProductos = document.getElementById("lista-productos");
const itemsCarrito = document.getElementById("items-carrito");
const total = document.getElementById("total");

let carrito = [];

function mostrarProductos() {
  productos.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("producto");
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <h3>${prod.nombre}</h3>
      <p>$${prod.precio.toLocaleString()}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    listaProductos.appendChild(div);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const item = carrito.find(p => p.id === id);
  if (item) {
    item.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarrito();
}

function actualizarCarrito() {
  itemsCarrito.innerHTML = "";
  let totalCompra = 0;

  carrito.forEach(item => {
    totalCompra += item.precio * item.cantidad;
    const div = document.createElement("div");
    div.innerHTML = `
      <p>${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString()}</p>
    `;
    itemsCarrito.appendChild(div);
  });

  total.textContent = `Total: $${totalCompra.toLocaleString()}`;
}

document.getElementById("finalizar").addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío 😅");
  } else {
    alert("Gracias por tu compra 🐾");
    carrito = [];
    actualizarCarrito();
  }
});

mostrarProductos();