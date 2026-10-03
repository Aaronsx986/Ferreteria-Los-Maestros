import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

/*function ProductCard({ product }) {
  return (
    <div className="card">
      <div className="card-category">{product.category}</div>
      <h3>{product.name}</h3>
      <p className="price">${product.price.toLocaleString('es-CL')}</p>
      <button className="btn">Agregar al carro</button>
    </div>
  )
}
*/

function ProductCard({ product }) { //TERMINAR LAS CARD DE LOS PRODUCTOS
  return (
    <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src={product.imagen} />
      <Card.Body>
        <Card.Title>{product.name}</Card.Title>
        <Card.Text>
          {product.price}
        </Card.Text>
        <Button variant="primary">Go somewhere</Button>
      </Card.Body>
    </Card>
  );
}


export default ProductCard


