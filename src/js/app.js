// --- FUNCIÓN GLOBAL PARA TOAST ---
function mostrarToast(mensaje, tipo = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  const id = 'toast' + Date.now();
  // Cambia el color de success a azul
  const color = tipo === 'success' ? 'bg-primary' : tipo === 'error' ? 'bg-danger' : 'bg-info';
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white ${color} border-0 show mb-2`;
  toast.id = id;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 500);
  }, 3000);

  toast.querySelector('.btn-close').onclick = () => toast.remove();
}

// --- FORMATEAR FECHAS ---
function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// --- VARIABLES GLOBALES ---
let pagosGlobal = [];
let editandoId = null;
let busquedaActual = '';

// --- FUNCIONES AUXILIARES Y DE UI ---
function actualizarNotificaciones() {
  const badge = document.getElementById('badgeNotificaciones');
  const btn = document.getElementById('btnNotificaciones');
  const lista = document.getElementById('listaNotificaciones');
  if (!badge || !btn || !lista) return;

  const vencidos = pagosGlobal.filter(p => p.vencido);

  if (vencidos.length > 0) {
    badge.textContent = vencidos.length;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }

  if (vencidos.length === 0) {
    lista.innerHTML = '<div class="text-center text-muted">No hay pagos vencidos</div>';
    return;
  }

  lista.innerHTML = vencidos.map(pago => `
    <div class="d-flex align-items-center justify-content-between border-bottom py-2" style="gap:8px;">
      <div style="flex:1;">
        <strong>${pago.nombre}</strong><br>
        <small>Vencido hace ${pago.dias_vencidos} día(s)</small>
      </div>
      <button class="btn btn-sm btn-warning" onclick="editarPago(${pago.id}); cerrarNotificaciones();">Editar</button>
      <button class="btn btn-sm btn-danger" onclick="eliminarPago(${pago.id}); cerrarNotificaciones();">Eliminar</button>
    </div>
  `).join('');
}

function toggleNotificaciones() {
  const lista = document.getElementById('listaNotificaciones');
  if (!lista) return;
  lista.classList.toggle('show');
  if (lista.classList.contains('show')) {
    document.addEventListener('mousedown', cerrarNotificacionesFuera, { once: true });
  }
}
function cerrarNotificaciones() {
  const lista = document.getElementById('listaNotificaciones');
  if (lista) lista.classList.remove('show');
}
function cerrarNotificacionesFuera(e) {
  const lista = document.getElementById('listaNotificaciones');
  const btn = document.getElementById('btnNotificaciones');
  if (!lista || !btn) return;
  if (!lista.contains(e.target) && !btn.contains(e.target)) {
    lista.classList.remove('show');
  }
}

function mostrarVista(vista) {
  document.getElementById('vistaRegistrar').style.display = 'none';
  document.getElementById('vistaPagos').style.display = 'none';
  document.getElementById('vistaEditar').style.display = 'none';
  document.getElementById('navRegistrar').classList.remove('active');
  document.getElementById('navPagos').classList.remove('active');
  if (vista === 'registrar') {
    document.getElementById('vistaRegistrar').style.display = '';
    document.getElementById('navRegistrar').classList.add('active');
  } else if (vista === 'pagos') {
    document.getElementById('vistaPagos').style.display = '';
    document.getElementById('navPagos').classList.add('active');
    obtenerPagos();
  } else if (vista === 'editar') {
    document.getElementById('vistaEditar').style.display = '';
  }
}

function mostrarSugerencias(texto) {
  const sugerencias = document.getElementById('sugerenciasBusqueda');
  if (!sugerencias) return;
  if (!texto) {
    sugerencias.style.display = 'none';
    sugerencias.innerHTML = '';
    return;
  }
  const nombres = pagosGlobal
    .map(p => p.nombre)
    .filter((nombre, idx, arr) => arr.findIndex(n => n.trim().toLowerCase() === nombre.trim().toLowerCase()) === idx)
    .filter(nombre => nombre.toLowerCase().includes(texto.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
    .slice(0, 5);

  if (nombres.length === 0) {
    sugerencias.style.display = 'none';
    sugerencias.innerHTML = '';
    return;
  }
  sugerencias.innerHTML = nombres.map(nombre =>
    `<div class="sugerencia-item" style="padding:6px 12px;cursor:pointer;">${nombre}</div>`
  ).join('');
  sugerencias.style.display = 'block';

  Array.from(sugerencias.children).forEach(item => {
    item.onclick = () => {
      const cliente = pagosGlobal.find(
        p => p.nombre.trim().toLowerCase() === item.textContent.trim().toLowerCase()
      );
      if (!cliente) return;
      if (document.getElementById('filtroTipo')) document.getElementById('filtroTipo').value = cliente.tipo_pago;
      if (document.getElementById('filtroGenero')) document.getElementById('filtroGenero').value = cliente.sexo;
      if (document.getElementById('barraBusqueda')) document.getElementById('barraBusqueda').value = cliente.nombre;
      busquedaActual = cliente.nombre;
      sugerencias.style.display = 'none';
      aplicarFiltros(() => {
        setTimeout(() => {
          resaltarYDesplazarAFila(cliente.nombre);
        }, 100);
      });
    };
  });
}

function resaltarYDesplazarAFila(nombre) {
  const pagos = pagosGlobal.filter(p => p.nombre === nombre);
  if (!pagos.length) return;
  const fila = document.getElementById(`fila-${pagos[0].id}`);
  if (fila) {
    fila.classList.add('table-primary');
    fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => fila.classList.remove('table-primary'), 2000);
  }
}

function mostrarPagos(pagos) {
  pagosGlobal = (pagos || []).map(pago => {
    const hoy = new Date();
    const fechaFin = new Date(pago.fecha_siguiente_pago);
    let vencido = false;
    let dias_vencidos = 0;
    let dias_disponibles = pago.dias_disponibles;

    if (hoy > fechaFin) {
      vencido = true;
      const diffTime = Math.abs(hoy - fechaFin);
      dias_vencidos = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      dias_disponibles = -dias_vencidos; // <-- Aquí el cambio
    } else {
      // Si no está vencido, calcula días disponibles normalmente
      const diffTime = fechaFin - hoy;
      dias_disponibles = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      ...pago,
      vencido,
      dias_vencidos,
      dias_disponibles
    };
  });
  if (document.getElementById('vistaPagos').style.display !== 'none') {
    aplicarFiltros();
  }
  actualizarNotificaciones();
}
function aplicarFiltros(callback) {
  const tipoSel = document.getElementById('filtroTipo');
  const generoSel = document.getElementById('filtroGenero');
  const barraBusqueda = document.getElementById('barraBusqueda');
  if (!tipoSel || !generoSel) return;

  const tipo = tipoSel.value;
  const genero = generoSel.value;
  const textoBusqueda = barraBusqueda ? barraBusqueda.value.trim().toLowerCase() : '';

  let filtrados = pagosGlobal;

  if (tipo) {
    filtrados = filtrados.filter(p => p.tipo_pago === tipo);
  }
  if (genero) {
    filtrados = filtrados.filter(p => p.sexo === genero);
  }
  if (textoBusqueda) {
    filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(textoBusqueda));
  }

  filtrados = filtrados.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  const pagosList = document.getElementById('pagosList');
  if (!filtrados || filtrados.length === 0) {
    pagosList.innerHTML = '<p>No hay pagos registrados.</p>';
    return;
  }
  let html = `<div class="table-responsive">
  <table class="table table-bordered table-striped table-hover">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Sexo</th>
        <th>Tipo de Pago</th>
        <th>Fecha de Pago</th>
        <th>Siguiente Pago</th>
        <th>Días Disponibles</th>
        <th>Estado</th>
        <th>Días Vencidos</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>`;
  filtrados.forEach(pago => {
    html += `<tr id="fila-${pago.id}">
      <td${pago.vencido ? ' class="table-danger"' : ''}>${pago.nombre}</td>
<td${pago.vencido ? ' class="table-danger capitalize-first"' : ' class="capitalize-first"'}>${pago.sexo}</td>
<td${pago.vencido ? ' class="table-danger capitalize-first"' : ' class="capitalize-first"'}>${pago.tipo_pago}</td>
      <td${pago.vencido ? ' class="table-danger"' : ''}>${formatearFecha(pago.fecha_pago)}</td>
      <td${pago.vencido ? ' class="table-danger"' : ''}>${formatearFecha(pago.fecha_siguiente_pago)}</td>
      <td${pago.vencido ? ' class="table-danger"' : ''}>${pago.dias_disponibles}</td>
      <td${pago.vencido ? ' class="table-danger"' : ''}>${pago.vencido ? 'Vencido' : 'Activo'}</td>
      <td${pago.vencido ? ' class="table-danger"' : ''}>${pago.dias_vencidos}</td>
      
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="editarPago(${pago.id})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarPago(${pago.id})">Eliminar</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  pagosList.innerHTML = html;

  if (typeof callback === 'function') callback();
}

