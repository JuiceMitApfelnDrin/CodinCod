import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header/Header";
import { Button } from "@chakra-ui/react";
import { ProfileMenu } from "../components/Header/partials/ProfileMenu";

const Index = () => (
  <Container height="100vh">
    <Header>
      <Button>IconDing</Button>
      <ProfileMenu name="Dan Abrahmov" src="https://bit.ly/dan-abramov" />
    </Header>
    <Hero />
    <Main></Main>

    <Footer></Footer>
  </Container>
);

export default Index;
