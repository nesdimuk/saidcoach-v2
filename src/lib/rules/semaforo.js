export function evaluarDolor(dolor = 0) {
  const valor = Number(dolor);

  if (valor >= 6) {
    return {
      nivel: "rojo",
      recomendacion: "Dolor alto: detener ejercicio y cambiar variante.",
      accion: "detener",
    };
  }

  if (valor >= 4) {
    return {
      nivel: "amarillo",
      recomendacion: "Dolor moderado: reduce peso 20-30% o limita rango de movimiento.",
      accion: "modificar",
    };
  }

  return {
    nivel: "verde",
    recomendacion: "Dolor bajo o ausente: continua con técnica controlada.",
    accion: "continuar",
  };
}
