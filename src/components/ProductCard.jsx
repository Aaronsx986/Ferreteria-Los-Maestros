import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function ProductCard({ product }) {
  //constantes para definir el stock en el boton y el texto de disponible o no
  const stock = product.stock ?? 0;
  const sinStock = stock <= 0;

  // Lógica de etiqueta de stock
  const renderStockBadge = () => {
    if (sinStock) {
      return (
        <span className="text-danger fw-bold small text-uppercase mb-2">
          No disponible
        </span>
      );
    }

    if (stock <= 3) {
      return (
        <span className="text-warning text-dark-emphasis fw-bolder small text-uppercase mb-2">
          ¡ÚLTIMAS UNIDADES! ({stock})
        </span>
      );
    }

    return (
      <span className="text-success fw-semibold small text-uppercase mb-2">
        Disponible
      </span>
    );
  };
  return (
    <Card className="h-100 shadow-sm">
      <Card.Img
        variant="top"
        src={product.imagen}
        alt={product.name}
        style={{height: '200px', objectFit: 'contain', padding: '10px'}}
      />
      <Card.Body className="d-flex flex-column">
        <span className="text-muted text-uppercase small mb-1">
          {product.brand || product.marca}
        </span>
        <Card.Title className="text-dark fw-bold mb-2">{product.name}</Card.Title>
        <Card.Text className="text-dark fw-normal fs-5">
          ${product.price}
        </Card.Text>
        <span className="text-muted text-uppercase small mb-1">
          {"disponible"}
        </span>        
        <Button variant={sinStock ? 'secondary' : 'primary'} disabled={sinStock} className="mt-auto">
          {sinStock ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
      </Card.Body>
    </Card>
  );
}

export default ProductCard


