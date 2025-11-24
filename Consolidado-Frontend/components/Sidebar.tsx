import React, { useState, useEffect } from 'react';
import { 
    UserIcon, ClientsIcon, TransportIcon, InventoryIcon, 
    SupplyIcon, SalesIcon, LogoutIcon, SparklesIcon 
} from './icons/IconsAbastecimiento';
import { ChevronDownIcon, ChevronUpIcon } from './icons/iconsVentas'; 
import { Screen } from '../types';

// 1. AQUÍ INTEGRAMOS TUS ENUMS PARA ORGANIZAR
export enum SidebarItemId {
    Clientes = 'clientes',
    Transporte = 'transporte',
    Inventario = 'inventario',
    Abastecimiento = 'abastecimiento',
    Ventas = 'ventas',
    IA = 'ia'
}

// Definimos un tipo flexible para la navegación
type NavigationTarget = Screen | string;

interface SidebarProps {
    onNavigate: (screen: NavigationTarget) => void;
    currentScreen: NavigationTarget;
}

// 2. DEFINIMOS LA ESTRUCTURA DE PANTALLAS AQUÍ (Fuente de la verdad)
// Esto evita el "solape" lógico: sabemos exactamente qué pantallas pertenecen a qué ID.
const MENU_STRUCTURE: Record<SidebarItemId, NavigationTarget[]> = {
    [SidebarItemId.Ventas]: [
        Screen.SalesTable, Screen.PaymentsView, Screen.ClaimsView, 
        Screen.VentasReportsView, Screen.RegisterSale, Screen.MainContent
    ],
    [SidebarItemId.Transporte]: [
        'transportOrders', 'transportOrderDetail', 'dispatchScheduling', 
        'dispatchOrderSelection', 'dispatchTrackingList', 'dispatchStopDetail',
        'stopProductDetail', 'vehicles', 'employees', 'permissions',
        'monthlyReport', 'currentState', 'transportDashboard'
    ],
    [SidebarItemId.Clientes]: [Screen.Clients],
    [SidebarItemId.Abastecimiento]: [Screen.MainMenu],
    [SidebarItemId.Inventario]: [Screen.MainContentAlmacen],
    [SidebarItemId.IA]: [Screen.AIHub]
};

// ==========================================
// SUBCOMPONENTES DE UI (Sin cambios drásticos)
// ==========================================

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;       // ¿Está seleccionada esta sección?
    isMenuOpen?: boolean;     // ¿Está desplegado el submenú?
    onClick?: () => void;
    hasSubmenu?: boolean;
    onToggle?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
    icon, label, isActive = false, isMenuOpen, onClick, hasSubmenu, onToggle 
}) => {
    const baseClasses = "flex items-center w-full p-3 my-1 rounded-lg text-white text-left text-sm transition-all duration-200";
    // Si es activo, color fuerte. Si no, hover suave.
    const activeClasses = "bg-green-600 font-bold shadow-md border-l-4 border-green-300"; 
    const inactiveClasses = "hover:bg-green-700 opacity-90 hover:opacity-100 border-l-4 border-transparent";

    return (
        <button 
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} 
            onClick={hasSubmenu ? onToggle : onClick}
        >
            <div className="mr-3">{icon}</div>
            <span className="flex-1">{label}</span>
            
            {hasSubmenu && (
                <div className="ml-2">
                    {isMenuOpen ? (
                        <ChevronUpIcon className="w-4 h-4 text-green-200" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4 text-green-200" />
                    )}
                </div>
            )}
        </button>
    );
};

const SubNavItem: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        className={`block w-full text-left py-2 pl-4 text-sm transition-colors duration-200 border-l border-green-700 ml-2
        ${active ? 'text-white font-bold border-green-300 bg-green-700/50' : 'text-green-200 hover:text-white hover:border-green-500'}`}
    >
        {label}
    </button>
);

