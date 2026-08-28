// Gestión de productos y catálogo
class ProductManager {
    constructor() {
        this.products = this.loadProducts();
        this.categories = this.loadCategories();
        this.filters = {
            category: '',
            priceRange: '',
            brand: '',
            search: ''
        };
    }

    loadProducts() {
        // Primero intentar cargar desde localStorage
        let products = StorageManager.get('products');
        
        // Si no hay productos, cargar los datos iniciales
        if (!products || products.length === 0) {
            products = this.getInitialProducts();
            StorageManager.set('products', products);
        }
        
        return products;
    }

    loadCategories() {
        return StorageManager.get('categories') || [
            { id: 'bicicletas', name: 'Bicicletas', subcategories: ['montaña', 'urbana', 'carrera', 'electrica', 'infantil'] },
            { id: 'accesorios', name: 'Accesorios', subcategories: ['seguridad', 'iluminacion', 'portaequipajes', 'vestimenta'] },
            { id: 'repuestos', name: 'Repuestos', subcategories: ['frenos', 'transmision', 'ruedas', 'sillines'] }
        ];
    }

    getInitialProducts() {
        return [
            {
                id: 1,
                name: "Bicicleta de Montaña Profesional",
                price: 450000,
                category: "bicicletas",
                subcategory: "montaña",
                brand: "Trek",
                description: "Ideal para terrenos difíciles y aventuras extremas. Suspensión completa de alta gama.",
                features: ["Suspensión completa", "21 velocidades", "Frenos de disco"],
                stock: 15,
                minStock: 5,
                images: ["🚴"],
                rating: 4.8,
                reviews: 47,
                tags: ["profesional", "montaña", "suspension-completa"],
                badge: "Popular"
            },
            {
                id: 2,
                name: "Bicicleta Urbana Elegante",
                price: 280000,
                category: "bicicletas",
                subcategory: "urbana",
                brand: "Giant",
                description: "Perfecta para recorridos urbanos cómodos. Diseño ergonómico y estilo moderno.",
                features: ["Diseño plegable", "Canasta incluida", "Luces LED"],
                stock: 8,
                minStock: 3,
                images: ["🚲"],
                rating: 4.5,
                reviews: 32,
                tags: ["urbana", "plegable", "ciudad"],
                badge: "Nuevo"
            },
            {
                id: 3,
                name: "Bicicleta de Carrera Aero",
                price: 650000,
                category: "bicicletas",
                subcategory: "carrera",
                brand: "Specialized",
                description: "Diseño aerodinámico para alta velocidad y competencia. Materiales ultralivianos.",
                features: ["Cuadro de carbono", "11 velocidades", "Manubrio aerodinámico"],
                stock: 5,
                minStock: 2,
                images: ["🏁"],
                rating: 4.9,
                reviews: 23,
                tags: ["carrera", "aerodinamico", "competencia"]
            },
            {
                id: 4,
                name: "Bicicleta Eléctrica Premium",
                price: 820000,
                category: "bicicletas",
                subcategory: "electrica",
                brand: "Cannondale",
                description: "Potencia eléctrica para recorridos sin esfuerzo. Autonomía de 80km por carga.",
                features: ["Motor 250W", "Batería 500Wh", "Display LCD"],
                stock: 12,
                minStock: 4,
                images: ["⚡"],
                rating: 4.7,
                reviews: 38,
                tags: ["electrica", "premium", "autonomia"],
                badge: "Oferta"
            },
            {
                id: 5,
                name: "Casco Deportivo Profesional",
                price: 45000,
                category: "accesorios",
                subcategory: "seguridad",
                brand: "Bell",
                description: "Protección de alta calidad con ventilación avanzada.",
                features: ["Ventilación avanzada", "Sistema de ajuste dial", "Visera desmontable"],
                stock: 25,
                minStock: 10,
                images: ["⛑️"],
                rating: 4.7,
                reviews: 89,
                tags: ["casco", "seguridad", "deportivo"]
            },
            {
                id: 6,
                name: "Kit de Herramientas Completo",
                price: 35000,
                category: "repuestos",
                subcategory: "herramientas",
                brand: "Park Tool",
                description: "Todo lo necesario para mantenimiento básico y avanzado.",
                features: ["25 herramientas", "Estuche organizador", "Guía de uso"],
                stock: 18,
                minStock: 8,
                images: ["🛠️"],
                rating: 4.6,
                reviews: 56,
                tags: ["herramientas", "mantenimiento", "completo"]
            }
        ];
    }

    getProducts(filters = this.filters) {
        let filteredProducts = [...this.products];

        // Aplicar filtros
        if (filters.category) {
            filteredProducts = filteredProducts.filter(product => 
                product.category === filters.category
            );
        }

        if (filters.brand) {
            filteredProducts = filteredProducts.filter(product => 
                product.brand === filters.brand
            );
        }

        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(val => 
                val.endsWith('+') ? parseInt(val) * 1000 : parseInt(val)
            );
            
            filteredProducts = filteredProducts.filter(product => {
                if (filters.priceRange.endsWith('+')) {
                    return product.price >= min;
                }
                return product.price >= min && product.price <= max;
            });
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        return filteredProducts;
    }

    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    getProductsByCategory(category) {
        return this.products.filter(product => product.category === category);
    }

    getFeaturedProducts(limit = 4) {
        return this.products
            .filter(product => product.badge)
            .slice(0, limit);
    }

    getLowStockProducts() {
        return this.products.filter(product => product.stock <= product.minStock);
    }

    updateProductStock(productId, quantity) {
        const product = this.getProductById(productId);
        if (product) {
            product.stock += quantity;
            product.updated = new Date().toISOString();
            this.saveProducts();
            return true;
        }
        return false;
    }

    saveProducts() {
        StorageManager.set('products', this.products);
    }

    // Métodos para renderizado
    renderProductGrid(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔍</div>
                    <h3>No se encontraron productos</h3>
                    <p>Intenta con otros filtros de búsqueda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    ${product.images[0] || '🚴'}
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    
                    <div class="product-features">
                        ${product.features.map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                    </div>
                    
                    <div class="product-meta">
                        <span class="product-brand">${product.brand}</span>
                        <span class="product-rating">⭐ ${product.rating} (${product.reviews})</span>
                    </div>
                    
                    <div class="product-price">${CurrencyFormatter.format(product.price)}</div>
                    
                    <div class="product-stock ${product.stock <= product.minStock ? 'stock-low' : 'stock-high'}">
                        ${product.stock <= product.minStock ? 'Stock bajo' : 'En stock'} - ${product.stock} unidades
                    </div>
                    
                    <button class="btn-add-cart" onclick="CartManager.addToCart(${product.id})">
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCategoryFilters(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.categories.map(category => `
            <option value="${category.id}">${category.name}</option>
        `).join('');
    }

    // Métodos estáticos para uso global
    static getAllProducts() {
        const productManager = new ProductManager();
        return productManager.products;
    }

    static getProduct(id) {
        const productManager = new ProductManager();
        return productManager.getProductById(id);
    }

    static searchProducts(query) {
        const productManager = new ProductManager();
        return productManager.getProducts({ search: query });
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const productManager = new ProductManager();
    window.productManager = productManager;

    // Si estamos en la página de catálogo, cargar productos
    if (document.getElementById('productGrid')) {
        productManager.renderProductGrid(productManager.getProducts(), 'productGrid');
        productManager.renderCategoryFilters('categoryFilter');
    }
});

// Exportar para uso global
window.ProductManager = ProductManager;