window.editarPago = function(id) {
  const pago = pagosGlobal.find(p => p.id === id);
  if (!pago) return;
  document.getElementById('edit_id').value = pago.id;
  document.getElementById('edit_nombre').value = pago.nombre;
  document.getElementById('edit_sexo').value = pago.sexo;
  document.getElementById('edit_tipo_pago').value = pago.tipo_pago;
  document.getElementById('edit_fecha_pago').value = pago.fecha_pago;
  mostrarVista('editar');
};

// --- INICIALIZACIÓN DE LA APP ---
function inicializarApp() {
  mostrarVista('registrar');

  document.getElementById('navRegistrar').onclick = () => mostrarVista('registrar');
  document.getElementById('navPagos').onclick = () => mostrarVista('pagos');

  // Registrar Pago
  const pagoForm = document.getElementById('pagoForm');
  pagoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const sexo = document.getElementById('sexo').value;
    const tipo_pago = document.getElementById('tipo_pago').value;
    const fecha_pago = document.getElementById('fecha_pago').value;

    let dias_disponibles = 0;
    if (tipo_pago === 'semana') dias_disponibles = 7;
    if (tipo_pago === 'quincena') dias_disponibles = 15;
    if (tipo_pago === 'mensualidad') dias_disponibles = 30;

    const fecha_siguiente_pago = new Date(fecha_pago);
    fecha_siguiente_pago.setDate(fecha_siguiente_pago.getDate() + dias_disponibles);

    const hoy = new Date();
    const fechaFin = new Date(fecha_siguiente_pago);
    let vencido = false;
    let dias_vencidos = 0;

    if (hoy > fechaFin) {
      vencido = true;
      const diffTime = Math.abs(hoy - fechaFin);
      dias_vencidos = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const pago = {
      nombre,
      sexo,
      tipo_pago,
      fecha_pago,
      fecha_siguiente_pago: fecha_siguiente_pago.toISOString().split('T')[0],
      dias_disponibles,
      vencido,
      dias_vencidos
    };

    await guardarPago(pago);
    pagoForm.reset();
    mostrarToast('Cliente registrado correctamente', 'success');
    actualizarNotificaciones();
  });

  // Editar Pago
  const editarForm = document.getElementById('editarForm');
  editarForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit_id').value;
    const nombre = document.getElementById('edit_nombre').value;
    const sexo = document.getElementById('edit_sexo').value;
    const tipo_pago = document.getElementById('edit_tipo_pago').value;
    const fecha_pago = document.getElementById('edit_fecha_pago').value;

    let dias_disponibles = 0;
    if (tipo_pago === 'semana') dias_disponibles = 7;
    if (tipo_pago === 'quincena') dias_disponibles = 15;
    if (tipo_pago === 'mensualidad') dias_disponibles = 30;

    const fecha_siguiente_pago = new Date(fecha_pago);
    fecha_siguiente_pago.setDate(fecha_siguiente_pago.getDate() + dias_disponibles);

    const hoy = new Date();
    const fechaFin = new Date(fecha_siguiente_pago);
    let vencido = false;
    let dias_vencidos = 0;

    if (hoy > fechaFin) {
      vencido = true;
      const diffTime = Math.abs(hoy - fechaFin);
      dias_vencidos = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const pago = {
      id: parseInt(id),
      nombre,
      sexo,
      tipo_pago,
      fecha_pago,
      fecha_siguiente_pago: fecha_siguiente_pago.toISOString().split('T')[0],
      dias_disponibles,
      vencido,
      dias_vencidos
    };

    await guardarPago(pago);
    editarForm.reset();
    mostrarVista('pagos');
    actualizarNotificaciones();
  });

  document.getElementById('btnCancelarEdicion').onclick = () => {
    document.getElementById('editarForm').reset();
    mostrarVista('pagos');
  };

  if (document.getElementById('filtroTipo')) {
    document.getElementById('filtroTipo').addEventListener('change', aplicarFiltros);
  }
  if (document.getElementById('filtroGenero')) {
    document.getElementById('filtroGenero').addEventListener('change', aplicarFiltros);
  }

  const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
  if (btnConfirmarEliminar) {
    btnConfirmarEliminar.onclick = async () => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminar'));
      modal.hide();
      await confirmarEliminacion();
      actualizarNotificaciones();
    };
  }

  const barraBusqueda = document.getElementById('barraBusqueda');
  const sugerencias = document.getElementById('sugerenciasBusqueda');
  if (barraBusqueda) {
    barraBusqueda.addEventListener('input', function () {
      busquedaActual = barraBusqueda.value.trim();
      mostrarSugerencias(busquedaActual);
      aplicarFiltros();
    });

    barraBusqueda.addEventListener('focus', function () {
      mostrarSugerencias(barraBusqueda.value.trim());
    });

    barraBusqueda.addEventListener('blur', function () {
      setTimeout(() => sugerencias.style.display = 'none', 150);
    });
  }

  const btnNotificaciones = document.getElementById('btnNotificaciones');
  if (btnNotificaciones) {
    btnNotificaciones.onclick = toggleNotificaciones;
  }
  actualizarNotificaciones();
}

