import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

import { BellIcon } from "@chakra-ui/icons";

export const NotificationMenu = () => {
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
        <BellIcon w={6} h={6} />
      </MenuButton>
      <MenuList>
        <MenuItem>Notification 1</MenuItem>
        <MenuItem>Notification 2</MenuItem>
        <MenuItem>Notification 3</MenuItem>
        <MenuItem>Notification 4</MenuItem>
        <MenuItem>Notification 5</MenuItem>
      </MenuList>
    </Menu>
  );
};
