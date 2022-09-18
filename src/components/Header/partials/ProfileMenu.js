import {
  Avatar,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";

export const ProfileMenu = ({ name, src }) => {
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
        <MenuItem>Profile</MenuItem>
        <MenuItem>Inbox</MenuItem>
        <MenuItem>Preferences</MenuItem>
        <MenuItem>Sign out</MenuItem>
      </MenuList>
    </Menu>
  );
};
