import { Input, InputGroup, InputRightAddon } from "@chakra-ui/react";

import { Search2Icon } from "@chakra-ui/icons";

export const SearchInput = (props) => (
  <InputGroup>
    <Input placeholder="Search" {...props} />
    <InputRightAddon children={<Search2Icon />} />
  </InputGroup>
);
