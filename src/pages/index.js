import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header/Header";
import {
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { ProfileMenu } from "../components/Header/partials/ProfileMenu";
import { SearchInput } from "../components/Input/SearchInput";

const Index = () => (
  <Container height="100vh">
    <Header>
      <HStack>
        <Button>GameCodin</Button>
        <Menu>
          <MenuButton
            px="1rem"
            py="0.5rem"
            border="2px"
            borderRadius="6.9"
            borderTop="0px"
            borderTopRadius="0px"
            borderColor="gray.600"
            _hover={{
              borderColor: "gray.400",
            }}
          >
            Play
          </MenuButton>
          <MenuList>
            <MenuItem>Create a game</MenuItem>
            <MenuItem>Code clash</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      <div>
        <SearchInput onChange={(e) => console.log(e.target.value)} />
      </div>
      <ProfileMenu name="Dan Abrahmov" src="https://bit.ly/dan-abramov" />
    </Header>
    <Hero />
    <Main></Main>

    <Footer></Footer>
  </Container>
);

export default Index;
