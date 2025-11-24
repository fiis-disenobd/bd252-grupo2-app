package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistorialCanjeDto {
    private String fecha;
    private String premio;
    private Integer cantidad;
    private Double puntosGastados;
    private String estado;
}