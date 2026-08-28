// Utilidades generales para MasterBikes

class StorageManager {
    static set(key, data) {
        try {
            localStorage.setItem(`masterbikes_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            return false;
        }
    }

    static get(key) {
        try {
            const data = localStorage.getItem(`masterbikes_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error leyendo de localStorage:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(`masterbikes_${key}`);
            return true;
        } catch (error) {
            console.error('Error eliminando de localStorage:', error);
            return false;
        }
    }

    static clear() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('masterbikes_'));
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Error limpiando localStorage:', error);
            return false;
        }
    }
}

class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^\+?[\d\s-()]{8,}$/;
        return re.test(phone);
    }

    static validatePassword(password) {
        return password.length >= 8;
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validateNumber(value, min = 0, max = Infinity) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }
}

class DateUtils {
    static formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    static formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static getDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    static isFutureDate(dateString) {
        return new Date(dateString) > new Date();
    }
}

class CurrencyFormatter {
    static format(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    static formatCompact(amount) {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}K`;
        }
        return this.format(amount);
    }
}

class NotificationManager {
    static show(message, type = 'info', duration = 3000) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // Remover después de la duración
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);

        return notification;
    }

    static getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    static getBackgroundColor(type) {
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        return colors[type] || '#3498db';
    }
}

// Animaciones CSS para notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Exportar para uso global
window.StorageManager = StorageManager;
window.FormValidator = FormValidator;
window.DateUtils = DateUtils;
window.CurrencyFormatter = CurrencyFormatter;
window.NotificationManager = NotificationManager;