const MenuSectionTitle: React.FC<{ label: string }> = ({ label }) => (
    <h3 className="px-4 py-1 mt-2 text-[10px] font-bold text-green-300 uppercase tracking-wider opacity-80">
        {label}
    </h3>
);

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentScreen }) => {
    // ESTADO ÚNICO: Controla qué menú está expandido usando el Enum.
    // null = ninguno abierto.
    const [activeMenuId, setActiveMenuId] = useState<SidebarItemId | null>(null);

    // --- LÓGICA DE DETECCIÓN AUTOMÁTICA ---
    // Busca en qué categoría cae la pantalla actual
    useEffect(() => {
        const foundCategory = (Object.keys(MENU_STRUCTURE) as SidebarItemId[]).find(key => 
            MENU_STRUCTURE[key].includes(currentScreen)
        );

        if (foundCategory) {
            // Si cambiamos de pantalla, abrimos el menú correspondiente automáticamente
            // Pero solo si es Ventas o Transporte (los que tienen submenús)
            if (foundCategory === SidebarItemId.Ventas || foundCategory === SidebarItemId.Transporte) {
                setActiveMenuId(foundCategory);
            }
        }
    }, [currentScreen]);

    // Función helper para manejar el click en menús desplegables (Efecto Acordeón)
    const handleToggleMenu = (id: SidebarItemId, defaultScreen: NavigationTarget) => {
        if (activeMenuId === id) {
            setActiveMenuId(null); // Si ya está abierto, lo cierro
        } else {
            setActiveMenuId(id);   // Abro este y cierro los demás
            // Opcional: Navegar a la pantalla principal de esa sección al abrir
            onNavigate(defaultScreen);
        }
    };

    return (
        <div className="w-64 bg-green-800 text-white flex flex-col p-4 shadow-lg h-screen sticky top-0 overflow-hidden font-sans">
            
            {/* Header de Usuario */}
            <div className="flex items-center mb-6 pb-4 border-b border-green-700 shrink-0">
                <div className="bg-green-600 rounded-full p-1 mr-3 shadow-sm">
                    <UserIcon className="h-10 w-10 text-green-100" />
                </div>
                <div>
                    <p className="font-bold text-sm">Usuario Sistema</p>
                    <p className="text-xs text-green-300">Administrador</p>
                </div>
            </div>

            {/* Navegación Principal */}
            <nav className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-transparent space-y-1">
                
                {/* 1. CLIENTES */}
                <NavItem 
                    icon={<ClientsIcon />} 
                    label="Clientes" 
                    isActive={currentScreen === Screen.Clients}
                    onClick={() => onNavigate(Screen.Clients)} 
                />

                {/* 2. ABASTECIMIENTO */}
                <NavItem 
                    icon={<SupplyIcon />} 
                    label="Abastecimiento" 
                    isActive={currentScreen === Screen.MainMenu} 
                    onClick={() => onNavigate(Screen.MainMenu)}
                />

                {/* 3. INVENTARIO */}
                <NavItem 
                    icon={<InventoryIcon />} 
                    label="Inventario" 
                    isActive={currentScreen === Screen.MainContentAlmacen}
                    onClick={() => onNavigate(Screen.MainContentAlmacen)}
                />

                {/* 4. VENTAS (Dropdown) */}
                <div>
                    <NavItem 
                        icon={<SalesIcon />} 
                        label="Ventas" 
                        // Usamos la estructura para saber si es active
                        isActive={MENU_STRUCTURE[SidebarItemId.Ventas].includes(currentScreen)}
                        hasSubmenu={true}
                        // Usamos el activeMenuId para saber si está abierto
                        isMenuOpen={activeMenuId === SidebarItemId.Ventas}
                        onToggle={() => handleToggleMenu(SidebarItemId.Ventas, Screen.MainContent)}
                    />
                    {activeMenuId === SidebarItemId.Ventas && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-green-700 pl-2 animate-fade-in-down">
                            <SubNavItem label="Registro de Ventas" active={currentScreen === Screen.SalesTable || currentScreen === Screen.RegisterSale} onClick={() => onNavigate(Screen.SalesTable)} />
                            <SubNavItem label="Pagos" active={currentScreen === Screen.PaymentsView} onClick={() => onNavigate(Screen.PaymentsView)} />
                            <SubNavItem label="Reclamos" active={currentScreen === Screen.ClaimsView} onClick={() => onNavigate(Screen.ClaimsView)} />
                            <SubNavItem label="Reportes" active={currentScreen === Screen.VentasReportsView} onClick={() => onNavigate(Screen.VentasReportsView)} />
                        </div>
                    )}
                </div>

                {/* 5. TRANSPORTE (Dropdown Complejo) */}
                <div>
                    <NavItem 
                        icon={<TransportIcon />} 
                        label="Transporte" 
                        isActive={MENU_STRUCTURE[SidebarItemId.Transporte].includes(currentScreen)}
                        hasSubmenu={true}
                        isMenuOpen={activeMenuId === SidebarItemId.Transporte}
                        onToggle={() => handleToggleMenu(SidebarItemId.Transporte, 'transportDashboard')}
                    />
                    {activeMenuId === SidebarItemId.Transporte && (
                        <div className="ml-4 mt-1 space-y-1 animate-fade-in-down">
                             <SubNavItem label="Dashboard" active={currentScreen === 'transportDashboard'} onClick={() => onNavigate('transportDashboard')} />
                            
                            {/* Gestión de Recursos */}
                            <MenuSectionTitle label="Recursos" />
                            <div className="border-l border-green-700 pl-2">
                                <SubNavItem label="Vehículos" active={currentScreen === 'vehicles'} onClick={() => onNavigate('vehicles')} />
                                <SubNavItem label="Empleados" active={currentScreen === 'employees'} onClick={() => onNavigate('employees')} />
                                <SubNavItem label="Permisos" active={currentScreen === 'permissions'} onClick={() => onNavigate('permissions')} />
                            </div>

                            {/* Procesos */}
                            <MenuSectionTitle label="Procesos" />
                            <div className="border-l border-green-700 pl-2">
                                <SubNavItem label="Pedidos Transporte" active={currentScreen === 'transportOrders'} onClick={() => onNavigate('transportOrders')} />
                                <SubNavItem label="Programar Despachos" active={currentScreen === 'dispatchScheduling'} onClick={() => onNavigate('dispatchScheduling')} />
                                <SubNavItem label="Seguimiento" active={currentScreen === 'dispatchTrackingList'} onClick={() => onNavigate('dispatchTrackingList')} />
                            </div>

                            {/* Reportes */}
                            <MenuSectionTitle label="Reportes" />
                            <div className="border-l border-green-700 pl-2">
                                <SubNavItem label="Vista General" active={currentScreen === 'monthlyReport'} onClick={() => onNavigate('monthlyReport')} />
                                <SubNavItem label="Estado Actual" active={currentScreen === 'currentState'} onClick={() => onNavigate('currentState')} />
                            </div>
                        </div>
                    )}
                </div>

                {/* 6. HERRAMIENTAS IA */}
                <div className="my-2 border-t border-green-700 pt-4 mt-4">
                    <MenuSectionTitle label="Herramientas" />
                    <NavItem 
                        icon={<SparklesIcon className="text-yellow-300"/>} 
                        label="Inteligencia Artificial" 
                        isActive={currentScreen === Screen.AIHub}
                        onClick={() => onNavigate(Screen.AIHub)}
                    />
                </div>

            </nav>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-green-700 shrink-0">
                <button className="flex items-center w-full p-3 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 shadow-sm">
                    <div className="mr-3"><LogoutIcon /></div>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;