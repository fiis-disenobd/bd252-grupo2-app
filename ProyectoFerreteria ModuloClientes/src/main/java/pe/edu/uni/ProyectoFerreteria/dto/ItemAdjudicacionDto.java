package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ItemAdjudicacionDto {
    private Integer cod_proveedor;
    private Integer cod_producto;
    private Integer cantidad_comprada;
    private BigDecimal costo_total;
    private String modalidad_pago;
}
