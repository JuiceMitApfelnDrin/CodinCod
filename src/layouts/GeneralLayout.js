import { Container } from "components/Container";
import { Footer } from "components/Footer";
import { Header } from "components/Header/Header";

const GeneralLayout = ({ children }) => (
  <Container height="100vh">
    <Header />
    {children}

    <Footer />
  </Container>
);

export default GeneralLayout;
