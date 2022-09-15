import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

const Index = () => (
  <Container bg='black' height="100vh">
    <Header width="full">
      <div>IconDing</div>
      <div>PersonalUserInfoTabDing</div>
    </Header>
    <Hero />
    <Main></Main>

    <Footer></Footer>
  </Container>
);

export default Index;
