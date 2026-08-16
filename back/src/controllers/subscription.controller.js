import { billingService } from '../services/billing.service.js';
import usuarioRepository from '../repositories/usuario.repository.js';

export const subscriptionController = {
    async checkout(req, res, next) {
        try {
            const userId = req.user.id; // Asumimos que viene del authMiddleware
            const checkoutData = req.body; // { plan, periodo, amountUsd, cuit }
            
            const result = await billingService.processCheckout(userId, checkoutData);
            
            res.json({
                success: true,
                message: 'Pago procesado y suscripción actualizada exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    },
    async cancel(req, res, next) {
        try {
            const userId = req.user.id;
            await usuarioRepository.update(userId, {
                suscripcionCancelada: true,
                nextNivelSuscripcion: null
            });
            res.json({ success: true, message: 'Se ha cancelado la renovación automática. Mantendrás tus beneficios Premium hasta finalizar el período.' });
        } catch (error) {
            next(error);
        }
    },
    async downgrade(req, res, next) {
        try {
            const userId = req.user.id;
            const { nextPlan } = req.body;
            
            await usuarioRepository.update(userId, {
                suscripcionCancelada: false, // Sigue activa, pero cambiará de plan
                nextNivelSuscripcion: nextPlan
            });
            
            res.json({ success: true, message: `Se ha programado el cambio al plan ${nextPlan}. Mantendrás tus beneficios actuales hasta finalizar el período.` });
        } catch (error) {
            next(error);
        }
    }
};
