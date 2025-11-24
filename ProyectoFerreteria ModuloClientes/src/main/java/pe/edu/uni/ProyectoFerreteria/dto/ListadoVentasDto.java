package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class ListadoVentasDto {
	private String venta;
    private String vendedor;
    private String fecha;
    private String hora;
    private String monto;
    private String estado;
}
