package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductoCatalogoDto {
    private Integer cod_producto;
    private String nombre_producto;
    private String rubro;
    private String familia;
    private String clase;
    private String marca;
    private String unidad_medida;
    private BigDecimal precio_base;
}
