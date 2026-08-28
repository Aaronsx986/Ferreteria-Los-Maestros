// Gestión del carrito de compras
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.updateCartIndicator();
    }

    loadCart() {
        return StorageManager.get('cart') || [];
    }

    saveCart() {
        StorageManager.set('cart', this.cart);
        this.updateCartIndicator();
    }

    addProduct(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        NotificationManager.show('Producto agregado al carrito', 'success');
        return this.cart;
    }

    removeProduct(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        NotificationManager.show('Producto removido del carrito', 'info');
        return this.cart;
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeProduct(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
        return this.cart;
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        NotificationManager.show('Carrito vaciado', 'info');
        return this.cart;
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getShipping() {
        const subtotal = this.getSubtotal();
        return subtotal > 100000 ? 0 : 5000; // Envío gratis sobre $100.000
    }

    getTotal() {
        return this.getSubtotal() + this.getShipping();
    }

    updateCartIndicator() {
        const cartIndicator = document.getElementById('cartIndicator');
        const cartCount = document.getElementById('cartCount');
        
        if (cartIndicator && cartCount) {
            const totalItems = this.getTotalItems();
            if (totalItems > 0) {
                cartIndicator.style.display = 'flex';
                cartCount.textContent = totalItems;
            } else {
                cartIndicator.style.display = 'none';
            }
        }
    }

    // Checkout process
    async checkout(paymentMethod = 'card') {
        if (this.cart.length === 0) {
            NotificationManager.show('El carrito está vacío', 'error');
            return false;
        }

        try {
            const order = {
                id: 'ORD-' + Date.now(),
                items: [...this.cart],
                subtotal: this.getSubtotal(),
                shipping: this.getShipping(),
                total: this.getTotal(),
                paymentMethod: paymentMethod,
                status: 'pending',
                createdAt: new Date().toISOString(),
                user: StorageManager.get('currentUser')?.username || 'guest'
            };

            // Guardar orden
            const orders = StorageManager.get('orders') || [];
            orders.push(order);
            StorageManager.set('orders', orders);

            // Guardar en historial de compras
            const purchaseHistory = StorageManager.get('purchaseHistory') || [];
            purchaseHistory.push({
                ...order,
                status: 'completed',
                completedAt: new Date().toISOString()
            });
            StorageManager.set('purchaseHistory', purchaseHistory);

            // Limpiar carrito
            this.clearCart();

            NotificationManager.show('¡Compra realizada con éxito!', 'success');
            return order;

        } catch (error) {
            console.error('Error en checkout:', error);
            NotificationManager.show('Error al procesar la compra', 'error');
            return false;
        }
    }

    // Métodos estáticos para uso global
    static addToCart(productId, quantity = 1) {
        const cartManager = new CartManager();
        // Buscar producto en los datos
        const products = StorageManager.get('products') || [];
        const product = products.find(p => p.id === productId);
        
        if (product) {
            return cartManager.addProduct(product, quantity);
        } else {
            NotificationManager.show('Producto no encontrado', 'error');
            return null;
        }
    }

    static getCart() {
        const cartManager = new CartManager();
        return cartManager.cart;
    }

    static removeFromCart(productId) {
        const cartManager = new CartManager();
        return cartManager.removeProduct(productId);
    }

    static clearCart() {
        const cartManager = new CartManager();
        return cartManager.clearCart();
    }
}

// Inicializar carrito al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const cartManager = new CartManager();
    window.cartManager = cartManager;
});

// Exportar para uso global
window.CartManager = CartManager;