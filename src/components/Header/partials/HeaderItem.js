import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";

const HeaderItem = ({ label, options }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Menu isOpen={isOpen}>
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
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
      >
        {label}
      </MenuButton>
      {/* TODO:  Add better open and close support to the dropdownmenu */}
      <MenuList onMouseEnter={onOpen} onMouseLeave={onClose}>
        {options.map((option) => (
          <MenuItem key={option.label} as={"a"} href={option.href}>
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default HeaderItem;
