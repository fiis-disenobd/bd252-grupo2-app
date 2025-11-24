package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleOfertaDto {
    private Integer cod_producto;
    private String nombre_producto;
    private Integer cantidad_solicitada; 
    private String unidad_medida;
    private BigDecimal costo_total;
    private String modalidad_pago;
}