// --- INICIO DE SESIÓN Y RECUPERACIÓN CON SUPABASE ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('loginContainer').style.display = 'flex';

  document.getElementById('loginForm').onsubmit = async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass
      });

      if (error) {
        mostrarToast('Credenciales incorrectas', 'error');
        console.error('Supabase login error:', error);
        return;
      }

      document.getElementById('loginContainer').style.display = 'none';
      document.getElementById('mainApp').style.display = 'block';
      mostrarToast('¡Bienvenido!', 'success');
      inicializarApp();
    } catch (err) {
      mostrarToast('Error de conexión', 'error');
      console.error('Login JS error:', err);
    }
  };

  const togglePassword = document.getElementById('togglePassword');
  const loginPassword = document.getElementById('loginPassword');
  const iconPassword = document.getElementById('iconPassword');
  if (togglePassword && loginPassword && iconPassword) {
    togglePassword.addEventListener('click', function () {
      const isPassword = loginPassword.type === 'password';
      loginPassword.type = isPassword ? 'text' : 'password';
      iconPassword.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
    });
  }

 const forgotPasswordLink = document.getElementById('forgotPasswordLink');
if (forgotPasswordLink) {
  forgotPasswordLink.onclick = function(e) {
    // e.preventDefault();
    // document.getElementById('recuperarForm').reset();
    // document.getElementById('recuperarMsg').style.display = 'none';
    // const modal = new bootstrap.Modal(document.getElementById('modalRecuperar'));
    // modal.show();
  };
}

  document.getElementById('recuperarForm').onsubmit = async function(e) {
    e.preventDefault();
    const email = document.getElementById('recuperarEmail').value.trim();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      document.getElementById('recuperarMsg').textContent = 'Error al enviar el correo. Intenta de nuevo.';
      document.getElementById('recuperarMsg').classList.remove('text-success');
      document.getElementById('recuperarMsg').classList.add('text-danger');
      document.getElementById('recuperarMsg').style.display = 'block';
    } else {
      document.getElementById('recuperarMsg').textContent = 'Si el correo está registrado, se ha enviado un enlace de recuperación.';
      document.getElementById('recuperarMsg').classList.remove('text-danger');
      document.getElementById('recuperarMsg').classList.add('text-success');
      document.getElementById('recuperarMsg').style.display = 'block';
    }
  };

// Botón de cerrar sesión
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
  btnLogout.addEventListener('click', async function() {
    if (window.supabase) {
      await supabase.auth.signOut();
    }
    // Limpiar campos del login
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
  });
}
});