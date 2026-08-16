import usuarioRepository from '../repositories/usuario.repository.js';
import facturaRepository from '../repositories/factura.repository.js';
import contabilidadRepository from '../repositories/contabilidad.repository.js';

const TIPO_CAMBIO = 1500; // 1 USD = 1500 ARS
const ALICUOTA_IVA = 0.21;
const ALICUOTA_IIBB = 0.036;

export const billingService = {
    /**
     * Procesa un pago simulado y actualiza la suscripción
     */
    async processCheckout(userId, checkoutData) {
        const { plan, periodo, amountUsd, cuit, nombreFacturacion } = checkoutData;

        // 1. Determinar tipo de Factura según Ley 27.618 (AFIP 2021)
        // RI a Monotributista -> Factura A
        // RI a Consumidor Final -> Factura B
        let tipoFactura = checkoutData.condicionIva === 'monotributista' ? 'A' : 'B';

        // 2. Cálculos financieros (Convertir USD a ARS)
        const totalArs = amountUsd * TIPO_CAMBIO;

        // El precio cobrado incluye IVA. Desglosamos:
        const montoNeto = totalArs / (1 + ALICUOTA_IVA);
        const montoIva = totalArs - montoNeto;
        const montoIibb = montoNeto * ALICUOTA_IIBB;

        // 3. Crear Factura
        const factura = await facturaRepository.create({
            tipo: tipoFactura,
            cuit: cuit || '',
            nombreFacturacion: nombreFacturacion || '',
            montoNeto: parseFloat(montoNeto.toFixed(2)),
            iva: parseFloat(montoIva.toFixed(2)),
            total: parseFloat(totalArs.toFixed(2)),
            userId: userId
        });

        // 4. Asientos Contables
        await contabilidadRepository.create({
            concepto: `Venta Suscripción ${plan} - Factura ${tipoFactura}`,
            monto: parseFloat(montoNeto.toFixed(2)),
            tipoCuenta: 'Ventas'
        });

        await contabilidadRepository.create({
            concepto: `IVA Débito - Factura ${tipoFactura}`,
            monto: parseFloat(montoIva.toFixed(2)),
            tipoCuenta: 'IVA Debito'
        });

        await contabilidadRepository.create({
            concepto: `Retención/Provisión IIBB - Factura ${tipoFactura}`,
            monto: parseFloat(montoIibb.toFixed(2)),
            tipoCuenta: 'Ingresos Brutos'
        });

        // Ingreso de dinero (Caja/Banco)
        await contabilidadRepository.create({
            concepto: `Cobro Tarjeta - Factura ${tipoFactura}`,
            monto: parseFloat(totalArs.toFixed(2)),
            tipoCuenta: 'Caja/Banco'
        });

        // 5. Actualizar Usuario
        const user = await usuarioRepository.findById(userId);
        const diasNuevos = periodo === 'anual' ? 365 : 30;
        
        let fechaVencimiento = new Date();
        
        if (user && user.fechaVencimientoSuscripcion && new Date(user.fechaVencimientoSuscripcion) > new Date()) {
            if (plan === user.nivelSuscripcion) {
                // Si está extendiendo su plan actual (ej: Mensual a Anual, o comprando más tiempo)
                // Se suman los días directo a la fecha que ya tenía
                fechaVencimiento = new Date(user.fechaVencimientoSuscripcion);
                fechaVencimiento.setDate(fechaVencimiento.getDate() + diasNuevos);
            } else {
                // Si es un UPGRADE a un plan distinto
                // Fórmula simple: 1 semana (7 días) de regalo por cada mes (30 días) que le sobraba
                const msRestantes = new Date(user.fechaVencimientoSuscripcion) - new Date();
                const diasRestantes = Math.floor(msRestantes / (1000 * 60 * 60 * 24));
                const mesesSobrantes = Math.floor(diasRestantes / 30);
                const diasRegalo = mesesSobrantes * 7;
                
                fechaVencimiento.setDate(fechaVencimiento.getDate() + diasNuevos + diasRegalo);
            }
        } else {
            // Usuario sin suscripción activa a favor
            fechaVencimiento.setDate(fechaVencimiento.getDate() + diasNuevos);
        }

        await usuarioRepository.update(userId, {
            nivelSuscripcion: plan,
            fechaVencimientoSuscripcion: fechaVencimiento,
            suscripcionCancelada: false, // Reactivamos por si estaba cancelada
            nextNivelSuscripcion: null
        });

        return { success: true, factura };
    }
};
