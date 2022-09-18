import { Container } from "components/Container";
import { Footer } from "components/Footer";
import { Header } from "components/Header/Header";
import { VStack } from "@chakra-ui/react";

const GeneralLayout = ({ children, spacing, mx = "1rem" }) => (
  <Container height="100vh">
    <Header />
    <VStack height="100vh" p="1rem" width="full" spacing={spacing} mx={mx}>
      {children}
    </VStack>

    <Footer />
  </Container>
);

export default GeneralLayout;
