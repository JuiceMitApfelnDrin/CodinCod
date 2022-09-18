import { Search2Icon } from "@chakra-ui/icons";
import { Input, InputGroup, InputRightAddon } from "@chakra-ui/react";

export const SearchInput = (props) => (
  <InputGroup>
    <Input placeholder="Search" {...props} />
    <InputRightAddon children={<Search2Icon />} />
  </InputGroup>
);
