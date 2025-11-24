package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class DetalleVentaCabeceraDto {
	private String cliente;
    private String fecha_hora;
    private String vendedor;
    private String condicion_pago;
}
