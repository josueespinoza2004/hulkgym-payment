// CRUD usando Supabase para la tabla "pagos"
// Asegúrate de tener una tabla "pagos" en Supabase con las columnas:
// id (int, PK, autoincrement), nombre (text), sexo (text), tipo_pago (text),
// fecha_pago (date), fecha_siguiente_pago (date), dias_disponibles (int),
// vencido (bool), dias_vencidos (int)

async function obtenerPagos() {
  try {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .order('fecha_pago', { ascending: false });
    if (error) {
      mostrarToast('Error al obtener pagos', 'error');
      console.error(error);
      mostrarPagos([]);
      return;
    }
    mostrarPagos(data || []);
  } catch (err) {
    mostrarToast('Error de conexión al obtener pagos', 'error');
    console.error(err);
    mostrarPagos([]);
  }
}

async function guardarPago(pago) {
  try {
    if (pago.id) {
      // Editar
      const { error } = await supabase
        .from('pagos')
        .update({
          nombre: pago.nombre,
          sexo: pago.sexo,
          tipo_pago: pago.tipo_pago,
          fecha_pago: pago.fecha_pago,
          fecha_siguiente_pago: pago.fecha_siguiente_pago,
          dias_disponibles: pago.dias_disponibles,
          vencido: pago.vencido,
          dias_vencidos: pago.dias_vencidos
        })
        .eq('id', pago.id);
      if (error) {
        mostrarToast('Error al editar: ' + error.message, 'error');
        return;
      }
      mostrarToast('Pago editado correctamente', 'success');
    } else {
      // Nuevo
      const { error } = await supabase
        .from('pagos')
        .insert([{
          nombre: pago.nombre,
          sexo: pago.sexo,
          tipo_pago: pago.tipo_pago,
          fecha_pago: pago.fecha_pago,
          fecha_siguiente_pago: pago.fecha_siguiente_pago,
          dias_disponibles: pago.dias_disponibles,
          vencido: pago.vencido,
          dias_vencidos: pago.dias_vencidos
        }]);
      if (error) {
        mostrarToast('Error al guardar: ' + error.message, 'error');
        return;
      }
      mostrarToast('Pago guardado correctamente', 'success');
    }
    await obtenerPagos();
  } catch (err) {
    mostrarToast('Error de conexión al guardar pago', 'error');
    console.error(err);
  }
}

let idAEliminar = null;

window.eliminarPago = function(id) {
  idAEliminar = id;
  const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminar'));
  modal.show();
};

async function confirmarEliminacion() {
  if (!idAEliminar) return;
  try {
    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id', idAEliminar);
    if (error) {
      mostrarToast('Error al eliminar: ' + error.message, 'error');
      return;
    }
    mostrarToast('Pago eliminado correctamente', 'success');
    await obtenerPagos();
  } catch (err) {
    mostrarToast('Error de conexión al eliminar pago', 'error');
    console.error(err);
  }
  idAEliminar = null;
}