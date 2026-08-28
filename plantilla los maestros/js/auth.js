// Sistema de autenticación para MasterBikes - VERSIÓN CORREGIDA
class AuthSystem {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.users = this.loadUsers();
    }

    loadUsers() {
        let users = StorageManager.get('users');
        
        if (!users || users.length === 0) {
            users = this.getInitialUsers();
            StorageManager.set('users', users);
        }
        
        return users;
    }

    getInitialUsers() {
        return [
            {
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                name: 'Administrador Principal',
                email: 'admin@masterbikes.cl',
                phone: '+56912345678',
                status: 'active',
                created: new Date().toISOString()
            },
            {
                username: 'usuario',
                password: 'user123',
                role: 'user',
                name: 'Cliente Ejemplo',
                email: 'usuario@masterbikes.cl',
                phone: '+56987654321',
                status: 'active',
                created: new Date().toISOString()
            }
        ];
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user && user.status === 'active') {
            user.lastLogin = new Date().toISOString();
            this.saveUsers();
            
            this.currentUser = { ...user };
            delete this.currentUser.password;
            
            StorageManager.set('currentUser', this.currentUser);
            
            return {
                success: true,
                user: this.currentUser
            };
        }
        
        return {
            success: false,
            error: 'Credenciales incorrectas'
        };
    }

    register(userData) {
        if (!FormValidator.validateRequired(userData.username) ||
            !FormValidator.validateRequired(userData.password) ||
            !FormValidator.validateRequired(userData.email) ||
            !FormValidator.validateRequired(userData.name)) {
            return {
                success: false,
                error: 'Todos los campos marcados con * son requeridos'
            };
        }

        if (!FormValidator.validateEmail(userData.email)) {
            return {
                success: false,
                error: 'El formato del email no es válido'
            };
        }

        if (!FormValidator.validatePassword(userData.password)) {
            return {
                success: false,
                error: 'La contraseña debe tener al menos 8 caracteres'
            };
        }

        if (userData.password !== userData.confirmPassword) {
            return {
                success: false,
                error: 'Las contraseñas no coinciden'
            };
        }

        if (this.users.find(u => u.username === userData.username)) {
            return {
                success: false,
                error: 'El nombre de usuario ya está en uso'
            };
        }

        if (this.users.find(u => u.email === userData.email)) {
            return {
                success: false,
                error: 'El email ya está registrado'
            };
        }

        const newUser = {
            username: userData.username,
            password: userData.password,
            role: userData.role || 'user',
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            status: 'active',
            created: new Date().toISOString(),
            lastLogin: null
        };

        this.users.push(newUser);
        this.saveUsers();

        this.sendWelcomeEmail(newUser);

        return {
            success: true,
            user: newUser
        };
    }

    logout() {
        this.currentUser = null;
        StorageManager.remove('currentUser');
        window.location.href = 'login.html';
    }

    getCurrentUser() {
        return StorageManager.get('currentUser');
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }

    saveUsers() {
        StorageManager.set('users', this.users);
    }

    sendWelcomeEmail(user) {
        console.log('📧 Email de bienvenida enviado a:', user.email);
        NotificationManager.show(`Email de bienvenida enviado a ${user.email}`, 'info');
    }

    // MÉTODO CORREGIDO: Solo verifica autenticación en páginas que lo requieran
    static checkAuth(requiredRole = null) {
        const auth = new AuthSystem();
        const user = auth.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop();
        
        // Páginas que NO requieren autenticación
        const publicPages = ['login.html'];
        
        // Si no está en página pública y no está autenticado, redirigir
        if (!publicPages.includes(currentPage) && !user) {
            window.location.href = 'login.html';
            return false;
        }
        
        // Si requiere rol específico y no lo tiene
        if (requiredRole && user && user.role !== requiredRole) {
            NotificationManager.show('No tienes permisos para acceder a esta sección', 'error');
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    }

    static getCurrentUser() {
        const auth = new AuthSystem();
        return auth.getCurrentUser();
    }
}

// Inicialización CORREGIDA - Solo verifica autenticación si es necesario
document.addEventListener('DOMContentLoaded', function() {
    const authSystem = new AuthSystem();
    window.authSystem = authSystem;

    // Solo verificar autenticación si NO estamos en login
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html' && !authSystem.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Mostrar información del usuario si está logueado
    if (authSystem.isAuthenticated()) {
        const user = authSystem.getCurrentUser();
        const userWelcome = document.getElementById('userWelcome');
        const userRole = document.getElementById('userRole');
        
        if (userWelcome) userWelcome.textContent = `Bienvenido, ${user.name}`;
        if (userRole) userRole.textContent = `Rol: ${user.role === 'admin' ? 'Administrador' : 'Cliente'}`;
        
        if (user.role === 'admin') {
            const adminSection = document.getElementById('adminSection');
            if (adminSection) adminSection.style.display = 'block';
        }
    }
});

window.AuthSystem = AuthSystem;