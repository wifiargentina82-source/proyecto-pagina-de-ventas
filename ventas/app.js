/* =========================================
   Skynet@rg - Carga dinámica de productos
   ========================================= */

let productosGlobal = [];   // guardamos todos los productos
let carrito = [];           // contador de carrito

// --- 1. Cargar productos desde el JSON ---
async function cargarProductos() {
    try {
        const respuesta = await fetch('productos.json');

        if (!respuesta.ok) throw new Error('Error al cargar productos.json');

        const datos = await respuesta.json();
        productosGlobal = datos.productos;

        renderizarProductos(productosGlobal);

    } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('grid-productos').innerHTML =
            '<p class="error">No se pudieron cargar los productos. Verificá que estés usando un servidor local.</p>';
    }
}

// --- 2. Renderizar productos en el HTML ---
function renderizarProductos(lista) {
    const contenedor = document.getElementById('grid-productos');
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = '<p class="vacio">No hay productos en esta categoría.</p>';
        return;
    }

    lista.forEach(prod => {
        // Convertimos el precio a formato moneda
        const precioFormateado = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(prod.precio);

        // Etiqueta según el booleano stock
        const estadoStock = prod.stock
            ? `<span class="badge en-stock">✔ En Stock</span>`
            : `<span class="badge sin-stock">✖ Agotado</span>`;

        // Botón deshabilitado si no hay stock
        const boton = prod.stock
            ? `<button class="btn-comprar" onclick="agregarAlCarrito(${prod.id})">Comprar</button>`
            : `<button class="btn-comprar deshabilitado" disabled>Sin Stock</button>`;

        // Clase extra en la card si está agotado
        const claseCard = prod.stock ? 'card' : 'card agotado';

        const card = `
            <article class="${claseCard}">
                <div class="card-imagen">
                    <img src="${prod.imagen}" alt="${prod.nombre}">
                    ${estadoStock}
                </div>
                <div class="card-info">
                    <h3>${prod.nombre}</h3>
                    <p>${prod.descripcion}</p>
                    <span class="precio">${precioFormateado}</span>
                    ${boton}
                </div>
            </article>
        `;

        contenedor.innerHTML += card;
    });
}

// --- 3. Filtros por stock ---
document.querySelectorAll('.filtro').forEach(boton => {
    boton.addEventListener('click', () => {
        // Cambiar botón activo
        document.querySelectorAll('.filtro').forEach(b => b.classList.remove('activo'));
        boton.classList.add('activo');

        const filtro = boton.dataset.filtro;
        let listaFiltrada = productosGlobal;

        if (filtro === 'disponibles') {
            listaFiltrada = productosGlobal.filter(p => p.stock === true);
        } else if (filtro === 'agotados') {
            listaFiltrada = productosGlobal.filter(p => p.stock === false);
        }

        renderizarProductos(listaFiltrada);
    });
});

// --- 4. Agregar al carrito (solo si hay stock) ---
function agregarAlCarrito(id) {
    const producto = productosGlobal.find(p => p.id === id);

    if (!producto) return;
    if (!producto.stock) {
        alert('❌ Este producto está agotado.');
        return;
    }

    carrito.push(producto);
    document.getElementById('contador-carrito').textContent = carrito.length;
    alert(`✅ "${producto.nombre}" agregado al carrito.`);
}

// --- 5. Iniciar todo ---
document.addEventListener('DOMContentLoaded', cargarProductos);