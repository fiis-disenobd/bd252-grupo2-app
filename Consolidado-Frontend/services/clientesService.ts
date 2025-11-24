import { 
    MaestroResumen, 
    PerfilMaestro, 
    InfoPantallaCanje, 
    PremioCatalogo, 
    NuevoCanjeRequest 
} from "../interfaces/clientesTypes"; // Importamos desde la carpeta interfaces

// Asegúrate de que este puerto sea el correcto ( o 8080 según tu configuración final)
const API_URL = "http://localhost:8080/api"; 

export const clientesService = {

    // --- MAESTROS ---

    // Obtener lista de maestros
    getMaestrosResumen: async (): Promise<MaestroResumen[]> => {
        const response = await fetch(`${API_URL}/maestros/resumen`);
        if (!response.ok) throw new Error("Error al obtener maestros");
        return response.json();
    },

    // Obtener perfil (Dashboard)
    getPerfilMaestro: async (codPersona: number): Promise<PerfilMaestro> => {
        const response = await fetch(`${API_URL}/maestros/${codPersona}/perfil`);
        if (!response.ok) throw new Error("Error obteniendo perfil");
        return response.json();
    },

    // --- CANJES ---

    // Info inicial (Cabecera)
    getInfoPantallaCanje: async (codUsuario: number, codMaestro: number): Promise<InfoPantallaCanje> => {
        const response = await fetch(`${API_URL}/canjes/info?codUsuario=${codUsuario}&codMaestro=${codMaestro}`);
        if (!response.ok) throw new Error("Error cargando info de canje");
        return response.json();
    },

    // Catálogo de premios
    getCatalogoPremios: async (buscar?: string): Promise<PremioCatalogo[]> => {
        let url = `${API_URL}/premios/catalogo`;
        if (buscar) {
            url += `?buscar=${encodeURIComponent(buscar)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error obteniendo premios");
        return response.json();
    },

    // Registrar Canje (POST)
    registrarCanje: async (data: NuevoCanjeRequest): Promise<string> => {
        const response = await fetch(`${API_URL}/canjes/registrar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || "Error al registrar canje");
        }
        return response.text();
    }
};