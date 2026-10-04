import Topbar from './Topbar';
import Navbar from './Navbar';
import Catbar from './Catbar';

function Header() {
  return (
    <header>
      <Topbar />
      <Navbar />
      <Catbar />
    </header>
  );
}

export default Header;