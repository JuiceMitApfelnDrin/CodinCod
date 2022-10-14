import { Avatar, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

export const ProfileMenu = ({ name, src, menuOptions }) => {
  return (
    <Menu>
      <MenuButton
        as="button"
        transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
        borderRadius="full"
        _focus={{
          boxShadow:
            "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
        }}
      >
        <Avatar name={name} src={src} />
      </MenuButton>
      <MenuList>
        {menuOptions.map((option) => (
          <MenuItem key={option.label} as={"a"} href={option.href}>
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
