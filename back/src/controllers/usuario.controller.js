import usuarioRepository from '../repositories/usuario.repository.js';
import facturaRepository from '../repositories/factura.repository.js';
import crypto from 'crypto';

const getAvatarUrl = (email) => {
    return null;
};

export const usuarioController = {
    async getProfile(req, res, next) {
        try {
            let user = await usuarioRepository.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            // Lazy downgrade: si la fecha de fin ya pasó
            if (user.fechaVencimientoSuscripcion && new Date(user.fechaVencimientoSuscripcion) < new Date()) {
                const newNivel = user.suscripcionCancelada ? 'Gratis' : (user.nextNivelSuscripcion || 'Gratis');
                user = await usuarioRepository.update(user.id, {
                    nivelSuscripcion: newNivel,
                    suscripcionCancelada: false,
                    nextNivelSuscripcion: null,
                    fechaVencimientoSuscripcion: null
                });
            }
            
            // Removemos password por seguridad
            const { password, ...safeUser } = user;
            safeUser.avatarUrl = getAvatarUrl(safeUser.gmail);
            
            res.json({ success: true, data: safeUser });
        } catch (error) {
            next(error);
        }
    },

    async updateProfile(req, res, next) {
        try {
            const { name, bannerColor } = req.body;
            
            // Re-agregamos la restricción premium para el color de portada
            const user = await usuarioRepository.findById(req.user.id);
            const isPremium = (user.nivelSuscripcion || 'Gratis') !== 'Gratis';
            
            const updateData = { name };
            if (bannerColor && isPremium) {
                updateData.bannerColor = bannerColor;
            }

            const updatedUser = await usuarioRepository.update(req.user.id, updateData);
            
            const { password, ...safeUser } = updatedUser;
            safeUser.avatarUrl = getAvatarUrl(safeUser.gmail);
            res.json({ success: true, data: safeUser, message: 'Perfil actualizado' });
        } catch (error) {
            next(error);
        }
    },

    async getInvoices(req, res, next) {
        try {
            const facturas = await facturaRepository.findByUserId(req.user.id);
            res.json({ success: true, data: facturas });
        } catch (error) {
            next(error);
        }
    },

    // Endpoint para obtener los datos de una factura específica
    async getInvoice(req, res, next) {
        try {
            const { id } = req.params;
            const factura = await facturaRepository.findById(parseInt(id));
            
            if (!factura || factura.userId !== req.user.id) {
                return res.status(404).json({ success: false, message: 'Factura no encontrada' });
            }

            res.status(200).json({ 
                success: true, 
                data: factura
            });
        } catch (error) {
            next(error);
        }
    }
};
