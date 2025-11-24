package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // Provides getters, setters, equals, hashCode, and toString
@NoArgsConstructor // Provides the necessary default constructor for JdbcTemplate
@AllArgsConstructor
public class GraficoCanjeDto {
    private String mes;
    private Integer cantidad;
}