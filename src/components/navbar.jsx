import { Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

function AppNavbar() {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Navbar.Brand as={Link} to="/">Dream Weaver</Navbar.Brand>
        </Navbar>
    );
}

export default AppNavbar;